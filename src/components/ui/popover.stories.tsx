import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Command, Settings } from "lucide-react";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta = {
  title: "Components/Popover",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1">
        <div className="flex h-8 items-center gap-2 rounded-fd-sm px-2 text-[13px] text-foundation-ink-secondary">
          <Command className="size-3.5" aria-hidden="true" />
          Command palette
          <span className="ml-auto font-mono text-[11px] tracking-widest text-foundation-ink-tertiary">
            ⌘K
          </span>
        </div>
        <div className="flex h-8 items-center gap-2 rounded-fd-sm px-2 text-[13px] text-foundation-ink-secondary">
          <Settings className="size-3.5" aria-hidden="true" />
          Workspace settings
        </div>
      </PopoverContent>
    </Popover>
  ),
};
