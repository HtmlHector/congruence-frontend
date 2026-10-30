import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import { WorkspaceSettings } from "@/features/workspace/components/workspace-settings";

const mocks = vi.hoisted(() => ({
  workspace: {
    id: "ws-1",
    name: "Acme",
    slug: "acme",
    plan: "pro",
    createdAt: "2026-01-15T12:00:00.000Z",
  },
  updateMutate: vi.fn(),
  deleteMutate: vi.fn(),
  deleteReset: vi.fn(),
  push: vi.fn(),
}));

const queryState = vi.hoisted(() => ({
  loading: false,
  error: null as Error | null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/features/workspace/hooks/use-workspace-query", () => ({
  useWorkspaceQuery: () => ({
    data: queryState.loading || queryState.error ? undefined : mocks.workspace,
    isLoading: queryState.loading,
    error: queryState.error,
    refetch: vi.fn(),
  }),
  useUpdateWorkspace: () => ({
    mutate: mocks.updateMutate,
    isPending: false,
    error: null,
  }),
  useDeleteWorkspace: () => ({
    mutate: mocks.deleteMutate,
    isPending: false,
    error: null,
    reset: mocks.deleteReset,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

beforeEach(() => {
  queryState.loading = false;
  queryState.error = null;
  mocks.updateMutate.mockClear();
  mocks.deleteMutate.mockClear();
  mocks.deleteReset.mockClear();
  mocks.push.mockClear();
});

describe("Workspace settings", () => {
  it("renders a loading skeleton while the workspace resolves", () => {
    queryState.loading = true;
    render(<WorkspaceSettings workspaceId="ws-1" />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading settings");
    expect(
      screen.queryByRole("heading", { name: "General" }),
    ).not.toBeInTheDocument();
  });

  it("shows a recovery path when the workspace is missing", () => {
    queryState.error = new Error("Not found");
    render(<WorkspaceSettings workspaceId="ws-1" />);

    expect(
      screen.getByRole("heading", { name: "Workspace not found" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders the workspace identity and details", () => {
    render(<WorkspaceSettings workspaceId="ws-1" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "General" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Workspace name")).toHaveValue("Acme");
    expect(screen.getByText("ws-1")).toBeInTheDocument();
    expect(screen.getByText("acme")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Jan 15, 2026")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy workspace ID" }),
    ).toBeInTheDocument();
  });

  it("saves a trimmed workspace name", () => {
    render(<WorkspaceSettings workspaceId="ws-1" />);

    const input = screen.getByLabelText("Workspace name");
    const save = screen.getByRole("button", { name: "Save changes" });

    expect(save).toBeDisabled();

    fireEvent.change(input, { target: { value: "  Acme Labs  " } });
    expect(save).toBeEnabled();

    fireEvent.click(save);

    expect(mocks.updateMutate).toHaveBeenCalledTimes(1);
    expect(mocks.updateMutate.mock.calls[0][0]).toEqual({
      name: "Acme Labs",
    });

    const options = mocks.updateMutate.mock.calls[0][1];
    options.onSuccess();
    expect(toast.success).toHaveBeenCalledWith("Workspace name updated.");

    fireEvent.change(input, { target: { value: "   " } });
    expect(save).toBeDisabled();
  });

  it("requires the workspace name before deleting", () => {
    render(<WorkspaceSettings workspaceId="ws-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Delete workspace" }));

    const dialog = screen.getByRole("dialog", { name: "Delete workspace" });
    const confirm = within(dialog).getByRole("textbox");
    const deleteButton = within(dialog).getByRole("button", {
      name: "Delete workspace",
    });

    expect(deleteButton).toBeDisabled();

    fireEvent.change(confirm, { target: { value: "Acme" } });
    expect(deleteButton).toBeEnabled();

    fireEvent.click(deleteButton);

    expect(mocks.deleteMutate).toHaveBeenCalledTimes(1);

    const options = mocks.deleteMutate.mock.calls[0][1];
    options.onSuccess();

    expect(toast.success).toHaveBeenCalledWith("Workspace deleted.");
    expect(mocks.push).toHaveBeenCalledWith("/");
  });
});
