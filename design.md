# Foundation design system

Foundation is the interface layer for this product. It is a neutral, ink-on-paper system: Geist type, hairline borders, compact controls and status color used only when something needs attention.

The live reference is `/design-system`. Storybook mirrors the components and their states. This document is the written contract for both.

- Tokens: `src/app/globals.css`
- UI components: `src/components/ui`
- Foundation components: `src/components/foundation`
- Layout primitives: `src/components/primitives`
- Stories: `.storybook`, `src/**/*.stories.tsx`

## Principles

1. **Ink carries the brand.** Primary actions, headings and focus use ink. One signal accent marks links, current location and the live pane; hue otherwise appears only to report status.
2. **Hairlines before shadows.** Borders and spacing separate most things. Shadows belong to menus, dialogs and drawers that actually float.
3. **Density comes from spacing.** Do not shrink body copy to fit more. Tighten the gaps and controls instead.
4. **One primary action per region.** Everything else steps down to outline, secondary, ghost or link.
5. **Motion confirms a change.** Nothing enters on page load, loops or follows the scroll.
6. **Accessibility is part of the visual design.** Contrast, focus, keyboard behavior and reduced motion are not cleanup tasks.

## Color

Foundation is neutral in both themes. Light and dark values are two expressions of the same token set.

| Token | Utility | Light | Dark | Use |
| --- | --- | --- | --- | --- |
| `--foundation-bg` | `bg-foundation-bg` | `oklch(0.985 0 0)` | `oklch(0.145 0 0)` | Page canvas |
| `--foundation-surface` | `bg-foundation-surface` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Cards, inputs, popovers |
| `--foundation-sunken` | `bg-foundation-sunken` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Hover rows, code blocks, active tabs |
| `--foundation-ink` | `text-foundation-ink` | `oklch(0.205 0 0)` | `oklch(0.93 0 0)` | Primary text, CTAs, focus |
| `--foundation-ink-secondary` | `text-foundation-ink-secondary` | `oklch(0.439 0 0)` | `oklch(0.708 0 0)` | Descriptions, secondary labels |
| `--foundation-ink-tertiary` | `text-foundation-ink-tertiary` | `oklch(0.556 0 0)` | `oklch(0.62 0 0)` | Captions, metadata, placeholders |
| `--foundation-ink-disabled` | `text-foundation-ink-disabled` | `oklch(0.708 0 0)` | `oklch(0.45 0 0)` | Disabled text only |
| `--foundation-line` | `border-foundation-line` | `oklch(0.922 0 0)` | `oklch(0.269 0 0)` | Decorative hairlines |
| `--foundation-line-strong` | `border-foundation-line-strong` | `oklch(0.62 0 0)` | `oklch(0.44 0 0)` | Input and control boundaries |
| `--foundation-focus` | `foundation-focus` | `oklch(0.205 0 0)` | `oklch(0.93 0 0)` | Focus outline, 2px with 2px offset |
| `--foundation-accent` | `text-foundation-accent` | `oklch(0.5 0.1 200)` | `oklch(0.78 0.1 200)` | Links, active navigation, live tab marker |
| `--foundation-danger` | `text-foundation-danger` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Errors, destructive actions |
| `--foundation-success` | `text-foundation-success` | `oklch(0.527 0.135 152)` | `oklch(0.765 0.15 152)` | Success text and icons |
| `--foundation-warning` | `text-foundation-warning` | `oklch(0.51 0.13 62)` | `oklch(0.79 0.16 70)` | Warnings |
| `--foundation-info` | `text-foundation-info` | `oklch(0.51 0.16 258)` | `oklch(0.72 0.12 255)` | Informational state |

### Color rules

- Status colors are text and icon colors with a 10% tinted background, for example `bg-foundation-danger/10 text-foundation-danger`. They never fill a section or decorate a card.
- The accent is a location signal, not a second brand color. It appears on inline links, the active navigation item and the active tab marker. It never fills a button, a card or a section, and it never replaces ink on a primary action.
- Accent text holds at least 4.5:1 on the page, surface and sunken backgrounds in both themes.
- Never use hue as decoration, an accent wash or a gradient.
- Never use raw hex values or arbitrary colors in feature code. Add a token instead.
- Status is never communicated by color alone. Pair it with a label or an icon.
- The previous shadcn aliases (`background`, `card`, `border`) remain for older screens. New UI uses the Foundation utilities. Migrate a screen when you touch it.

### Theming

A pre-paint script in the root layout sets `class="dark"`, `data-theme` and `color-scheme` on the root element from storage. `ThemeProvider` keeps the choice in sync after hydration and responds to system changes. The stored mode is `light`, `dark` or `system` under the `foundation-theme` key. System is the default.

Use `ThemeControl` anywhere the mode should be switchable. The standalone scopes `.foundation-theme-light` and `.foundation-theme-dark` let token specimens show both values at once. Test every new surface in both themes.

## Typography

Geist Sans is used for interface copy, headings and controls. Geist Mono is used for token names, ids, shortcuts and numeric metadata. Both come from `next/font`.

| Role | Size / line | Weight | Tracking | Use |
| --- | --- | --- | --- | --- |
| Display | 32/40, 48/48 at `sm` | 600 | -0.02em, -0.04em at `sm` | One per page |
| H1 | 32/40 | 600 | -0.03em | Page title |
| H2 | 24/32 | 600 | -0.02em | Section title |
| H3 | 20/28 | 600 | -0.015em | Subsection title |
| Body | 16/24 | 400 | 0 | Prose, 70ch maximum |
| Body strong | 16/24 | 500 | 0 | Lead-ins |
| Body small | 14/20 | 400 | -0.005em | Dense descriptions |
| Label | 14/20 | 500 | 0 | Controls and navigation |
| Caption | 12/16 | 400 | 0 | Helper text and metadata, tertiary ink |
| Code | 13/20 | 400 or 500 | 0 | Geist Mono values |

Dense product chrome uses 13px labels and 11px machine labels. Body copy stays at 14px or 16px. Do not scale body copy down to make a layout fit.

### Type rules

- Display tracking stops at `-0.04em`. Tighter tracking closes the counters at 48px.
- Prose caps at `70ch`. Tables may run wider because scanning wins over reading rhythm.
- Uppercase is limited to short machine labels and navigation group names at 11px. It is never a section eyebrow.
- Use one H1 per page. Do not skip heading levels to get a size.
- Numeric values, ids, CSS variables and shortcuts use mono.

## Layout and spacing

The base unit is 4px.

| Step | Value | Typical use |
| --- | --- | --- |
| 1 | 4px | Icon to label inside compact controls |
| 2 | 8px | Gaps inside buttons and form rows |
| 3 | 12px | Gaps between related controls |
| 4 | 16px | Small card padding, stack spacing |
| 5 | 20px | Default card padding, page headers |
| 6 | 24px | Desktop gutters, dialog padding |
| 8 | 32px | Page shell rhythm |
| 12 | 48px | Section rhythm |
| 24 | 96px | Major page separation |

### Grid and containers

- The grid is 12 columns. Gutters are 24px at desktop and 16px below `sm`.
- Combined page container: 1200px.
- Documentation content column: 880px.
- Prose measure: 720px or 70ch.
- Workspace dashboard content: 1024px.
- Settings content: 768px.
- Sidebar: 260px expanded. The workspace sidebar resizes between 200px and 420px and collapses to a 56px icon rail; the design-system shell also collapses to that rail.
- Breakpoints: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px.
- Sidebars are full height from `lg` up. Below `lg`, navigation moves into a top bar and a 280px drawer.

### Product shells

**Workspace shell.** A fixed sidebar that starts at 260px, can be dragged between 200px and 420px from its right edge, and collapses to a 56px icon rail from the control in its top strip. A 36px terminal tab bar follows it, and the page content is offset by the sidebar's current width on desktop. The width and collapsed state persist. Below `lg`, a 56px top bar opens the sidebar drawer, which is fixed at 280px. The sidebar and tab bar belong to the workspace app layout, not to every route.

**Settings shell.** Settings has its own layout and no terminal tab bar. It uses a fixed 260px settings sidebar with a 48px top bar below `lg`, a 768px content column, and a 280px navigation drawer on small screens.

**Terminal panes.** The terminal area is a tiling layout: every pane has its own 36px tab strip. Tabs are 36px tall and 200px wide, butt together with vertical hairlines, and the active tab uses a sunken background and a 2px ink underline. Close controls appear on the active or hovered tab. Each strip ends with an add control that opens a menu anchored to it: a search field, the New terminal action, an Agents group (Claude, Cline, Codex) and workspace settings. The search field keeps focus and uses combobox and listbox semantics; arrow keys move the active option, Enter runs it, and Escape closes the menu and returns focus to the add control. Agent tabs show the provider mark in the strip and tab label, and type the agent CLI into their shell once when the session opens. Drag a tab onto a pane edge to split it, and drag the splitter to resize. A pane with no tabs collapses; a layout with no tabs shows an empty state with a New terminal action. The tree, tab names and sessions persist under `congruence.terminal-layout.v1`, and the pre-pane tab list migrates in place without minting new sessions.

**Route structure.** `src/app/[workspaceId]/layout.tsx` only binds workspace context. The overview and integrations routes live inside the `(workspace)` group and share the terminal shell. Settings lives in `settings/` with its own layout, so it does not inherit the tab bar.

## Materials and depth

### Radius

| Token | Value | Use |
| --- | --- | --- |
| `rounded-fd-xs` | 4px | Tags, shortcut keys |
| `rounded-fd-sm` | 6px | Menu rows, sidebar items |
| `rounded-fd-md` | 8px | Buttons, inputs, popovers |
| `rounded-fd-lg` | 12px | Cards, dialogs |
| `rounded-full` | 9999px | Fully rounded pills only |

### Borders

- `border-foundation-line` is a decorative hairline for dividers and card edges.
- `border-foundation-line-strong` is for control boundaries that must read at 3:1, such as inputs.
- A card has a border and no shadow. A menu gets a small shadow and a dialog gets a large shadow. Nothing else floats.

### Layers

Use the layer order rather than one-off z-index values:

1. Page content
2. Sticky headers
3. Fixed sidebars
4. Menus and popovers
5. Dialogs and navigation drawers
6. Toasts

Typical values are `30` for the fixed shell, `40` for the drawer scrim, `50` for menus, dialogs and drawers, and `60` for toasts.

## Motion

| Interaction | Duration | Detail |
| --- | --- | --- |
| Hover color and border | 150ms | Color only, hover-capable pointers |
| Button press | Immediate | Moves down 1px, never scales |
| Menu open and close | 100ms | Fade and 98% scale from the trigger |
| Dialog open and close | 200ms | Fade and 98% scale, centered |
| Sidebar width | 200ms | Width and label visibility |
| Theme change | Instant | No page cross-fade |

- Easing is `cubic-bezier(0.2, 0, 0, 1)`, exposed as `ease-fd`. Durations are 100ms, 150ms and 200ms.
- Only animate color, border-color, background-color, opacity and transform.
- Respect `prefers-reduced-motion`: remove width and transform transitions, keep color changes.
- No page-load entrances, looping decoration or scroll-driven effects.

## Components

### Buttons

Six variants: `default` (ink), `outline`, `secondary`, `ghost`, `destructive` and `link`. Sizes are 24px, 28px, 32px and 36px, plus icon sizes.

- Use one primary button per region. Destructive is intentionally a tinted surface with danger text, never a solid red primary button.
- Icon-only buttons need an `aria-label`; icons inside labelled buttons are `aria-hidden`.
- Loading keeps the label width stable and disables the action. Disabled controls use 50% opacity and stop pointer events.
- Press feedback is a 1px downward move. Focus is a visible 2px outline.

### Forms

```tsx
<div className="space-y-1.5">
  <Label htmlFor="workspace-name">Workspace name</Label>
  <Input id="workspace-name" placeholder="Platform team" />
  <p className="text-xs leading-5 text-foundation-ink-tertiary">
    Shown to every member of the workspace.
  </p>
</div>
```

- Labels sit above fields and are never replaced by placeholders.
- Helper text sits below the field. An error replaces the helper, sets `aria-invalid` and is referenced by `aria-describedby`.
- Validate on blur and on submit, not on every keystroke.
- Controls are 32px tall. Touch-first layouts add row padding rather than growing the control.
- Disabled fields use the disabled ink and sunken surface.

### Cards

A card is one object that needs to sit above the page. Settings groups, documentation sections and lists use a hairline and space instead.

- Default padding is 20px, small cards use 16px.
- The footer is separated by a top hairline and holds an action, not a second description.
- Never nest a card inside a card. Use a hairline or a sunken block for internal grouping.
- Cards do not get shadows.

### Overlays

- Use a dialog for an interrupting decision that cannot be undone inline. Use undo or inline editing for reversible actions.
- The dialog scrim is 60% black with no blur. Escape closes it and focus returns to the trigger.
- Menus anchor to their trigger and scale from its origin over 100ms.
- Navigation drawers use a 40% black scrim, lock body scroll and close on Escape or backdrop click.
- The command menu uses combobox and listbox semantics, keeps focus in the input and announces the active option.

### Status

Use a status chip for a state, not for a category.

```tsx
<span className="rounded-fd-xs bg-foundation-danger/10 px-2 py-1 text-xs font-medium text-foundation-danger">
  Error
</span>
```

Status needs text or an icon in addition to color. Do not color an entire card or section to indicate an error unless the whole region is blocked.

### Copy and code

- Every token row, CSS variable and utility is a copy target.
- Copy feedback uses a polite live region and resets after 1.5 seconds.
- Inline code uses `bg-foundation-sunken` with `rounded-fd-xs`.
- Snippets copy as whole blocks, not line by line.

### Primitives

Headless primitives own structure and behavior. Styling stays with the feature.

| Primitive | Owns |
| --- | --- |
| `AppShell` | Sidebar open and collapsed state |
| `SidebarNav`, `SidebarGroup`, `SidebarItem` | Active route detection and collapse awareness |
| `WorkspaceSwitcher` | Workspace selection and tenant navigation |
| `ResourceHeader` | Breadcrumbs, title, description, badge and actions |
| `ResourceGrid` | Loading, empty and populated resource states |
| `EmptyState` | Zero-state icon, title, description and actions |
| `RealtimeProvider` | Socket.IO connection scoped to a workspace |

Each exposes `data-slot` hooks so a feature can style it without forking the behavior.

## Accessibility

- Contrast targets: ink is above 15:1 on the page, secondary is at least 7:1, tertiary and placeholders are at least 4.5:1, and control boundaries are at least 3:1.
- Focus is a 2px outline with a 2px offset using `foundation-focus`. Never remove it without an equally visible replacement.
- Every control is reachable by keyboard and has a visible label or an accessible name.
- Dialogs and menus close on Escape and return focus to the trigger. Drawers close on Escape or the backdrop and restore body scroll. Do not trap focus in a layer without a way out.
- Use semantic landmarks, one H1 per page and heading levels in order.
- Do not rely on color alone for status.
- Respect reduced motion. Loading spinners stop under reduced motion.
- Test both themes and both pointer and keyboard use for every new interaction.

### Shortcuts

| Keys | Action |
| --- | --- |
| `⌘K` or `Ctrl+K` | Open or close the command palette |
| `⌘T` or `Ctrl+T` | Open a new terminal tab |
| `↑` `↓` | Move through results |
| `Enter` | Open the active result |
| `Escape` | Close the active layer |
| `[` | Collapse or expand the design system sidebar outside a text field |

## Content style

- Use sentence case. Uppercase is reserved for 11px machine labels and navigation groups.
- Use plain punctuation. Do not use em dashes or en dashes; use a period, comma, colon or parentheses.
- Actions start with a verb: `Save changes`, `Connect provider`, `Delete workspace`.
- Errors say what happened and what to do next. Do not blame the user and do not use exclamation marks.
- Labels are direct and specific. Avoid "Submit", "Click here" and filler such as "Please".
- Helper text explains the consequence: "Shown to every member of the workspace."
- Keep UI copy in English until the product adds localization. Do not concatenate sentences from fragments.

## Do and do not

| Do | Do not |
| --- | --- |
| Use Foundation tokens for every color, radius and motion value | Use raw hex, arbitrary colors or one-off shadows |
| Group with a hairline and spacing | Wrap every section in a card |
| Use hue for status only | Use hue as decoration or an accent wash |
| Use the accent for links and the current location | Use the accent as a button fill or a second brand color |
| Keep one primary action per region | Compete two ink buttons for attention |
| Use 16px body copy and 70ch prose | Shrink body copy to fit a dense layout |
| Put labels above fields | Use placeholders as labels |
| Use a dialog for an irreversible decision | Use a dialog for inline edits or reversible actions |
| Keep motion short and purposeful | Animate page load or loop attention |
| Test light, dark, keyboard and reduced motion | Ship a state that only works with a mouse |

## Using the system

Start with the canvas and text tokens:

```tsx
<div className="min-h-svh bg-foundation-bg text-foundation-ink">
  <section className="mx-auto w-full max-w-[880px] px-4 py-10 sm:px-6">
    <h1 className="text-[32px] leading-10 font-semibold tracking-[-0.03em]">
      Workspace overview
    </h1>
    <p className="mt-2 max-w-[70ch] text-sm leading-6 text-foundation-ink-secondary">
      Connect a provider to see its events in this workspace.
    </p>
  </section>
</div>
```

Capabilities map one to one. Every Foundation variable has a color, border, radius or easing utility. If a value is missing, add a token in `globals.css`, map it in `@theme inline`, then update `/design-system`, Storybook and this document in the same change.

## Workflow

```bash
pnpm dev              # app and /design-system
pnpm storybook        # component workshop on port 6006
pnpm check            # lint, typecheck and unit tests
pnpm build-storybook  # static Storybook build
```

- `/design-system` is the live contract: tokens, type, grid, materials, motion, components, primitives, copy and keyboard rules.
- Storybook mirrors component states and runs the a11y addon.
- Page tests cover the design system, theme switching, sidebar behavior, the command palette and copy feedback.
- Legacy screens still using the previous palette should move to Foundation utilities as they are touched. Do not add new usage of the old aliases.
- Update this document when a token, component, layout rule or interaction changes. A design system that disagrees with itself is worse than no document.
