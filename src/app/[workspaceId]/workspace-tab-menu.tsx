"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { Globe, Plus, Search, Settings, Terminal, X } from "lucide-react";

import {
  AgentLogo,
  AGENTS,
  type AgentName,
} from "@/components/logos/agent-logo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type MenuEntry =
  | { id: string; kind: "new-terminal"; label: string }
  | { id: string; kind: "browser-preview"; label: string }
  | { id: string; kind: "agent"; label: string; agent: AgentName }
  | { id: string; kind: "settings"; label: string };

const NEW_TERMINAL: MenuEntry = {
  id: "new-terminal",
  kind: "new-terminal",
  label: "New terminal",
};
const BROWSER_PREVIEW: MenuEntry = {
  id: "browser-preview",
  kind: "browser-preview",
  label: "Browser preview",
};
const AGENT_ENTRIES: MenuEntry[] = AGENTS.map((agent) => ({
  id: `agent-${agent.name}`,
  kind: "agent",
  label: agent.label,
  agent: agent.name,
}));
const SETTINGS: MenuEntry = {
  id: "settings",
  kind: "settings",
  label: "Workspace settings",
};
// Shown as a hint only: the shortcut is registered once by the pane layout, not
// once per menu, so several panes cannot each add a tab on the same keypress.
const NEW_TERMINAL_SHORTCUT = "⌘T";

function filterEntries(query: string): MenuEntry[] {
  const normalized = query.trim().toLowerCase();
  const matches = (label: string) => label.toLowerCase().includes(normalized);

  const entries: MenuEntry[] = [];
  if (matches(NEW_TERMINAL.label)) entries.push(NEW_TERMINAL);
  if (matches(BROWSER_PREVIEW.label)) entries.push(BROWSER_PREVIEW);
  for (const entry of AGENT_ENTRIES) {
    if (matches(entry.label)) entries.push(entry);
  }
  if (matches(SETTINGS.label)) entries.push(SETTINGS);
  return entries;
}

function Keycap({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-[5px] border border-foundation-line bg-foundation-bg px-1.5 font-mono text-[10px] font-medium leading-none text-foundation-ink-secondary">
      {children}
    </kbd>
  );
}

/** Muted label with the matched slice picked out, so filtering reads at a glance. */
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  if (!needle) return <>{text}</>;
  const start = text.toLowerCase().indexOf(needle.toLowerCase());
  if (start === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, start)}
      <span className="font-medium text-foundation-ink">
        {text.slice(start, start + needle.length)}
      </span>
      {text.slice(start + needle.length)}
    </>
  );
}

function MenuRow({
  entry,
  query,
  active,
  optionId,
  onHover,
  onSelect,
}: {
  entry: MenuEntry;
  query: string;
  active: boolean;
  optionId: string;
  onHover: () => void;
  onSelect: () => void;
}) {
  return (
    <div
      id={optionId}
      role="option"
      aria-selected={active}
      onMouseMove={onHover}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      className={cn(
        "flex h-9 cursor-pointer items-center gap-2.5 rounded-fd-sm px-2.5 text-[13px] transition-colors duration-150 ease-fd",
        active
          ? "bg-foundation-sunken text-foundation-ink"
          : "text-foundation-ink-secondary",
      )}
    >
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center",
          active ? "text-foundation-ink" : "text-foundation-ink-tertiary",
        )}
      >
        {entry.kind === "agent" ? (
          <AgentLogo agent={entry.agent} className="size-3.5" />
        ) : entry.kind === "settings" ? (
          <Settings className="size-4" aria-hidden="true" />
        ) : entry.kind === "browser-preview" ? (
          <Globe className="size-4" aria-hidden="true" />
        ) : (
          <Terminal className="size-4" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate">
        <Highlight text={entry.label} query={query} />
      </span>
      {entry.kind === "new-terminal" ? (
        <span aria-hidden="true">
          <Keycap>{NEW_TERMINAL_SHORTCUT}</Keycap>
        </span>
      ) : null}
    </div>
  );
}

export function WorkspaceTabMenu({
  onCreateTab,
  onCreateAgent,
  onCreateBrowserPreview,
}: {
  onCreateTab: () => void;
  onCreateAgent: (agent: AgentName) => void;
  onCreateBrowserPreview?: () => void;
}) {
  const router = useRouter();
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const optionId = (id: string) => `${listId}-${id}`;

  const entries = useMemo(() => filterEntries(query), [query]);
  const clampedIndex = Math.min(activeIndex, Math.max(entries.length - 1, 0));
  const activeEntry = entries[clampedIndex];

  useEffect(() => {
    if (!open || !activeEntry) return;
    document
      .getElementById(`${listId}-${activeEntry.id}`)
      ?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeEntry, listId]);


  const select = (entry: MenuEntry | undefined) => {
    if (!entry) return;
    setOpen(false);
    if (entry.kind === "new-terminal") {
      onCreateTab();
    } else if (entry.kind === "browser-preview") {
      onCreateBrowserPreview?.();
    } else if (entry.kind === "agent") {
      onCreateAgent(entry.agent);
    } else if (workspaceId) {
      router.push(`/${workspaceId}/settings`);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery("");
      setActiveIndex(0);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (entries.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((clampedIndex + 1) % entries.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((clampedIndex - 1 + entries.length) % entries.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      select(activeEntry);
    }
  };

  const actionEntries = entries.filter(
    (entry) => entry.kind === "new-terminal" || entry.kind === "browser-preview",
  );
  const agentEntries = entries.filter((entry) => entry.kind === "agent");
  const settingsEntry = entries.find((entry) => entry.kind === "settings");
  const showAgentGroup = agentEntries.length > 0;

  const row = (entry: MenuEntry) => (
    <MenuRow
      key={entry.id}
      entry={entry}
      query={query}
      optionId={optionId(entry.id)}
      active={entry.id === activeEntry?.id}
      onHover={() => setActiveIndex(entries.indexOf(entry))}
      onSelect={() => select(entry)}
    />
  );

  const clearSearch = () => {
    setQuery("");
    setActiveIndex(0);
    inputRef.current?.focus();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="New tab"
          title="New tab"
          className="mx-1.5 grid size-7 shrink-0 cursor-pointer place-items-center rounded-fd-sm text-foundation-ink-secondary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-72 overflow-hidden rounded-fd-lg p-0 shadow-[0_16px_40px_-12px_rgba(9,9,11,0.24),0_4px_12px_-4px_rgba(9,9,11,0.12)]"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <div className="flex h-11 items-center gap-2.5 border-b border-foundation-line px-4">
          <Search
            className="size-4 shrink-0 text-foundation-ink-tertiary"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-label="Search actions"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeEntry ? optionId(activeEntry.id) : undefined
            }
            placeholder="Search actions"
            autoComplete="off"
            spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-foundation-ink outline-none placeholder:text-foundation-ink-secondary focus-visible:outline-none"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onMouseDown={(event) => event.preventDefault()}
              onClick={clearSearch}
              className="grid size-5 shrink-0 cursor-pointer place-items-center rounded-[5px] text-foundation-ink-tertiary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : (
            <span aria-hidden="true">
              <Keycap>esc</Keycap>
            </span>
          )}
        </div>

        <div
          id={listId}
          role="listbox"
          aria-label="Actions"
          className="flex max-h-[360px] flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
            {entries.length === 0 ? (
              <p
                role="presentation"
                className="px-3 py-8 text-center text-[13px] text-foundation-ink-secondary"
              >
                No actions match “{query.trim()}”.
              </p>
            ) : (
              <>
                {actionEntries.length > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    {actionEntries.map(row)}
                  </div>
                ) : null}
                {showAgentGroup ? (
                  <>
                    {actionEntries.length > 0 ? (
                      <div
                        aria-hidden="true"
                        className="mx-1.5 my-1.5 h-px bg-foundation-line"
                      />
                    ) : null}
                    <p
                      role="presentation"
                      className="px-2.5 pb-1 pt-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-foundation-ink-secondary"
                    >
                      Agents
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {agentEntries.map(row)}
                    </div>
                  </>
                ) : null}
              </>
            )}
          </div>

          {settingsEntry ? (
            <div className="border-t border-foundation-line p-1.5">
              {row(settingsEntry)}
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
