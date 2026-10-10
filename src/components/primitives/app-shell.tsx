"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

interface AppShellContextValue {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toggleCollapse: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error("useAppShell must be used within an <AppShell> component.");
  }
  return ctx;
}

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultCollapsed?: boolean;
  defaultMobileOpen?: boolean;
  children: React.ReactNode;
}

/**
 * Unstyled, headless AppShell container.
 * Coordinates sidebar open/collapse state and layout regions (sidebar, header, content).
 */
export function AppShell({
  defaultCollapsed = false,
  defaultMobileOpen = false,
  className = "",
  children,
  ...props
}: AppShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(defaultMobileOpen);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed);

  const value = useMemo(
    () => ({
      isSidebarOpen,
      isSidebarCollapsed,
      toggleSidebar: () => setSidebarOpen((prev) => !prev),
      toggleCollapse: () => setSidebarCollapsed((prev) => !prev),
      setSidebarOpen,
      setSidebarCollapsed,
    }),
    [isSidebarOpen, isSidebarCollapsed]
  );

  return (
    <AppShellContext.Provider value={value}>
      <div
        data-slot="app-shell"
        data-sidebar-collapsed={isSidebarCollapsed}
        data-sidebar-open={isSidebarOpen}
        className={className}
        {...props}
      >
        {children}
      </div>
    </AppShellContext.Provider>
  );
}

export function AppShellSidebar({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { isSidebarCollapsed, isSidebarOpen } = useAppShell();

  return (
    <aside
      data-slot="app-shell-sidebar"
      data-collapsed={isSidebarCollapsed}
      data-mobile-open={isSidebarOpen}
      className={className}
      {...props}
    >
      {children}
    </aside>
  );
}

export function AppShellHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header data-slot="app-shell-header" className={className} {...props}>
      {children}
    </header>
  );
}

export function AppShellMain({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <main data-slot="app-shell-main" className={className} {...props}>
      {children}
    </main>
  );
}
