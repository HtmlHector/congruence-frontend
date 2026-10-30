import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Platform team",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-sm space-y-1.5">
      <Label htmlFor="story-default">Workspace name</Label>
      <Input id="story-default" {...args} />
      <p className="text-xs leading-5 text-foundation-ink-tertiary">
        Shown to every member of the workspace.
      </p>
    </div>
  ),
};

export const Invalid: Story = {
  render: (args) => (
    <div className="max-w-sm space-y-1.5">
      <Label htmlFor="story-invalid">Workspace slug</Label>
      <Input
        id="story-invalid"
        aria-invalid="true"
        aria-describedby="story-invalid-error"
        defaultValue="platform team"
        {...args}
      />
      <p
        id="story-invalid-error"
        className="text-xs font-medium leading-5 text-foundation-danger"
      >
        Use lowercase letters and hyphens only.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "ws_8f2c",
    className: "font-mono",
  },
  render: (args) => (
    <div className="max-w-sm space-y-1.5">
      <Label htmlFor="story-disabled">Workspace id</Label>
      <Input id="story-disabled" readOnly {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    placeholder: "Name or email address",
  },
  render: (args) => (
    <div className="max-w-sm space-y-1.5">
      <Label htmlFor="story-search">Find a member</Label>
      <Input id="story-search" {...args} />
    </div>
  ),
};
