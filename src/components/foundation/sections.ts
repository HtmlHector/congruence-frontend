export type SectionGroup = "Foundations" | "Components" | "Reference";

export type SectionIcon =
  | "palette"
  | "type"
  | "grid"
  | "layers"
  | "timer"
  | "pointer"
  | "field"
  | "square"
  | "overlay"
  | "blocks"
  | "code"
  | "keyboard";

export interface FoundationSection {
  id: string;
  label: string;
  group: SectionGroup;
  icon: SectionIcon;
  hint: string;
}

export const FOUNDATION_SECTIONS: FoundationSection[] = [
  {
    id: "color",
    label: "Color",
    group: "Foundations",
    icon: "palette",
    hint: "Tokens, swatches and contrast",
  },
  {
    id: "typography",
    label: "Typography",
    group: "Foundations",
    icon: "type",
    hint: "Geist scale and tracking",
  },
  {
    id: "grid",
    label: "Grid and spacing",
    group: "Foundations",
    icon: "grid",
    hint: "12 columns, gutters, breakpoints",
  },
  {
    id: "materials",
    label: "Materials and depth",
    group: "Foundations",
    icon: "layers",
    hint: "Surfaces, hairlines, elevation",
  },
  {
    id: "motion",
    label: "Motion",
    group: "Foundations",
    icon: "timer",
    hint: "Durations and reduced motion",
  },
  {
    id: "buttons",
    label: "Buttons",
    group: "Components",
    icon: "pointer",
    hint: "Variants, sizes and states",
  },
  {
    id: "forms",
    label: "Forms",
    group: "Components",
    icon: "field",
    hint: "Inputs, labels and errors",
  },
  {
    id: "cards",
    label: "Cards",
    group: "Components",
    icon: "square",
    hint: "Panels, footers and grouping",
  },
  {
    id: "overlays",
    label: "Overlays",
    group: "Components",
    icon: "overlay",
    hint: "Dialogs and menus",
  },
  {
    id: "primitives",
    label: "Primitives",
    group: "Components",
    icon: "blocks",
    hint: "Headless structure and hooks",
  },
  {
    id: "code",
    label: "Code and copy",
    group: "Reference",
    icon: "code",
    hint: "Snippets and copy targets",
  },
  {
    id: "keyboard",
    label: "Keyboard and command menu",
    group: "Reference",
    icon: "keyboard",
    hint: "Shortcuts and the palette",
  },
];

export const SECTION_GROUPS: SectionGroup[] = [
  "Foundations",
  "Components",
  "Reference",
];

export function sectionById(id: string): FoundationSection {
  return (
    FOUNDATION_SECTIONS.find((section) => section.id === id) ??
    FOUNDATION_SECTIONS[0]
  );
}

export type TokenGroup =
  | "Surfaces"
  | "Text"
  | "Lines and focus"
  | "Accent"
  | "Status";

export interface FoundationToken {
  cssVar: string;
  utility: string;
  group: TokenGroup;
  use: string;
  note?: string;
  swatch: string;
}

export const FOUNDATION_TOKENS: FoundationToken[] = [
  {
    cssVar: "--foundation-bg",
    utility: "bg-foundation-bg",
    group: "Surfaces",
    use: "Page canvas.",
    note: "Near-white in light, near-black in dark.",
    swatch: "bg-foundation-bg",
  },
  {
    cssVar: "--foundation-surface",
    utility: "bg-foundation-surface",
    group: "Surfaces",
    use: "Cards, panels and inputs.",
    swatch: "bg-foundation-surface",
  },
  {
    cssVar: "--foundation-sunken",
    utility: "bg-foundation-sunken",
    group: "Surfaces",
    use: "Code blocks, hover rows, table headers.",
    swatch: "bg-foundation-sunken",
  },
  {
    cssVar: "--foundation-ink",
    utility: "text-foundation-ink",
    group: "Text",
    use: "Primary text, CTAs and focus.",
    note: "Above 15:1 on the page.",
    swatch: "bg-foundation-ink",
  },
  {
    cssVar: "--foundation-ink-secondary",
    utility: "text-foundation-ink-secondary",
    group: "Text",
    use: "Descriptions and secondary labels.",
    note: "At least 7:1.",
    swatch: "bg-foundation-ink-secondary",
  },
  {
    cssVar: "--foundation-ink-tertiary",
    utility: "text-foundation-ink-tertiary",
    group: "Text",
    use: "Captions, metadata and placeholders.",
    note: "At least 4.5:1.",
    swatch: "bg-foundation-ink-tertiary",
  },
  {
    cssVar: "--foundation-ink-disabled",
    utility: "text-foundation-ink-disabled",
    group: "Text",
    use: "Disabled text only, never body copy.",
    swatch: "bg-foundation-ink-disabled",
  },
  {
    cssVar: "--foundation-line",
    utility: "border-foundation-line",
    group: "Lines and focus",
    use: "Decorative hairlines and dividers.",
    swatch: "bg-foundation-line",
  },
  {
    cssVar: "--foundation-line-strong",
    utility: "border-foundation-line-strong",
    group: "Lines and focus",
    use: "Input borders and essential control boundaries.",
    note: "At least 3:1.",
    swatch: "bg-foundation-line-strong",
  },
  {
    cssVar: "--foundation-focus",
    utility: "outline-foundation-focus",
    group: "Lines and focus",
    use: "2px focus outline with a 2px offset.",
    swatch: "bg-foundation-focus",
  },
  {
    cssVar: "--foundation-accent",
    utility: "text-foundation-accent",
    group: "Accent",
    use: "Links, active navigation and the live pane marker.",
    note: "At least 4.5:1 on every surface. Never a button fill.",
    swatch: "bg-foundation-accent",
  },
  {
    cssVar: "--foundation-danger",
    utility: "text-foundation-danger",
    group: "Status",
    use: "Errors and destructive actions.",
    swatch: "bg-foundation-danger",
  },
  {
    cssVar: "--foundation-success",
    utility: "text-foundation-success",
    group: "Status",
    use: "Success text and icons.",
    swatch: "bg-foundation-success",
  },
  {
    cssVar: "--foundation-warning",
    utility: "text-foundation-warning",
    group: "Status",
    use: "Warnings and attention states.",
    swatch: "bg-foundation-warning",
  },
  {
    cssVar: "--foundation-info",
    utility: "text-foundation-info",
    group: "Status",
    use: "Informational state, never decoration.",
    swatch: "bg-foundation-info",
  },
];

export const TOKEN_GROUPS: TokenGroup[] = [
  "Surfaces",
  "Text",
  "Lines and focus",
  "Accent",
  "Status",
];

export interface ComponentIndexEntry {
  label: string;
  target: string;
  hint: string;
  keywords: string;
}

export const COMPONENT_INDEX: ComponentIndexEntry[] = [
  {
    label: "Button",
    target: "buttons",
    hint: "Variants, sizes, states",
    keywords: "primary secondary outline ghost destructive link action",
  },
  {
    label: "Input",
    target: "forms",
    hint: "Default, invalid, disabled",
    keywords: "field text form placeholder",
  },
  {
    label: "Label",
    target: "forms",
    hint: "Field labels",
    keywords: "form field label",
  },
  {
    label: "Card",
    target: "cards",
    hint: "Panels and footers",
    keywords: "panel surface container",
  },
  {
    label: "Dialog",
    target: "overlays",
    hint: "Modal layer",
    keywords: "modal overlay scrim",
  },
  {
    label: "Dropdown menu",
    target: "overlays",
    hint: "Menu and items",
    keywords: "menu popover actions",
  },
  {
    label: "Empty state",
    target: "primitives",
    hint: "Zero-state composition",
    keywords: "empty zero state",
  },
];
