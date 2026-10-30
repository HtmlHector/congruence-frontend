import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RealtimeProvider } from "./realtime-provider";

const meta = {
  title: "Primitives/RealtimeProvider",
  component: RealtimeProvider,
  tags: ["autodocs"],
  args: {
    workspaceId: "ws_demo",
    children: null,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Headless Socket.IO provider scoped to the active workspace room. Stories do not open a live connection; use it inside an AppShell with a real workspace id and token.",
      },
    },
  },
} satisfies Meta<typeof RealtimeProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LiveConnectionRequired: Story = {
  render: () => (
    <div className="max-w-md rounded-fd-lg border border-foundation-line bg-foundation-surface p-4 text-sm leading-6 text-foundation-ink-secondary">
      <p className="font-medium text-foundation-ink">No live socket in stories</p>
      <p className="mt-1">
        Consumers read the connection with useRealtimeContext and subscribe with
        useWorkspaceEvent. Opening a socket here would make stories depend on a
        running realtime server.
      </p>
    </div>
  ),
};
