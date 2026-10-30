import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Check, Inbox, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { CodeBlock } from "@/components/foundation/code-block";
import { CommandMenuTriggerButton } from "@/components/foundation/command-menu-trigger";
import { FoundationShell } from "@/components/foundation/foundation-shell";
import { GridDemo } from "@/components/foundation/grid-demo";
import { DialogSpecimen, MenuSpecimen } from "@/components/foundation/overlay-specimens";
import {
  FOUNDATION_TOKENS,
  TOKEN_GROUPS,
} from "@/components/foundation/sections";
import { TokenRow } from "@/components/foundation/token-row";

export const metadata: Metadata = {
  title: "Design system",
  description:
    "Foundation tokens, components and interaction rules for this product.",
};

const TYPE_SCALE = [
  {
    role: "Display",
    classes:
      "text-[32px] leading-[40px] font-semibold tracking-[-0.02em] sm:text-[48px] sm:leading-[48px] sm:tracking-[-0.04em]",
    sample: "Design system",
    note: "One per page.",
  },
  {
    role: "H1",
    classes: "text-[32px] leading-[40px] font-semibold tracking-[-0.03em]",
    sample: "Workspace overview",
    note: "Group title.",
  },
  {
    role: "H2",
    classes: "text-2xl leading-8 font-semibold tracking-[-0.02em]",
    sample: "Billing and plans",
    note: "Section title.",
  },
  {
    role: "H3",
    classes: "text-xl leading-7 font-semibold tracking-[-0.015em]",
    sample: "Included with the plan",
    note: "Subsection title.",
  },
  {
    role: "Body",
    classes: "text-base leading-6",
    sample: "Connect a provider to see its events in this workspace.",
    note: "Prose, max 70ch.",
  },
  {
    role: "Body strong",
    classes: "text-base leading-6 font-medium",
    sample: "Read access to issues, comments and labels.",
    note: "Lead-ins.",
  },
  {
    role: "Body small",
    classes: "text-sm leading-5 tracking-[-0.005em]",
    sample: "Seats and storage are billed per workspace.",
    note: "Dense descriptions.",
  },
  {
    role: "Label",
    classes: "text-sm leading-5 font-medium",
    sample: "Workspace name",
    note: "Controls and navigation.",
  },
  {
    role: "Caption",
    classes: "text-xs leading-4 text-foundation-ink-tertiary",
    sample: "Updated after the next sync",
    note: "Helper and metadata.",
  },
  {
    role: "Code",
    classes: "font-mono text-[13px] leading-5",
    sample: "bg-foundation-surface",
    note: "Inline code and values.",
  },
];

const SPACING = [
  ["1", "4px", "Icon to label in compact controls"],
  ["2", "8px", "Gaps inside buttons and form rows"],
  ["3", "12px", "Gaps between related controls"],
  ["4", "16px", "Panel padding, stack spacing"],
  ["5", "20px", "Card padding and page headers"],
  ["6", "24px", "Desktop gutters, dialog padding"],
  ["8", "32px", "Page shell vertical rhythm"],
  ["12", "48px", "Section rhythm on this page"],
  ["24", "96px", "Major page separation"],
];

const BREAKPOINTS = [
  ["sm", "640px", "Two-column specimen grids"],
  ["md", "768px", "Table columns appear"],
  ["lg", "1024px", "Sidebar expands from the rail"],
  ["xl", "1280px", "Wider content with the same measure"],
];

const RADIUS = [
  { token: "rounded-fd-xs", value: "4px", use: "Tags, shortcut keys", className: "rounded-fd-xs" },
  { token: "rounded-fd-sm", value: "6px", use: "Menu rows, sidebar items", className: "rounded-fd-sm" },
  { token: "rounded-fd-md", value: "8px", use: "Buttons, inputs, popovers", className: "rounded-fd-md" },
  { token: "rounded-fd-lg", value: "12px", use: "Cards and dialogs", className: "rounded-fd-lg" },
  { token: "rounded-full", value: "9999px", use: "Status pills only", className: "rounded-full" },
];

const ELEVATION = [
  {
    name: "Card",
    classes: "border border-foundation-line bg-foundation-surface",
    use: "Panels, no shadow",
  },
  {
    name: "Menu",
    classes:
      "border border-foundation-line bg-foundation-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]",
    use: "Dropdown content",
  },
  {
    name: "Dialog",
    classes:
      "border border-foundation-line bg-foundation-surface shadow-[0_24px_48px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.08)]",
    use: "Modal layer",
  },
];

const MOTION = [
  ["Hover color and border", "150ms", "Color only, inside hover-capable pointers"],
  ["Button press", "Immediate", "Moves down 1px"],
  ["Menu open and close", "100ms", "Fade and 98% scale from the trigger origin"],
  ["Dialog open and close", "200ms", "Fade and 98% scale, centered"],
  ["Sidebar expand and collapse", "200ms", "Width and label visibility"],
  ["Theme change", "Instant", "No cross-fade of the page"],
];

const PRIMITIVES = [
  {
    name: "AppShell",
    owns: "Sidebar open and collapsed state for product layouts",
    hooks: "app-shell, app-shell-sidebar, app-shell-header, app-shell-main",
  },
  {
    name: "SidebarNav, SidebarGroup, SidebarItem",
    owns: "Navigation with active route detection and collapse awareness",
    hooks: "sidebar-nav, sidebar-group, sidebar-item",
  },
  {
    name: "WorkspaceSwitcher",
    owns: "Workspace selection and navigation between tenant routes",
    hooks: "workspace-switcher, workspace-switcher-select",
  },
  {
    name: "ResourceHeader",
    owns: "Breadcrumbs, title, description, badge and actions",
    hooks: "resource-header, resource-header-title",
  },
  {
    name: "ResourceGrid",
    owns: "Skeletons, empty state and item rendering for a resource list",
    hooks: "resource-grid, resource-grid-loading, resource-grid-empty",
  },
  {
    name: "EmptyState",
    owns: "Zero-state icon, title, description and two actions",
    hooks: "empty-state, empty-state-title, empty-state-actions",
  },
  {
    name: "RealtimeProvider",
    owns: "Socket.IO connection scoped to the active workspace room",
    hooks: "useRealtimeContext, useWorkspaceEvent",
  },
];

const SHORTCUTS = [
  ["⌘K or Ctrl+K", "Open or close the command palette"],
  ["↑ ↓", "Move through results"],
  ["Enter", "Jump to the active result"],
  ["Escape", "Close the palette and return focus to the trigger"],
  ["[", "Collapse or expand the sidebar outside a text field"],
];

const BUTTON_SNIPPET = `<Button variant="outline" size="sm">
  Export
</Button>`;

const FIELD_SNIPPET = `<div className="space-y-1.5">
  <Label htmlFor="workspace-name">Workspace name</Label>
  <Input id="workspace-name" placeholder="Platform team" />
  <p className="text-xs text-foundation-ink-tertiary">
    Shown to every member of the workspace.
  </p>
</div>`;

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-20 border-t border-foundation-line pt-10"
    >
      <div className="max-w-[720px]">
        <h2
          id={`${id}-title`}
          className="text-2xl leading-8 font-semibold tracking-[-0.02em]"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-foundation-ink-secondary">
          {description}
        </p>
      </div>
      <div className="mt-6 space-y-8">{children}</div>
    </section>
  );
}

function Subsection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[15px] leading-6 font-medium tracking-[-0.01em]">
          {title}
        </h3>
        {note ? (
          <span className="font-mono text-[11px] text-foundation-ink-tertiary">
            {note}
          </span>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Notes({ items }: { items: string[] }) {
  return (
    <ul className="max-w-[70ch] list-disc space-y-1.5 pl-5 text-sm leading-6 text-foundation-ink-secondary marker:text-foundation-ink-tertiary">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Table({
  head,
  children,
}: {
  head: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-foundation-line">
            {head.map((cell) => (
              <th
                key={cell}
                scope="col"
                className="py-2 pr-4 text-[11px] font-medium uppercase tracking-[0.04em] text-foundation-ink-tertiary"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-foundation-line">{children}</tbody>
      </table>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <FoundationShell>
      <div className="space-y-16">
        <header>
          <h1 className="text-[32px] leading-[40px] font-semibold tracking-[-0.03em] sm:text-[48px] sm:leading-[48px] sm:tracking-[-0.04em]">
            Design system
          </h1>
          <p className="mt-3 max-w-[70ch] text-base leading-6 text-foundation-ink-secondary">
            Foundation is the interface layer for this starter: ink and paper, Geist
            type, hairlines and compact controls. The page runs on the same tokens and
            components it documents, in both light and dark themes.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-foundation-line pt-4 text-[11px] text-foundation-ink-tertiary">
            <span>
              Tokens <code className="font-mono text-foundation-ink-secondary">src/app/globals.css</code>
            </span>
            <span>
              Components <code className="font-mono text-foundation-ink-secondary">src/components/ui</code>
            </span>
            <span>
              Theme <span className="font-mono text-foundation-ink-secondary">sidebar footer</span>
            </span>
          </div>

          <div className="mt-6 rounded-fd-lg border border-foundation-line bg-foundation-sunken/60 px-4 py-3">
            <p className="text-sm leading-6 text-foundation-ink-secondary">
              <span className="font-medium text-foundation-ink">Target system.</span>{" "}
              Components use Foundation tokens. Screens built from raw utility classes
              still use the previous palette.
            </p>
          </div>
        </header>

        <Section
          id="color"
          title="Color"
          description="Ink carries the brand. One signal accent marks links, current location and the live pane. Hue otherwise appears only to report status."
        >
          <Notes
            items={[
              "The palette is neutral in both themes. Ink inverts between light and dark, and the accent is the only non-status hue in the system.",
              "Accent is limited to links, active navigation and the active tab marker. It is never a button fill, a card tint or decoration.",
              "Status colors are text and icon colors with tinted backgrounds at 10%. They never fill a section or decorate a card.",
              "The two small chips on each row show the light and dark value side by side. The rest of the interface follows the active theme.",
            ]}
          />

          <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
            {TOKEN_GROUPS.map((group) => (
              <div key={group}>
                <h3 className="text-[13px] font-medium uppercase tracking-[0.06em] text-foundation-ink-tertiary">
                  {group}
                </h3>
                <ul className="mt-2 divide-y divide-foundation-line">
                  {FOUNDATION_TOKENS.filter((token) => token.group === group).map(
                    (token) => (
                      <TokenRow key={token.cssVar} token={token} />
                    ),
                  )}
                </ul>
              </div>
            ))}
          </div>

          <Subsection title="Accent usage">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <span className="text-sm text-foundation-accent underline decoration-foundation-accent/40 underline-offset-4">
                Read the deployment guide
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-foundation-accent">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-foundation-accent"
                />
                Terminal 1
              </span>
              <span className="text-sm text-foundation-ink-secondary">
                Primary actions stay ink.
              </span>
            </div>
          </Subsection>

          <Subsection title="Status usage">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-fd-xs bg-foundation-danger/10 px-2 py-1 text-xs font-medium text-foundation-danger">
                Error
              </span>
              <span className="rounded-fd-xs bg-foundation-success/10 px-2 py-1 text-xs font-medium text-foundation-success">
                Success
              </span>
              <span className="rounded-fd-xs bg-foundation-warning/10 px-2 py-1 text-xs font-medium text-foundation-warning">
                Warning
              </span>
              <span className="rounded-fd-xs bg-foundation-info/10 px-2 py-1 text-xs font-medium text-foundation-info">
                Info
              </span>
            </div>
          </Subsection>
        </Section>

        <Section
          id="typography"
          title="Typography"
          description="One family for interface and headings, one mono for values. Weight and tracking carry the hierarchy."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-fd-lg border border-foundation-line bg-foundation-surface p-4">
              <p className="text-[13px] font-medium">Geist Sans</p>
              <p className="mt-1 text-xs leading-5 text-foundation-ink-secondary">
                Interface copy, headings and controls. Weights 400, 500 and 600.
              </p>
              <p className="mt-4 text-[28px] leading-8 font-semibold tracking-[-0.03em]">
                Precision in the details
              </p>
            </div>
            <div className="rounded-fd-lg border border-foundation-line bg-foundation-surface p-4">
              <p className="text-[13px] font-medium">Geist Mono</p>
              <p className="mt-1 text-xs leading-5 text-foundation-ink-secondary">
                Token names, ids, shortcuts and numeric metadata. Weights 400 and 500.
              </p>
              <p className="mt-4 font-mono text-[13px] leading-6 text-foundation-ink-secondary">
                --foundation-ink
                <br />
                01 : 12.480
                <br />
                ⌘K
              </p>
            </div>
          </div>

          <ul className="border-t border-foundation-line">
            {TYPE_SCALE.map((row) => (
              <li
                key={row.role}
                className="grid gap-2 border-b border-foundation-line py-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-baseline sm:gap-8"
              >
                <div>
                  <p className="text-[13px] font-medium">{row.role}</p>
                  <p className="mt-1 break-words font-mono text-[11px] leading-5 text-foundation-ink-tertiary">
                    {row.classes}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className={row.classes}>{row.sample}</p>
                  <p className="mt-1 text-[11px] text-foundation-ink-tertiary">
                    {row.note}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <Notes
            items={[
              "Display tracking stops at -0.04em. Anything tighter starts to close the counters at 48px.",
              "Prose caps at 70ch. Dense specimen tables may run wider because scanning wins over reading rhythm.",
              "Uppercase is limited to short machine labels and navigation group names. It is never a section eyebrow.",
            ]}
          />
        </Section>

        <Section
          id="grid"
          title="Grid and spacing"
          description="A 4px base unit, a 12-column grid and a fixed measure for prose. Density comes from spacing, not from scaling type down."
        >
          <GridDemo />

          <div className="grid gap-8 md:grid-cols-2">
            <Subsection title="Containers">
              <ul className="divide-y divide-foundation-line text-sm">
                {[
                  ["1200px", "Page container, sidebar and content combined"],
                  ["880px", "Content column on this page"],
                  ["720px", "Prose measure"],
                  ["260px / 56px", "Expanded sidebar and icon rail"],
                ].map(([value, use]) => (
                  <li key={value} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5">
                    <span className="font-mono text-xs">{value}</span>
                    <span className="text-xs text-foundation-ink-secondary">{use}</span>
                  </li>
                ))}
              </ul>
            </Subsection>

            <Subsection title="Breakpoints">
              <ul className="divide-y divide-foundation-line text-sm">
                {BREAKPOINTS.map(([name, value, use]) => (
                  <li key={name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5">
                    <span className="w-8 font-mono text-xs">{name}</span>
                    <span className="w-16 font-mono text-xs text-foundation-ink-tertiary">
                      {value}
                    </span>
                    <span className="text-xs text-foundation-ink-secondary">{use}</span>
                  </li>
                ))}
              </ul>
            </Subsection>
          </div>

          <Subsection title="Spacing scale" note="4px base">
            <Table head={["Step", "Value", "Typical use"]}>
              {SPACING.map(([step, value, use]) => (
                <tr key={step}>
                  <td className="py-2 pr-4 font-mono text-xs">{step}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-foundation-ink-tertiary">
                    {value}
                  </td>
                  <td className="py-2 text-xs leading-5 text-foundation-ink-secondary">
                    {use}
                  </td>
                </tr>
              ))}
            </Table>
          </Subsection>
        </Section>

        <Section
          id="materials"
          title="Materials and depth"
          description="Three surfaces and one hairline. Shadows belong to layers that float above the page, not to every card."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Page", "bg-foundation-bg", "border-foundation-line"],
              ["Surface", "bg-foundation-surface", "border-foundation-line"],
              ["Sunken", "bg-foundation-sunken", "border-foundation-line"],
            ].map(([label, bg, border]) => (
              <div
                key={label}
                className={`rounded-fd-md border ${border} ${bg} p-4`}
              >
                <p className="text-[13px] font-medium">{label}</p>
                <p className="mt-1 font-mono text-[11px] text-foundation-ink-tertiary">
                  {bg}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Subsection title="Borders">
              <div className="space-y-3">
                <div className="rounded-fd-md border border-foundation-line p-3 text-xs text-foundation-ink-secondary">
                  Hairline. Decorative separation.
                  <span className="mt-1 block font-mono text-[11px] text-foundation-ink-tertiary">
                    border-foundation-line
                  </span>
                </div>
                <div className="rounded-fd-md border border-foundation-line-strong p-3 text-xs text-foundation-ink-secondary">
                  Control border. Essential boundary.
                  <span className="mt-1 block font-mono text-[11px] text-foundation-ink-tertiary">
                    border-foundation-line-strong
                  </span>
                </div>
              </div>
            </Subsection>

            <Subsection title="Radius" note="4 / 6 / 8 / 12 / pill">
              <div className="grid grid-cols-5 gap-3">
                {RADIUS.map((radius) => (
                  <div key={radius.token}>
                    <div
                      aria-hidden="true"
                      className={`h-14 w-full border border-foundation-line bg-foundation-sunken ${radius.className}`}
                    />
                    <p className="mt-2 break-words font-mono text-[10px]">
                      {radius.token}
                    </p>
                    <p className="font-mono text-[10px] text-foundation-ink-tertiary">
                      {radius.value}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-foundation-ink-secondary">
                      {radius.use}
                    </p>
                  </div>
                ))}
              </div>
            </Subsection>
          </div>

          <Subsection title="Elevation and layers">
            <ul className="divide-y divide-foundation-line">
              {ELEVATION.map((entry) => (
                <li
                  key={entry.name}
                  className="flex flex-wrap items-center gap-3 py-3 sm:flex-nowrap"
                >
                  <span
                    aria-hidden="true"
                    className={`size-9 shrink-0 rounded-fd-md ${entry.classes}`}
                  />
                  <span className="w-20 shrink-0 font-mono text-[11px]">{entry.name}</span>
                  <span className="min-w-0 break-words font-mono text-[11px] text-foundation-ink-tertiary">
                    {entry.classes}
                  </span>
                  <span className="ml-auto text-[11px] text-foundation-ink-secondary">
                    {entry.use}
                  </span>
                </li>
              ))}
            </ul>
          </Subsection>

          <Subsection title="Z-index">
            <Table head={["Layer", "Value", "Use"]}>
              {[
                ["Base", "0", "Page content"],
                ["Sticky header", "10", "Breadcrumb bar"],
                ["Sidebar", "20", "Fixed navigation rail"],
                ["Menu", "40", "Dropdowns and popovers"],
                ["Dialog", "50", "Modals and the command palette"],
                ["Toast", "60", "Transient notifications"],
              ].map(([layer, value, use]) => (
                <tr key={layer}>
                  <td className="py-2 pr-4 text-xs">{layer}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-foundation-ink-tertiary">
                    {value}
                  </td>
                  <td className="py-2 text-xs text-foundation-ink-secondary">{use}</td>
                </tr>
              ))}
            </Table>
          </Subsection>
        </Section>

        <Section
          id="motion"
          title="Motion"
          description="Motion confirms a state change and stops there. Nothing enters on page load, loops, or follows the scroll."
        >
          <Table head={["Interaction", "Timing", "Detail"]}>
            {MOTION.map(([interaction, timing, detail]) => (
              <tr key={interaction}>
                <td className="py-2 pr-4 text-xs">{interaction}</td>
                <td className="py-2 pr-4 font-mono text-xs text-foundation-ink-tertiary">
                  {timing}
                </td>
                <td className="py-2 text-xs leading-5 text-foundation-ink-secondary">
                  {detail}
                </td>
              </tr>
            ))}
          </Table>

          <Notes
            items={[
              "Easing is cubic-bezier(0.2, 0, 0, 1), exposed as ease-fd with 100ms, 150ms and 200ms durations.",
              "Hover effects are scoped to hover-capable pointers. Press feedback is a 1px downward move, never a scale.",
              "Reduced motion removes width and transform animation. The sidebar snaps, the palette appears, colors still change.",
              "The only properties allowed to animate are color, border-color, background-color, opacity and transform.",
            ]}
          />
        </Section>

        <Section
          id="buttons"
          title="Buttons"
          description="One component, six variants and four text sizes. Ink is the primary action, everything else steps down in contrast."
        >
          <Subsection title="Variants">
            <div className="flex flex-wrap items-center gap-2">
              <Button>Save changes</Button>
              <Button variant="outline">Export</Button>
              <Button variant="secondary">Duplicate</Button>
              <Button variant="ghost">Cancel</Button>
              <Button variant="destructive">Delete workspace</Button>
              <Button variant="link">View activity</Button>
            </div>
          </Subsection>

          <Subsection title="Sizes" note="24 / 28 / 32 / 36">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="xs">Extra small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon-sm" aria-label="Add member">
                <Plus aria-hidden="true" />
              </Button>
              <Button size="icon" aria-label="Add member">
                <Plus aria-hidden="true" />
              </Button>
            </div>
          </Subsection>

          <Subsection title="States">
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>Disabled</Button>
              <Button disabled>
                <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Saving
              </Button>
              <span className="text-xs text-foundation-ink-tertiary">
                Press Tab to inspect the 2px focus outline.
              </span>
            </div>
          </Subsection>

          <Notes
            items={[
              "Icon-only buttons need an aria-label. Icons inside a labelled button stay aria-hidden.",
              "Destructive is a tinted surface with danger text, so it reads as secondary next to the primary action.",
              "Disabled buttons stop pointer events at 50% opacity. Loading keeps the label width stable.",
            ]}
          />
        </Section>

        <Section
          id="forms"
          title="Forms"
          description="Labels sit above the field, helper text supports it, and an error replaces the helper below. Validation runs on blur."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ds-workspace-name">Workspace name</Label>
              <Input id="ds-workspace-name" defaultValue="Platform team" />
              <p className="text-xs leading-5 text-foundation-ink-tertiary">
                Shown to every member of the workspace.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ds-workspace-slug">Workspace slug</Label>
              <Input
                id="ds-workspace-slug"
                aria-invalid="true"
                aria-describedby="ds-workspace-slug-error"
                defaultValue="platform team"
              />
              <p
                id="ds-workspace-slug-error"
                className="text-xs font-medium leading-5 text-foundation-danger"
              >
                Use lowercase letters and hyphens only.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ds-workspace-id">Workspace id</Label>
              <Input
                id="ds-workspace-id"
                className="font-mono"
                defaultValue="ws_8f2c"
                disabled
                readOnly
              />
              <p className="text-xs leading-5 text-foundation-ink-tertiary">
                Set by the server. It cannot be changed.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ds-workspace-search">Find a member</Label>
              <Input id="ds-workspace-search" placeholder="Name or email address" />
              <p className="text-xs leading-5 text-foundation-ink-tertiary">
                Placeholder text stays above 4.5:1.
              </p>
            </div>
          </div>

          <Notes
            items={[
              "A placeholder never replaces a label. It shows an example or the expected format.",
              "Invalid fields set aria-invalid and point at the message with aria-describedby.",
              "Controls are 32px tall. Touch-first forms add row padding rather than growing the control.",
            ]}
          />
        </Section>

        <Section
          id="cards"
          title="Cards"
          description="A card is one object that needs to sit above the page. Grouping, settings and documentation use a border and space instead."
        >
          <div className="flex flex-wrap items-start gap-8">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Provider access</CardTitle>
                <CardDescription>Scopes requested by the connection.</CardDescription>
                <CardAction>
                  <span className="font-mono text-[11px] text-foundation-ink-tertiary">
                    Active
                  </span>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-foundation-ink-secondary">
                  Read access to issues, comments and labels. Write access stays off
                  until an approval rule is added.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Review scopes
                </Button>
              </CardFooter>
            </Card>

            <div className="w-full max-w-sm">
              <div className="rounded-fd-md border border-foundation-line p-4">
                <p className="text-sm font-medium">Grouping without a card</p>
                <p className="mt-1 text-sm leading-6 text-foundation-ink-secondary">
                  A hairline and 16px of padding separate related settings from the
                  page. No surface change, no shadow.
                </p>
              </div>
            </div>
          </div>

          <Notes
            items={[
              "Card padding comes from --card-spacing: 20px by default, 16px for the small size.",
              "The footer uses a top hairline instead of a tinted background. It holds an action, not a second description.",
              "Never nest a card inside a card. Use a hairline or a sunken block for internal grouping.",
            ]}
          />
        </Section>

        <Section
          id="overlays"
          title="Overlays"
          description="Dialogs and menus render in a portal, so no scroll container clips them. Menus anchor to their trigger, dialogs stay centered."
        >
          <div className="flex flex-wrap items-center gap-4">
            <DialogSpecimen />
            <MenuSpecimen />
            <span className="text-xs text-foundation-ink-tertiary">
              Escape closes either layer and returns focus to the trigger.
            </span>
          </div>

          <Notes
            items={[
              "The dialog scrim is 60% black with no blur, so the page behind stays legible but clearly inactive.",
              "Dialogs scale 98% to 100% over 200ms. Menus scale from the trigger origin over 100ms.",
              "Use a dialog for an interrupting decision. Inline editing or undo beats it for anything reversible.",
            ]}
          />
        </Section>

        <Section
          id="primitives"
          title="Primitives"
          description="Structure lives in primitives, styling stays with the feature. Each primitive exposes data-slot hooks so teams can style it without forking."
        >
          <Table head={["Primitive", "What it owns", "Hooks"]}>
            {PRIMITIVES.map((entry) => (
              <tr key={entry.name}>
                <td className="py-3 pr-4 align-top font-mono text-xs">{entry.name}</td>
                <td className="py-3 pr-4 align-top text-xs leading-5 text-foundation-ink-secondary">
                  {entry.owns}
                </td>
                <td className="py-3 align-top font-mono text-[11px] leading-5 text-foundation-ink-tertiary">
                  {entry.hooks}
                </td>
              </tr>
            ))}
          </Table>

          <div className="rounded-fd-lg border border-foundation-line bg-foundation-surface">
            <EmptyState
              className="flex flex-col items-center px-6 py-10 text-center [&>[data-slot=empty-state-actions]]:mt-4 [&>[data-slot=empty-state-icon]]:text-foundation-ink-tertiary [&>h3]:text-sm [&>h3]:font-medium [&>p]:mt-1 [&>p]:max-w-sm [&>p]:text-xs [&>p]:leading-5 [&>p]:text-foundation-ink-secondary"
              icon={<Inbox className="size-5" aria-hidden="true" />}
              title="No integrations yet"
              description="Connect a provider to see its events, sync history and errors in this workspace."
              action={
                <div className="flex items-center gap-2">
                  <Button size="sm">
                    <Plus aria-hidden="true" />
                    Connect provider
                  </Button>
                  <Button variant="ghost" size="sm">
                    Read the setup guide
                  </Button>
                </div>
              }
            />
          </div>
        </Section>

        <Section
          id="code"
          title="Code and copy"
          description="Values are copy targets, not transcription work. Every token row copies its CSS variable or utility, and snippets copy whole."
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-foundation-ink-secondary">
              Every row above has two copy buttons:
            </span>
            <code className="rounded-fd-xs bg-foundation-sunken px-1.5 py-0.5 font-mono text-[11px]">
              --foundation-ink
            </code>
            <code className="rounded-fd-xs bg-foundation-sunken px-1.5 py-0.5 font-mono text-[11px]">
              text-foundation-ink
            </code>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <CodeBlock title="button.tsx" code={BUTTON_SNIPPET} />
            <CodeBlock title="field.tsx" code={FIELD_SNIPPET} />
          </div>

          <Notes
            items={[
              "Copy uses navigator.clipboard with a 1.5s confirmation and a polite live region.",
              "Classes map one to one: every Foundation variable has a color or radius utility.",
              "Raw hex and arbitrary colors do not belong in feature code. Add a token instead.",
            ]}
          />
        </Section>

        <Section
          id="keyboard"
          title="Keyboard and command menu"
          description="The palette searches every section, token and component on this page. It is hand-rolled with the Dialog primitive and no extra dependency."
        >
          <div className="flex flex-wrap items-center gap-3">
            <CommandMenuTriggerButton />
            <span className="text-xs text-foundation-ink-tertiary">
              Or press ⌘K anywhere on the page.
            </span>
          </div>

          <Table head={["Shortcut", "Action"]}>
            {SHORTCUTS.map(([keys, action]) => (
              <tr key={keys}>
                <td className="py-2 pr-4 whitespace-nowrap font-mono text-xs">{keys}</td>
                <td className="py-2 text-xs leading-5 text-foundation-ink-secondary">
                  {action}
                </td>
              </tr>
            ))}
          </Table>

          <div className="flex items-start gap-2.5 rounded-fd-lg border border-foundation-line bg-foundation-surface p-4">
            <Check
              className="mt-0.5 size-4 shrink-0 text-foundation-success"
              aria-hidden="true"
            />
            <p className="text-sm leading-6 text-foundation-ink-secondary">
              The palette uses combobox and listbox semantics, keeps focus in the input,
              announces the active option, and restores focus to the trigger on close.
            </p>
          </div>
        </Section>

        <footer className="border-t border-foundation-line pt-6 text-xs leading-5 text-foundation-ink-tertiary">
          <p className="max-w-[70ch]">
            Update this page in the same change as any token, component or interaction
            rule it documents. Storybook mirrors the component states at the same time.
          </p>
        </footer>
      </div>
    </FoundationShell>
  );
}
