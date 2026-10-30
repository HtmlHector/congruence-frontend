"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleHelp,
  FileText,
  GitPullRequest,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";

import { SidebarProjects } from "@/features/projects/components/sidebar-projects";
import { useWorkspaceQuery } from "@/features/workspace/hooks/use-workspace-query";
import { cn } from "@/lib/utils";

// Set NEXT_PUBLIC_HELP_URL to the product's documentation or support site.
const helpUrl = process.env.NEXT_PUBLIC_HELP_URL ?? "https://example.com/help";

// Both the fixed sidebar and the workspace content offset read this variable,
// so the panes can never fall out of step with a resize.
const SIDEBAR_WIDTH_PROPERTY = "--workspace-sidebar-width";
const SIDEBAR_STORAGE_KEY = "workspace:sidebar";
const DEFAULT_SIDEBAR_WIDTH = 260;
const COLLAPSED_SIDEBAR_WIDTH = 56;
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 420;
const KEYBOARD_RESIZE_STEP = 16;

interface SidebarPreference {
  width: number;
  collapsed: boolean;
}

const DEFAULT_SIDEBAR_PREFERENCE: SidebarPreference = {
  width: DEFAULT_SIDEBAR_WIDTH,
  collapsed: false,
};

function clampSidebarWidth(width: number) {
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, Math.round(width)));
}

function readSidebarPreference(): SidebarPreference | null {
  try {
    const raw = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { width, collapsed } = parsed as Partial<SidebarPreference>;
    if (typeof width !== "number" || !Number.isFinite(width)) return null;

    return { width: clampSidebarWidth(width), collapsed: collapsed === true };
  } catch {
    return null;
  }
}

function writeSidebarPreference(preference: SidebarPreference) {
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(preference));
  } catch {
    // Persistence is best effort; the sidebar still resizes for this session.
  }
}

/**
 * The saved width belongs to an external system (localStorage), so it is read
 * through useSyncExternalStore rather than copied into state after mount. The
 * store also owns the live width, which keeps dragging free of effect-driven
 * state updates while still persisting on release.
 */
function createSidebarStore() {
  let preference: SidebarPreference | null = null;
  const listeners = new Set<() => void>();

  const current = () => {
    preference ??= readSidebarPreference() ?? DEFAULT_SIDEBAR_PREFERENCE;
    return preference;
  };

  const emit = () => {
    for (const listener of listeners) listener();
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: current,
    getServerSnapshot: () => DEFAULT_SIDEBAR_PREFERENCE,
    update(next: SidebarPreference, persist = true) {
      preference = {
        width: clampSidebarWidth(next.width),
        collapsed: next.collapsed,
      };
      if (persist) writeSidebarPreference(preference);
      emit();
    },
    persist() {
      writeSidebarPreference(current());
    },
  };
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
}

interface SidebarPanelProps {
  workspaceId: string;
  planLabel: string;
  isLoading: boolean;
  navItems: NavItem[];
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onNavigate?: () => void;
}

function isPathActive(pathname: string | null, href: string, exact = false) {
  if (!pathname) return false;
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceSidebar({ workspaceId }: { workspaceId: string }) {
  const pathname = usePathname();
  const { data: workspace, isLoading } = useWorkspaceQuery(workspaceId);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarStore] = useState(createSidebarStore);
  const { width, collapsed } = useSyncExternalStore(
    sidebarStore.subscribe,
    sidebarStore.getSnapshot,
    sidebarStore.getServerSnapshot,
  );
  const [resizing, setResizing] = useState(false);
  const resizeStart = useRef<{ pointerX: number; width: number } | null>(null);

  const overviewHref = `/${workspaceId}`;
  const name = workspace?.name ?? "Workspace";
  const initial = name.charAt(0).toUpperCase();
  const planLabel = (workspace?.plan ?? "free").toUpperCase();

  const navItems: NavItem[] = [
    {
      label: "Search",
      href: `${overviewHref}/search`,
      icon: Search,
      isActive: isPathActive(pathname, `${overviewHref}/search`),
    },
    {
      label: "Pull Requests",
      href: `${overviewHref}/pull-requests`,
      icon: GitPullRequest,
      isActive: isPathActive(pathname, `${overviewHref}/pull-requests`),
    },
    {
      label: "Automations",
      href: `${overviewHref}/automations`,
      icon: Workflow,
      isActive: isPathActive(pathname, `${overviewHref}/automations`),
    },
    {
      label: "Pages",
      href: `${overviewHref}/pages`,
      icon: FileText,
      isActive: isPathActive(pathname, `${overviewHref}/pages`),
    },
  ];

  // The layout reads the same variable for the content offset, so the rail, the
  // panes and the terminal splitters all move on the same width.
  useEffect(() => {
    document.documentElement.style.setProperty(
      SIDEBAR_WIDTH_PROPERTY,
      `${collapsed ? COLLAPSED_SIDEBAR_WIDTH : width}px`,
    );
  }, [collapsed, width]);

  useEffect(() => {
    if (!resizing) return;

    // The content offset shares the rail's transition; turn it off so both
    // edges follow the pointer instead of easing behind it.
    const root = document.documentElement;
    root.dataset.sidebarResizing = "true";

    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const onPointerMove = (event: PointerEvent) => {
      const start = resizeStart.current;
      if (!start) return;
      sidebarStore.update(
        {
          width: start.width + event.clientX - start.pointerX,
          collapsed: false,
        },
        // Persist once on release instead of on every pointer move.
        false,
      );
    };

    const finishResize = () => {
      resizeStart.current = null;
      setResizing(false);
      sidebarStore.persist();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", finishResize);
    window.addEventListener("pointercancel", finishResize);

    return () => {
      delete root.dataset.sidebarResizing;
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", finishResize);
      window.removeEventListener("pointercancel", finishResize);
    };
  }, [resizing, sidebarStore]);

  const toggleCollapsed = () => {
    sidebarStore.update({ width, collapsed: !collapsed });
  };

  const beginResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (collapsed || event.button !== 0) return;
    event.preventDefault();
    resizeStart.current = { pointerX: event.clientX, width };
    setResizing(true);

    // Keep receiving events if the pointer leaves the window mid-drag.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is unavailable in jsdom and older browsers.
    }
  };

  const resizeWithKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    const step = event.shiftKey
      ? KEYBOARD_RESIZE_STEP * 4
      : KEYBOARD_RESIZE_STEP;
    const requested =
      event.key === "Home"
        ? MIN_SIDEBAR_WIDTH
        : event.key === "End"
          ? MAX_SIDEBAR_WIDTH
          : width + (event.key === "ArrowRight" ? step : -step);
    sidebarStore.update({ width: requested, collapsed: false });
  };

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  // A drawer left open while the viewport grows would keep the page scroll
  // locked even though the desktop sidebar has taken over.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };

    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      {/* The rail and the content offset share one width variable and one
          duration, so a collapse moves them together. Dragging turns both
          transitions off in favor of following the pointer. */}
      <aside
        id="workspace-sidebar"
        aria-label="Workspace"
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-[var(--workspace-sidebar-width,260px)] flex-col overflow-hidden border-r border-foundation-line bg-foundation-bg lg:flex",
          !resizing &&
            "transition-[width] duration-200 ease-fd motion-reduce:transition-none",
        )}
      >
        <SidebarPanel
          workspaceId={workspaceId}
          planLabel={planLabel}
          isLoading={isLoading}
          navItems={navItems}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
        />

        {/* A collapsed rail has no width to drag; the toggle reopens it. */}
        {collapsed ? null : (
          <div
            role="separator"
            aria-label="Resize workspace sidebar"
            aria-orientation="vertical"
            aria-controls="workspace-sidebar"
            aria-valuemin={MIN_SIDEBAR_WIDTH}
            aria-valuemax={MAX_SIDEBAR_WIDTH}
            aria-valuenow={width}
            data-resizing={resizing}
            tabIndex={0}
            onPointerDown={beginResize}
            onKeyDown={resizeWithKeyboard}
            className="group absolute inset-y-0 right-0 z-10 w-1.5 cursor-col-resize touch-none focus-visible:outline-none"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 right-0 w-px bg-transparent transition-[width,background-color] duration-150 ease-fd group-hover:w-0.5 group-hover:bg-foundation-line-strong group-focus-visible:w-0.5 group-focus-visible:bg-foundation-ink group-data-[resizing=true]:w-0.5 group-data-[resizing=true]:bg-foundation-ink"
            />
          </div>
        )}
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-foundation-line bg-foundation-bg/95 px-3 backdrop-blur-sm lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          aria-expanded={mobileOpen}
          aria-controls="workspace-navigation"
          className="grid size-8 shrink-0 place-items-center rounded-fd-sm text-foundation-ink-secondary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
        >
          <Menu className="size-4" aria-hidden="true" />
        </button>

        <Link
          href={overviewHref}
          aria-label={`${name} overview`}
          className="flex min-w-0 items-center gap-2 rounded-fd-sm focus-visible:foundation-focus"
        >
          <WorkspaceMark initial={initial} />
          {isLoading ? (
            <span
              aria-hidden="true"
              className="h-3 w-28 animate-pulse rounded-full bg-foundation-sunken"
            />
          ) : (
            <span className="truncate text-[13px] font-semibold leading-5 tracking-[-0.01em]">
              {name}
            </span>
          )}
        </Link>
      </header>

      {mobileOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <aside
            id="workspace-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Workspace navigation"
            className="fixed inset-y-0 left-0 z-50 flex w-[288px] flex-col border-r border-foundation-line bg-foundation-bg shadow-[0_24px_48px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.08)]"
          >
            <SidebarPanel
              workspaceId={workspaceId}
              planLabel={planLabel}
              isLoading={isLoading}
              navItems={navItems}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarPanel({
  workspaceId,
  planLabel,
  isLoading,
  navItems,
  collapsed = false,
  onToggleCollapsed,
  onNavigate,
}: SidebarPanelProps) {
  const overviewHref = `/${workspaceId}`;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* The strip and its hairline stay as the sidebar's top edge. It shares
          --workspace-strip-height with the pane tab bars so the lines run level.
          On desktop it holds the collapse control; in the drawer it holds the
          close control. End-aligned, so the 12px padding and 32px control center
          themselves in the 56px rail and the control rides the right edge while
          the width animates. */}
      <header className="flex h-[var(--workspace-strip-height,36px)] shrink-0 items-center justify-end gap-2 border-b border-foundation-line px-3">
        {onToggleCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls="workspace-sidebar"
            className="grid size-8 shrink-0 place-items-center rounded-fd-sm text-foundation-ink-tertiary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden="true" />
            )}
          </button>
        ) : null}

        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation"
            className="grid size-8 shrink-0 place-items-center rounded-fd-sm text-foundation-ink-tertiary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3">
        <nav aria-label="Workspace navigation">
          {collapsed ? null : (
            <p className="px-2 pb-2 font-mono text-[11px] font-medium uppercase leading-4 tracking-[0.06em] text-foundation-ink-tertiary">
              Workspace
            </p>
          )}

          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                onNavigate={onNavigate}
                collapsed={collapsed}
              />
            ))}
          </ul>

          {/* The project tree needs text, so the rail keeps only the nav icons. */}
          {collapsed ? null : (
            <SidebarProjects workspaceId={workspaceId} onNavigate={onNavigate} />
          )}
        </nav>
      </div>

      <footer
        className={cn(
          "flex shrink-0 border-t border-foundation-line px-3 py-2",
          collapsed
            ? "flex-col items-center gap-1"
            : "items-center justify-between gap-2",
        )}
      >
        {collapsed ? null : isLoading ? (
          <span
            aria-hidden="true"
            className="h-6 w-12 animate-pulse rounded-fd-xs bg-foundation-sunken"
          />
        ) : (
          <span
            title={`${planLabel} plan`}
            className="inline-flex h-6 items-center rounded-fd-xs border border-foundation-line bg-foundation-surface px-1.5 font-mono text-[11px] font-medium uppercase leading-4 tracking-[0.04em] text-foundation-ink-tertiary"
          >
            {planLabel}
          </span>
        )}

        <div
          className={cn(
            "flex items-center",
            collapsed ? "flex-col gap-1" : "gap-0.5",
          )}
        >
          <a
            href={helpUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Help"
            className="grid size-7 place-items-center rounded-fd-sm text-foundation-ink-tertiary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
          >
            <CircleHelp className="size-4" aria-hidden="true" />
          </a>
          <Link
            href={`${overviewHref}/settings`}
            onClick={onNavigate}
            aria-label="Settings"
            className="grid size-7 place-items-center rounded-fd-sm text-foundation-ink-tertiary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
          >
            <Settings className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </div>
  );
}

function WorkspaceMark({ initial }: { initial: string }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-7 shrink-0 place-items-center rounded-fd-xs bg-foundation-ink font-mono text-[11px] font-medium text-foundation-bg"
    >
      {initial}
    </span>
  );
}

function SidebarLink({
  item,
  onNavigate,
  collapsed = false,
}: {
  item: NavItem;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={item.isActive ? "page" : undefined}
        title={collapsed ? item.label : undefined}
        className={cn(
          "group flex h-8 items-center gap-2.5 rounded-fd-sm text-[13px] leading-5 tracking-[-0.006em] transition-colors duration-150 ease-fd focus-visible:foundation-focus",
          collapsed ? "justify-center px-0" : "px-2",
          item.isActive
            ? "bg-foundation-sunken font-medium text-foundation-ink"
            : "text-foundation-ink-secondary hover:bg-foundation-sunken/60 hover:text-foundation-ink",
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0 transition-colors duration-150 ease-fd",
            item.isActive
              ? "text-foundation-ink"
              : "text-foundation-ink-tertiary group-hover:text-foundation-ink-secondary",
          )}
          aria-hidden="true"
        />
        {/* Kept for the accessible name and the tooltip, hidden in the rail. */}
        <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>
      </Link>
    </li>
  );
}
