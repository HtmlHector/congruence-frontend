# Foundation Blueprint

Status: proposal for approval. Not implemented.
Scope: the whole product surface, not just `/design-system`.
Relationship to existing docs: `design.md` remains the live contract until this blueprint is approved. This document proposes the corrected system and the migration that follows.

## 1. Design read

Congruence is a cloud development console. A workspace holds projects, each project provisions a devbox, and each git worktree opens a tiled surface of terminal panes, agent sessions (Claude, Cline, Codex) and browser previews.

Audience: developers and operators who already live in a terminal. They value fast scanning, predictable positions, low chrome and keyboard access.

Primary job: get a worktree running, and know what it is doing without leaving the workspace.

Voice: technical, plain, sentence case. The interface should read like a well-built tool, not a marketing site.

Direction: **operator's console**. Ink on paper in light mode, signal lights in dark mode. Structure comes from hairlines, aligned edges and a 4px grid. Color comes from the work itself: terminal output, previews, agent marks. The chrome stays quiet.

This direction is deliberately Vercel-adjacent, but it is not a Vercel copy. The identity is the pane grid, the 36px tab strip, the mono instrumentation, and the one expressive surface (the auth panel). Remove those and it would be generic. Keep them and it is Congruence.

## 2. Audit: what already works, and what breaks cohesion

### Already coherent

- Foundation tokens exist in `src/app/globals.css` and are consumed by 54 files.
- The workspace sidebar, settings shell, project list and worktree view already share the same language: hairlines, sunken hover, 13px UI copy, mono metadata, 12px cards.
- Geist Sans and Geist Mono are loaded through `next/font`; no font dependency is needed.
- The theme engine is app-wide, defaults to system, and paints before hydration.
- The 2px ink underline for the active pane is a strong, specific signature.

### What breaks cohesion

| Problem | Evidence | Consequence |
| --- | --- | --- |
| Three product names and voices | `Frontend starter` on `/`, `Congruence` in project copy, `Traceback` in auth, `Sora` in auth headings | The system cannot feel like one product while the product introduces itself three ways. |
| Two token vocabularies | Foundation in 54 files; legacy shadcn aliases (`bg-card`, `text-muted-foreground`, `border-border`) in 15 files | `--background` is `#FFFFFF` while `--foundation-bg` is `#FAFAFA`; `--border` is `#E5E5E5` in light and `white/10` in dark, while `--foundation-line` is `#262626`. Near-duplicates drift. |
| Type scale is ad hoc | 15 arbitrary sizes: 10, 11, 12, 13, 14, 15, 18, 19, 20, 24, 28, 32, 34, 36, 48 | `text-[10px]` appears 27 times, including status chips. Page titles range from 16px to 36px. Weights range from 400 to 800. |
| Uppercase eyebrows everywhere | 21 instances of `uppercase tracking-*` | `Product Foundation`, `Congruence`, `Included capabilities` and status chips all shout. Uppercase stops signaling "machine data" because it is used for marketing labels too. |
| Card language splits in two | Legacy `rounded-xl border bg-card shadow-xs` versus Foundation `rounded-fd-lg border` with no shadow | Billing and the home page read as a different product. Four radius families are in use: `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-fd-*`. |
| Shell dimensions disagree | Sidebar 260 vs 264; mobile drawer 280 vs 288; mobile header 56 vs 48 vs 60; content 720, 800, 880, 896, 1024, 1120, 1152 | The eye notices a 4px shift even when it cannot name it. Pages do not line up. |
| Hardcoded color | Auth `#0A0B0E`, `#F4AA84`, white copy and a gradient; emerald in billing and home; `bg-white` in the preview stage | Dark mode cannot adapt these surfaces. Status green competes with the system's success token. |
| The accent is unresolved | `--foundation-accent` is defined and documented, but used only in a `/design-system` specimen; active navigation and tabs use ink | The documentation promises a location signal that the product does not use. Two colors systems exist in one doc. |
| Dark control borders fail 3:1 | `--foundation-line-strong` is `oklch(0.44)` (`#525252`): 2.55:1 on `#0A0A0A` and 2.31:1 on `#171717` | Inputs and control boundaries are below the minimum for essential non-text contrast. This is a bug, not a preference. |

## 3. Principles

1. **Ink is the primary.** Near-black in light mode, near-white in dark. No brand hue, no gradient, no glow.
2. **Hue reports state.** Danger, success, warning and info are the only colors in chrome. They never decorate a card or a section.
3. **Structure is hairlines and space.** Borders and alignment separate most things. Shadows belong only to layers that actually float.
4. **The work is the color.** Terminal output, previews and agent marks supply the visual interest. Chrome stays monochrome.
5. **One scale each.** One type scale, one spacing scale, one radius ladder. An off-scale value is a defect, not a style choice.
6. **Density with air.** Compact controls (24 to 36px), compact rows (32 to 40px), generous page rhythm (48 to 64px).
7. **Motion confirms.** 100 to 200ms, never on load, never looping, never scroll-driven.

## 4. Color

### 4.1 Palette

OKLCH in `globals.css` remains the source of truth. Hex values below are computed for review. Contrast is measured against the page background unless noted.

| Role | Token | Light | Dark | Use |
| --- | --- | --- | --- | --- |
| Background | `--foundation-bg` | `#FAFAFA` | `#0A0A0A` | App canvas, sidebar, auth form side |
| Surface | `--foundation-surface` | `#FFFFFF` | `#171717` | Cards, panes, inputs, menus, dialogs |
| Sunken | `--foundation-sunken` | `#F5F5F5` | `#262626` | Hover, active nav, code blocks, table headers |
| Primary | `--foundation-ink` | `#171717` | `#E8E8E8` | Headings, primary buttons, focus, active tab underline |
| Primary foreground | `--foundation-bg` | `#FAFAFA` | `#0A0A0A` | Text on an ink fill |
| Text secondary | `--foundation-ink-secondary` | `#525252` | `#A1A1A1` | Descriptions, secondary labels |
| Text tertiary | `--foundation-ink-tertiary` | `#737373` | `#868686` | Captions, metadata, placeholders |
| Text disabled | `--foundation-ink-disabled` | `#A1A1A1` | `#555555` | Disabled text only |
| Hairline | `--foundation-line` | `#E5E5E5` | `#262626` | Dividers, card edges |
| Control line | `--foundation-line-strong` | `#868686` | `#6C6C6C` | Input and control boundaries |
| Focus | `--foundation-focus` | `#171717` | `#E8E8E8` | 2px ring, 2px offset |
| Danger | `--foundation-danger` | `#E7000B` | `#FF6467` | Errors, destructive actions |
| Success | `--foundation-success` | `#0C8041` | `#5DCD82` | Healthy state, success text and icon |
| Warning | `--foundation-warning` | `#995100` | `#FBA62A` | Attention, degraded state |
| Info | `--foundation-info` | `#2063BF` | `#6FA7EE` | In-progress, neutral information |

Contrast check:

| Token | Light on bg | Dark on bg | Verdict |
| --- | --- | --- | --- |
| Ink | 17.16:1 | 16.11:1 | AAA |
| Secondary | 7.47:1 | 7.63:1 | AAA |
| Tertiary | 4.53:1 | 5.44:1 | AA |
| Control line | 3.49:1 (3.64 on surface) | 3.75:1 (3.39 on surface) | Passes 3:1 |
| Danger | 4.56:1 | 6.84:1 | AA |
| Success | 4.81:1 | 9.95:1 | AA / AAA |
| Warning | 5.71:1 | 9.95:1 | AA / AAA |
| Info | 5.61:1 | 7.98:1 | AA / AAA |

The only value change from today's implementation is dark `--foundation-line-strong`: `oklch(0.53 0 0)` (`#6C6C6C`) instead of `oklch(0.44 0 0)`. The current value is 2.55:1 on the page and fails the 3:1 requirement for control boundaries. Light control line stays as it is.

### 4.2 Semantic recipes

- Status text and icon: 100% of the status color on `foundation-bg` or `surface`.
- Status chip: `bg-<status>/10`, `border-<status>/25`, text at 100%, plus a dot and a label. Color is never the only signal.
- Status fill: never. No full red card, no green banner. If the whole region is blocked, use a tinted block with a hairline and a clear heading.
- Primary action: ink fill, background-color text. Hover is `ink/85`. Press moves down 1px.
- Destructive action: `danger/10` fill with danger text. Never a solid red primary.
- Focus: 2px ink ring with 2px offset. It is visible on both themes and is not replaced by a colored glow.
- Selection: sunken fill with ink text, plus a 2px ink marker where position matters (active pane tab, active nav if needed).

### 4.3 Color rules

- No raw hex in feature code. If a value is missing, add a token.
- No hue as decoration: no accent wash, no gradient mesh, no glow, no colored side stripes.
- No status color on more than 15% of a screen at once.
- No pure black or pure white as a background. Use the token values.
- Inline links use ink with an underline. They do not use a blue link color; info is a state, not a link style.
- Charts use a five-step ink ramp (`ink`, `ink-secondary`, `ink-tertiary`, `line-strong`, `line`) with status colors only for thresholds. No rainbow series.

### 4.4 Resolve the accent

Retire `--foundation-accent`. It is defined, documented and effectively unused; active location already uses ink. Removing it resolves the contradiction between `design.md` (which describes a location accent) and `foundation-design-system-spec.md` (which requires ink only). If a live signal is needed later, add `--foundation-live` as a semantic token for realtime presence only, not as a second brand color.

### 4.5 One expressive exception

The auth split panel is the one place where the product may be expressive: a full-bleed product image or a still of the pane grid, a dark scrim for contrast, white copy. Its form column still uses Foundation. Do not add expressive surfaces anywhere else. This is where boldness is spent.

## 5. Spacing and layout

### 5.1 Scale

Base unit 4px. The scale is intentionally small.

| Token | Value | Allowed use |
| --- | --- | --- |
| `space-px` | 1px | Hairlines and dividers only |
| `space-0.5` | 2px | Focus offset, dot alignment, optical nudge |
| `space-1` | 4px | Icon interior, tight label spacing |
| `space-1.5` | 6px | Icon to label inside 24 to 32px controls. The only 6px exception. |
| `space-2` | 8px | Button gaps, control padding, related rows |
| `space-3` | 12px | Form rows, compact card padding, row padding |
| `space-4` | 16px | Default card padding, page gutter at mobile, stack gap |
| `space-5` | 20px | Comfortable card padding, header spacing |
| `space-6` | 24px | Desktop gutter, dialog padding, header-to-content |
| `space-8` | 32px | Section gap on mobile, large padding |
| `space-12` | 48px | Section gap on desktop, page top |
| `space-16` | 64px | Major page separation, page bottom |
| `space-24` | 96px | Marketing and docs only |

Retire 10, 14, 18, 28, 36, 44, 56, 72 and 80 as spacing values. Some of those numbers remain valid as component heights (for example a 56px header), but not as gaps or padding.

### 5.2 Semantic spacing

| Context | Value |
| --- | --- |
| Page gutter | 16 mobile, 24 from 640px, 32 from 1024px |
| Page top | 24 mobile, 32 from 640px, 48 from 1024px |
| Page bottom | 48 mobile, 64 desktop |
| Page title to description | 6px |
| Header to content | 24px |
| Section to section | 32 mobile, 48 desktop |
| Group to group inside a section | 24px |
| Card padding | 16 small, 20 default, 24 large |
| Row padding | 8/12 compact, 12/16 default |
| Label to field | 6px |
| Field to helper/error | 4px |
| Icon to label | 6px inside compact controls, 8px elsewhere |
| Stack inside a card | 12px |
| Sidebar padding | 8px horizontal, 8px vertical |
| Sidebar item height | 32px |
| Settings row gap | 40px between columns, 8px row gap |

### 5.3 Shell and containers

One dimension per role. No near-duplicates.

| Element | Value |
| --- | --- |
| Sidebar (workspace and settings) | 260px including the 1px border |
| Collapsed rail | 56px |
| Top bar | 56px, both shells |
| Tab strip | 36px |
| Tab width | 200px |
| Mobile drawer | 288px |
| Control heights | 24 xs, 28 sm, 32 md, 36 lg |
| Row heights | 32 compact, 40 default, 48 comfortable |
| App content max | 1200px |
| Settings content | 768px |
| Docs / design system content | 880px |
| Prose measure | 68ch |
| Auth form column | 400px |
| Breakpoints | 640, 768, 1024, 1280, 1536 |

Workspace shell:

```
┌────────────────────┬──────────────────────────────────────────────┐
│ 260 sidebar        │ 56 top bar: breadcrumb, context, actions     │
│ workspace identity ├──────────────────────────────────────────────┤
│ nav items 32px     │ 36 tab strip  [Terminal 1] [Preview :3000] + │
│ projects           ├──────────────────────────────────────────────┤
│                    │ pane grid, hairlines, 36px pane tab strips   │
│ footer: plan/help  │                                              │
└────────────────────┴──────────────────────────────────────────────┘
```

Content rhythm:

```
16/24/32 gutter
┌──────────────────────────────────────────────┐
│ Page title            24/32 semibold         │
│ Description           14/22 secondary, 68ch  │
│                                              │ 24
├──────────────────────────────────────────────┤ hairline
│ Section title         16/24 semibold         │
│ rows 40px, 12/16 padding, hairline separators│
└──────────────────────────────────────────────┘
48 to next section
```

### 5.4 Density tiers

- **Compact** (terminal strips, tables, sidebars): 28 to 32px rows, 4 to 8px gaps, 11 to 13px type.
- **Default** (settings, projects, billing): 40px rows, 12 to 16px padding, 13 to 14px type.
- **Comfortable** (auth, empty states, marketing): 48px or more, 20 to 24px padding, 14 to 16px type.

Do not mix tiers inside one region. A compact sidebar next to a comfortable settings page is fine because they are separate regions.

## 6. Typography

### 6.1 Families

- Sans: Geist Sans, weights 400, 500, 600. Used for all interface copy, headings and controls.
- Mono: Geist Mono, weights 400, 500. Used for IDs, ports, branches, shortcuts, counts, token names and code.
- No serif. No third family. No `font-sora`; it is referenced but not loaded.
- Numerals in mono contexts use `font-variant-numeric: tabular-nums`.

### 6.2 Hierarchy

| Role | Size / line | Weight | Tracking | Use |
| --- | --- | --- | --- | --- |
| Display | 48/48 | 600 | -0.04em | Landing and auth, once per page |
| H1 | 32/40 | 600 | -0.03em | Docs and design system page title |
| H2 | 24/32 | 600 | -0.02em | App page title, one per route |
| H3 | 20/28 | 600 | -0.015em | Dialog title, major section |
| H4 | 16/24 | 600 | -0.01em | Card or settings section title |
| Body large | 16/26 | 400 | 0 | Prose, 68ch maximum |
| Body small | 14/22 | 400 | 0 | Product descriptions, form values |
| UI / label | 13/20 | 500 | 0 | Nav, controls, table cells, row labels |
| Caption | 12/16 | 400 | 0 | Helper text, metadata, empty-state copy |
| Machine | 11/16 | 500 mono | 0.02em | IDs, ports, branches, keycaps, counts |
| Machine label | 11/16 | 500 mono | 0.06em, uppercase | Sidebar group names and status chips only |
| Code | 13/20 | 400 or 500 mono | 0 | Inline code and code blocks |

Scale names describe visual roles, not HTML heading levels. The route title is always rendered as an `<h1>` even when it uses the 24/32 role.

Product hierarchy in practice:

- Route title: 24/32 semibold, sentence case, one `<h1>` per page.
- Description: 14/22 secondary, maximum 68ch.
- Section title: H4 16/24.
- Group label: 11 mono uppercase, tertiary, used only for navigation groups and machine categories.
- Row label: 13/20 medium.
- Row description: 12/16 tertiary.
- Status chip: 11 mono uppercase, dot plus label.

### 6.3 Rules

- Weights are 400, 500 and 600 only. Retire 700 and 800 (billing currently uses `font-extrabold`).
- No italic headings.
- Negative tracking only at 20px and above. Never below -0.04em.
- Uppercase only for 11px machine labels and status chips. Never as a section eyebrow, never for a marketing label.
- Sentence case everywhere else, including buttons, page titles and section headings.
- Body copy never below 14px. Do not shrink prose to fit a layout; tighten spacing or change the layout.
- Prose measure 65 to 75ch. Tables may run wider because scanning wins over reading rhythm.
- One H1 per page, heading levels in order. Do not skip levels to get a size.
- No `text-balance` on interface copy; use it only on display headings.

### 6.4 Mapping the current sizes

| Current | New |
| --- | --- |
| 10px | 11px machine, or 12px caption |
| 11px | Keep (machine) |
| 12px | Caption |
| 13px | UI |
| 14px | Body small |
| 15px | 14 or 16 |
| 18/19px | 20px (H3) |
| 20px | H3 20/28 |
| 24px | H2 24/32 |
| 28px | 24 H2 or 32 H1 |
| 32px | H1 32/40 |
| 34/36px | 32 H1 |
| 48px | Display 48/48 |
| 700/800 weight | 600 |

## 7. Materials and motion

### Radius

| Value | Use |
| --- | --- |
| 4px | Chips, keycaps, status pills |
| 6px | Nav items, menu rows, compact buttons |
| 8px | Buttons, inputs, popovers |
| 12px | Cards, dialogs, panes |
| 9999px | Dots and avatars only |

No radius above 12px on a card or panel. Retire `rounded-[3.5px]`, `rounded-[5px]` and mixed `rounded-md/lg/xl` in feature code.

### Borders and elevation

- Card: 1px hairline, surface fill, no shadow.
- Input: 1px control line, surface fill, no shadow.
- Menu: hairline plus `0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)`.
- Dialog: hairline plus `0 24px 48px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.08)`.
- Mobile drawer: dialog shadow.
- Never a border plus a wide shadow on the same element unless it is a menu, dialog or drawer.
- Dark mode: floating layers step up one surface tone because shadows carry little weight there.

### Layers

Base content 0, sticky header 10, fixed sidebar 30, menus and popovers 40, dialogs and drawers 50, toasts 60. No arbitrary `z-[999]`.

### Motion

| Interaction | Duration | Behavior |
| --- | --- | --- |
| Hover color, border, background | 150ms | Color only |
| Button press | Immediate | 1px down |
| Menu open and close | 100ms | Fade plus 98% scale from trigger |
| Dialog open and close | 200ms | Fade plus 98% scale |
| Sidebar collapse | 200ms | Width and label opacity |
| Theme change | Instant | No page cross-fade |

Easing: `cubic-bezier(0.2, 0, 0, 1)`. Respect `prefers-reduced-motion`. No entrance sequences, loops or scroll effects.

## 8. Component contracts

- **Button.** 24/28/32/36px. One primary per region. Ink primary, outline, secondary, ghost, danger tint, link. Icon 16px (14px at xs). Focus ring 2px. Press 1px down.
- **Input and Label.** 32px, radius 8, control line. Label above at 13/20 medium. Helper below at 12/16 tertiary. Error replaces helper, uses danger, sets `aria-invalid` and `aria-describedby`. Placeholders are not labels.
- **Card.** Radius 12, 20px padding, hairline, no shadow, no nested cards. Footer separated by a top hairline, holding an action.
- **Tabs.** 36px strip, 200px tabs, butt together with hairlines, active tab sunken with a 2px ink underline. No rounded active tab.
- **Sidebar.** 260px, 32px rows, 6px radius, sunken active fill with ink text. Group labels are 11px mono uppercase. No left accent bar.
- **Status chip.** 20px tall, radius 4, 11px mono uppercase, 10% tint, 25% border, dot plus label.
- **Page header.** 24px title, 14/22 description at 68ch, actions right aligned, 24px below the header. One primary action.
- **Empty state.** 40px sunken square with a 16px icon, 16px title, 14/22 description at 46ch, one primary and one secondary action.
- **List row.** 40px default, 32px compact, 12/16 padding, hairline separators, hover sunken, focus ring inside the row.

## 9. Migration plan

No component is changed until this blueprint is approved.

**Phase 1: tokens and contracts**
1. Fix dark `--foundation-line-strong` to `oklch(0.53 0 0)`.
2. Remove `--foundation-accent` and its utility.
3. Add named spacing and type custom properties that mirror sections 5 and 6, so code no longer needs arbitrary values.
4. Make `body` use `bg-foundation-bg text-foundation-ink`, not the legacy aliases.
5. Update `design.md` and the `/design-system` specimens to match the approved values.

**Phase 2: primitives and shared components**
1. Button, input, label, card, dialog and menu already use Foundation. Audit them against section 8 and remove the remaining legacy classes.
2. Add shared `PageHeader`, `SectionHeader` and `StatusChip` recipes (or primitives) so pages stop rebuilding them.
3. Standardize shell dimensions to 260/56/288/40.

**Phase 3: route migration, closest first**
1. Projects list and project detail (mostly compliant; align titles and metadata).
2. Settings (already close; align section title to 16px and machine labels to 11px).
3. Workspace dashboard (currently legacy shadcn and marketing cards).
4. Billing and success (legacy cards, extrabold, emerald, shadows).
5. Auth (Traceback naming, Sora, hardcoded artwork colors, hand-rolled input).
6. Home (legacy tokens, 4xl/5xl headings, emerald dot, three feature cards).
7. `/design-system` specimens to match the final tokens.

**Phase 4: enforcement**
1. Delete the legacy shadcn aliases after the last route migrates.
2. Add lint rules or a CI check that fails on raw hex, arbitrary `text-[Npx]`, `rounded-xl`, `font-bold`, `font-extrabold`, `bg-card`, `text-muted-foreground` and off-scale spacing in feature code.
3. Add a visual regression baseline for the workspace shell, projects, settings and auth in both themes.

## 10. Acceptance checks

- No raw hex outside `globals.css`, logos and the terminal theme.
- No arbitrary text sizes in feature code. All type uses the scale.
- No legacy shadcn aliases remain in routes.
- Every route has one `<h1>` at 24/32, except docs/design system (32) and landing (48). The auth panel display line is not a document heading.
- Both top bars are 56px, both drawers 288px, both tab strips 36px. The settings sidebar is 260px; the workspace sidebar starts at 260px and collapses to a 56px rail.
- Body text is at least 14px; captions are 12px; machine labels are 11px.
- Every text token meets its contrast target in light and dark, including control lines at 3:1.
- Every interactive state has hover, focus-visible, active and disabled treatments.
- Reduced motion removes transform and width transitions.
- No uppercase eyebrow above a section heading.
- No status color used as decoration.

## 11. Decisions to confirm

1. **Product name.** Recommend `Congruence` everywhere. Retire `Frontend starter` and `Traceback`, including the auth copy, artwork and `Sora` references.
2. **Accent.** Recommend retiring it and using ink for location. If a live signal is required, add a narrowly scoped `foundation-live` token later.
3. **Body sizes.** Recommend 14px for product UI and 16px for prose. This is denser than the current 16px body rule, but it matches the operator console and keeps 13px chrome legible.
4. **Auth panel.** Keep the split composition as the one expressive surface, but replace the borrowed artwork and copy with Congruence's own.
5. **Dark control line.** The change from `#525252` to `#6C6C6C` is a correctness fix, not a style preference. It should be approved even if nothing else in this blueprint is.

## 12. What this blueprint refuses

- A second brand color, gradient accents, glass panels, glow rings or mesh backgrounds.
- A marketing card grid inside the product.
- A different typeface for headings just to create contrast.
- More than three weights and more than seven type sizes in product chrome.
- Cards inside cards, shadows on cards, or a border plus a wide shadow on the same surface.
- Uppercase labels as decoration.
- Inconsistent shell dimensions hidden behind "it looks close enough".
