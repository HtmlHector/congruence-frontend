import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";

import { ResourceHeader } from "./resource-header";

const meta = {
  title: "Primitives/ResourceHeader",
  component: ResourceHeader,
  tags: ["autodocs"],
  args: {
    title: "Integrations and services",
  },
} satisfies Meta<typeof ResourceHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ResourceHeader
      {...args}
      className="flex flex-wrap items-start justify-between gap-4 border-b border-foundation-line pb-6 [&_[data-slot=resource-header-breadcrumbs]]:text-[13px] [&_[data-slot=resource-header-breadcrumbs]]:text-foundation-ink-tertiary [&_[data-slot=resource-header-badge]]:rounded-fd-xs [&_[data-slot=resource-header-badge]]:bg-foundation-sunken [&_[data-slot=resource-header-badge]]:px-1.5 [&_[data-slot=resource-header-badge]]:py-0.5 [&_[data-slot=resource-header-badge]]:font-mono [&_[data-slot=resource-header-badge]]:text-[11px] [&_[data-slot=resource-header-description]]:mt-2 [&_[data-slot=resource-header-description]]:text-sm [&_[data-slot=resource-header-description]]:text-foundation-ink-secondary [&_[data-slot=resource-header-title-row]]:mt-1 [&_[data-slot=resource-header-title-row]]:flex [&_[data-slot=resource-header-title-row]]:items-center [&_[data-slot=resource-header-title-row]]:gap-2.5 [&_[data-slot=resource-header-title]]:text-2xl [&_[data-slot=resource-header-title]]:font-semibold [&_[data-slot=resource-header-title]]:tracking-[-0.02em]"
      breadcrumbs={<span>Workspace / Integrations</span>}
      description="Connect providers, review scopes and manage workspace credentials."
      badge="12 providers"
      actions={
        <Button size="sm" variant="outline">
          Manage keys
        </Button>
      }
    />
  ),
};
