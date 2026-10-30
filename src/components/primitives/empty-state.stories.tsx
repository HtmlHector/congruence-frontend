import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Inbox, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { EmptyState } from "./empty-state";

const meta = {
  title: "Primitives/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: {
    title: "No integrations yet",
    description:
      "Connect a provider to see its events, sync history and errors in this workspace.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <EmptyState
      {...args}
      className="flex flex-col items-center rounded-fd-lg border border-foundation-line bg-foundation-surface px-6 py-12 text-center [&>[data-slot=empty-state-actions]]:mt-4 [&>[data-slot=empty-state-icon]]:text-foundation-ink-tertiary [&>h3]:text-sm [&>h3]:font-medium [&>p]:mt-1 [&>p]:max-w-sm [&>p]:text-xs [&>p]:leading-5 [&>p]:text-foundation-ink-secondary"
      icon={<Inbox className="size-5" aria-hidden="true" />}
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
  ),
};
