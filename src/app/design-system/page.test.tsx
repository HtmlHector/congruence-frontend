import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DesignSystemPage from "@/app/design-system/page";
import { ThemeProvider } from "@/components/foundation/theme-provider";

function renderPage() {
  return render(
    <ThemeProvider>
      <DesignSystemPage />
    </ThemeProvider>,
  );
}

const SECTION_HEADINGS = [
  "Color",
  "Typography",
  "Grid and spacing",
  "Materials and depth",
  "Motion",
  "Buttons",
  "Forms",
  "Cards",
  "Overlays",
  "Primitives",
  "Code and copy",
  "Keyboard and command menu",
];

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

  return storage;
}

let storage: ReturnType<typeof installStorage>;

beforeEach(() => {
  storage = installStorage();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.colorScheme = "";
});

describe("Foundation design system page", () => {
  it("documents all twelve sections and the target-system note", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { level: 1, name: "Design system" }),
    ).toBeInTheDocument();

    SECTION_HEADINGS.forEach((heading) => {
      expect(
        screen.getByRole("heading", { level: 2, name: heading }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Target system.")).toBeInTheDocument();
    expect(
      screen.getAllByText("--foundation-ink").length,
    ).toBeGreaterThan(0);
  });

  it("keeps zero em or en dashes in the rendered page", () => {
    renderPage();

    const dashCharacters = [
      String.fromCharCode(0x2013),
      String.fromCharCode(0x2014),
    ].join("");

    expect(document.body.textContent).not.toMatch(new RegExp(`[${dashCharacters}]`));
  });

  it("applies and persists the explicit theme choice", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Dark theme" }));

    await waitFor(() => {
      expect(document.documentElement).toHaveClass("dark");
    });
    expect(storage.getItem("foundation-theme")).toBe("dark");

    fireEvent.click(screen.getByRole("button", { name: "Light theme" }));

    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass("dark");
    });
    expect(storage.getItem("foundation-theme")).toBe("light");

    fireEvent.click(screen.getByRole("button", { name: "System theme" }));
    expect(storage.getItem("foundation-theme")).toBe("system");
  });

  it("collapses the sidebar and restores the choice on the next mount", async () => {
    const first = renderPage();

    const sidebar = document.querySelector("aside");
    expect(sidebar).toHaveAttribute("data-collapsed", "false");

    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    await waitFor(() => {
      expect(sidebar).toHaveAttribute("data-collapsed", "true");
    });
    expect(storage.getItem("foundation:sidebar")).toBe("collapsed");
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toBeInTheDocument();

    first.unmount();
    renderPage();

    await waitFor(() => {
      expect(document.querySelector("aside")).toHaveAttribute(
        "data-collapsed",
        "true",
      );
    });
  });

  it("opens the command palette with the shortcut and filters results", async () => {
    renderPage();

    fireEvent.keyDown(document, { key: "k", metaKey: true });

    const input = await screen.findByRole("combobox");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "button" } });

    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options.length).toBeGreaterThan(0);
      expect(
        options.some((option) => option.textContent?.includes("Button")),
      ).toBe(true);
    });

    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });
  });

  it("toggles the grid overlay", () => {
    renderPage();

    const toggle = screen.getByRole("button", { name: "Hide grid" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: "Show grid" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("copies token values and announces the result", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Copy CSS variable --foundation-ink",
      }),
    );

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("--foundation-ink");
    });

    expect(screen.getByText("Copied --foundation-ink")).toBeInTheDocument();
  });
});
