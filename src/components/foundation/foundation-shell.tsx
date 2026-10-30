"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Blocks,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Code,
  Command,
  Layers,
  LayoutGrid,
  MousePointerClick,
  Palette,
  PanelsTopLeft,
  Search,
  Square,
  TextCursorInput,
  Timer,
  Type,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { CommandMenu, CommandMenuProvider } from "./command-menu";
import { ThemeControl } from "./theme-control";
import {
  FOUNDATION_SECTIONS,
  SECTION_GROUPS,
  sectionById,
  type SectionIcon,
} from "./sections";

const SIDEBAR_STORAGE_KEY = "foundation:sidebar";

const sidebarListeners = new Set<() => void>();

function notifySidebarListeners() {
  sidebarListeners.forEach((listener) => listener());
}

function subscribeSidebar(callback: () => void) {
  sidebarListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    sidebarListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSidebarSnapshot(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed";
  } catch {
    return false;
  }
}

function getServerSidebarSnapshot(): boolean {
  return false;
}

const SECTION_ICONS: Record<SectionIcon, LucideIcon> = {
  palette: Palette,
  type: Type,
  grid: LayoutGrid,
  layers: Layers,
  timer: Timer,
  pointer: MousePointerClick,
  field: TextCursorInput,
  square: Square,
  overlay: PanelsTopLeft,
  blocks: Blocks,
  code: Code,
  keyboard: Command,
};

export function FoundationShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getServerSidebarSnapshot,
  );
  const [activeId, setActiveId] = useState(FOUNDATION_SECTIONS[0].id);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    const next = !getSidebarSnapshot();
    try {
      window.localStorage.setItem(
        SIDEBAR_STORAGE_KEY,
        next ? "collapsed" : "expanded",
      );
    } catch {
      // Persistence is best effort.
    }
    notifySidebarListeners();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
        return;
      }

      if (
        event.key === "[" &&
        !isTyping &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebar]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const elements = FOUNDATION_SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-72px 0px -65% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const activeSection = sectionById(activeId);
  const commandContext = useMemo(() => ({ open: () => setPaletteOpen(true) }), []);

  return (
    <CommandMenuProvider value={commandContext}>
      <div className="min-h-svh bg-foundation-bg text-foundation-ink">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-fd-sm focus:bg-foundation-ink focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foundation-bg"
        >
          Skip to content
        </a>

        <div className="flex">
          <aside
            aria-label="Design system navigation"
            data-collapsed={collapsed}
            className={cn(
              "sticky top-0 z-20 flex h-svh shrink-0 flex-col border-r border-foundation-line bg-foundation-bg transition-[width] duration-200 ease-fd motion-reduce:transition-none",
              collapsed ? "w-14" : "w-14 lg:w-[260px]",
            )}
          >
            <Link
              href="/design-system"
              className="flex h-14 shrink-0 items-center gap-2.5 border-b border-foundation-line px-3 focus-visible:foundation-focus"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-fd-xs bg-foundation-ink font-mono text-[11px] font-medium text-foundation-bg">
                F
              </span>
              <span
                className={cn(
                  "min-w-0 flex-col leading-4",
                  collapsed ? "hidden" : "hidden lg:flex",
                )}
              >
                <span className="truncate text-[13px] font-semibold tracking-[-0.01em]">
                  Foundation
                </span>
                <span className="truncate text-[11px] font-normal text-foundation-ink-tertiary">
                  Design system
                </span>
              </span>
            </Link>

            <nav
              aria-label="Design system sections"
              className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2"
            >
              {SECTION_GROUPS.map((group, groupIndex) => {
                const groupSections = FOUNDATION_SECTIONS.filter(
                  (section) => section.group === group,
                );

                return (
                  <div
                    key={group}
                    className={cn(
                      groupIndex > 0 &&
                        "mt-3 border-t border-foundation-line/70 pt-3",
                    )}
                  >
                    <p
                      className={cn(
                        "px-2 pb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-foundation-ink-tertiary",
                        collapsed ? "hidden" : "hidden lg:block",
                      )}
                    >
                      {group}
                    </p>
                    <ul className="space-y-0.5">
                      {groupSections.map((section) => {
                        const Icon = SECTION_ICONS[section.icon];
                        const isActive = activeId === section.id;

                        return (
                          <li key={section.id}>
                            <a
                              href={`#${section.id}`}
                              aria-current={isActive ? "page" : undefined}
                              title={section.label}
                              onClick={() => setActiveId(section.id)}
                              className={cn(
                                "flex h-8 items-center gap-3 rounded-fd-sm text-[13px] font-medium transition-colors duration-150 ease-fd focus-visible:foundation-focus",
                                collapsed
                                  ? "justify-center px-0"
                                  : "justify-center px-0 lg:justify-start lg:px-2",
                                isActive
                                  ? "bg-foundation-sunken text-foundation-ink"
                                  : "text-foundation-ink-secondary hover:bg-foundation-sunken/60 hover:text-foundation-ink",
                              )}
                            >
                              <Icon
                                className="size-4 shrink-0"
                                aria-hidden="true"
                              />
                              <span
                                className={cn(
                                  "truncate",
                                  collapsed ? "hidden" : "hidden lg:block",
                                )}
                              >
                                {section.label}
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </nav>

            <div className="border-t border-foundation-line p-2">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                aria-label="Search Foundation"
                className={cn(
                  "flex h-8 w-full items-center gap-2 rounded-fd-md border border-foundation-line bg-foundation-surface px-2 text-[13px] text-foundation-ink-tertiary transition-colors duration-150 ease-fd hover:border-foundation-line-strong hover:text-foundation-ink focus-visible:foundation-focus",
                  collapsed ? "justify-center px-0" : "justify-center lg:justify-start",
                )}
              >
                <Search className="size-3.5 shrink-0" aria-hidden="true" />
                <span
                  className={cn(
                    "truncate",
                    collapsed ? "hidden" : "hidden lg:block",
                  )}
                >
                  Search Foundation
                </span>
                <kbd
                  className={cn(
                    "ml-auto rounded-fd-xs border border-foundation-line px-1 py-0.5 font-mono text-[10px] leading-none",
                    collapsed ? "hidden" : "hidden lg:block",
                  )}
                >
                  ⌘K
                </kbd>
              </button>

              <div
                className={cn(
                  "mt-2 flex items-center gap-1",
                  collapsed ? "flex-col" : "flex-col lg:flex-row lg:justify-between",
                )}
              >
                <ThemeControl />

                <div
                  className={cn(
                    "flex items-center gap-1",
                    collapsed ? "flex-col" : "flex-col lg:flex-row",
                  )}
                >
                  <Link
                    href="/"
                    aria-label="Back to app"
                    title="Back to app"
                    className="grid size-7 place-items-center rounded-fd-sm text-foundation-ink-tertiary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
                  >
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                  </Link>

                  <button
                    type="button"
                    onClick={toggleSidebar}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-pressed={collapsed}
                    className="hidden size-7 place-items-center rounded-fd-sm text-foundation-ink-tertiary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus lg:grid"
                  >
                    {collapsed ? (
                      <ChevronsRight className="size-3.5" aria-hidden="true" />
                    ) : (
                      <ChevronsLeft className="size-3.5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <header className="sticky top-0 z-10 flex h-14 items-center border-b border-foundation-line bg-foundation-bg px-4 sm:px-6 lg:px-10">
              <nav aria-label="Breadcrumb" className="min-w-0">
                <ol className="flex min-w-0 items-center gap-2 text-[13px]">
                  <li className="shrink-0">
                    <Link
                      href="/design-system"
                      className="rounded-fd-xs text-foundation-ink-secondary transition-colors hover:text-foundation-ink focus-visible:foundation-focus"
                    >
                      Foundation
                    </Link>
                  </li>
                  <li aria-hidden="true" className="shrink-0">
                    <ChevronRight className="size-3.5 text-foundation-ink-tertiary" />
                  </li>
                  <li className="hidden shrink-0 text-foundation-ink-secondary sm:block">
                    {activeSection.group}
                  </li>
                  <li
                    aria-hidden="true"
                    className="hidden shrink-0 sm:block"
                  >
                    <ChevronRight className="size-3.5 text-foundation-ink-tertiary" />
                  </li>
                  <li
                    aria-current="page"
                    className="min-w-0 truncate font-medium text-foundation-ink"
                  >
                    {activeSection.label}
                  </li>
                </ol>
              </nav>
            </header>

            <main
              id="content"
              className="px-4 pb-24 pt-10 sm:px-6 lg:px-10"
            >
              <div className="mx-auto w-full max-w-[880px]">{children}</div>
            </main>
          </div>
        </div>
      </div>

      <CommandMenu open={paletteOpen} onOpenChange={setPaletteOpen} />
    </CommandMenuProvider>
  );
}
