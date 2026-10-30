import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SettingsSidebar } from "@/app/[workspaceId]/settings/settings-sidebar";
import { ThemeProvider } from "@/components/foundation/theme-provider";

const navigation = vi.hoisted(() => ({ pathname: "/ws-1/settings" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock("@/features/workspace/hooks/use-workspace-query", () => ({
  useWorkspaceQuery: () => ({
    data: {
      id: "ws-1",
      name: "Acme",
      slug: "acme",
      plan: "pro",
      createdAt: "2026-01-15T12:00:00.000Z",
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
      <SettingsSidebar workspaceId="ws-1" />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  navigation.pathname = "/ws-1/settings";
  installStorage();
});

describe("Settings sidebar", () => {
  it("links to every settings tab and back to the workspace", () => {
    renderSidebar();

    const nav = screen.getByRole("navigation", { name: "Settings tabs" });

    expect(within(nav).getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "/ws-1/settings/profile",
    );
    expect(
      within(nav).getByRole("link", { name: "Appearance" }),
    ).toHaveAttribute("href", "/ws-1/settings/appearance");
    expect(within(nav).getByRole("link", { name: "MCP" })).toHaveAttribute(
      "href",
      "/ws-1/settings/mcp",
    );
    expect(
      within(nav).getByRole("link", { name: "Integrations" }),
    ).toHaveAttribute("href", "/ws-1/settings/integrations");
    expect(within(nav).getByRole("link", { name: "Storage" })).toHaveAttribute(
      "href",
      "/ws-1/settings/storage",
    );
    expect(within(nav).getByRole("link", { name: "Billing" })).toHaveAttribute(
      "href",
      "/ws-1/settings/billing",
    );
    expect(within(nav).getByRole("link", { name: "General" })).toHaveAttribute(
      "href",
      "/ws-1/settings",
    );

    expect(
      screen.getByRole("link", { name: "Back to workspace" }),
    ).toHaveAttribute("href", "/ws-1");
  });

  it("marks the current tab", () => {
    navigation.pathname = "/ws-1/settings/storage";
    renderSidebar();

    const nav = screen.getByRole("navigation", { name: "Settings tabs" });

    expect(within(nav).getByRole("link", { name: "Storage" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).getByRole("link", { name: "General" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("opens and closes the mobile drawer", () => {
    renderSidebar();

    fireEvent.click(
      screen.getByRole("button", { name: "Open settings navigation" }),
    );

    const drawer = screen.getByRole("dialog", {
      name: "Settings navigation",
    });
    expect(
      within(drawer).getByRole("link", { name: "Profile" }),
    ).toHaveAttribute("href", "/ws-1/settings/profile");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(
      screen.queryByRole("dialog", { name: "Settings navigation" }),
    ).not.toBeInTheDocument();
  });
});
