import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Project, UsageSummary } from "../types";
import { ProjectsView } from "./projects-view";

const state = vi.hoisted(() => ({
  projects: [] as Project[],
  usage: null as UsageSummary | null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("../hooks/use-projects", () => ({
  useProjectsQuery: () => ({
    data: state.projects,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useUsageQuery: () => ({ data: state.usage }),
  useCreateProject: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const project: Project = {
  id: "p1",
  workspaceId: "ws-1",
  name: "Web app",
  description: null,
  status: "active",
  repositoryId: "acme/web-app",
  repoProvider: "github",
  defaultBranch: "main",
  rootPath: "",
  setupCommand: "npm ci",
  setupStatus: "pending",
  baseImageRef: null,
  createdAt: "2026-10-01T12:00:00.000Z",
  updatedAt: "2026-10-01T12:00:00.000Z",
};

const usage: UsageSummary = {
  plan: "trial",
  awakeSeconds: 7200,
  includedSeconds: 72000,
  remainingSeconds: 64800,
  percentUsed: 10,
  awakeBoxes: 2,
  terminalsPerWorktree: 4,
};

beforeEach(() => {
  state.projects = [];
  state.usage = null;
});

describe("Projects view", () => {
  it("renders a project card linked to its detail page", () => {
    state.projects = [project];
    state.usage = usage;

    render(<ProjectsView workspaceId="ws-1" />);

    const link = screen.getByRole("link", { name: /Web app/i });
    expect(link).toHaveAttribute("href", "/ws-1/projects/p1");
    expect(screen.getByText("acme/web-app")).toBeInTheDocument();
    expect(screen.getByText("npm ci")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  it("shows the onboarding empty state when there are no projects", () => {
    render(<ProjectsView workspaceId="ws-1" />);

    expect(screen.getByText("Add your first project")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /New project/i }).length,
    ).toBeGreaterThan(0);
  });
});
