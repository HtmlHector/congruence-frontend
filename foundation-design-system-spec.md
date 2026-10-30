# Foundation Design System Spec

Status: Ready for implementation
Date: 2026-10-23
Request: "beautiful, i kinda want us to modify our design system so it can have a vercel and notion type UI Design"

## 1. Summary

Modify the design system so it reads as Vercel-dominant, with Notion contributing the navigation model rather than the surface palette.

The visible redesign lands on the design system page at `/design-system`. The design system itself becomes a real layer:

- New `--foundation-*` tokens in `globals.css`, available globally, consumed by `src/components/ui` and the page.
- Existing shadcn token values stay untouched, so screens built from raw utility classes keep their current look in light mode.
- Storybook is added with full component coverage.
- Dark mode becomes app-wide, controlled by a three-way theme setting that defaults to system and persists an explicit choice.

This intentionally supersedes the neutral shadcn constraint in `frontend-starter-spec.md`. That document is not updated by this spec; updating it is a follow-up.

## 2. Design read

Surface: design system reference page, part documentation (Read) and part component bench (Operate).
Audience: the engineers and designers working in this starter before it is copied per product.
Voice: technical, plain, no marketing register.
Direction: Vercel visual discipline (ink monochrome, Geist, tight tracking, hairlines, 8px controls, dense metadata) with Notion information architecture (persistent grouped sidebar, breadcrumbs, calm grouping) and Notion softness only in rounding and hover surfaces.

Dials: DESIGN_VARIANCE 5, MOTION_INTENSITY 2, VISUAL_DENSITY 6.

Explicit non-goals: no Vercel or Notion logos, wordmarks, screenshots or trademarks in the interface. No gradient mesh hero. No purple or blue brand glow. No emoji icon system.

## 3. Decisions log

| Area | Decision | Notes |
| --- | --- | --- |
| Surface scope | Design system page only | No layout redesign of home, auth, billing or integrations in this change. |
| Blend | Vercel-dominant | Notion appears in navigation and grouping, not in warmth or serif type. |
| Theme | Dual, system default, persisted choice | Applied app-wide through `.dark` on the document element. |
| Accent | Ink only | Hue is reserved for semantic status colors. |
| Typefaces | Geist Sans and Geist Mono | Already installed with `next/font`. No new font dependency. |
| Shape and density | Strict Vercel | 8px base radius, 32px controls, compact rows, mono metadata. |
| Warmth | Cool neutral | Near-white and neutral gray, no visible warm tint. |
| Page shell | Notion sidebar plus breadcrumbs | Grouped navigation, breadcrumb header above content. |
| Gap handling | Label the page as the target system | One status note, no per-component status table. |
| Token strategy | Add globally, consume on the page and in `ui` | Existing token values remain unchanged. |
| Token names | `--foundation-*` prefix | Utility mapping uses an `fd` short prefix. |
| State color | Standard semantic colors | Danger, success, warning, info. Status only, never decoration. |
| Motion | Vercel restraint | 100-200ms, no entrance choreography, no scroll effects. |
| Mobile navigation | Collapse to icon rail | No drawer, no backdrop. |
| Dark surfaces | Vercel near-black | `#0a0a0a` page, elevated panels at `#171717`. |
| System name | Foundation | No mention of Vercel or Notion in the interface. |
| Page sections | Curated: keep core, drop patterns and rules, add grid, materials, code, keyboard | Final list in section 9. |
| Storybook | Full setup | Every `ui` component and primitive, docs pages, a11y addon, theme toolbar. |
| Dependencies | Hand-roll theme and command menu | Storybook is the only new dependency family. |
| Shell controls | Sidebar footer | Search trigger, theme control and home link pinned at the bottom. |
| Search | One unified command palette | Cmd/Ctrl+K, no inline filter field. |
| Copy behavior | Two copy targets | CSS variable and Tailwind utility per token row. |
| Sidebar desktop | Collapsible with persisted state | Expanded by default at 1024px and above. |
| A11y | WCAG AA | 4.5:1 body, 3:1 large text and essential control boundaries, keyboard complete. |
| Component code | Components adopt Foundation | `src/components/ui` consumes Foundation tokens. Existing screens using them shift. |
| Existing component consumers | Let them shift | Integrations hub and custom key modal inherit the new component surfaces. |
| Theme scope | Whole app | Every route follows the resolved theme, including auth and billing. |
| Route | Replace `/design-system` | No legacy page, no redirect. |

### Resolved conflicts

- "Design system page only" versus "components adopt Foundation": the redesign is page-level. The component library is restyled because the page must document real components, not a parallel copy. Screens keep their layouts and raw-styled sections stay as they are.
- "Page-local composition" versus "components adopt Foundation": component adoption wins. The page may still compose page-only layout pieces (sidebar, token rows, command palette), but the shared `Button`, `Input`, `Label`, `Card`, `Dialog` and `DropdownMenu` are updated in place.
- "Storybook documents current components" versus "update the components": components are updated, so Storybook is accurate without a decorator trick.
- Theme is app-wide, which means dark mode also reaches raw-styled screens. That is accepted, with the risk documented in section 14.

## 4. Current state and constraints

- `src/app/globals.css` holds the shadcn token set in OKLCH, light values in `:root`, dark values in `.dark`. Nothing applies `.dark` today.
- `src/components/ui` contains Button (Base UI), Card, Dialog and DropdownMenu (Radix), Input, Label.
- `src/components/primitives` is headless and emits `data-slot` attributes. These do not change.
- Screens use three visual languages:
  - Neutral starter home with raw utility classes and inline hex.
  - Traceback auth screens with a split artwork panel, `#0A0B0E`, `text-white`, `font-sora` (no such font is loaded), undefined `--duration-fast` and `border-border-strong`, and `rounded-[3.5px]`.
  - Feature screens with emerald and indigo status colors and pill filters.
- No Storybook, no theme provider, no command palette, no visual regression setup.
- `src/middleware.ts` was removed earlier because Next 16.4.3 rejects a project that has both `middleware.ts` and `proxy.ts`. The dev server runs with `src/proxy.ts` only.
- Existing tests: `src/app/design-system/page.test.tsx` covers the current page, including a no-dash assertion.

## 5. Foundation direction

### 5.1 Principles

1. Structure over decoration. Hierarchy comes from type scale, weight, hairlines and space.
2. Ink is the brand. Near-black carries CTAs, links and selected states.
3. One hue rule. Color only appears to report status, never to decorate.
4. Density with air. Compact controls, generous space between groups.
5. Docs mirror product. The page uses the same components it documents.
6. Motion confirms state. Nothing enters, loops or parallaxes for effect.

### 5.2 What comes from Vercel

- Geist Sans and Geist Mono, weights 400, 500, 600 only.
- Near-black and near-white palette with a neutral gray ramp.
- Tight negative tracking at display sizes, capped at -0.04em.
- 1px hairlines, 8px control radius, 12px panel radius.
- Mono for token names, IDs, shortcuts and numeric metadata.
- Compact 32px controls and 56px rails and headers.
- Stacked low-opacity shadows only on floating layers.
- Restraint: no second accent, no display weight above 600, no gradient decoration.

### 5.3 What comes from Notion

- Persistent left sidebar with grouped, icon-led navigation.
- Breadcrumbs above the content, reflecting the active group and section.
- Calm grouping through space and single hairlines rather than cards.
- Sunken hover surfaces for navigation rows.
- Sidebar footer for persistent utility controls.
- Airier line height in prose than in controls.

Not adopted from Notion: warm paper neutrals, serif headings, emoji page icons, illustrated covers, pill-shaped content badges outside status.

### 5.4 Anti-patterns to refuse

- Gradient text, glass panels, glow rings, mesh backgrounds.
- Side-stripe accent borders on cards or callouts.
- Hero metric blocks, identical feature card grids, uppercase eyebrows above every section.
- Border plus wide drop shadow on the same element.
- Radius above 16px on panels and cards.
- Vercel or Notion brand marks, product screenshots or copied component names as branding.
- Em dashes in any user-visible copy.

## 6. Tokens

All Foundation tokens are defined in `src/app/globals.css`, globally available, and consumed only by `src/components/ui` and the design system page. Existing shadcn variables are not modified.

Naming: `--foundation-*` for variables. Map color values in `@theme inline` as `--color-foundation-*` so utilities such as `bg-foundation-surface` exist. Map radii as `--radius-fd-*` so utilities such as `rounded-fd-lg` exist. The `fd` short prefix avoids collision with the existing radius scale.

### 6.1 Color, light

Hex values are review aids. OKLCH is the source of truth.

| Token | Value | Role | Contrast note |
| --- | --- | --- | --- |
| `--foundation-bg` | `oklch(0.985 0 0)` `#fafafa` | Page canvas | Base |
| `--foundation-surface` | `oklch(1 0 0)` `#ffffff` | Cards, panels, inputs | Base |
| `--foundation-sunken` | `oklch(0.97 0 0)` `#f5f5f5` | Code blocks, hover rows, table headers | Base |
| `--foundation-ink` | `oklch(0.205 0 0)` `#171717` | Primary text, CTAs, focus | Above 15:1 on page |
| `--foundation-ink-secondary` | `oklch(0.439 0 0)` `#525252` | Body support, descriptions | Above 7:1 |
| `--foundation-ink-tertiary` | `oklch(0.556 0 0)` `#737373` | Captions, metadata | Above 4.5:1 |
| `--foundation-ink-disabled` | `oklch(0.708 0 0)` `#a3a3a3` | Disabled text only | Non-text exemption |
| `--foundation-line` | `oklch(0.922 0 0)` `#e5e5e5` | Dividers and hairlines | Decorative only |
| `--foundation-line-strong` | `oklch(0.62 0 0)` `#949494` | Input borders, essential control boundaries | At least 3:1 on white |
| `--foundation-focus` | `oklch(0.205 0 0)` `#171717` | Focus ring | 2px ring, 2px offset |
| `--foundation-danger` | `oklch(0.577 0.245 27.325)` | Errors and destructive text | At least 4.5:1 |
| `--foundation-success` | `oklch(0.527 0.135 152)` | Success text and icons | At least 4.5:1 |
| `--foundation-warning` | `oklch(0.51 0.13 62)` | Warning text and icons | At least 4.5:1 |
| `--foundation-info` | `oklch(0.51 0.16 258)` | Informational text and links in prose | At least 4.5:1 |

### 6.2 Color, dark

| Token | Value | Role |
| --- | --- | --- |
| `--foundation-bg` | `oklch(0.145 0 0)` `#0a0a0a` | Page canvas |
| `--foundation-surface` | `oklch(0.205 0 0)` `#171717` | Cards, panels, inputs |
| `--foundation-sunken` | `oklch(0.269 0 0)` `#262626` | Code blocks, hover rows |
| `--foundation-ink` | `oklch(0.93 0 0)` `#ededed` | Primary text |
| `--foundation-ink-secondary` | `oklch(0.708 0 0)` `#a3a3a3` | Body support |
| `--foundation-ink-tertiary` | `oklch(0.62 0 0)` `#8f8f8f` | Captions, metadata |
| `--foundation-ink-disabled` | `oklch(0.45 0 0)` | Disabled text only |
| `--foundation-line` | `oklch(0.269 0 0)` `#262626` | Hairlines |
| `--foundation-line-strong` | `oklch(0.44 0 0)` `#6b6b6b` | Control borders, at least 3:1 on page |
| `--foundation-focus` | `oklch(0.93 0 0)` `#ededed` | Focus ring |
| `--foundation-danger` | `oklch(0.704 0.191 22.216)` | Errors |
| `--foundation-success` | `oklch(0.765 0.15 152)` | Success |
| `--foundation-warning` | `oklch(0.79 0.16 70)` | Warning |
| `--foundation-info` | `oklch(0.72 0.12 255)` | Info |

### 6.3 Color rules

- Ink-only means no brand hue. `info` is a state color, not a link accent; prose links use ink with an underline.
- Status color never fills a large surface. Use tinted text plus a hairline, or a small tinted background at 10% with full-strength text.
- The page shows one theme at a time. Swatch rows include a small light/dark pair for reference, but the surrounding UI follows the active theme.
- Do not introduce raw hex in feature code. If a value is missing, add a token.

### 6.4 Typography

Families:

- Sans: Geist, loaded as `--font-geist-sans`, weights 400, 500, 600.
- Mono: Geist Mono, loaded as `--font-geist-mono`, weights 400, 500.
- No serif. No second display family.

Scale:

| Role | Size / line height | Weight | Tracking | Use |
| --- | --- | --- | --- | --- |
| Display | 48px / 48px | 600 | -0.04em | One per page, page title only |
| H1 | 32px / 40px | 600 | -0.03em | Section group titles |
| H2 | 24px / 32px | 600 | -0.02em | Section headings |
| H3 | 20px / 28px | 600 | -0.015em | Subsection headings |
| Body | 16px / 24px | 400 | 0 | Prose, max 70ch |
| Body strong | 16px / 24px | 500 | 0 | Lead-ins inside prose |
| Body small | 14px / 20px | 400 | -0.005em | Dense descriptions |
| Label | 14px / 20px | 500 | 0 | Controls, nav items |
| Caption | 12px / 16px | 400 | 0 | Helper text, metadata |
| Code | 13px / 20px | 400 mono | 0 | Inline code, token values |
| Mono label | 12px / 16px | 500 mono | 0.02em | Shortcuts, IDs, group labels in the sidebar |

Rules:

- Display tracking never goes below -0.04em, even though Vercel uses -2.4px at 48px.
- Uppercase is limited to short machine labels such as shortcut keys and token prefixes. It is never a section eyebrow.
- Sidebar group labels may use mono label styling, since they name a navigation group rather than decorate a heading.
- Prose measure is 65-75ch. Tables may run wider.
- No italic headings.

### 6.5 Spacing and grid

- Base unit 4px. Steps: 4, 8, 12, 16, 20, 24, 32, 48, 64, 96.
- 12-column grid, 24px gutter at 1024px and above, 16px at 768-1023px, 12px below 768px.
- Page container: 1200px maximum.
- Content measure: 720px for prose, 880px for specimen tables and grids.
- Sidebar expanded 260px, rail 56px, header 56px.
- Section rhythm: 64px between sections at desktop, 40px at mobile, separated by a single hairline.

### 6.6 Radius

| Token | Value | Use |
| --- | --- | --- |
| `--foundation-radius-xs` | 4px | Tags, shortcut keys |
| `--foundation-radius-sm` | 6px | Menu rows, sidebar items |
| `--foundation-radius-md` | 8px | Buttons, inputs, popovers |
| `--foundation-radius-lg` | 12px | Cards, dialogs, panels |
| `--foundation-radius-pill` | 9999px | Status pills and avatars only |

No radius above 16px on a card or panel.

### 6.7 Borders, elevation, z-index

- Hairline: 1px `--foundation-line`. Decorative separation only.
- Control border: 1px `--foundation-line-strong`, used where the boundary is essential to identify an input.
- Cards: 1px hairline, surface fill, no shadow.
- Raised menu: `0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)`, plus a hairline.
- Dialog: `0 24px 48px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.08)`, plus a hairline.
- Dark mode: shadows carry little weight, so floating layers also step up one surface tone.
- Never combine a border with a wide shadow on the same element unless it is a dialog or menu.
- Z-index: 0 base, 10 sticky header, 40 dropdown and popover, 50 dialog and command palette, 60 toast. No arbitrary `z-[999]`.
- Overlay scrim: 60% black, no backdrop blur.

### 6.8 Motion

| Interaction | Duration | Behavior |
| --- | --- | --- |
| Hover color, border, background | 150ms | Color only |
| Button press | Immediate | 1px downward translate |
| Menu open and close | 100ms | Fade plus 98% scale from the trigger origin |
| Dialog open and close | 200ms | Fade plus 98% scale, centered |
| Sidebar expand and collapse | 200ms | Width and label opacity |
| Command palette | 150ms | Fade plus 98% scale |
| Theme change | Instant | No cross-fade of the whole page |

Easing: `cubic-bezier(0.2, 0, 0, 1)`.

Rules:

- No page-load sequences, no scroll-triggered reveals, no marquees.
- Hover effects only inside `(hover: hover) and (pointer: fine)`.
- Reduced motion: remove transform and width animation, keep instant color and opacity changes. Sidebar snaps, palette appears.
- Never animate `top`, `left`, `width`, `height`, `margin` or `padding` except the sidebar width, which is allowed once with a reduced-motion fallback.
- Motion tokens: `--foundation-duration-fast: 100ms`, `--foundation-duration-base: 150ms`, `--foundation-duration-slow: 200ms`, `--foundation-ease`.

## 7. Component changes

All APIs and exports stay stable. Only the visual recipe changes. Existing call sites do not need edits.

### 7.1 Button

- Height 24, 28, 32, 36 for xs, sm, default, lg. Icon sizes match.
- Radius 8px. Label 14px/500, 12px for xs. Icon 16px, 14px for xs.
- Variants keep their names:
  - `default`: ink fill, background-color text.
  - `secondary`: sunken fill, ink text.
  - `outline`: surface fill, control border, ink text.
  - `ghost`: transparent, sunken on hover.
  - `destructive`: danger tint at 10%, danger text, danger hairline on hover.
  - `link`: ink text, underline on hover.
- Focus: 2px `--foundation-focus` ring with 2px offset, visible on keyboard only.
- Press: 1px down. No scale.
- Disabled: 50% opacity, no pointer events, no press.
- Loading: keep width stable, spinner icon 14px, label unchanged or "Saving" style copy set by the caller.
- Icon-only buttons require `aria-label`.

### 7.2 Input and Label

- Height 32px, radius 8px, 14px text, 12px horizontal padding.
- Surface fill, 1px `--foundation-line-strong` border.
- Hover: border shifts to ink-secondary.
- Focus: 2px ink ring, 2px offset, border stays visible.
- Invalid: danger border plus danger ring at 20%, error text below at 12px/500 danger.
- Disabled: sunken fill, disabled ink, no pointer events.
- Placeholder: `--foundation-ink-tertiary` and at least 4.5:1.
- Label sits above the field, 14px/500. Never a placeholder as label.
- Helper text 12px, tertiary. Error replaces helper and is wired with `aria-describedby`.

### 7.3 Card

- Radius 12px, surface fill, 1px hairline, no shadow.
- Padding comes from `--card-spacing`: 20px default, 16px small.
- Footer: top hairline, no tinted background. This is a change from the current `bg-muted/50` footer.
- No nested cards. Use a hairline and space for internal grouping.
- Hover lift is not part of the base card. An interactive card may shift border color only.

### 7.4 Dialog

- Radius 12px, surface fill, hairline, dialog shadow.
- Scrim 60% black, no blur.
- 200ms fade and 98% to 100% scale, centered.
- Close button 28px, ghost, focus visible.
- Header, title 20px/600, description 14px secondary.
- Footer actions right aligned at desktop, stacked at mobile.
- Escape closes, focus returns to the trigger.

### 7.5 DropdownMenu

- Radius 8px, surface fill, raised shadow, hairline.
- Item radius 6px, height 28px, 14px label, 16px icon.
- 100ms fade and scale from the trigger origin.
- Keyboard highlight uses the sunken surface, not a colored fill.
- Destructive item uses danger text.
- No checkmarks or separators unless they convey state or grouping.

### 7.6 Unchanged

- `src/components/primitives/*` keeps its structure and `data-slot` hooks. Stories compose them with Foundation styles.
- Sonner toaster keeps its behavior, with colors mapped to Foundation tokens if it is touched at all.
- Forms, API, auth logic and data fetching are untouched.

## 8. Theme engine

- Three-way mode: `system`, `light`, `dark`. Default `system`.
- Storage key: `foundation-theme`. Values: `system`, `light`, `dark`. Missing value means `system`.
- Resolution: `system` reads `prefers-color-scheme`; explicit values win.
- Application: toggle `dark` on `document.documentElement`, set `style.colorScheme` to the resolved value, and set `data-theme` for debugging.
- No flash: a small blocking inline script in the root layout reads storage and media query before paint. Keep it dependency-free and try/catch around storage access.
- Live system change: listen to `matchMedia` and update only while mode is `system`.
- Control: three icon buttons (`Sun`, `Moon`, `Monitor`) in the sidebar footer, 28px each, grouped in a 32px segmented container, each with `aria-pressed` and an accessible name.
- Scope: app-wide. Every route follows the resolved theme. Storybook uses its own toolbar and applies the same class to its preview root.
- Consequence: raw-styled screens will change in dark mode, including hardcoded colors in auth and the emerald and indigo status colors. This is accepted. Section 14 records the risk.

## 9. The Foundation page

### 9.1 Route and shell

- Replace `src/app/design-system/page.tsx`. Keep the `/design-system` URL.
- Remove the current `ThemeScope` wrapper, since theme is now app-wide.
- Shell composition:
  - Left sidebar, fixed, full viewport height, 260px expanded and 56px rail.
  - 56px top header across the content area, sticky, hairline bottom, breadcrumbs only.
  - Content container 1200px with 24px side padding at desktop, 16px at mobile.
  - Skip link to `#content`.
- Wordmark: 24px ink square with a mono `F`, then `Foundation` at 14px/600 and a 11px tertiary caption `Design system`.
- Sidebar groups:
  - Foundations: Color, Typography, Grid and spacing, Materials and depth, Motion.
  - Components: Buttons, Forms, Cards, Overlays, Primitives.
  - Reference: Code and copy, Keyboard and command menu.
- Nav item: 32px height, 6px radius, 16px lucide icon, 13px/500 label, 12px gap. Hover uses sunken at 60%. Active uses sunken with ink text and `aria-current="page"`. No left accent bar.
- Sidebar footer, separated by a hairline and pinned to the bottom:
  - Command trigger styled as a 32px field: search icon, `Search Foundation`, and a `⌘K` key hint. Opens the palette.
  - Theme control: three segments for light, dark and system.
  - Home link to `/`, 13px secondary with an arrow icon.
- Collapse control: 28px ghost icon button in the sidebar footer, `ChevronsLeft` and `ChevronsRight`, accessible label changes with state. Persisted under `foundation:sidebar`. Collapsed state hides labels, group headings become a hairline, and icons get tooltips on hover and focus.
- Responsive: at 1024px and above, expanded by default with a user toggle. Below 1024px, the rail is the default and labels are hidden. No drawer. Tables scroll horizontally inside their own container.
- Breadcrumbs: `Foundation / <group> / <section>`, 13px, group and section links, current section plain text with `aria-current="page"`. Updates from the active section via scroll position. No slash separators inside metadata elsewhere.

### 9.2 Content sections, final list

1. Color
   - One-line rule: ink only, hue for status.
   - Token groups: surfaces, text, lines and focus, status, radius-independent. Each row: swatch pair for light and dark, token name, utility, contrast note, copy targets for var and class.
   - Status color rules and tinted usage examples.
2. Typography
   - Families, then the scale table with live specimens.
   - Rules: tracking floor, measure, sentence case, machine labels only in caps.
3. Grid and spacing
   - Spacing steps, 12-column grid diagram, containers, gutters, breakpoints.
   - `Show grid` toggle that overlays 12 columns inside the content column with `pointer-events-none`. `aria-pressed` on the control. No animation.
4. Materials and depth
   - Surface swatches: page, surface, sunken.
   - Hairline versus control border, with a control boundary example.
   - Elevation specimens for card, menu and dialog.
   - Z-index table and rules.
5. Motion
   - Duration table, easing, sidebar and palette behavior.
   - Reduced-motion demonstration note.
   - What never animates.
6. Buttons
   - Variants, sizes, states, icon-only, loading, destructive, focus example.
   - Notes on press, disabled and label copy.
7. Forms
   - Default, helper, invalid with `aria-describedby`, disabled, placeholder contrast, label placement.
   - No new controls beyond Input and Label in this change.
8. Cards
   - Base card, small card, footer, interactive border-only hover.
   - When to use a panel instead, no nesting.
9. Overlays
   - Working dialog and dropdown specimens.
   - Scrim, focus return, escape, trigger-origin scaling, when to prefer inline editing.
10. Primitives
    - Inventory table of AppShell, SidebarNav, SidebarGroup, SidebarItem, WorkspaceSwitcher, ResourceHeader, ResourceGrid, EmptyState, RealtimeProvider.
    - Columns: primitive, owns, hooks. Note that primitives stay unstyled.
11. Code and copy
    - Token copy pattern, code block with a copy button, feedback via `aria-live="polite"`, reset after 1.5s.
    - Snippet examples for a button, a field and a card.
    - Copy targets: CSS variable and Tailwind utility per token. No syntax highlighting dependency; mono text with token coloring.
12. Keyboard and command menu
    - Shortcut table: `⌘K` or `Ctrl+K` open palette, arrows move, Enter jumps, Escape closes, `[` toggles the sidebar.
    - Live palette demonstration and behavior notes.

Removed: the old `Page patterns` and `Rules` sections. The rules survive as implementation guidance in this spec and as short inline notes inside sections, not as their own list.

### 9.3 Target-system note

Placed once under the page intro, in a sunken block with a hairline:

> Target system. Components use Foundation tokens. Screens built from raw utility classes still use the previous palette.

No status table, no per-section labels, no version number, no status dot.

### 9.4 Command palette

- Hand-rolled with the existing Dialog primitive. No `cmdk`.
- Trigger: sidebar footer button, plus `Cmd+K` on macOS and `Ctrl+K` elsewhere.
- Panel: 560px wide, surface, 12px radius, dialog shadow, top input, grouped results, footer key hints.
- Search index built at module scope from:
  - Sections: label, group, anchor, keywords.
  - Tokens: token name, utility, group.
  - Components: name, variants.
- Behavior: type to filter across all groups with a case-insensitive match; arrows move a single active index across groups; Enter navigates to the anchor or copies the token? Navigation only. Escape closes. Focus returns to the trigger. Result list uses `role="listbox"` and `aria-activedescendant`; input uses `role="combobox"` with `aria-expanded` and `aria-controls`.
- Empty state: "No matches." plus a hint to try "color" or "button".
- No recent items, no remote search, no AI.

### 9.5 Copy behavior

- Each token row has two icon buttons: copy CSS variable (`--foundation-ink`) and copy utility (`text-foundation-ink`).
- `navigator.clipboard.writeText` with a try/catch. On success, swap the icon to `Check` for 1.5s and announce "Copied --foundation-ink" in a polite live region.
- On failure, announce "Copy failed" and leave the icon unchanged.
- Buttons are 24px with 44px hit area via padding, and carry accessible labels.

## 10. Storybook

- Add Storybook at the repo root with the current stable version at implementation time. Verify the framework package for Next.js and Vite before installing.
- Framework: Next.js with Vite.
- Config: `.storybook/main.ts` and `.storybook/preview.tsx`.
- `preview` imports `src/app/globals.css`, sets a neutral canvas, and registers a `theme` global toolbar with `light` and `dark`.
- Theme decorator toggles `dark` on the preview root and sets `color-scheme`. Alternatively apply to the preview iframe document if the framework requires it; verify both themes visually.
- Addons: essentials (controls, actions, docs, viewport, backgrounds), accessibility. No visual regression addon.
- Docs: autodocs for components plus `Introduction.mdx` covering Foundation principles and linking to `/design-system`.
- Stories required:
  - Button: variants, sizes, states, icon-only, loading, destructive.
  - Input and Label: default, helper, invalid, disabled, placeholder.
  - Card: default, small, with footer, interactive.
  - Dialog: open state with title, description and footer actions.
  - DropdownMenu: open state with items, destructive item, separator.
  - AppShell and SidebarNav: expanded and collapsed, active item.
  - WorkspaceSwitcher: multiple workspaces.
  - ResourceHeader: title, description, badge, actions.
  - ResourceGrid: loading, empty, filled.
  - EmptyState: icon, title, description, primary and secondary action.
  - RealtimeProvider: a decorator that provides a mock context for `useRealtimeContext` consumers. Do not open sockets in stories.
- Scripts: `pnpm storybook` and `pnpm build-storybook`. `build-storybook` must succeed in verification.
- No deployment, no Chromatic, no hosted Storybook.

## 11. Files expected to change

Modify:

- `src/app/globals.css`: Foundation tokens, theme mappings, utilities, no changes to existing token values.
- `src/app/layout.tsx`: no-flash theme script.
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/app/design-system/page.tsx`
- `src/app/design-system/page.test.tsx`
- `package.json`

Add:

- `src/components/foundation/theme-provider.tsx`
- `src/components/foundation/theme-control.tsx`
- `src/components/foundation/app-sidebar.tsx`
- `src/components/foundation/breadcrumbs.tsx`
- `src/components/foundation/command-menu.tsx`
- `src/components/foundation/copy-button.tsx`
- `src/components/foundation/token-row.tsx`
- `src/components/foundation/grid-overlay.tsx`
- `src/components/foundation/section.tsx`
- `.storybook/main.ts`
- `.storybook/preview.tsx`
- `src/components/ui/*.stories.tsx`
- `src/components/primitives/*.stories.tsx`
- `src/stories/Introduction.mdx`

Remove or replace:

- `src/app/design-system/theme-scope.tsx` (theme is app-wide now).
- `src/app/design-system/overlay-specimens.tsx` (content moves into the new page structure or its stories).

Do not change:

- Routes other than `/design-system`.
- Auth, billing and workspace page layouts.
- API, auth logic, TanStack Query setup, Clerk and Stripe flows.
- Primitive structure and `data-slot` names.

## 12. Accessibility requirements

- WCAG 2.1 AA: 4.5:1 body text and controls, 3:1 large text and essential boundaries.
- Every interactive element has default, hover, focus-visible, active and disabled states.
- Focus ring: 2px ink with 2px offset, visible on keyboard only. Never `outline: none` without a replacement.
- Sidebar: `nav` with an accessible name, `aria-current` on the active item, collapse button label reflects state, tooltips are keyboard reachable.
- Breadcrumbs: `nav` with `aria-label="Breadcrumb"`, ordered list semantics, current page plain text.
- Theme control: grouped, each button has `aria-pressed` and an accessible name, keyboard operable.
- Command palette: combobox and listbox semantics, active descendant, Escape closes, focus returns to trigger, results announce counts politely.
- Copy: polite live region, accessible button labels, success and failure announced.
- Grid overlay: `aria-hidden`, toggle is `aria-pressed`, never steals pointer events.
- Tables: real table markup with `scope` on headers, or definition lists where a table is not appropriate.
- Reduced motion honored for the sidebar, palette and all transforms.
- No keyboard traps. The skip link is first in tab order.

## 13. Verification plan

1. `pnpm typecheck` and `pnpm lint` pass.
2. `pnpm test` passes. Rewrite `src/app/design-system/page.test.tsx` to cover:
   - All twelve section headings render.
   - Theme control sets `dark` on `document.documentElement`, persists the choice, and restores it on mount.
   - Sidebar toggle changes the rail state and persists it.
   - Command palette opens with the shortcut, filters, moves with arrows and closes with Escape.
   - Copy buttons call the clipboard and announce success.
   - The existing no-dash assertion is retained.
3. `pnpm storybook` starts and every story renders in light and dark.
4. `pnpm build-storybook` succeeds.
5. Start the dev server and load `/design-system`:
   - 200 response with all sections and no console errors.
   - Sidebar collapse and reload persistence.
   - Breadcrumbs follow scroll position.
   - Palette jump lands on the right anchor below the sticky header.
   - Grid overlay toggles.
   - Copy feedback appears.
6. Manual theme pass at 375, 768 and 1280 in light and dark, system and forced modes.
7. Keyboard-only pass: skip link, sidebar, theme control, palette, copy buttons, dialog.
8. Contrast spot check on ink, secondary, tertiary, placeholder, control border and status colors in both themes.
9. Visual drift check on `/billing`, `/sign-in`, `/{workspaceId}` and `/{workspaceId}/integrations` in both themes. Record any raw-styled surfaces that do not adapt.
10. Run the design pre-flight script on the page directory and confirm zero violations.
11. Confirm zero `U+2014` characters in the new page and its copy.

## 14. Risks and open items

- Dark mode reaches screens with hardcoded colors: the auth artwork panel uses `#0A0B0E` and `text-white`, and feature screens use emerald and indigo statuses. These will not adapt cleanly. Accepted for this change; record them in the migration backlog.
- Updating `Button`, `Input`, `Card`, `Dialog` and `DropdownMenu` shifts the integrations hub and custom key modal. Layout stays, surfaces change. Accepted.
- The command palette is hand-rolled. Combobox accessibility is easy to get wrong; the spec requires the ARIA pattern and a keyboard test.
- Storybook is a large dev dependency tree. Runtime bundle is unaffected. Verify install size and Node compatibility at implementation time.
- A blocking theme script in the root layout can cause hydration warnings if it mutates attributes React owns. Keep it to `classList` and `style.colorScheme` on `documentElement` and test.
- "Full Storybook" can expand indefinitely. The required story list in section 10 is the boundary.
- The page currently has a green "done" test suite; the rewrite must not weaken assertions to pass.
- The original starter spec still says no custom design system. Update it in a follow-up so new copies do not inherit a contradiction.
- No visual regression baselines are included. If the page churns, add Playwright screenshots later.

## 15. Acceptance criteria

- [ ] `/design-system` renders the Foundation shell: sidebar with groups, breadcrumbs, collapsed rail and persisted state.
- [ ] The page contains exactly the twelve sections in section 9.2, with page patterns and rules removed.
- [ ] `--foundation-*` tokens exist for both themes, are mapped to utilities, and are consumed by `src/components/ui` and the page. Existing token values are unchanged.
- [ ] Theme control supports system, light and dark, defaults to system, persists an explicit choice, applies app-wide, and causes no flash.
- [ ] Buttons, inputs, labels, cards, dialogs and dropdowns match the component specs and keep their APIs.
- [ ] Command palette opens from the sidebar and `Cmd/Ctrl+K`, filters sections, tokens and components, and is fully keyboard operable.
- [ ] Token rows expose two copy targets with clipboard feedback and live-region announcements.
- [ ] Grid overlay toggles without intercepting pointer events.
- [ ] Storybook runs with stories for every `ui` component and primitive, a theme toolbar and the a11y addon, and `build-storybook` succeeds.
- [ ] Light and dark both pass WCAG AA for body text, controls and focus.
- [ ] No Vercel or Notion logos, trademarks or screenshots appear in the interface.
- [ ] `pnpm typecheck`, `pnpm lint` and `pnpm test` pass with meaningful assertions.
- [ ] Zero em dashes in the page and its copy.
- [ ] Home, auth, billing and workspace layouts are structurally unchanged apart from inherited component surfaces and dark mode.
