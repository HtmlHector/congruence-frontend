import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LayoutGrid, Settings } from "lucide-react";

import { AppShell, AppShellSidebar } from "./app-shell";
import {
  SidebarCollapseTrigger,
  SidebarGroup,
  SidebarItem,
  SidebarNav,
} from "./sidebar";

const meta = {
  title: "Primitives/Sidebar",
  component: SidebarNav,
  tags: ["autodocs"],
  args: {
    children: null,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/overview",
      },
    },
  },
} satisfies Meta<typeof SidebarNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Navigation: Story = {
  render: () => (
    <AppShell className="overflow-hidden rounded-fd-lg border border-foundation-line bg-foundation-surface">
      <div className="grid h-[360px] grid-cols-[220px_minmax(0,1fr)]">
        <AppShellSidebar className="flex flex-col border-r border-foundation-line p-2">
          <SidebarNav
            aria-label="Workspace"
            className="flex-1 [&_[data-slot=sidebar-group-label]]:px-2 [&_[data-slot=sidebar-group-label]]:pb-1 [&_[data-slot=sidebar-group-label]]:pt-3 [&_[data-slot=sidebar-group-label]]:text-[11px] [&_[data-slot=sidebar-group-label]]:uppercase [&_[data-slot=sidebar-group-label]]:tracking-[0.06em] [&_[data-slot=sidebar-group-label]]:text-foundation-ink-tertiary [&_[data-slot=sidebar-group-list]]:space-y-0.5 [&_[data-slot=sidebar-link]]:flex [&_[data-slot=sidebar-link]]:h-8 [&_[data-slot=sidebar-link]]:items-center [&_[data-slot=sidebar-link]]:gap-2.5 [&_[data-slot=sidebar-link]]:rounded-fd-sm [&_[data-slot=sidebar-link]]:px-2 [&_[data-slot=sidebar-link]]:text-[13px] [&_[data-slot=sidebar-link]]:font-medium [&_[data-slot=sidebar-link]]:text-foundation-ink-secondary [&_[data-slot=sidebar-link]]:hover:bg-foundation-sunken/60 [&_[data-slot=sidebar-item][data-active=true]_[data-slot=sidebar-link]]:bg-foundation-sunken [&_[data-slot=sidebar-item][data-active=true]_[data-slot=sidebar-link]]:text-foundation-ink"
          >
            <SidebarGroup label="Workspace">
              <SidebarItem
                href="/overview"
                label="Overview"
                icon={<LayoutGrid className="size-4" aria-hidden="true" />}
              />
              <SidebarItem
                href="/settings"
                label="Settings"
                icon={<Settings className="size-4" aria-hidden="true" />}
              />
            </SidebarGroup>
          </SidebarNav>
          <SidebarCollapseTrigger className="mt-2 grid size-7 place-items-center rounded-fd-sm text-foundation-ink-tertiary hover:bg-foundation-sunken">
            <span aria-hidden="true">‹</span>
          </SidebarCollapseTrigger>
        </AppShellSidebar>
        <div className="p-4 text-sm leading-6 text-foundation-ink-secondary">
          The active row is derived from the current pathname. Collapse state comes
          from the AppShell context.
        </div>
      </div>
    </AppShell>
  ),
};
