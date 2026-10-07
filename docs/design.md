# Congruence · UI & UX Design Brief

> **Purpose:** Concrete visual direction, typography scales, layout rules, and copy-pasteable CSS design tokens for Congruence (`congruence.dev`).  
> **Status:** Approved  
> **Design Stylist:** design-stylist  
> **Visual Reference:** Superset (`superset.sh`) Precision Agent Workspace  
> **Skill Standard:** Hallmark Anti-AI-Slop Standard  
> **Date:** 2026-10-07  

---

## System

* **Genre:** Precision Obsidian Agent Workspace (Superset-inspired CLI Orchestrator)
* **Macrostructure:** Multi-pane execution environment, dual-mode. Left collapsible navigation sidebar with Workspaces, Tasks, and Worktree Sessions (`+46 -1`); Center canvas hosting the `{< >}` prompt hub, floating omnibar, and multi-lane execution deck (Terminal PTY, live HTTPS preview, Git diff).
* **Theme:** Deep Obsidian (dark) **and** Paper Neutral (light), selected by the OS. Dark values (Canvas `#0A0A0C`, Sidebar `#0E0E12`, Card surface `#121216`, Hairline border `#222227`, Foreground `#EDEDED`, Muted text `#878790`, Claude Anthropic Amber `#E8804A`, Emerald status `#10B981`). Light values are re-picked, not derived (Canvas `#F4F4F5`, Card surface `#FDFDFD`, Hairline border `#DCDCE1`, Foreground `#17171A`, Muted text `#5C5C64`, Claude Amber `#A94E19`, Emerald status `#047857`).
  - **Selection:** `prefers-color-scheme` only. There is no in-app toggle, no persisted preference, and no JavaScript in the critical path, so there is no flash-of-wrong-theme and no hydration mismatch. Dark is the `:root` base (and the no-media-query fallback); light is the `@media (prefers-color-scheme: light)` override.
* **Axes:**
  - *Density:* High-precision technical density (11px/12px monospace chips, diff badges `+46 -1`, compact worktree trees)
  - *Contrast:* Ultra-High in both modes. Dark holds white/light-gray on obsidian; light holds off-black ink on paper. Body text is never below 4.5:1 in either mode, verified by `npm run audit:contrast` and `npm run audit:theme`.
  - *Corner Radius:* Subtle geometric precision (`4px` to `6px` for cards/inputs, `12px` to `14px` for the floating omnibar pill, `2px` for monospace status chips)
  - *Texture:* Matte Obsidian with hairline borders, crisp top inset highlights, and zero fuzzy neon gradients.

### Mode-independent token families

Three families in `globals.css` are deliberately **not** overridden by the light block. Adding them to the light override is the main way to break this system:

| Family | Why it is mode-independent | Rule |
| :--- | :--- | :--- |
| `--radius-*` | Geometry | Never reference a colour to set a radius. |
| `--wash-*`, `--edge-hairline` | Derived from `--foreground` via `color-mix()` | Replaces hardcoded `bg-white/[0.0x]` hover states. Because it mixes the foreground, it inverts on its own. **Never write `bg-white/[0.04]`.** |
| `--surface-terminal`, `--terminal-*`, `--diff-*-bg`, `--diff-*-fg` | Terminal and git-diff panes stay dark in both modes, like a real terminal or `git diff` viewer | Panes must consume this family, **not** `--foreground` / `--muted-foreground` / `--surface-inset`, which invert and would leave near-black text on a near-black pane. |

Semantic aliases (`--ink-primary`, `--ink-muted`, `--bg-canvas`, `--bg-surface`, `--border-line`, `--accent-primary`, `--status-success`, `--status-error`) exist because `/dashboard` and `rail-sidebar` were authored against that vocabulary. They only reference other custom properties, so they are correct in both modes with no duplication. Prefer the canonical token in new code.


---

## 2. Design Tokens (`:root`)

The governing source of truth is **`src/styles/globals.css`**. The block below is the historical dark-mode excerpt and is kept for reference only; do not paste it into a project, because it predates the light palette and the three mode-independent token families described above.

```css
:root {
  /* Obsidian Dark Canvas & Surfaces (Default Experience) */
  --background: #0A0A0C;
  --foreground: #EDEDED;
  
  --surface-sidebar: #0E0E12;
  --surface-primary: #121216;
  --surface-secondary: #18181D;
  --surface-tertiary: #202026;
  --surface-omnibar: #16161B;
  --surface-card: #131318;
  --surface-inset: #0C0C0F;

  /* Borders & Dividers */
  --border: #222227;
  --border-subtle: #1A1A1F;
  --border-strong: #33333A;
  --border-focus: #FFFFFF;

  /* Primary Interactive Elements */
  --primary: #EDEDED;
  --primary-foreground: #0A0A0C;
  --primary-hover: #FFFFFF;

  --secondary: #1C1C22;
  --secondary-foreground: #EDEDED;
  --secondary-hover: #26262E;

  /* Muted Text & Accents */
  --muted: #1A1A20;
  --muted-foreground: #71717A;
  --subtle-foreground: #52525B;

  /* Provider Brand Colors */
  --accent-claude: #E8804A; /* Anthropic Claude Coral / Amber */
  --accent-claude-subtle: rgba(232, 128, 74, 0.12);
  --accent-codex: #10B981;  /* OpenAI Codex Emerald */
  --accent-codex-subtle: rgba(16, 185, 129, 0.12);
  --accent-opencode: #60A5FA;
  --accent-aider: #A78BFA;

  /* Status Indicators */
  --status-awake: #10B981;
  --status-asleep: #71717A;
  --status-running: #E8804A;
  --diff-add: #22C55E;
  --diff-del: #EF4444;

  /* Inputs & Forms */
  --input: #121216;
  --input-border: #26262C;
  --ring: #EDEDED;

  /* Geometry & Radius */
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --radius-omnibar: 14px;
  --radius-pill: 9999px;
  --radius: 6px;

  /* Typography Scale */
  --font-sans: 'Inter', 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'IBM Plex Mono', 'Geist Mono', monospace;

  /* Shadows (Subtle, Crisp Inset Hairline Highlights) */
  --shadow-frame: 0 16px 40px -12px rgba(0, 0, 0, 0.6), 0 32px 90px -24px rgba(0, 0, 0, 0.75);
  --shadow-omnibar: 0 12px 32px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  --shadow-dropdown: 0 8px 24px -4px rgba(0, 0, 0, 0.6);
}
```

---

## 3. Typography Hierarchy

| Style Element | Font Family | Size | Weight | Tracking / Line Height | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hub Headline** | Sans | `32px` / `40px` | Medium (500) | `-0.02em` / `1.2` | "What should we build next?" |
| **Hero Display** | Sans | `44px` / `56px` | SemiBold (600) | `-0.03em` / `1.15` | Landing headline |
| **Section Header** | Sans | `24px` / `30px` | Medium (500) | `-0.02em` / `1.25` | Section titles ("Changing devices...") |
| **Omnibar Input** | Sans | `15px` / `16px` | Regular (400) | `normal` / `1.4` | Primary task composer input |
| **Sidebar Nav / Labels** | Sans | `12px` / `13px` | Regular (400) | `normal` / `1.4` | Sidebar menu items, actor list |
| **Prompt Chip / Badges**| Sans | `12px` | Regular (400) | `normal` / `1.3` | Starter suggestions (💡 *Set up...*) |
| **Worktree / Branch / Diffs**| Mono | `11px` | Regular (400) | `+0.02em` / `1.4` | `+46 -1`, `main`, `/lanes/<id>` |
| **Terminal / PTY Output**| Mono | `12px` / `13px` | Regular (400) | `normal` / `1.6` | Shell output, Claude logs, rewritten URLs |

---

## 4. Key Component Specs (Superset Design Language)

### 4.1 Left Navigation Sidebar (`--surface-sidebar: #0E0E12`)
* **Header:**
  - Window controls (3 subtle dots: `#FF5F57`, `#FEBC2E`, `#28C840`).
  - Action button: `+ New Workspace` (`background: var(--surface-secondary)`, border: `1px solid var(--border)`).
* **Navigation List:**
  - Icons + Labels: `Search (Cmd+K)`, `Workspaces`, `Automations`, `Tasks`, `Pull requests`, `Pages`.
  - Active item: highlighted with subtle background `rgba(255,255,255,0.04)` and bright foreground.
* **Worktrees & Sessions Section:**
  - Section header: `SESSIONS` or `DESKTOP` with counter badge (`5`).
  - Session items:
    - Status icon: Animated spinner `⠋` for active runs, green dot `#10B981` for awake, amber dot for waiting.
    - Title: e.g. `fix onboarding crash`, `billing webhooks`, `refactor auth flow`.
    - Git diff badge: Monospace `+46 -1` in `--diff-add` and `--diff-del` colors.
* **Bottom Profile:**
  - Team monogram: `HT Hector's Team` with gear settings trigger.

### 4.2 Center Hub & The Floating Omnibar (`--surface-omnibar: #16161B`)
* **Geometric Branded Glyph:**
  - Centered monospace bracket glyph: `{< >}` with subtle ambient glow.
* **Prompt Starter Chips:**
  - Light pill cards (`background: var(--surface-card)`, border: `1px solid var(--border)`):
    - 💡 *Set up this project for Congruence*
    - 💡 *Explain to me how this repository works*
    - 💡 *Find and fix a small bug*
* **The Floating Omnibar:**
  - Container: Rounded rectangle (`border-radius: var(--radius-omnibar)`), border `1px solid var(--border)`, top inset highlight `inset 0 1px 0 rgba(255,255,255,0.08)`, shadow `var(--shadow-omnibar)`.
  - Multi-line textarea: *"Upgrade a dependency and fix what breaks..."*
  - Bottom Controls Row:
    - `+` Context attachment button.
    - Harness selector dropdown: `Claude v` (with orange Anthropic sunburst icon), `Codex v`, `OpenCode v`.
    - Model selector dropdown: `Default model v` (e.g. `claude-3-7-sonnet`, `o3-mini`).
    - Effort selector dropdown: `Default effort v` (`Low`, `Medium`, `High`).
    - Utility icons: Checkmark toggle, branch target, paperclip.
    - Submit button: Pill with `↑` arrow icon (`background: var(--primary)`, `color: var(--primary-foreground)`).

### 4.3 Workspace Execution Deck (Split View)
When a task/session is opened:
* **Top Header Bar:** Breadcrumb `PARABOX / WORKSPACES / Sample app (Private)` + `● Workspace awake` badge + `Sleep workspace` button.
* **Left Sub-Sidebar:** Worktree Lanes (`Pair lane [main]`, `Claude Code [claude/progress]`, `Codex [codex/copy]`) with `Files & Git: Persistent` context badges.
* **Center Tabs:**
  - `Preview`: Browser chrome with private HTTPS URL (`sample-app.congruence.example`) + rendered Fieldnotes app.
  - `Terminal`: Dark interactive xterm.js PTY with Claude Code logs and port rewrite detection.
  - `Changes`: Split git diff viewer with addition/deletion highlights.
* **Right Sidebar:**
  - In This Workspace: `You` (Owner), `Claude Code`, `Codex`.
  - Lane Control: "Watch first, grant when needed" dropdown with `Grant control` / `Revoke control`.
  - Recent activity feed.
* **Bottom Status Bar:**
  - Device/Host: `Fly Sprite (Awake)`
  - Workspace: `sample-app`
  - Worktree: `Worktree ⇕ main`

---

## 5. Voice & Copy Standards

* Pure precision, zero marketing fluff.
* Factual, technical, and respectful of developer intelligence:
  - *"One workspace for Claude Code, Codex, and any coding agent."*
  - *"Watch first. Grant when needed."*
  - *"One worktree per writer. One shared place to work."*
  - *"Files and configured identities survive sleep. Live processes are ephemeral."*
