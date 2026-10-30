import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["default", "sm"] },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card className="max-w-sm" {...args}>
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
          Read access to issues, comments and labels.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">
          Review scopes
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Small: Story = {
  args: { size: "sm" },
  render: (args) => (
    <Card className="max-w-xs" {...args}>
      <CardHeader>
        <CardTitle>Connected accounts</CardTitle>
        <CardDescription>Two providers are active.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs leading-5 text-foundation-ink-secondary">
          Scopes are reviewed when a provider adds a new permission.
        </p>
      </CardContent>
    </Card>
  ),
};
