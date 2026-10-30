"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { Check, ChevronDown, Loader2, Lock, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRepositoriesQuery } from "@/features/integrations/hooks/use-repositories";
import type { Repository } from "@/features/integrations/types";
import { cn } from "@/lib/utils";

function optionId(listId: string, repository: Repository) {
  return `${listId}-${repository.fullName.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

/**
 * Repository picker for the new-project dialog. Lists the repositories the
 * workspace's GitHub connection can reach, with filtering for accounts that
 * have many of them.
 */
export function RepositoryPicker({
  id,
  workspaceId,
  value,
  onChange,
  disabled = false,
}: {
  id?: string;
  workspaceId: string;
  value: string;
  onChange: (repository: Repository) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const { data, isPending, isError, isFetching, isSignedIn, refetch } =
    useRepositoriesQuery("GITHUB", workspaceId);

  const repositories = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return repositories;
    return repositories.filter((repository) =>
      repository.fullName.toLowerCase().includes(needle),
    );
  }, [query, repositories]);

  const clampedIndex = Math.min(activeIndex, Math.max(filtered.length - 1, 0));
  const active = filtered[clampedIndex];

  useEffect(() => {
    if (!open || !active) return;
    document
      .getElementById(optionId(listId, active))
      ?.scrollIntoView?.({ block: "nearest" });
  }, [open, active, listId]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      const selected = repositories.findIndex(
        (repository) => repository.fullName === value,
      );
      setActiveIndex(selected >= 0 ? selected : 0);
      return;
    }
    setQuery("");
    setActiveIndex(0);
  };

  const select = (repository: Repository | undefined) => {
    if (!repository) return;
    onChange(repository);
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (filtered.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((clampedIndex + 1) % filtered.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((clampedIndex - 1 + filtered.length) % filtered.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(filtered.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      select(active);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          aria-label={
            value ? `Repository: ${value}` : "Select a repository"
          }
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled}
          className={cn(
            "flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-fd-md border border-foundation-line-strong bg-foundation-surface px-3 text-sm transition-colors duration-150 ease-fd hover:border-foundation-ink-secondary focus-visible:border-foundation-ink focus-visible:foundation-focus disabled:pointer-events-none disabled:border-foundation-line disabled:bg-foundation-sunken disabled:text-foundation-ink-disabled",
            value ? "text-foundation-ink" : "text-foundation-ink-tertiary",
          )}
        >
          <span className="truncate">{value || "Select a repository"}</span>
          <ChevronDown
            className="size-3.5 shrink-0 text-foundation-ink-tertiary"
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[240px] overflow-hidden p-0"
        align="start"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <div className="flex h-9 items-center gap-2 border-b border-foundation-line px-3">
          <Search
            className="size-3.5 shrink-0 text-foundation-ink-tertiary"
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
            aria-label="Search repositories"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active ? optionId(listId, active) : undefined}
            placeholder="Search repositories"
            autoComplete="off"
            spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-foundation-ink outline-none placeholder:text-foundation-ink-tertiary"
          />
          {isFetching && !isPending ? (
            <>
              <Loader2
                className="size-3.5 shrink-0 animate-spin text-foundation-ink-tertiary"
                aria-hidden="true"
              />
              <span className="sr-only">Refreshing repositories</span>
            </>
          ) : null}
        </div>

        <div
          id={listId}
          role="listbox"
          aria-label="Repositories"
          className="max-h-[280px] overflow-y-auto p-1"
        >
          {!isSignedIn ? (
            <div role="presentation" className="px-2 py-4 text-center">
              <p className="text-[13px] leading-5 text-foundation-ink-secondary">
                Sign in to browse repositories.
              </p>
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex h-6 items-center rounded-fd-sm px-2 text-xs font-medium text-foundation-ink-secondary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
              >
                Sign in
              </Link>
            </div>
          ) : isPending ? (
            <div
              role="status"
              className="flex items-center justify-center gap-2 px-3 py-8 text-[13px] text-foundation-ink-secondary"
            >
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Loading repositories…
            </div>
          ) : isError ? (
            <div role="alert" className="px-2 py-4 text-center">
              <p className="text-[13px] leading-5 text-foundation-ink-secondary">
                Couldn&apos;t load repositories from GitHub.
              </p>
              <div className="mt-2 flex items-center justify-center gap-1">
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
                <Link
                  href={`/${workspaceId}/settings/integrations`}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-6 items-center rounded-fd-sm px-2 text-xs font-medium text-foundation-ink-secondary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
                >
                  GitHub settings
                </Link>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div role="presentation" className="px-2 py-4 text-center">
              <p className="text-[13px] leading-5 text-foundation-ink-secondary">
                {repositories.length === 0
                  ? "No repositories available."
                  : `No repositories match “${query.trim()}”.`}
              </p>
              <Link
                href={`/${workspaceId}/settings/integrations`}
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex h-6 items-center rounded-fd-sm px-2 text-xs font-medium text-foundation-ink-secondary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
              >
                Manage GitHub connection
              </Link>
            </div>
          ) : (
            filtered.map((repository, index) => {
              const isSelected = repository.fullName === value;
              return (
                <div
                  key={repository.fullName}
                  id={optionId(listId, repository)}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`${repository.fullName}${
                    repository.isPrivate ? ", private" : ""
                  }`}
                  onMouseMove={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => select(repository)}
                  className={cn(
                    "flex h-8 cursor-pointer items-center gap-2 rounded-fd-sm px-2 text-[13px] transition-colors duration-150 ease-fd",
                    index === clampedIndex
                      ? "bg-foundation-sunken text-foundation-ink"
                      : "text-foundation-ink-secondary",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {repository.fullName}
                  </span>
                  {repository.isPrivate ? (
                    <Lock
                      className="size-3 shrink-0 text-foundation-ink-tertiary"
                      aria-hidden="true"
                    />
                  ) : null}
                  {isSelected ? (
                    <Check
                      className="size-3.5 shrink-0 text-foundation-ink"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
