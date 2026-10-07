# Congruence · App Flow & Interaction Architecture

> **Purpose:** Document every screen, user journey, state transition, and interaction specification for Congruence (`congruence.dev`).  
> **Status:** Approved  
> **UX Designer:** ux-designer  
> **Visual Reference:** Superset (`superset.sh`) Precision Agent Workspace  
> **Date:** 2026-10-07  

---

## 1. Entry Points & Screen Inventory

| Screen ID | Route / Anchor | Screen Name | Key Purpose | Primary Actions |
| :--- | :--- | :--- | :--- | :--- |
| **SCR-01** | `/` | **Landing & Concept Surface** | Articulate value proposition, show architecture, and host the interactive preview | Click "Explore the demo", read workflow & details, toggle FAQ accordions |
| **SCR-02A** | `/workspace#hub` | **Superset Agent Hub & Omnibar** | Central dispatch center featuring the `{< >}` glyph, starter prompt chips, and floating multi-harness omnibar | Type task prompt, switch harness (`Claude` / `Codex`), adjust effort/model, launch task |
| **SCR-02B** | `/workspace#deck` | **Multi-Lane Execution Deck (Split View)** | Active execution canvas combining multi-worktree lanes, terminal PTY, private HTTPS preview, and lane leases | Switch lanes, toggle Preview/Terminal/Changes, Run dev server, Grant/Revoke writer leases, Sleep/Wake host |
| **SCR-03** | `/workspace#modal-info` | **Product Details Modal** | Technical architecture breakdown (Control plane, Sprite host, Host Custody, Security) | Read technical specs, close modal |
| **SCR-04** | Responsive `/workspace` | **Mobile Execution View** | Focused, high-efficiency mobile experience for inspecting previews, observing terminals, and granting leases | Switch between Preview and Terminal tabs, Tap Grant/Revoke, Wake host |
| **SCR-05** | `/workspace#modal-connect` | **Connect Agent Modal** | Authenticate a CLI harness on the host via the vendor's own login. Congruence stores nothing. | Select harness, Run host login, Open vendor sign-in on any device, Disconnect |

---

## 2. Primary User Journey: End-to-End Workflow

```mermaid
flowchart TD
    A["Visitor Lands on congruence.dev (SCR-01)"] --> B["Clicks 'Explore the demo' CTA"]
    B --> C["Enters Superset Agent Hub (SCR-02A)"]
    C --> D{"User Action"}
    D -- "Select Prompt Chip or Type in Omnibar" --> E["User Chooses Harness (e.g. Claude) & Submits Task"]
    E --> F["Task Dispatched to Dedicated Git Worktree Lane (/lanes/<id>)"]
    F --> G["Enters Multi-Lane Execution Deck (SCR-02B)"]
    D -- "Clicks Active Session from Sidebar" --> G
    G --> H{"Workspace State?"}
    H -- Asleep --> I["Click 'Wake workspace'"]
    I --> J["Host Wakes: Persistent Disk & Identities Loaded"]
    H -- Awake --> J
    J --> K{"Action in Execution Deck"}
    K -- "Run dev" --> L["Starts Dev Server on Port 3000"]
    L --> M["Automatic Port Rewrite to HTTPS Service URL"]
    M --> N["Live Preview Window Renders App ('Fieldnotes')"]
    K -- "Switch Lane" --> O["Select 'Claude Code' or 'Codex' Lane"]
    O --> P["Context Switches to Isolated Worktree on Dedicated Branch"]
    K -- "Click 'Connect agent' on a Harness Row" --> AA["Open Connect Agent Modal (SCR-05)"]
    AA --> AB{"Host State?"}
    AB -- Asleep --> AC["Wake Host (< 12s), show Waking State"]
    AC --> AD
    AB -- Awake --> AD["Run Vendor Login in Host PTY (e.g. claude login)"]
    AD --> AE["Host Daemon Detects Loopback Callback Port"]
    AE --> AF["Issue Single-Use Private Callback URL (expires 10 min)"]
    AF --> AG["User Opens Vendor Sign-in On Their Own Device"]
    AG --> AH["Vendor Writes Credential to Host $HOME; We Never See It"]
    AH --> AI["Close Callback Port; Mark Harness Connected"]
    AI --> AJ["Harness Ready: Dispatch Task in Omnibar"]
    K -- "Manage Writer Control" --> Q["Open Lane Control Panel"]
    Q --> R["Select Actor from Dropdown & Click 'Grant Control'"]
    R --> S["Actor receives exclusive write lease; Owner can Revoke"]
    K -- "Simulate an Edit" --> T["Simulated Agent Writes to Lane"]
    T --> U["Changes Tab Badges (+46 -1); Live Preview Updates"]
    U --> V["Put Workspace to Sleep"]
    V --> W["Processes Die, Disk Persists; Ready for Wake from Other Device"]
```

---

## 3. Detailed Screen Specifications

### 3.1 SCR-01: Landing & Concept Surface (`/`)
* **Header Bar (Obsidian Theme):**
  - Left: Congruence logo mark (triple horizontal bars) + `congruence.dev`.
  - Right Navigation Links: `How it works` (`#how-it-works`), `The details` (`#the-details`), `Explore the demo` (`#demo` button).
* **Hero Section:**
  - Sub-tag: `A PARABOX PRODUCT · CONCEPT PREVIEW` in mono uppercase.
  - Headline: `Your repository, your agents, and the running app. In one place.`
  - Body: `A shared browser workspace for the coding agents you already use. Keep the files, terminal, and live preview together, then pick up from another device.`
  - CTA Button: `Explore the demo` (crisp white on obsidian).
  - Micro-copy: `Your tools. Your accounts. A browser is enough.`
* **Embedded Workspace Section:**
  - Section Header: `A LOOK INSIDE / The work stays together.`
  - Meta tags: `Interactive · simulated workspace` | `Open full preview` action.
  - Hosts the complete interactive component `SCR-02A` & `SCR-02B`.
* **Section 01 / THE IDEA:**
  - Title: `Changing devices shouldn't mean rebuilding your context.`
  - Narrative on execution context surviving machine transitions.
* **Section 02 / THE WORKFLOW:**
  - 4 numbered steps:
    1. *Bring your repository:* Connect GitHub project to a persistent host.
    2. *Use your own agents:* Run real Claude Code or Codex CLI with existing subscriptions.
    3. *See what's running:* Dev server opens private HTTPS preview alongside terminal.
    4. *Come back to the work:* Return from another device, wake workspace, restart services.
* **Section 03 / BUILT AROUND SHARED WORK:**
  - 3 Core Columns:
    - *Continuity:* Files and configured identities survive sleep. Live processes are ephemeral.
    - *Parallel Work:* One worktree per writer (`pair lane`, `claude/progress`, `codex/copy`).
    - *Explicit Control:* "Watch first. Grant when needed." Read-only observation with revocable write leases.
* **Section 04 / THE DETAILS (Accordion FAQ):**
  - 4 technical questions answered faithfully from `congruence.dev.md`.
* **Section 05 / Final CTA & Footer:**
  - Headline: `A browser. Your tools. A place to pick up where you left off.`
  - Footer: `congruence.dev · A Parabox product · Product concept · October 2026`.

---

### 3.2 SCR-02A: Superset Agent Hub & Floating Omnibar (`/workspace#hub`)
Inspired directly by `superset.sh`:
* **Left Navigation Sidebar (`#0E0E12`):**
  - Window controls: macOS triple dots (`#FF5F57`, `#FEBC2E`, `#28C840`).
  - Action button: `+ New Workspace`.
  - Nav items: `Search (Cmd+K)`, `Workspaces`, `Automations`, `Tasks`, `Pull requests`, `Pages`.
  - Collapsible `SESSIONS` / `DESKTOP` tree:
    - `⠋ fix onboarding crash` (`+46 -1`)
    - `● billing webhooks` (`+193`)
    - `○ refactor auth flow` (`+394 -23`)
    - `● speed up cold start` (`+33`)
  - Bottom profile: `HT Hector's Team` with settings gear icon.
* **Center Hub:**
  - Centered monospace bracket glyph: `{< >}`
  - Heading: `What should we build next?`
  - Starter prompt suggestion chips:
    - 💡 *Set up this project for Congruence*
    - 💡 *Explain to me how this repository works*
    - 💡 *Find and fix a small bug*
* **The Floating Omnibar (`#16161B` with top inset highlight):**
  - Input field: *"Upgrade a dependency and fix what breaks..."*
  - Bottom action row:
    - `+` (Attach context)
    - Harness selector: `Claude v` (with orange Anthropic sunburst icon), `Codex v`, `OpenCode v`
    - Model selector: `Default model v`
    - Effort selector: `Default effort v`
    - Submit button: `↑` pill button. Clicking submits or switches view into the Execution Deck (`SCR-02B`).
* **Bottom Status Bar:**
  - `This device / Fly Sprite` · `ss` workspace · `Worktree ⇕ main`

---

### 3.3 SCR-02B: Multi-Lane Execution Deck (Split View)
When inspecting or running an active worktree session:
* **Top Header Bar:**
  - Breadcrumbs: `PARABOX / WORKSPACES / Sample app` with a padlock `Private` badge.
  - Status Pill: `● Workspace awake` (emerald dot) or `○ Workspace asleep` (muted gray dot).
  - Power Action: Button toggling between `Sleep workspace` and `Wake workspace`.
  - Product Info Trigger: `The product ⓘ` button opening the technical architecture modal.
  - View switcher: `Hub view` vs `Execution view`.
* **Left Sub-Sidebar (Width: ~220px):**
  - PROJECT: `parabox / sample-app` (tagged `Fictional repository`).
  - WORK LANES:
    - `P Pair lane` · branch: `main` (active badge).
    - `C Claude Code` · branch: `claude/progress`.
    - `O Codex` · branch: `codex/copy`.
    - Caption: *"One worktree per writer. One shared place to work."*
  - WORKSPACE CONTEXT:
    - `Files & Git`: **Persistent**
    - `Tool identities`: **Retained**
    - `Running processes`: **Ephemeral**
* **Center Canvas (Flex-1):**
  - Lane sub-header: Active Lane Name, branch pill, status (`Ready`).
  - View Tabs: `Preview`, `Terminal 1`, `Changes 0` (or dynamic diff count).
  - Action Toolbar: `Try the workspace`, `Run dev` button, `Simulate an edit` button.
  - **In Preview Mode:**
    - Dark URL bar: Padlock + `sample-app.congruence.example` + `Saved preview` or `Live service` badge.
    - Embedded App Frame: Displays **Fieldnotes** sample app (minimalist dark/light note list with interactive checkmarks).
    - Preview Footer: `Port 3000 · HTTPS · private`.
  - **In Terminal Mode:**
    - Dark xterm.js PTY terminal showing interactive shell session:
      - Prompt: `admin@congruence:~/sample-app$`
      - Output: Claude Code / Codex execution logs, port detection message (`Listening on port 3000 -> https://sample-app.congruence.example`).
  - **In Changes Mode:**
    - Split git diff viewer displaying modified files with syntax coloring.
* **Right Sidebar (Width: ~240px):**
  - IN THIS WORKSPACE: `You` (Owner · full access), `Claude Code`, `Codex`.
  - LANE CONTROL:
    - Current writer dropdown: `You`, `Claude Code`, `Codex`.
    - Helper status text: *"You can write in pair lane. Agents can watch until you grant control."*
    - Button: `Grant control` (or `Revoke control`).
    - Checkbox: `[x] Allow other actors to watch. Watching is read-only. Control is explicit, scoped to this lane, and revocable.`
  - RECENT ACTIVITY: Timestamped event log.

---

### 3.4 SCR-05: Connect Agent Modal (`/workspace#modal-connect`)

Reached by clicking a harness row (e.g. `Claude Code` in the right sidebar `IN THIS WORKSPACE` panel) or a `Connect agent` affordance in the Omnibar harness selector. Rendered as a centered modal over the Execution Deck, max-width `440px`.

**Trust framing is the primary design goal.** A developer is being asked to authorise billable agent access from a web app they have used for two weeks. The modal must earn that trust before asking for anything.

* **Header:**
  - Title: `Connect Claude Code`
  - Close: `×` button, top-right.
* **Trust Panel (always visible, above the fold):**
  - Body copy, plain and specific: *"Congruence never sees your Claude credentials. Your browser opens Anthropic's own sign-in page, and the token is written straight to this workspace's disk. Anthropic keeps billing your existing plan."*
  - Explicit non-claim: *"We can't restore these credentials later, because we never hold them."*
* **Harness Selector:** segmented control, `Claude Code` / `Codex`. Selecting one updates the copy to name the correct vendor and sign-in domain. Do not show harnesses that have no host login flow without explaining why.
* **Primary Action:** `Connect Claude Code` (verb + object, per copy rules). On click:
  - Host asleep → button becomes `Waking workspace…` (disabled, spinner) until awake.
  - Host awake → button becomes `Waiting for you…` and the Authorize panel appears.
* **Authorize Panel (appears after the CLI starts, `state: awaiting_user`):**
  - Line 1, label + link: `Open Anthropic sign-in` → the single-use callback URL, `target="_blank"`, `rel="noopener noreferrer"`.
  - Line 2, secondary: `Copy code` for the device-code path, shown only when the CLI prints one.
  - Line 3, monospace expiry: `This link expires in 9:41` (live countdown, ≤ 10 min).
  - Never render the URL as a bare text input the user might paste elsewhere; present it as a labelled action.
* **Connected State (`state: connected`):**
  - Row shows provider mark + `Connected`, plus `Signed in on the host · survives sleep`.
  - Action: `Disconnect` (destructive, requires confirm).
  - **Disconnect confirm copy must state irreversibility plainly:** *"This deletes the credential from the workspace disk. Congruence can't restore it, you'll need to sign in again with Anthropic."* Confirm button: `Disconnect`, cancel: `Keep connected`.
* **Error State (`state: error`):**
  - Inline, below the harness selector, `text-[var(--accent-danger)]`.
  - Message is specific and actionable: *"Claude Code isn't installed on this host."* → *"Install it from the workspace terminal, then try again."* Never a generic "Something went wrong."
  - Action: `Retry` and `Open terminal`.

**States to design:** default, waking, awaiting_user (with countdown), connected, error (per-cause), host-asleep-on-open, and mid-disconnect-confirm. All eight interaction states from the design system apply (`hover`, `focus-visible`, `active`, `disabled`, `loading`).

**Accessibility:** the countdown is `aria-live="polite"` but throttled to announce only at 5 min and 1 min remaining, not every second. The modal traps focus and returns it to the invoking harness row on close. The sign-in link has an accessible name that includes the vendor (`Open Anthropic sign-in`), not just "Open link".

---

## 4. Alternate & Edge State Specifications

### 4.1 Hub to Execution Transition
1. User types in the Omnibar or clicks a starter chip (e.g. *Find and fix a small bug*).
2. Omnibar displays animated execution pulse.
3. System creates a new worktree lane `agent/fix-bug` in the sidebar with a `⠋` spinner.
4. Screen smoothly transitions to `SCR-02B` (Execution Deck) focused on the new worktree lane.

### 4.2 Workspace Sleep & Wake Transition Flow
1. User clicks `Sleep workspace`.
2. Workspace status switches to `○ Putting workspace to sleep...`.
3. Running dev server process is killed; terminal displays: `[Process terminated - Host entering sleep]`.
4. Preview switches to static snapshot state: `Saved preview (Host asleep)`.
5. Status changes to `○ Workspace asleep`.
6. User clicks `Wake workspace`:
   - Host wakes (< 15s simulation).
   - Files and tool credentials verify as preserved.
   - User clicks `Run dev` to restart ephemeral services.

### 4.3 Connect Agent Edge Cases

| Situation | Behaviour |
| :--- | :--- |
| Host asleep when modal opens | Auto-wake, `Waking workspace…`. Do not fail with an error the user must retry. |
| User closes the modal mid-handshake | Callback port stays bound until expiry, then reaped. Reopening shows the same pending URL. Resumable, not restart-only. |
| Callback URL expires unused | Inline `This link expired`, single action `Generate a new link`. The host-side partial state is cleaned up. |
| CLI not installed on host | Error names the missing binary and offers `Open terminal` to install it. |
| User has API billing, not a subscription | Vendor's own API-key login still works, executed on the host. We never persist the key; copy must not imply the subscription covers it. |
| Harness already connected | Modal opens in `connected` state with `Disconnect` as the only action. Never re-prompt. |
| Credential revoked at the vendor mid-session | Host probe flips state to `disconnected` on next check; harness surfaces its own auth error in the terminal. We do not attempt re-auth silently. |

---

## 5. Navigation & Keyboard Shortcuts

* `Cmd/Ctrl + K` -> Open Search / Command Palette.
* `Cmd/Ctrl + P` -> Quick switch between lanes (`Pair lane`, `Claude Code`, `Codex`).
* `Cmd/Ctrl + 1` -> Switch to Preview tab.
* `Cmd/Ctrl + 2` -> Switch to Terminal tab.
* `Cmd/Ctrl + 3` -> Switch to Changes tab.
* `Esc` -> Close modal or toggle hub/deck view.
