import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { layoutStorageKey } from "@/app/[workspaceId]/workspace-layout";
import { WorktreeWorkspace } from "@/app/[workspaceId]/workspace-tab-bar";

const nav = vi.hoisted(() => ({
  params: { workspaceId: "acme" } as {
    workspaceId: string;
  },
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => nav.params,
  useRouter: () => ({ push: nav.push }),
}));

vi.mock("@/features/terminals/components/devbox-terminal", () => ({
  DevboxTerminal: () => <div data-testid="terminal" />,
}));

vi.mock("@/features/preview/components/browser-preview", () => ({
  BrowserPreview: () => <div data-testid="browser-preview" />,
}));

const api = vi.hoisted(() => ({ delete: vi.fn() }));
vi.mock("@/lib/api", () => ({ apiClient: api }));

const WORKTREE_ID = "wt-1";
const LAYOUT_KEY = layoutStorageKey(WORKTREE_ID);

function workspace() {
  return <WorktreeWorkspace projectId="proj-1" worktreeId={WORKTREE_ID} />;
}

// This Node version exposes an unavailable `localStorage`, which shadows the
// jsdom one, so each test gets its own in-memory store.
function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => {
      data.delete(key);
    },
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

interface SavedTab {
  name: string;
  component: string;
  config: {
    kind: string;
    session: string;
    agent: string | null;
    launched: boolean;
  };
}

interface SavedTabset {
  children: SavedTab[];
}

interface SavedLayout {
  layout: { children: SavedTabset[] };
}

function savedLayout(): SavedLayout {
  return JSON.parse(window.localStorage.getItem(LAYOUT_KEY) ?? "{}") as SavedLayout;
}

function savedTabs(): SavedTab[] {
  return savedLayout().layout.children.flatMap((tabset) => tabset.children);
}

function openMenu(name: "New tab" = "New tab") {
  fireEvent.click(screen.getByRole("button", { name }));
}

function createTerminal() {
  openMenu();
  fireEvent.click(screen.getByRole("option", { name: "New terminal" }));
}

describe("Workspace panes", () => {
  beforeEach(() => {
    nav.params = { workspaceId: "acme" };
    nav.push.mockClear();
    api.delete.mockReset();
    api.delete.mockResolvedValue({});
    Object.defineProperty(window, "localStorage", {
      value: memoryStorage(),
      configurable: true,
    });

    // jsdom reports zero-size elements, and FlexLayout only paints a tab's
    // content once its pane has a measured rect.
    const rect = {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1200,
      bottom: 800,
      width: 1200,
      height: 800,
      toJSON: () => ({}),
    };
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(
      rect as DOMRect,
    );
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get: () => 1200,
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get: () => 800,
    });
  });

  it("starts with one terminal in one pane", () => {
    render(workspace());

    const strips = screen.getAllByRole("tablist");
    expect(strips).toHaveLength(1);
    expect(
      within(strips[0]).getByRole("tab", { name: "Terminal 1" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("adds a terminal to the pane from its strip menu", () => {
    render(workspace());
    createTerminal();

    const strips = screen.getAllByRole("tablist");
    expect(strips).toHaveLength(1);
    expect(
      within(strips[0]).getByRole("tab", { name: "Terminal 2" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(
      within(strips[0]).getByRole("tab", { name: "Terminal 1" }),
    ).toHaveAttribute("aria-selected", "false");
  });

  it("opens a terminal with the keyboard shortcut", () => {
    render(workspace());

    fireEvent.keyDown(window, { key: "t", metaKey: true });

    const strip = screen.getByRole("tablist");
    expect(
      within(strip).getByRole("tab", { name: "Terminal 2" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("opens an agent tab from the menu", () => {
    render(workspace());

    openMenu();
    expect(screen.getByRole("option", { name: "Claude" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Cline" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Codex" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: "Claude" }));

    const strip = screen.getByRole("tablist");
    expect(
      within(strip).getByRole("tab", { name: "Claude" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(savedTabs()[1]).toMatchObject({
      name: "Claude",
      component: "terminal",
      config: { agent: "claude", launched: false },
    });
  });

  it("numbers repeated agent tabs", () => {
    render(workspace());

    openMenu();
    fireEvent.click(screen.getByRole("option", { name: "Codex" }));
    openMenu();
    fireEvent.click(screen.getByRole("option", { name: "Codex" }));

    const strip = screen.getByRole("tablist");
    expect(
      within(strip).getByRole("tab", { name: "Codex 2" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(
      within(strip).getByRole("tab", { name: "Codex" }),
    ).toHaveAttribute("aria-selected", "false");
  });

  it("filters the menu by query", () => {
    render(workspace());

    openMenu();
    fireEvent.change(
      screen.getByRole("combobox", { name: "Search actions" }),
      { target: { value: "code" } },
    );

    expect(screen.getByRole("option", { name: "Codex" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Claude" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "New terminal" }),
    ).not.toBeInTheDocument();
  });

  it("clears the search from the menu header", () => {
    render(workspace());

    openMenu();
    fireEvent.change(
      screen.getByRole("combobox", { name: "Search actions" }),
      { target: { value: "code" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(
      screen.getByRole("combobox", { name: "Search actions" }),
    ).toHaveValue("");
    expect(
      screen.getByRole("option", { name: "New terminal" }),
    ).toBeInTheDocument();
  });

  it("opens workspace settings from the menu", () => {
    render(workspace());

    openMenu();
    fireEvent.click(screen.getByRole("option", { name: "Workspace settings" }));

    expect(nav.push).toHaveBeenCalledWith("/acme/settings");
  });

  it("adds a browser preview tab", () => {
    render(workspace());

    openMenu();
    fireEvent.click(screen.getByRole("option", { name: "Browser preview" }));

    const strip = screen.getByRole("tablist");
    expect(
      within(strip).getByRole("tab", { name: "Browser 1" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("browser-preview")).toBeInTheDocument();
  });

  it("restores the pane layout and session ids after a reload", () => {
    const first = render(workspace());

    // Even an untouched single tab is stored, so the first reload reattaches.
    const initial = savedTabs();
    expect(initial).toHaveLength(1);
    expect(initial[0].config.session).toMatch(/^tab-/);

    createTerminal();
    const saved = savedTabs();
    expect(saved).toHaveLength(2);
    expect(saved[1].config.session).toMatch(/^tab-/);
    expect(saved[1].config.session).not.toBe(initial[0].config.session);

    first.unmount();
    render(workspace());

    const strip = screen.getByRole("tablist");
    expect(
      within(strip).getByRole("tab", { name: "Terminal 2" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(
      within(strip).getByRole("tab", { name: "Terminal 1" }),
    ).toHaveAttribute("aria-selected", "false");
    expect(savedTabs().map((tab) => tab.config.session)).toEqual(
      saved.map((tab) => tab.config.session),
    );
  });

  it("keeps a stored split as one tab strip per pane", () => {
    const split = {
      global: {},
      borders: [],
      layout: {
        type: "row",
        weight: 100,
        children: [
          {
            type: "tabset",
            weight: 50,
            selected: 0,
            children: [
              {
                type: "tab",
                name: "Terminal 1",
                component: "terminal",
                config: {
                  kind: "terminal",
                  session: "tab-left",
                  agent: null,
                  launched: false,
                  port: null,
                  path: "/",
                },
              },
            ],
          },
          {
            type: "tabset",
            weight: 50,
            selected: 0,
            children: [
              {
                type: "tab",
                name: "Browser 1",
                component: "browser",
                config: {
                  kind: "browser",
                  session: "tab-right",
                  agent: null,
                  launched: false,
                  port: 3000,
                  path: "/",
                },
              },
            ],
          },
        ],
      },
    };
    window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(split));

    render(workspace());

    const strips = screen.getAllByRole("tablist");
    expect(strips).toHaveLength(2);
    expect(
      within(strips[0]).getByRole("tab", { name: "Terminal 1" }),
    ).toBeInTheDocument();
    expect(
      within(strips[1]).getByRole("tab", { name: "Browser 1" }),
    ).toBeInTheDocument();
  });

  it("dismisses a pane when its last tab is closed", () => {
    window.localStorage.setItem(
      LAYOUT_KEY,
      JSON.stringify({
        global: {},
        borders: [],
        layout: {
          type: "row",
          weight: 100,
          children: [
            {
              type: "tabset",
              weight: 50,
              selected: 0,
              children: [
                {
                  type: "tab",
                  name: "Terminal 1",
                  component: "terminal",
                  config: {
                    kind: "terminal",
                    session: "tab-left",
                    agent: null,
                    launched: false,
                    port: null,
                    path: "/",
                  },
                },
              ],
            },
            {
              type: "tabset",
              weight: 50,
              selected: 0,
              children: [
                {
                  type: "tab",
                  name: "Browser 1",
                  component: "browser",
                  config: {
                    kind: "browser",
                    session: "tab-right",
                    agent: null,
                    launched: false,
                    port: 3000,
                    path: "/",
                  },
                },
              ],
            },
          ],
        },
      }),
    );

    render(workspace());
    expect(screen.getAllByRole("tablist")).toHaveLength(2);

    const right = screen.getAllByRole("tablist")[1];
    fireEvent.click(within(right).getByTitle("Close"));

    const strips = screen.getAllByRole("tablist");
    expect(strips).toHaveLength(1);
    expect(
      within(strips[0]).getByRole("tab", { name: "Terminal 1" }),
    ).toBeInTheDocument();
  });

  it("stops the shell when a terminal tab is closed", () => {
    render(workspace());
    createTerminal();
    // Close the selected tab: FlexLayout only offers the close affordance on a
    // hovered tab when the pointer is a mouse, which jsdom does not report.
    const closing = savedTabs()[1].config.session;

    fireEvent.click(screen.getAllByTitle("Close")[1]);

    expect(api.delete).toHaveBeenCalledWith(
      `/api/v1/projects/proj-1/shell-sessions/${closing}`,
    );
    const strip = screen.getByRole("tablist");
    expect(
      within(strip).queryByRole("tab", { name: "Terminal 2" }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state after the last tab closes and can start over", () => {
    render(workspace());

    fireEvent.click(screen.getByTitle("Close"));
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
    expect(
      screen.getByText("No tabs are open in this workspace."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "New terminal" }));

    const strip = screen.getByRole("tablist");
    expect(
      within(strip).getByRole("tab", { name: "Terminal 1" }),
    ).toHaveAttribute("aria-selected", "true");
  });

});
