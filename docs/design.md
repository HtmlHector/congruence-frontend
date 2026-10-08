# Congruence Design System & Architecture Spec (`design.md`)

> **Product:** Congruence (`congruence.dev`)  
> **Aesthetic:** Geometric Precision Obsidian & Paper Technical Workspace  
> **Core Principle:** Strict Zero-Rounding (`rounded-none` / 0px radius), High Information Density, and Pure Geometric Clarity.

---

## 1. Core Visual Principles & Anti-Slop Guidelines

1. **Zero-Rounding Geometry (`rounded-none`)**:
   - All interactive controls, tab bars, buttons, dropdown menus, cards, modals, message bubbles, and drop zones must use strict `rounded-none` (0px border-radius).
   - No pill shapes, no bubbly corners, and no softened edges. Crisp, mechanical, IDE-grade precision.

2. **True Dual-Theme Contrast**:
   - **Dark Mode (Default Obsidian)**: 
     - Base Canvas: `#0A0A0C`
     - Header & Tab Bars: `#0E0E12`
     - Card / Surface Elev 1: `#121216`
     - Card / Surface Elev 2: `#141418`
     - Hairline Borders: `#222227` / `border-zinc-800`
     - Text Primary: `#EDEDED`
     - Text Muted: `#71717A` / `#A1A1AA`
   - **Light Mode (Paper Clean)**:
     - Base Canvas: `#FFFFFF`
     - Header & Tab Bars: `#FAFAFA`
     - Card / Surface Elev 1: `#F8F9FA`
     - Hairline Borders: `#E4E4E7` / `border-zinc-200`
     - Text Primary: `#09090B` / `#18181B`
     - Text Muted: `#71717A`

3. **Official Frontier Agent Iconography (Elements Standard)**:
   - Official SVG brand vectors matching [Elements](https://www.tryelements.dev/docs/logos):
     - **Claude Code (Anthropic)**: Multi-spoke coral/amber asterisk (`#E8804A`).
     - **OpenAI Codex**: Signature rosette ring (`#10B981` / `#18181B`).
     - **Google Antigravity (DeepMind)**: 4-point geometric astroid / star (`#6366F1` / `#818CF8`).
     - **Pair Shell / PTY**: Geometric terminal badge (`›_`).

4. **Information Density & Hierarchy**:
   - Clean, unified typography (`Inter` / `Geist Sans`) across interface copy, chat prompts, and technical metadata.
   - Precise text weights and contrast levels for git branches, diff counts (`+46 -1`), ports, session titles, and timestamps.
   - Clean micro-badges (status indicators, execution state badges, lease indicators).

---

## 2. Workspace Layout & Architecture

```
+---------------------------------------------------------------------------------------+
|  TOP HEADER / TAB STRIP (36px)                                                        |
|  [main] | [Claude 1] [Kilo CLI] [Preview] [Changes] [+] |  [Chat|PTY] [◫] [▶ Dev] [⌘J]|
+-------------------------------------------+-------------------------------------------+
|  PRIMARY PANE GROUP (50%)                 |  SECONDARY PANE GROUP (50%)               |
|  [Tab 1] [Tab 2] [+]        [Chat|PTY][X] |  [Preview] [Changes] [+]       [Swap] [X] |
|                                           |                                           |
|  [YOU] 06:42 PM                           |  +-------------------------------------+  |
|  Refactor auth middleware                 |  | Live HTTPS Web Preview              |  |
|                                           |  |                                     |  |
|  [GOOGLE ANTIGRAVITY]                     |  |  localhost:3000                     |  |
|  - Inspected middleware.ts                |  |                                     |  |
|  - Updated session token validation       |  |                                     |  |
|                                           |  +-------------------------------------+  |
|                                           |                                           |
|  +-------------------------------------+  |                                           |
|  | Instruct Antigravity...             |  |                                           |
|  | [Context] [Gemini 3.7] [SEND ^]     |  |                                           |
|  +-------------------------------------+  |                                           |
+-------------------------------------------+-------------------------------------------+
|  STATUS BAR (28px): SESSION: Antigravity | BRANCH: main | WORKTREE: repo  WRITE LEASE |
+---------------------------------------------------------------------------------------+
```

### 2.1 Multi-Tab Pane Groups (Editor Groups)
- **Independent Tab Bars**:
  - In single-pane mode, the top header hosts the worktree's tab bar.
  - In split-view mode, each pane group (Left/Right or Top/Bottom) renders its own dedicated tab bar with full tab controls.
- **Per-Group `+` Tab Spawning**:
  - Each tab bar has a dedicated `+` button to spawn Claude, Codex, Antigravity, Shell, Preview, or Changes directly within that specific group.
- **Drag-and-Drop Capabilities**:
  - **Horizontal Reordering**: Drag tabs within any group to reorder them with live left/right insertion indicators.
  - **Cross-Group Transfer**: Drag a tab from one group's tab bar into another group's tab bar.
  - **Drag to Split**: Dragging any tab toward the canvas boundaries (Right, Left, Bottom, Top) reveals live drop zones (`[ SPLIT RIGHT ]`, `[ SPLIT DOWN ]`, `[ SPLIT LEFT ]`, `[ SPLIT UP ]`) to split the layout.
- **Resizable Split Divider**:
  - Interactive 4px divider bar with hover gripper cues, allowing proportional resizing from 20% to 80%.

### 2.2 Conversation Stream & Composer
- **Unified Column Width**:
  - Both the message stream and composer dock share `w-full max-w-3xl mx-auto`.
  - No floating or shrinking blocks; cards span the full column cleanly.
- **User Prompt Box (`[YOU]`)**:
  - Background `#F8F9FA` (light) / `#121216` (dark) with `border-l-2 border-l-zinc-900 dark:border-l-zinc-100`.
- **Assistant Response Box (`[RUNNER]`)**:
  - Header: Runner name, active model, response duration (`✓ 3.9s`), and timestamp.
  - Collapsible Thought Process & Strategy accordion.
  - Real-time tool execution chips (running, done, error).
  - Clarification question cards with quick-response option pills.
- **Composer Dock**:
  - Seamless, borderless transition above the input box (`border-t-0`).
  - Textarea with auto-resizing and Enter-to-send.
  - Toolbar controls: Context attachments (`@file`, git diff, design spec), model selector, and Send button.

### 2.3 Consolidated Bottom Status Bar
- The top of the chat view is kept completely clean of metadata.
- All session context is consolidated into the bottom 28px bar:
  - `SESSION: <active_session_title>`
  - `BRANCH: <git_branch>`
  - `WORKTREE: <repo_name>`
  - `HOST: Local Runner` (pulsing status dot)
  - `WRITE LEASE ACTIVE` badge (emerald status chip).

---

## 3. Design Tokens Reference

### CSS Custom Properties (`src/styles/globals.css`)

```css
:root {
  /* Surfaces */
  --background: #0A0A0C;
  --foreground: #EDEDED;
  --surface-sidebar: #0E0E12;
  --surface-primary: #121216;
  --surface-card: #141418;
  --surface-header: #0E0E12;

  /* Borders */
  --border: #222227;
  --border-subtle: #18181C;
  --border-strong: #33333A;

  /* Brand Accents */
  --accent-claude: #E8804A;
  --accent-codex: #10B981;
  --accent-antigravity: #6366F1;
  
  /* Status Colors */
  --status-awake: #10B981;
  --status-working: #10B981;
  --status-thinking: #A855F7;
  --status-waiting: #F59E0B;
  
  /* Strict Geometry */
  --radius: 3.5px;
}
```

---

## 4. Key Component Checklist for New Features

When creating or modifying workspace components:
1. **Always use `rounded-[3.5px]`**: Use unified 3.5px precision corners for cards, buttons, tabs, and containers.
2. **Include Brand Icons**: Use `ClaudeIcon`, `OpenAIIcon`, `AntigravityIcon`, or `SquareTerminal` from `@/components/ui/brand-icons`.
3. **Respect Tab Group Ownership**: Tabs and chats should support being assigned to `primary` or `secondary` pane groups.
4. **Clean Technical Hierarchy**: Use compact text sizing (`text-[10px]` or `text-[11px]`) with precise weight and tracking for session badges, diff statistics, and timestamps.
5. **Keep Status in StatusBar**: Do not introduce top metadata headers inside canvas panes; pass session and branch info to `StatusBar.tsx`.
