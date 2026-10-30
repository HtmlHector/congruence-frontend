import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkspaceSidebar } from "@/app/[workspaceId]/workspace-sidebar";
import { ThemeProvider } from "@/components/foundation/theme-provider";

const navigation = vi.hoisted(() => ({ pathname: "/ws-1/pull-requests" }));
const treeState = vi.hoisted(() => ({
  isAuthLoading: false,
  isSignedIn: true,
  empty: false,
  isError: false,
  refetch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/features/projects/hooks/use-projects", () => ({
  useProjectTreeQuery: () => ({
    isAuthLoading: treeState.isAuthLoading,
    isSignedIn: treeState.isSignedIn,
    entries: treeState.empty
      ? []
      : [
          {
            project: {
              id: "p1",
              name: "acme-web",
              repoProvider: "github",
              defaultBranch: "main",
            },
            worktrees: [
              {
                id: "w1",
                title: "checkout-flow-v2",
                branch: "feature/checkout-flow-v2",
                status: "working",
              },
              {
                id: "w2",
                title: "auth-session-refresh",
                branch: "feature/auth-session-refresh",
                status: "merged",
              },
            ],
          },
        ],
    isLoading: false,
    isError: treeState.isError,
    refetch: treeState.refetch,
  }),
  useCreateWorktree: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/features/workspace/hooks/use-workspace-query", () => ({
  useWorkspaceQuery: () => ({
    data: {
      id: "ws-1",
      name: "Acme",
      slug: "acme",
      plan: "pro",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

function installStorage() {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
    clear: () => values.clear(),
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    get length() {
      return values.size;
    },
  };

  Object.defineProperty(window, "localStorage", {
    value: storage,
    configurable: true,
  });
}

function renderSidebar() {
  return render(
    <ThemeProvider>
      <WorkspaceSidebar workspaceId="ws-1" />
    </ThemeProvider>,
  );
}

function storedPreference() {
  const raw = window.localStorage.getItem("workspace:sidebar");
  return raw ? (JSON.parse(raw) as { width: number; collapsed: boolean }) : null;
}

function pointerEvent(
  type: string,
  init: { clientX?: number; button?: number } = {},
) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    clientX: { value: init.clientX ?? 0 },
    clientY: { value: 0 },
    button: { value: init.button ?? 0 },
    pointerId: { value: 1 },
    pointerType: { value: "mouse" },
  });
  return event as PointerEvent;
}

beforeEach(() => {
  navigation.pathname = "/ws-1/pull-requests";
  treeState.isAuthLoading = false;
  treeState.isSignedIn = true;
  treeState.empty = false;
  treeState.isError = false;
  treeState.refetch.mockClear();
  installStorage();
});

describe("Workspace sidebar", () => {
  it("marks the current section", () => {
    renderSidebar();

    const nav = screen.getByRole("navigation", {
      name: "Workspace navigation",
    });

    expect(
      within(nav).getByRole("link", { name: "Pull Requests" }),
    ).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Search" })).toHaveAttribute(
      "href",
      "/ws-1/search",
    );
    expect(
      within(nav).getByRole("link", { name: "Automations" }),
    ).toHaveAttribute("href", "/ws-1/automations");
    expect(within(nav).getByRole("link", { name: "Pages" })).toHaveAttribute(
      "href",
      "/ws-1/pages",
    );
    expect(
      within(nav).queryByRole("link", { name: "Design system" }),
    ).not.toBeInTheDocument();
  });

  it("shows a skeleton instead of an empty state while the session resolves", () => {
    treeState.isAuthLoading = true;
    renderSidebar();

    const nav = screen.getByRole("navigation", {
      name: "Workspace navigation",
    });

    expect(within(nav).getByLabelText("Loading projects")).toBeInTheDocument();
    expect(within(nav).queryByText(/No projects yet/i)).not.toBeInTheDocument();
  });

  it("shows an invitation when there are no projects", () => {
    treeState.empty = true;
    renderSidebar();

    const nav = screen.getByRole("navigation", {
      name: "Workspace navigation",
    });

    expect(within(nav).getByText("No projects yet")).toBeInTheDocument();
    expect(
      within(nav)
        .getAllByRole("link", { name: "New project" })
        .some((link) => link.getAttribute("href") === "/ws-1/projects?new=1"),
    ).toBe(true);
  });

  it("shows a retry action when projects fail to load", () => {
    treeState.isError = true;
    renderSidebar();

    const nav = screen.getByRole("navigation", {
      name: "Workspace navigation",
    });

    expect(within(nav).getByRole("alert")).toHaveTextContent(
      "Projects unavailable",
    );

    fireEvent.click(within(nav).getByRole("button", { name: "Retry" }));
    expect(treeState.refetch).toHaveBeenCalledTimes(1);
  });

  it("lists projects and their worktrees", () => {
    renderSidebar();

    const nav = screen.getByRole("navigation", {
      name: "Workspace navigation",
    });

    // The project is a heading for its worktrees, not a navigation target.
    expect(within(nav).queryByRole("link", { name: /acme-web/i })).not.toBeInTheDocument();
    expect(within(nav).getByText("acme-web")).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: /checkout-flow-v2/i }),
    ).toHaveAttribute("href", "/ws-1/projects/p1/worktrees/w1");
    expect(
      within(nav).getByRole("link", { name: /auth-session-refresh/i }),
    ).toHaveAttribute("href", "/ws-1/projects/p1/worktrees/w2");
    expect(within(nav).getByTitle("2 worktrees")).toBeInTheDocument();
  });

  it("opens the new worktree dialog from a project row", async () => {
    renderSidebar();

    const nav = screen.getByRole("navigation", {
      name: "Workspace navigation",
    });
    fireEvent.click(
      within(nav).getByRole("button", { name: "New worktree in acme-web" }),
    );

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "New worktree" }),
    ).toBeInTheDocument();
  });

  it("badges the primary worktree", () => {
    renderSidebar();

    const nav = screen.getByRole("navigation", {
      name: "Workspace navigation",
    });

    const badges = within(nav).getAllByText("primary");
    expect(badges).toHaveLength(1);
    expect(
      within(nav).getByRole("link", { name: /checkout-flow-v2/i }),
    ).toContainElement(badges[0]);
  });

  it("marks search active on the search route", () => {
    navigation.pathname = "/ws-1/search";
    renderSidebar();

    const nav = screen.getByRole("navigation", {
      name: "Workspace navigation",
    });

    expect(within(nav).getByRole("link", { name: "Search" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(nav).getByRole("link", { name: "Pull Requests" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("leaves the sidebar top strip clear of workspace identity", () => {
    renderSidebar();

    const sidebar = screen.getByRole("complementary", { name: "Workspace" });

    expect(within(sidebar).queryByText("acme")).not.toBeInTheDocument();
    expect(
      within(sidebar).queryByRole("link", { name: /Acme overview/i }),
    ).not.toBeInTheDocument();
    // The small-screen top bar still names the workspace.
    expect(
      screen.getByRole("link", { name: /Acme overview/i }),
    ).toBeInTheDocument();
  });

  it("shows the plan badge and footer shortcuts", () => {
    renderSidebar();

    const badge = screen.getByTitle("PRO plan");
    expect(badge).toHaveTextContent("PRO");

    const footer = badge.parentElement as HTMLElement;
    expect(within(footer).getByRole("link", { name: "Help" })).toHaveAttribute(
      "href",
      "https://example.com/help",
    );
    expect(within(footer).getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/ws-1/settings",
    );
  });

  it("collapses to the icon rail and remembers the preference", () => {
    const { unmount } = renderSidebar();

    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    expect(
      document.documentElement.style.getPropertyValue(
        "--workspace-sidebar-width",
      ),
    ).toBe("56px");

    const nav = screen.getByRole("navigation", {
      name: "Workspace navigation",
    });
    expect(within(nav).queryByText("acme-web")).not.toBeInTheDocument();
    // The rail keeps the icon links reachable by name.
    expect(within(nav).getByRole("link", { name: "Search" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(storedPreference()).toEqual({ width: 260, collapsed: true });

    unmount();
    renderSidebar();

    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toBeInTheDocument();
  });

  it("resizes from the keyboard and clamps to the bounds", () => {
    renderSidebar();

    const separator = screen.getByRole("separator", {
      name: "Resize workspace sidebar",
    });
    expect(separator).toHaveAttribute("aria-valuenow", "260");

    fireEvent.keyDown(separator, { key: "ArrowRight" });
    expect(separator).toHaveAttribute("aria-valuenow", "276");
    expect(
      document.documentElement.style.getPropertyValue(
        "--workspace-sidebar-width",
      ),
    ).toBe("276px");

    fireEvent.keyDown(separator, { key: "ArrowLeft" });
    fireEvent.keyDown(separator, { key: "ArrowLeft" });
    expect(separator).toHaveAttribute("aria-valuenow", "244");

    fireEvent.keyDown(separator, { key: "End" });
    expect(separator).toHaveAttribute("aria-valuenow", "420");
    fireEvent.keyDown(separator, { key: "ArrowRight" });
    expect(separator).toHaveAttribute("aria-valuenow", "420");

    expect(storedPreference()).toEqual({ width: 420, collapsed: false });
  });

  it("resizes by dragging the sidebar edge", () => {
    renderSidebar();

    const sidebar = screen.getByRole("complementary", { name: "Workspace" });
    const separator = screen.getByRole("separator", {
      name: "Resize workspace sidebar",
    });
    expect(sidebar.className).toContain("transition-[width]");

    act(() => {
      separator.dispatchEvent(pointerEvent("pointerdown", { clientX: 260 }));
    });
    act(() => {
      window.dispatchEvent(pointerEvent("pointermove", { clientX: 320 }));
    });

    expect(separator).toHaveAttribute("aria-valuenow", "320");
    expect(separator).toHaveAttribute("data-resizing", "true");
    // The rail and the content offset follow the pointer without easing.
    expect(sidebar.className).not.toContain("transition-[width]");
    expect(document.documentElement.dataset.sidebarResizing).toBe("true");

    act(() => {
      window.dispatchEvent(pointerEvent("pointermove", { clientX: 100 }));
    });
    expect(separator).toHaveAttribute("aria-valuenow", "200");

    act(() => {
      window.dispatchEvent(pointerEvent("pointerup"));
    });

    expect(separator).toHaveAttribute("data-resizing", "false");
    expect(storedPreference()).toEqual({ width: 200, collapsed: false });
    expect(document.body.style.cursor).toBe("");
    expect(sidebar.className).toContain("transition-[width]");
    expect(document.documentElement.dataset.sidebarResizing).toBeUndefined();
  });

  it("opens the navigation drawer on small screens and closes on escape", () => {
    renderSidebar();

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));

    const drawer = screen.getByRole("dialog", {
      name: "Workspace navigation",
    });
    expect(
      within(drawer).getByRole("link", { name: "Pull Requests" }),
    ).toHaveAttribute("aria-current", "page");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(
      screen.queryByRole("dialog", { name: "Workspace navigation" }),
    ).not.toBeInTheDocument();
  });
});
