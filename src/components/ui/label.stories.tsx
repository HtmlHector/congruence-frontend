import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
  args: {
    children: "Workspace name",
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-sm space-y-1.5">
      <Label htmlFor="story-label" {...args} />
      <Input id="story-label" placeholder="Platform team" />
    </div>
  ),
};
