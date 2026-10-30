"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import {
  COMPONENT_INDEX,
  FOUNDATION_SECTIONS,
  FOUNDATION_TOKENS,
} from "./sections";

interface CommandMenuContextValue {
  open: () => void;
}

const CommandMenuContext = createContext<CommandMenuContextValue | null>(null);

export function CommandMenuProvider({
  value,
  children,
}: {
  value: CommandMenuContextValue;
  children: React.ReactNode;
}) {
  return (
    <CommandMenuContext.Provider value={value}>
      {children}
    </CommandMenuContext.Provider>
  );
}

export function useCommandMenu(): CommandMenuContextValue {
  const context = useContext(CommandMenuContext);
  if (!context) {
    throw new Error("useCommandMenu must be used inside CommandMenuProvider.");
  }
  return context;
}

type CommandGroup = "Sections" | "Tokens" | "Components";

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  group: CommandGroup;
  target: string;
  keywords: string;
}

const COMMAND_GROUPS: CommandGroup[] = ["Sections", "Tokens", "Components"];

const COMMAND_INDEX: CommandItem[] = [
  ...FOUNDATION_SECTIONS.map((section) => ({
    id: `section-${section.id}`,
    label: section.label,
    hint: section.hint,
    group: "Sections" as const,
    target: section.id,
    keywords: `${section.group} ${section.id}`,
  })),
  ...FOUNDATION_TOKENS.map((token) => ({
    id: `token-${token.cssVar.replace(/[^a-z0-9-]/gi, "-")}`,
    label: token.cssVar,
    hint: token.utility,
    group: "Tokens" as const,
    target: "color",
    keywords: `${token.group} ${token.use} ${token.utility}`,
  })),
  ...COMPONENT_INDEX.map((component) => ({
    id: `component-${component.label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    label: component.label,
    hint: component.hint,
    group: "Components" as const,
    target: component.target,
    keywords: component.keywords,
  })),
];

const LIST_ID = "foundation-command-results";

export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return COMMAND_INDEX;
    return COMMAND_INDEX.filter((item) =>
      `${item.label} ${item.hint} ${item.keywords}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setQuery("");
        setActive(0);
      }
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    matches.forEach((item, index) => map.set(item.id, index));
    return map;
  }, [matches]);

  useEffect(() => {
    if (!open) return;
    const activeItem = matches[active];
    if (!activeItem) return;
    document
      .getElementById(`${LIST_ID}-${activeItem.id}`)
      ?.scrollIntoView?.({ block: "nearest" });
  }, [active, matches, open]);

  const select = useCallback(
    (item: CommandItem | undefined) => {
      if (!item) return;
      handleOpenChange(false);
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.setTimeout(() => {
        document
          .getElementById(item.target)
          ?.scrollIntoView?.({ behavior: reduced ? "auto" : "smooth", block: "start" });
      }, 40);
    },
    [handleOpenChange],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (matches.length ? (current + 1) % matches.length : 0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) =>
        matches.length ? (current - 1 + matches.length) % matches.length : 0,
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      select(matches[active]);
    }
  };

  const activeItem = matches[active];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[560px] gap-0 overflow-hidden p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById("foundation-command-input")?.focus();
        }}
      >
        <DialogTitle className="sr-only">Search Foundation</DialogTitle>
        <DialogDescription className="sr-only">
          Search sections, tokens and components, then press Enter to jump to a result.
        </DialogDescription>

        <div className="flex items-center gap-2.5 border-b border-foundation-line px-4">
          <Search className="size-4 shrink-0 text-foundation-ink-tertiary" aria-hidden="true" />
          <input
            id="foundation-command-input"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls={LIST_ID}
            aria-autocomplete="list"
            aria-activedescendant={
              activeItem ? `${LIST_ID}-${activeItem.id}` : undefined
            }
            placeholder="Search sections, tokens and components"
            autoComplete="off"
            spellCheck={false}
            className="h-12 w-full bg-transparent text-sm text-foundation-ink outline-none placeholder:text-foundation-ink-tertiary focus-visible:outline-none"
          />
        </div>

        <div
          id={LIST_ID}
          role="listbox"
          aria-label="Search results"
          className="max-h-[320px] overflow-y-auto p-2"
        >
          {matches.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-foundation-ink-secondary">
              No matches. Try color, grid or button.
            </p>
          ) : (
            COMMAND_GROUPS.map((group) => {
              const groupItems = matches.filter((item) => item.group === group);
              if (groupItems.length === 0) return null;

              return (
                <div key={group} className="pb-1">
                  <p
                    role="presentation"
                    className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-foundation-ink-tertiary"
                  >
                    {group}
                  </p>
                  {groupItems.map((item) => {
                    const itemIndex = indexById.get(item.id) ?? 0;
                    const isActive = itemIndex === active;
                    return (
                      <div
                        key={item.id}
                        id={`${LIST_ID}-${item.id}`}
                        role="option"
                        aria-selected={isActive}
                        onMouseMove={() => setActive(itemIndex)}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => select(item)}
                        className={cn(
                          "flex h-8 cursor-pointer items-center gap-3 rounded-fd-sm px-2 text-[13px]",
                          isActive
                            ? "bg-foundation-sunken text-foundation-ink"
                            : "text-foundation-ink-secondary",
                        )}
                      >
                        <span className="truncate font-mono text-[12px]">
                          {item.label}
                        </span>
                        <span className="ml-auto truncate text-[11px] text-foundation-ink-tertiary">
                          {item.hint}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-foundation-line px-3 py-2 text-[11px] text-foundation-ink-tertiary">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            move
          </span>
          <span className="flex items-center gap-1">
            <Kbd>↵</Kbd>
            open
          </span>
          <span className="flex items-center gap-1">
            <Kbd>esc</Kbd>
            close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-fd-xs border border-foundation-line bg-foundation-sunken px-1 py-0.5 font-mono text-[10px] leading-none text-foundation-ink-secondary">
      {children}
    </kbd>
  );
}
