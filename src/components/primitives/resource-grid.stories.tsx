import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ResourceGrid } from "./resource-grid";

type Provider = {
  id: string;
  name: string;
  description: string;
};

const providers: Provider[] = [
  { id: "github", name: "GitHub", description: "Issues, pull requests and checks" },
  { id: "linear", name: "Linear", description: "Projects, cycles and issues" },
  { id: "slack", name: "Slack", description: "Channels and message events" },
];

const meta = {
  title: "Primitives/ResourceGrid",
  component: ResourceGrid<Provider>,
  tags: ["autodocs"],
  args: {
    items: providers,
    renderItem: (provider: Provider) => (
      <div className="rounded-fd-lg border border-foundation-line bg-foundation-surface p-4">
        <p className="text-sm font-medium">{provider.name}</p>
        <p className="mt-1 text-xs leading-5 text-foundation-ink-secondary">
          {provider.description}
        </p>
      </div>
    ),
  },
} satisfies Meta<typeof ResourceGrid<Provider>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Filled: Story = {
  render: (args) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <ResourceGrid {...args} />
    </div>
  ),
};

export const Loading: Story = {
  args: {
    isLoading: true,
    skeletonCount: 3,
  },
  render: (args) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <ResourceGrid
        {...args}
        renderSkeleton={() => (
          <div className="h-24 rounded-fd-lg border border-foundation-line bg-foundation-sunken motion-safe:animate-pulse" />
        )}
      />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    items: [],
    emptyState: (
      <p className="rounded-fd-lg border border-foundation-line bg-foundation-surface p-8 text-center text-sm text-foundation-ink-secondary">
        No providers connected.
      </p>
    ),
  },
  render: (args) => <ResourceGrid {...args} />,
};
