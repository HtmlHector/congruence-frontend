import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellSidebar,
} from "./app-shell";

const meta = {
  title: "Primitives/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  args: {
    children: null,
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Regions: Story = {
  render: () => (
    <AppShell className="overflow-hidden rounded-fd-lg border border-foundation-line bg-foundation-surface">
      <div className="grid h-[420px] grid-cols-[200px_minmax(0,1fr)]">
        <AppShellSidebar className="border-r border-foundation-line p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-foundation-ink-tertiary">
            Sidebar
          </p>
          <p className="mt-2 text-sm font-medium">Navigation region</p>
        </AppShellSidebar>
        <div className="flex min-w-0 flex-col">
          <AppShellHeader className="flex h-12 shrink-0 items-center border-b border-foundation-line px-4 text-sm font-medium">
            Overview
          </AppShellHeader>
          <AppShellMain className="p-4 text-sm leading-6 text-foundation-ink-secondary">
            Main content region. The shell coordinates sidebar open and collapsed
            state for its children.
          </AppShellMain>
        </div>
      </div>
    </AppShell>
  ),
};
