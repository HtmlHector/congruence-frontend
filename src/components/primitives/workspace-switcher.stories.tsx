import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { WorkspaceSwitcher } from "./workspace-switcher";

const meta = {
  title: "Primitives/WorkspaceSwitcher",
  component: WorkspaceSwitcher,
  tags: ["autodocs"],
  args: {
    currentWorkspaceId: "ws_platform",
    workspaces: [
      { id: "ws_platform", name: "Platform team", plan: "pro" },
      { id: "ws_design", name: "Design systems", plan: "free" },
      { id: "ws_research", name: "Research", plan: "team" },
    ],
  },
} satisfies Meta<typeof WorkspaceSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-xs text-sm [&_select]:h-8 [&_select]:w-full [&_select]:rounded-fd-md [&_select]:border [&_select]:border-foundation-line-strong [&_select]:bg-foundation-surface [&_select]:px-2 [&_select]:text-sm [&_select]:text-foundation-ink">
      <WorkspaceSwitcher {...args} />
    </div>
  ),
};
