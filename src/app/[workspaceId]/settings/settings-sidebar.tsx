"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Blocks,
  CreditCard,
  Database,
  Menu,
  Palette,
  Plug,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

import { ThemeControl } from "@/components/foundation/theme-control";
import { useWorkspaceQuery } from "@/features/workspace/hooks/use-workspace-query";
import { cn } from "@/lib/utils";

type SettingsTab = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

// The first group needs no heading: the sidebar header already says which
// workspace these settings belong to.
const SETTINGS_GROUPS: Array<{ label?: string; tabs: SettingsTab[] }> = [
  {
    tabs: [
      { href: "", label: "General", icon: SlidersHorizontal, exact: true },
      { href: "/integrations", label: "Integrations", icon: Blocks },
      { href: "/mcp", label: "MCP", icon: Plug },
      { href: "/storage", label: "Storage", icon: Database },
      { href: "/billing", label: "Billing", icon: CreditCard },
    ],
  },
  {
    label: "Account",
    tabs: [
      { href: "/profile", label: "Profile", icon: UserRound },
      { href: "/appearance", label: "Appearance", icon: Palette },
    ],
  },
];

function isPathActive(pathname: string | null, href: string, exact = false) {
  if (!pathname) return false;
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function SettingsSidebar({ workspaceId }: { workspaceId: string }) {
  const pathname = usePathname();
  const { data: workspace } = useWorkspaceQuery(workspaceId);
  const [mobileOpen, setMobileOpen] = useState(false);

  const workspaceName = workspace?.name ?? "Workspace";

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

  return (
    <>
      <aside
        aria-label="Settings"
        className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-foundation-line bg-foundation-bg lg:flex"
      >
        <SettingsSidebarPanel
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          pathname={pathname}
        />
      </aside>

      <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-foundation-line bg-foundation-bg/95 px-3 backdrop-blur-sm lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open settings navigation"
          aria-expanded={mobileOpen}
          aria-controls="settings-navigation"
          className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-fd-sm text-foundation-ink-secondary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
        >
          <Menu className="size-4" aria-hidden="true" />
        </button>

        <Link
          href={`/${workspaceId}`}
          className="flex min-w-0 items-center gap-2 rounded-fd-sm focus-visible:foundation-focus"
        >
          <span
            aria-hidden="true"
            className="grid size-6 shrink-0 place-items-center rounded-fd-xs bg-foundation-ink font-mono text-[10px] font-semibold text-foundation-bg"
          >
            {workspaceName.trim().charAt(0).toUpperCase() || "W"}
          </span>
          <span className="truncate text-[13px] font-medium tracking-[-0.01em]">
            {workspaceName}
          </span>
          <span aria-hidden="true" className="shrink-0 text-foundation-ink-tertiary">
            /
          </span>
          <span className="shrink-0 text-[13px] text-foundation-ink-secondary">
            Settings
          </span>
        </Link>
      </header>

      {mobileOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close settings navigation"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <aside
            id="settings-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Settings navigation"
            className="fixed inset-y-0 left-0 z-50 flex w-[288px] flex-col border-r border-foundation-line bg-foundation-bg shadow-[0_24px_64px_rgba(0,0,0,0.28)]"
          >
            <SettingsSidebarPanel
              workspaceId={workspaceId}
              workspaceName={workspaceName}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}

export function SettingsSidebarPanel({
  workspaceId,
  workspaceName,
  pathname,
  onNavigate,
  onClose,
}: {
  workspaceId: string;
  workspaceName: string;
  pathname: string | null;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const settingsHref = `/${workspaceId}/settings`;
  const initial = workspaceName.trim().charAt(0).toUpperCase() || "W";
  const normalizedQuery = query.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!normalizedQuery) return SETTINGS_GROUPS;

    return SETTINGS_GROUPS.map((group) => ({
      ...group,
      tabs: group.tabs.filter((tab) =>
        tab.label.toLowerCase().includes(normalizedQuery),
      ),
    })).filter((group) => group.tabs.length > 0);
  }, [normalizedQuery]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== "/" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.isComposing
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, select, [contenteditable='true'], [role='dialog']",
        )
      ) {
        return;
      }

      const input = searchRef.current;
      if (!input || input.offsetParent === null) return;

      event.preventDefault();
      input.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const clearSearch = () => {
    setQuery("");
    searchRef.current?.focus();
  };

  const hasResults = groups.some((group) => group.tabs.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-[60px] shrink-0 items-center gap-2.5 border-b border-foundation-line px-3">
        <Link
          href={`/${workspaceId}`}
          onClick={onNavigate}
          aria-label="Workspace overview"
          className="grid size-8 shrink-0 place-items-center rounded-fd-md bg-foundation-ink font-mono text-[12px] font-semibold text-foundation-bg transition-opacity duration-150 ease-fd hover:opacity-90 focus-visible:foundation-focus"
        >
          {initial}
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] leading-4 font-semibold tracking-[-0.01em] text-foundation-ink">
            {workspaceName}
          </p>
          <p className="truncate text-[11px] leading-4 text-foundation-ink-tertiary">
            Workspace settings
          </p>
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings navigation"
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-fd-sm text-foundation-ink-tertiary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="shrink-0 px-2 pt-2.5 pb-1">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foundation-ink-tertiary"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                if (query) {
                  setQuery("");
                } else {
                  searchRef.current?.blur();
                }
              }
            }}
            placeholder="Search settings"
            aria-label="Search settings"
            aria-keyshortcuts="/"
            autoComplete="off"
            spellCheck={false}
            className="h-8 w-full rounded-fd-md border border-transparent bg-foundation-sunken/70 pr-12 pl-8 text-[12px] text-foundation-ink outline-none transition-colors duration-150 ease-fd placeholder:text-foundation-ink-tertiary hover:bg-foundation-sunken focus-visible:border-foundation-line focus-visible:bg-foundation-surface focus-visible:foundation-focus"
          />

          {query ? (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute top-1/2 right-1.5 grid size-5 -translate-y-1/2 cursor-pointer place-items-center rounded-fd-xs text-foundation-ink-tertiary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          ) : (
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-2 hidden h-5 min-w-5 -translate-y-1/2 place-items-center rounded-[4px] border border-foundation-line bg-foundation-surface px-1 font-mono text-[10px] leading-none text-foundation-ink-tertiary sm:grid"
            >
              /
            </kbd>
          )}
        </div>
      </div>

      <nav
        aria-label="Settings tabs"
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 pb-4"
      >
        {groups.map((group) => (
          <div key={group.label ?? "primary"} className="pt-3 first:pt-2">
            {group.label ? (
              <p className="px-2 pb-2 font-mono text-[11px] leading-4 font-medium tracking-[0.06em] text-foundation-ink-tertiary uppercase">
                {group.label}
              </p>
            ) : null}

            <ul className="space-y-0.5">
              {group.tabs.map((tab) => {
                const Icon = tab.icon;
                const href = `${settingsHref}${tab.href}`;
                const isActive = isPathActive(pathname, href, tab.exact);

                return (
                  <li key={tab.label}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group flex h-8 items-center gap-2.5 rounded-fd-sm px-2 text-[13px] leading-5 tracking-[-0.006em] transition-colors duration-150 ease-fd focus-visible:foundation-focus",
                        isActive
                          ? "bg-foundation-sunken font-medium text-foundation-ink"
                          : "text-foundation-ink-secondary hover:bg-foundation-sunken/60 hover:text-foundation-ink",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-colors duration-150 ease-fd",
                          isActive
                            ? "text-foundation-ink"
                            : "text-foundation-ink-tertiary group-hover:text-foundation-ink-secondary",
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{tab.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {!hasResults ? (
          <div className="px-3 pt-10 text-center">
            <p className="text-[12px] leading-[18px] text-foundation-ink-tertiary">
              No settings match{" "}
              <span className="text-foundation-ink-secondary">
                &ldquo;{query.trim()}&rdquo;
              </span>
              .
            </p>
            <button
              type="button"
              onClick={clearSearch}
              className="mt-2 cursor-pointer rounded-fd-xs px-1.5 py-1 text-[12px] font-medium text-foundation-ink underline-offset-4 hover:underline focus-visible:foundation-focus"
            >
              Clear search
            </button>
          </div>
        ) : null}
      </nav>

      <div className="shrink-0 border-t border-foundation-line p-2">
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <span className="text-[12px] leading-5 text-foundation-ink-secondary">
            Theme
          </span>
          <ThemeControl className="flex-row" />
        </div>

        <Link
          href={`/${workspaceId}`}
          onClick={onNavigate}
          className="mt-0.5 flex h-8 items-center gap-2.5 rounded-fd-sm px-2 text-[13px] font-medium text-foundation-ink-secondary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
          <span>Back to workspace</span>
        </Link>
      </div>
    </div>
  );
}
