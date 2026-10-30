import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Loader2, Plus } from "lucide-react";

import { Button } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Save changes",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Save changes</Button>
      <Button variant="outline">Export</Button>
      <Button variant="secondary">Duplicate</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive">Delete workspace</Button>
      <Button variant="link">View activity</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
      <Button disabled>
        <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
        Saving
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  args: {
    size: "icon",
    "aria-label": "Add member",
    children: <Plus aria-hidden="true" />,
  },
};
