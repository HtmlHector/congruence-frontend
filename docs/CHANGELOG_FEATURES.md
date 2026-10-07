# Congruence (`congruence.dev`) — Feature & Architecture Guide

This document summarizes all components, pages, APIs, and workflows implemented across **Congruence** (`/Users/admin/Desktop/congruence` and `/Users/admin/Desktop/congruence-backend`).

---

## 1. System Overview & Architecture

**Congruence** is a browser execution space for multi-agent CLI coding (Claude Code CLI, OpenAI Codex CLI, Aider) featuring:
- **Zero-Conflict Git Worktrees:** Each lane operates in its own isolated physical directory on the runner host.
- **Real POSIX PTY Terminals:** Interactive `xterm.js` terminals with ANSI sequence support and WebSocket streaming.
- **Dynamic Port Proxying:** Instant live preview mapping via FastAPI reverse proxy (`/preview/{lane_id}/{port}/`).
- **Cryptographic Vault:** AES-256-GCM encrypted API key storage and Anthropic Device OAuth.

---

## 2. Interactive Views & Sidebar Navigation

All views are accessible via the left sidebar or through the **Omnibar Command Palette** (<kbd>⌘K</kbd>):

| View | Component File | Description |
| :--- | :--- | :--- |
| **Search (<kbd>⌘K</kbd>)** | [`CommandPaletteModal.tsx`](file:///Users/admin/Desktop/congruence/src/components/workspace/CommandPaletteModal.tsx) | Omnibar search across pages, tasks, worktree branches, and quick terminal actions (e.g. `claude auth login`). |
| **Workspaces** | [`ExecutionDeck.tsx`](file:///Users/admin/Desktop/congruence/src/components/workspace/ExecutionDeck.tsx) | Main POSIX PTY terminal deck, split live preview proxy, worktree diff inspector, and write lease management. |
| **Clone from GitHub** | [`CloneRepoModal.tsx`](file:///Users/admin/Desktop/congruence/src/components/workspace/CloneRepoModal.tsx) | Modal to import any public/private GitHub repository URL with vault token injection and auto-provisioned worktrees. |
| **Integrations & Vault** | [`IntegrationsModal.tsx`](file:///Users/admin/Desktop/congruence/src/components/workspace/IntegrationsModal.tsx) | Anthropic interactive browser Device OAuth (`https://console.anthropic.com/device`) + BYO API key vault. |
| **Automations** | [`AutomationsView.tsx`](file:///Users/admin/Desktop/congruence/src/components/workspace/AutomationsView.tsx) | Scheduled background cron triggers, PR review bots, and continuous test audits for Claude and Codex. |
| **Tasks** | [`TasksView.tsx`](file:///Users/admin/Desktop/congruence/src/components/workspace/TasksView.tsx) | Kanban backlog board with one-click **Dispatch** to spawn autonomous worktree runs in Claude Code CLI. |
| **Pull Requests** | [`PullRequestsView.tsx`](file:///Users/admin/Desktop/congruence/src/components/workspace/PullRequestsView.tsx) | Multi-lane PR reviewer with diff stats (`+184 −12`), CI test status, and **"Publish Lane to GitHub PR"** push action. |
| **Pages** | [`PagesView.tsx`](file:///Users/admin/Desktop/congruence/src/components/workspace/PagesView.tsx) | Engineering document notebook and markdown viewer for PRD, TRD specs, and agent field notes. |

---

## 3. Backend REST APIs & Runner Infrastructure

All backend endpoints are implemented in [`congruence-backend`](file:///Users/admin/Desktop/congruence-backend):

### Projects & Worktrees (`src/routes/projects.py`)
- `GET /api/v1/projects`: List all active projects.
- `POST /api/v1/projects`: Create a project with auto-provisioned host and pair lane.
- `POST /api/v1/projects/clone`: Clone a remote GitHub repo and initialize isolated Git worktrees.
- `GET /api/v1/projects/{id}/lanes`: List dynamic worktree lanes (`main`, `claude/progress`, `codex/refactor`).
- `POST /api/v1/projects/{id}/lanes`: Add a new worktree lane.
- `GET /api/v1/projects/{id}/actors`: List actors with presence and lease permissions.
- `GET /api/v1/projects/{id}/git/status?lane_id=...`: Stream live modified files and diff patches.
- `POST /api/v1/projects/{id}/github/pull-requests`: Push the lane branch (`git push -u origin <branch>`) and create a GitHub PR.

### Vault & Credentials (`src/routes/integrations.py`)
- `POST /api/v1/integrations/vault/keys/{project_id}`: Encrypt and store API keys using AES-256-GCM.
- `GET /api/v1/integrations/vault/keys/{project_id}`: Check connection status for Anthropic, OpenAI, and GitHub.

### POSIX PTY Gateway & Proxy (`src/infrastructure/runner/local.py`)
- `WS /ws/session/{lane_id}`: Interactive bidirectional terminal shell stream with ANSI terminal resizing.
- `GET /preview/{lane_id}/{port}/`: Reverse proxy to inspect running dev servers in iframe preview without port collisions.

---

## 4. Production Deployment Artifacts

- **Backend Docker:** [`Dockerfile`](file:///Users/admin/Desktop/congruence-backend/Dockerfile) (Python 3.12, Git, Zsh, Node.js, `@anthropic-ai/claude-code`, `uv`).
- **Backend Compose:** [`docker-compose.yml`](file:///Users/admin/Desktop/congruence-backend/docker-compose.yml) (persistent `/data` and `/tmp/congruence_runners` volume mounts).
- **Frontend Docker:** [`Dockerfile`](file:///Users/admin/Desktop/congruence/Dockerfile) (Next.js standalone multi-stage build).

---

## 5. Verification & Test Suites

- **Playwright Frontend E2E:** `11/11` tests passing (`npx playwright test`).
- **Pytest Backend Tests:** `20/20` tests passing (`uv run pytest`).
- **Design Tokens & Contrast:** 100% WCAG AA / AAA compliance (`npm run audit:contrast && npm run audit:theme`).
