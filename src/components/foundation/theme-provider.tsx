"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import { THEME_STORAGE_KEY } from "./theme-script";

export type ThemeMode = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

interface FoundationThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const FoundationThemeContext = createContext<FoundationThemeContextValue | null>(null);

const themeListeners = new Set<() => void>();

function notifyThemeListeners() {
  themeListeners.forEach((listener) => listener());
}

function subscribeTheme(callback: () => void) {
  themeListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    themeListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getThemeSnapshot(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function getServerThemeSnapshot(): ThemeMode {
  return "system";
}

function subscribeSystemTheme(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSystemThemeSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerSystemThemeSnapshot(): boolean {
  return false;
}

function writeThemeMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage can be blocked; the in-memory choice still applies for this session.
  }
  notifyThemeListeners();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const systemDark = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemThemeSnapshot,
    getServerSystemThemeSnapshot,
  );

  const resolved: ResolvedTheme =
    mode === "system" ? (systemDark ? "dark" : "light") : mode;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
    root.dataset.theme = resolved;
  }, [resolved]);

  const setMode = useCallback((next: ThemeMode) => writeThemeMode(next), []);

  const value = useMemo(
    () => ({ mode, resolved, setMode }),
    [mode, resolved, setMode],
  );

  return (
    <FoundationThemeContext.Provider value={value}>
      {children}
    </FoundationThemeContext.Provider>
  );
}

export function useFoundationTheme(): FoundationThemeContextValue {
  const context = useContext(FoundationThemeContext);
  if (!context) {
    throw new Error("useFoundationTheme must be used inside ThemeProvider.");
  }
  return context;
}
