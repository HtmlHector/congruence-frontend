import { beforeEach, describe, expect, it } from "vitest";

import {
  clearSnapshot,
  readSnapshot,
  writeSnapshot,
} from "@/features/terminals/lib/terminal-snapshot";

// This Node version exposes an unavailable `localStorage` that shadows the jsdom
// one, so each test installs its own in-memory store.
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

describe("terminal snapshots", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: memoryStorage(),
      configurable: true,
    });
  });

  it("round-trips a screen for one tab", () => {
    expect(readSnapshot("project-1", "tab-1")).toBeNull();

    writeSnapshot("project-1", "tab-1", "\u001b[32mclaude\u001b[0m\r\nready");
    expect(readSnapshot("project-1", "tab-1")).toBe(
      "\u001b[32mclaude\u001b[0m\r\nready",
    );

    // Other tabs and projects keep their own screen.
    expect(readSnapshot("project-1", "tab-2")).toBeNull();
    expect(readSnapshot("project-2", "tab-1")).toBeNull();
  });

  it("replaces the previous screen for the same tab", () => {
    writeSnapshot("project-1", "tab-1", "old");
    writeSnapshot("project-1", "tab-1", "new");
    expect(readSnapshot("project-1", "tab-1")).toBe("new");
  });

  it("drops the screen when a tab is closed", () => {
    writeSnapshot("project-1", "tab-1", "screen");
    clearSnapshot("project-1", "tab-1");
    expect(readSnapshot("project-1", "tab-1")).toBeNull();
  });

  it("ignores empty screens and storage failures", () => {
    writeSnapshot("project-1", "tab-1", "");
    expect(readSnapshot("project-1", "tab-1")).toBeNull();

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: () => {
          throw new Error("denied");
        },
        setItem: () => {
          throw new Error("quota");
        },
        removeItem: () => {
          throw new Error("denied");
        },
      },
      configurable: true,
    });

    expect(() => writeSnapshot("project-1", "tab-1", "screen")).not.toThrow();
    expect(readSnapshot("project-1", "tab-1")).toBeNull();
    expect(() => clearSnapshot("project-1", "tab-1")).not.toThrow();
  });
});
