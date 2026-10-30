import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Repository } from "@/features/integrations/types";

import { NewProjectDialog } from "./new-project-dialog";

const repositoryState = vi.hoisted(() => ({
  data: undefined as
    | { fullName: string; isPrivate: boolean; defaultBranch: string | null }[]
    | undefined,
  isPending: true,
  isError: false,
  isFetching: false,
  isSignedIn: true,
  refetch: vi.fn(),
}));

const createProject = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("../hooks/use-projects", () => ({
  useCreateProject: () => createProject,
}));

vi.mock("@/features/integrations/hooks/use-repositories", () => ({
  useRepositoriesQuery: () => repositoryState,
}));

const repositories: Repository[] = [
  { fullName: "acme/web-app", isPrivate: false, defaultBranch: "develop" },
  { fullName: "acme/api", isPrivate: true, defaultBranch: "main" },
];

function renderDialog() {
  return render(
    <NewProjectDialog workspaceId="ws-1" open onOpenChange={() => {}} />,
  );
}

function openPicker() {
  fireEvent.click(
    screen.getByRole("button", { name: /Select a repository/i }),
  );
}

beforeEach(() => {
  repositoryState.data = repositories;
  repositoryState.isPending = false;
  repositoryState.isError = false;
  repositoryState.isFetching = false;
  repositoryState.isSignedIn = true;
  repositoryState.refetch.mockClear();
  createProject.mutateAsync.mockClear();
});

describe("New project dialog", () => {
  it("lists the connected GitHub repositories", () => {
    renderDialog();
    openPicker();

    expect(
      screen.getByRole("option", { name: /acme\/web-app/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /acme\/api, private/ }),
    ).toBeInTheDocument();
  });

  it("selects a repository and prefills its default branch", () => {
    renderDialog();
    openPicker();

    fireEvent.click(screen.getByRole("option", { name: /acme\/web-app/ }));

    expect(
      screen.getByRole("button", { name: /acme\/web-app/ }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Base branch")).toHaveValue("develop");
  });

  it("filters repositories by name", () => {
    renderDialog();
    openPicker();

    fireEvent.change(
      screen.getByRole("combobox", { name: "Search repositories" }),
      { target: { value: "api" } },
    );

    expect(
      screen.queryByRole("option", { name: /acme\/web-app/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /acme\/api, private/ }),
    ).toBeInTheDocument();
  });

  it("falls back to typing an owner/repo", () => {
    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Enter manually" }));
    const input = screen.getByLabelText("Repository");
    fireEvent.change(input, { target: { value: "acme/legacy" } });
    expect(input).toHaveValue("acme/legacy");

    fireEvent.click(screen.getByRole("button", { name: "Choose from GitHub" }));
    expect(
      screen.getByRole("button", { name: /Repository: acme\/legacy/ }),
    ).toBeInTheDocument();
  });

  it("creates the project with the selected repository and branch", async () => {
    createProject.mutateAsync.mockResolvedValue({ id: "p2", name: "Web" });
    renderDialog();

    fireEvent.change(screen.getByLabelText("Project name"), {
      target: { value: "Web" },
    });
    openPicker();
    fireEvent.click(screen.getByRole("option", { name: /acme\/web-app/ }));
    fireEvent.click(screen.getByRole("button", { name: /Create project/i }));

    await waitFor(() =>
      expect(createProject.mutateAsync).toHaveBeenCalledWith({
        name: "Web",
        repositoryId: "acme/web-app",
        defaultBranch: "develop",
        setupCommand: "",
      }),
    );
  });

  it("asks signed-out users to sign in instead of spinning", () => {
    repositoryState.data = undefined;
    repositoryState.isPending = true;
    repositoryState.isSignedIn = false;
    renderDialog();
    openPicker();

    expect(screen.getByText("Sign in to browse repositories.")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows a loading state while repositories load", () => {
    repositoryState.data = undefined;
    repositoryState.isPending = true;
    renderDialog();
    openPicker();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading repositories",
    );
  });

  it("offers a retry when repositories fail to load", () => {
    repositoryState.data = undefined;
    repositoryState.isPending = false;
    repositoryState.isError = true;
    renderDialog();
    openPicker();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't load repositories from GitHub.",
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(repositoryState.refetch).toHaveBeenCalledTimes(1);
  });
});
