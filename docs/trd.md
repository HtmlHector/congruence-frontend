# Congruence · Technical Requirements Document (TRD)

> **Purpose:** Document system architecture, platform decisions, component boundaries, and performance budgets for Congruence (`congruence.dev`).  
> **Status:** Approved  
> **Systems Architect:** architect  
> **Date:** 2026-10-07  

---

## 1. Technical Strategy & Platform Choices

* **Frontend Framework:** Next.js 15 (App Router), React 19, TypeScript 5.5+
* **Styling Engine:** Tailwind CSS v4 with custom properties (`@theme` / `:root`) adhering to the Hallmark Parchment & Charcoal standard.
* **Component Primitives:** Radix UI unstyled primitives / accessible hooks.
* **Terminal & PTY Simulation:** xterm.js (or lightweight React terminal renderer for POC simulation) with WebLinks addon for automatic port-to-URL rewrites.
* **Control Plane & API:** Next.js Route Handlers / Server Actions deployed to Vercel Edge/Serverless.
* **Database & Persistence:** PostgreSQL (Supabase or Neon) with Drizzle/Prisma ORM.
* **Credential Vault:** Encrypted envelope storage (AES-256-GCM with KMS key rotation) for user-owned CLI credentials (Claude Code OAuth, OpenAI keys, GitHub tokens).
* **Live Session Gateway:** Lightweight Fly.io / Railway WebSocket gateway handling bi-directional PTY multiplexing between browser sessions and host processes.
* **Compute Host:** Fly Sprites (microVM with durable persistent disk, instant sleep, wake-on-request, and public URL routing).
* **Testing Suite:** Playwright (Chromium/Mobile Safari) for multi-device end-to-end verification.

---

## 2. Three-Plane System Architecture

```mermaid
flowchart TD
    subgraph BrowserClient [1. Browser Client (Desktop / Mobile)]
        UI[Workspace Canvas UI]
        PreviewFrame[Private HTTPS Preview Frame]
        TerminalView[xterm.js PTY Terminal]
        LaneManager[Worktree Lane & Actor Leases]
    end

    subgraph ControlPlane [2. Control Plane (Vercel + Postgres)]
        API[Next.js App Router API]
        DB[(PostgreSQL)]
        Vault[Credential Vault KMS]
        GitHubApp[GitHub App Integration]
    end

    subgraph SessionPlane [3. Live Session Gateway (Fly.io)]
        WSGateway[WebSocket Gateway]
        PresenceEngine[Multiplayer Presence & Leases]
    end

    subgraph HostPlane [4. Compute Host (Fly Sprites)]
        SpriteVM[Fly Sprite microVM]
        subgraph SpriteDisk [Persistent NVMe Storage]
            HomeDir["$HOME (Vault Injected Logins & mise Toolchain)"]
            PairLane["/repo (main branch worktree)"]
            AgentLanes["/lanes/<id> (isolated agent/* worktrees)"]
        end
        subgraph SpriteProcesses [Ephemeral Processes]
            PTYMaster["tmux / PTY Session Manager"]
            CLIHarnesses["Claude Code / Codex CLI Processes"]
            DevServer["Dev Server (e.g. Vite / Next on Port 3000)"]
            PortProxy["Port Index & HTTPS Preview Proxy"]
        end
    end

    subgraph ExternalServices [External Source of Truth]
        GitHub[(GitHub Repos & Pull Requests)]
        ModelProviders[(Anthropic / OpenAI Direct Billing)]
    end

    UI --> API
    API --> DB
    API --> Vault
    API --> GitHubApp
    GitHubApp --> GitHub

    UI <--> WSGateway
    WSGateway <--> PTYMaster
    PTYMaster <--> CLIHarnesses
    CLIHarnesses --> ModelProviders

    DevServer --> PortProxy
    PortProxy <--> PreviewFrame
    CLIHarnesses --> AgentLanes
    AgentLanes --> GitHub
```

---

## 3. The `HostBackend` Orchestrator Interface

To ensure harness neutrality and borrowed compute without building custom hypervisors, all compute host interactions are abstracted behind the `HostBackend` interface:

```typescript
export interface HostBackend {
  /** Create or provision a persistent compute host */
  create(options: {
    projectId: string;
    repoUrl: string;
    size: 'small' | 'standard' | 'large';
    networkConfig?: NetworkConfig;
  }): Promise<HostInstance>;

  /** Attach to or spawn a PTY shell for an actor */
  execPty(options: {
    hostId: string;
    laneId: string;
    actorId: string;
    command: string[];
    env: Record<string, string>;
  }): Promise<PtySessionStream>;

  /** Create an isolated Git worktree lane for an agent */
  createLane(options: {
    hostId: string;
    laneId: string;
    branchName: string;
  }): Promise<LaneResult>;

  /** Publish a listening localhost port to a secure HTTPS URL */
  publishPort(options: {
    hostId: string;
    port: number;
    access: 'private' | 'timeboxed-public';
  }): Promise<{ url: string }>;

  /** Suspend compute to near-zero cost while retaining disk */
  sleep(hostId: string): Promise<void>;

  /** Wake host and restore storage mounting */
  wake(hostId: string): Promise<HostStatus>;

  /** Teardown and deprovision host */
  destroy(hostId: string): Promise<void>;
}
```

* **First Planned Backend:** Fly Sprites backend implementation (`SpriteBackend`), leveraging persistent volumes, sub-second wake triggers, and near-zero sleep costs.
* **Secondary Backend:** Railway Sandboxes implementation (`RailwayBackend`) for rapid swarm/lane forking.

### 3.1 The Credential Boundary

The `HostBackend` interface above has **no method that accepts a credential**, and this is deliberate and load-bearing. `execPty` takes a `command` and an `env` map; the control plane populates `env` with its own configuration and never with a user token. The only way a harness becomes authenticated is by the user running the vendor's login inside a PTY we merely relay bytes for.

```typescript
// Non-negotiable: this type does not exist anywhere in the codebase.
// Its absence is the enforcement mechanism for Host Custody.
//   type UserCredential = ...   // ← must never be declared
```

This is why the boundary holds under pressure: there is no field to fill in, so no future engineer can accidentally persist a token without introducing a new type, which then fails review against this section.

---

## 4. Port Indexing & Private HTTPS Proxying

### The Loopback Rewrite Mechanism:
1. When a process (e.g. `pnpm dev`, `vite`, or `next dev`) binds to a port (e.g. `3000`), the in-box host daemon detects the listening socket.
2. The host proxy assigns a subdomain: `https://<project-hash>-<port>.congruence.example`.
3. In the terminal PTY stream, regex matches on `http://localhost:PORT` or `http://127.0.0.1:PORT` and automatically rewrites them into the clickable private HTTPS preview URL.
4. The embedded preview iframe loads the private HTTPS URL with secure cookie-based session auth, ensuring only authorized workspace members can view the preview.

---

## 5. Security, Isolation & Invariant Enforcement

1. **Watch is Default; Write is a Grant:**
   - The WebSocket gateway enforces incoming PTY message filtering.
   - Any client without an active write grant on the current lane has their `stdin` frames dropped at the gateway with an authorization warning.
2. **Host Custody (We Hold No Credential):**
   - The control plane has **no** secret storage: no `vault_secrets` table, no KMS envelope key, no `POST` endpoint that accepts a token. There is no code path by which a credential can reach our database.
   - The user authenticates using the **vendor's own CLI login** (`claude login`, `codex login`) executed in the host PTY. The vendor's tooling writes the credential to the host's `$HOME` on durable disk. Anthropic and OpenAI keep billing the user directly under their existing plan.
   - Because the host is a **remote Fly Sprite microVM**, the CLI's OAuth loopback callback (`localhost:1455`) is not reachable from the user's browser. We bridge it with §7 rather than by capturing the token ourselves.
   - Credentials are excluded from git tracking via global `.gitignore`, and lane working trees never contain them.
   - **Disconnection** deletes the credential on the host and is irreversible from our side by design. We cannot restore what we never held.
3. **Isolated Worktrees:**
   - Agent lanes are created via `git worktree add /lanes/<id> agent/<task-slug>`.
   - Two autonomous agents can never write to the same directory simultaneously, eliminating race conditions and dirty git index corruption.
4. **Bounded Blast Radius:**
   - Outbound network egress allowlist restricts agent network requests to GitHub, package registries (npm, PyPI), and AI model APIs.
   - Git pushes from agent lanes are restricted to `agent/**` branch prefixes; pushes to `main` require a GitHub Pull Request and human review.

---

## 7. Agent Authentication: Host-Native Login

### 7.1 The Problem This Solves

The host is a **remote Fly Sprite microVM**, not the user's laptop. The naive instruction "run `claude login`" fails, because:

1. Claude Code and Codex complete OAuth against a **loopback callback** (`localhost:1455` and similar) bound on the machine running the CLI.
2. That machine is the microVM. The user's browser cannot reach `localhost` on someone else's computer.
3. The obvious workaround — proxying the callback and reading the token at the edge — would mean **we** handle the credential. That is exactly what Host Custody forbids.

### 7.2 Approach: Bridge the Callback, Never Touch the Token

We reuse the §4 private-service-address machinery, which already authenticates and terminates HTTPS for any listening port, to expose the CLI's callback port as a temporary private URL:

```
1. User clicks "Connect Claude Code" on SCR-05.
2. Control plane wakes the host and runs `claude login` in a PTY.
3. The CLI prints an authorize URL and starts listening on its callback port (e.g. 1455).
4. Host daemon detects the bind and, because the port is flagged as an
   `oauth_callback` kind, issues a SINGLE-USE, SHORT-LIVED private service URL.
5. We surface that URL to the user's device as a plain link.
6. User opens it on their own phone or laptop and authenticates with Anthropic
   directly. We are not in the request path for the vendor's credentials.
7. The vendor redirects to the callback URL, which terminates on the microVM.
   The CLI itself exchanges the code and writes the token to `$HOME`.
8. Host daemon closes the callback URL immediately. The port is no longer served.
```

The critical property: **step 6 happens on the vendor's domain, not ours.** The user's Anthropic password or passkey never touches Congruence. Congruence's involvement ends at "here is a temporary URL that points at a port on your own host."

### 7.3 Constraints & Guardrails

| Concern | Mitigation |
| :--- | :--- |
| Callback URL is a credential-adjacent surface | Issue as `single_use`, `expires_in ≤ 10 min`, scoped to the requesting member only. Auto-close on completion. Never log the full URL. |
| Host asleep at connect time | Wake first (< 12s), then run login. Surface an explicit waking state. |
| CLI lacks a loopback flow (some versions use device-code) | Detect the printed URL shape and offer "Open on this device" vs "Copy code", so we support both without special-casing each vendor. |
| User closes the browser mid-handshake | Callback port stays bound until expiry, then the daemon reaps it. Connect is resumable, not restart-only. |
| Multiple harnesses | Each lane has its own `$HOME` credential state. Status is a per-lane boolean read from the host, never a token. |
| Revocation | "Disconnect" deletes the host-side credential. We cannot and do not revoke server-side with the vendor, because we hold no token to present. Copy must say so plainly. |

### 7.4 What We Deliberately Removed

The pre-POC codebase contained a `VaultService` (AES-256-GCM), a `VaultSecret` model, and `POST /integrations/vault/keys/{project_id}`. Under Host Custody these are **deleted, not deprecated**:

* `infrastructure/security/vault.py` — delete. Includes the silent `"0" * 64` fallback key, which meant any deploy missing `VAULT_SECRET_KEY` encrypted every user's credentials under a publicly-known key.
* `contexts/congruence/models.py::VaultSecret` + the `congruence_vault_secrets` table — delete, with a migration that drops the table. `schema.md` is updated accordingly.
* `routes/integrations.py` — delete the `POST /vault/keys` and `GET /vault/keys` endpoints. The `GET` returned only presence booleans and is harmless, but it exists solely to describe the removed store.
* `infrastructure/llm/agent_gateway.py` — **delete.** It resolves provider keys from `settings.llm.*` (our operator keys) to drive a tool-calling loop. That is us spending our own inference on the user's behalf, which contradicts Invariant 3 (Harness Neutrality), Invariant 4, and the no-resale principle. If we need agent reasoning, it runs in the lane via the vendor's CLI, not through our gateway.
* `settings.llm.openai_api_key` / `openrouter_api_key` — delete. Nothing in the control plane should hold a model-provider key.

The `integrations.py` status endpoint is kept and rewritten to report **host-observed** auth state, so the UI can show "Claude Code · connected" without us storing anything.

---

## 8. Performance & Reliability Budgets

| Metric | Target | Verification Method |
| :--- | :--- | :--- |
| **Reconnect to Awake Host** | `< 2.0s` | WebSocket handshake & state hydration |
| **Wake Host from Sleep** | `< 12.0s` | Fly Sprite wake-on-request time |
| **PTY Input-to-Render Latency** | `< 30ms` | Local echo & WebSocket roundtrip |
| **Preview Initial Render** | `< 800ms` | Dev server HTTP response through proxy |
| **Client Bundle Size (Gzipped)** | `< 150 kB` | Next.js build bundle analyzer |
| **Test Verification** | 100% of P0 Features | Playwright end-to-end test suite |
