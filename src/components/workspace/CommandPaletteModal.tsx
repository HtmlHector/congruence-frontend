"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  Zap,
  Sparkles,
  Terminal,
  ArrowRight,
  SlidersHorizontal,
  Layers,
  GitPullRequest,
  Key,
  FolderGit2,
  Play,
  FileCode,
  Eye,
  CornerDownLeft,
  Bot,
  Flame,
  Check,
} from "lucide-react";
import {
  ClaudeIcon,
  OpenAIIcon,
  AntigravityIcon,
} from "@/components/ui/brand-icons";
import { useWorkspace } from "@/context/WorkspaceContext";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CommandItem {
  id: string;
  category: "Navigation" | "Worktrees" | "Agent Actions" | "Developer Tools" | "Integrations";
  label: string;
  badge?: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  shortcut?: string;
  metadata?: { label: string; value: string }[];
  action: () => void;
}

export function CommandPaletteModal({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const {
    currentTenant,
    projectId,
    setMode,
    setIsIntegrationsOpen,
    setIsSettingsOpen,
    executeTerminalCommand,
    toggleDevServer,
    lanes,
    switchLane,
    activeLane,
    chats,
    createChatInGroup,
  } = useWorkspace();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Reset query and selected index on modal open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Build command catalogue
  const allItems: CommandItem[] = useMemo(() => {
    const baseItems: CommandItem[] = [
      // Navigation
      {
        id: "nav-deck",
        category: "Navigation",
        label: "Mission Control",
        badge: "View",
        description: "Open the multi-pane developer execution deck, worktree split views, and active agent terminals.",
        icon: Layers,
        iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        shortcut: "⌘1",
        metadata: [
          { label: "Type", value: "Primary Canvas" },
          { label: "Active Panes", value: "Chat · Terminal · Preview" },
        ],
        action: () => {
          setMode("deck");
          onOpenChange(false);
        },
      },
      {
        id: "nav-hub",
        category: "Navigation",
        label: "Prompt Hub & Dispatcher",
        badge: "View",
        description: "Broadcast parallel prompts across Claude, Codex, and Antigravity coding agents simultaneously.",
        icon: Sparkles,
        iconBg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        shortcut: "⌘2",
        metadata: [
          { label: "Type", value: "Multi-Agent Matrix" },
          { label: "Status", value: "Ready" },
        ],
        action: () => {
          setMode("hub");
          onOpenChange(false);
        },
      },
      {
        id: "nav-prs",
        category: "Navigation",
        label: "Pull Requests & Reviews",
        badge: "GitHub",
        description: "Inspect branch worktrees, compare staging diffs, and publish pull requests to GitHub.",
        icon: GitPullRequest,
        iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        shortcut: "⌘3",
        metadata: [
          { label: "Sync", value: "GitHub Origin" },
          { label: "Reviewers", value: "Automated" },
        ],
        action: () => {
          setMode("pull-requests");
          onOpenChange(false);
        },
      },
      {
        id: "nav-settings",
        category: "Navigation",
        label: "Workspace Settings",
        badge: "Config",
        description: "Manage team tenancy, billing tiers, default model temperatures, and repository connections.",
        icon: SlidersHorizontal,
        iconBg: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
        shortcut: "⌘,",
        metadata: [
          { label: "Scope", value: currentTenant?.name || "Personal" },
          { label: "Plan", value: currentTenant?.plan || "PRO" },
        ],
        action: () => {
          const wsId = currentTenant?.id || projectId;
          router.push(wsId ? `/${wsId}/settings` : "/settings");
          onOpenChange(false);
        },
      },

      // Agent Actions
      {
        id: "act-claude",
        category: "Agent Actions",
        label: "Spawn Claude Code Agent",
        badge: "Anthropic",
        description: "Launch an autonomous Claude 3.7 Sonnet agent with CLI file-editing and terminal tools in this worktree.",
        icon: ClaudeIcon,
        iconBg: "bg-orange-500/10 text-[var(--accent-claude)] border-orange-500/20",
        shortcut: "↵",
        metadata: [
          { label: "Model", value: "Claude 3.7 Sonnet" },
          { label: "Capabilities", value: "Tool Calling · Worktree Edits" },
        ],
        action: () => {
          if (activeLane) {
            createChatInGroup("primary", "Claude");
          }
          setMode("deck");
          onOpenChange(false);
        },
      },
      {
        id: "act-codex",
        category: "Agent Actions",
        label: "Spawn OpenAI Codex Agent",
        badge: "OpenAI",
        description: "Initialize an OpenAI Codex reasoning lane for deep architectural refactoring and code generation.",
        icon: OpenAIIcon,
        iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        shortcut: "↵",
        metadata: [
          { label: "Model", value: "GPT-4.5 / o3-mini" },
          { label: "Capabilities", value: "Refactoring · Reasoning" },
        ],
        action: () => {
          if (activeLane) {
            createChatInGroup("primary", "Codex");
          }
          setMode("deck");
          onOpenChange(false);
        },
      },
      {
        id: "act-antigravity",
        category: "Agent Actions",
        label: "Spawn Antigravity Agent",
        badge: "DeepMind",
        description: "Activate Google DeepMind Antigravity agent with multimodal context and agentic skills.",
        icon: AntigravityIcon,
        iconBg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        shortcut: "↵",
        metadata: [
          { label: "Model", value: "Gemini 2.5 Flash / Pro" },
          { label: "Capabilities", value: "Subagents · Vision · Skills" },
        ],
        action: () => {
          if (activeLane) {
            createChatInGroup("primary", "Antigravity");
          }
          setMode("deck");
          onOpenChange(false);
        },
      },

      // Developer Tools
      {
        id: "tool-dev",
        category: "Developer Tools",
        label: "Toggle Dev Server (pnpm dev)",
        badge: "Process",
        description: "Start or terminate the local Next.js preview development server running on port 3000.",
        icon: Play,
        iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        shortcut: "⌥R",
        metadata: [
          { label: "Port", value: "localhost:3000" },
          { label: "Command", value: "pnpm dev" },
        ],
        action: () => {
          toggleDevServer();
          onOpenChange(false);
        },
      },
      {
        id: "tool-git-status",
        category: "Developer Tools",
        label: "Run 'git status' in Terminal",
        badge: "Git",
        description: "Query worktree modified files, staged changes, and branch tracking status in the active PTY.",
        icon: Terminal,
        iconBg: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
        shortcut: "↵",
        metadata: [
          { label: "Target", value: activeLane?.branch || "main" },
          { label: "Command", value: "git status -sb" },
        ],
        action: () => {
          setMode("deck");
          executeTerminalCommand("git status -sb");
          onOpenChange(false);
        },
      },

      // Integrations
      {
        id: "int-vault",
        category: "Integrations",
        label: "API Keys & Provider OAuth Vault",
        badge: "Vault",
        description: "Securely store Anthropic, OpenAI, GitHub, and DeepMind credentials with zero-knowledge encryption.",
        icon: Key,
        iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        shortcut: "⌘I",
        metadata: [
          { label: "Encryption", value: "AES-GCM-256" },
          { label: "Sync", value: "Hardware Host PTY" },
        ],
        action: () => {
          setIsIntegrationsOpen(true);
          onOpenChange(false);
        },
      },
    ];

    // Dynamic Lane / Worktree Items
    const laneItems: CommandItem[] = (lanes || []).map((lane) => ({
      id: `lane-${lane.id}`,
      category: "Worktrees",
      label: `Switch to ${lane.name}`,
      badge: lane.branch,
      description: `Switch active workspace focus to isolated worktree on branch '${lane.branch}'.`,
      icon: FolderGit2,
      iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      shortcut: "↵",
      metadata: [
        { label: "Branch", value: lane.branch },
        { label: "Role", value: lane.is_pair_lane ? "Pair Trunk" : "Feature Lane" },
      ],
      action: () => {
        switchLane(lane.id);
        setMode("deck");
        onOpenChange(false);
      },
    }));

    return [...baseItems, ...laneItems];
  }, [currentTenant, projectId, activeLane, lanes, router, setMode, setIsIntegrationsOpen, executeTerminalCommand, toggleDevServer, switchLane, createChatInGroup, onOpenChange]);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
    );
  }, [allItems, query]);

  // Ensure selectedIndex is always valid
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(Math.max(0, filteredItems.length - 1));
    }
  }, [filteredItems.length, selectedIndex]);

  // Group filtered items by category
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: CommandItem[] } = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const activeItem = filteredItems[selectedIndex] || filteredItems[0];

  // Handle keyboard arrow navigation & enter execution
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeItem) {
        activeItem.action();
      }
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150" />
        <Dialog.Content
          onKeyDown={handleKeyDown}
          className="fixed left-1/2 top-[18%] z-50 w-full max-w-2xl -translate-x-1/2 overflow-hidden rounded-[8px] border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#0E0E12] shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-150 font-sans"
        >
          {/* Main 2-Column Split: Command List (1fr) + Live Preview Pane (260px) */}
          <div className="grid h-[420px] w-full grid-cols-1 overflow-hidden sm:grid-cols-[1fr_260px]">
            {/* Left Column: Search Input & Grouped Command Items */}
            <div className="flex h-full flex-col overflow-hidden bg-transparent">
              {/* Search Bar Input */}
              <div className="flex h-12 shrink-0 items-center gap-2.5 border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 bg-transparent">
                <Search className="size-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search commands, lanes, or actions…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSelectedIndex(0);
                    }}
                    className="text-[10px] font-mono text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Scrollable Command List */}
              <div
                ref={listRef}
                className="flex-1 overflow-y-auto p-1.5 scrollbar-thin divide-y-0"
              >
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-zinc-400">
                    <Search className="size-6 text-zinc-300 dark:text-zinc-700 mb-2 stroke-[1.5]" />
                    <p>No results found for &ldquo;{query}&rdquo;</p>
                  </div>
                ) : (
                  Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category} className="mb-2 last:mb-0">
                      <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 select-none">
                        {category}
                      </div>
                      <div className="space-y-0.5">
                        {items.map((item) => {
                          const itemGlobalIdx = filteredItems.indexOf(item);
                          const isSelected = itemGlobalIdx === selectedIndex;
                          const Icon = item.icon;

                          return (
                            <div
                              key={item.id}
                              onClick={item.action}
                              onMouseEnter={() => setSelectedIndex(itemGlobalIdx)}
                              className={`group flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-[5px] text-xs transition-colors cursor-pointer select-none ${
                                isSelected
                                  ? "bg-zinc-100 dark:bg-zinc-800/90 text-zinc-950 dark:text-white font-medium"
                                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`flex size-6 shrink-0 items-center justify-center rounded-[4px] border ${
                                    item.iconBg ||
                                    "bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400"
                                  }`}
                                >
                                  <Icon className="size-3.5" />
                                </div>
                                <span className="truncate text-xs">{item.label}</span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {item.shortcut && (
                                  <kbd
                                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-[3.5px] border leading-none ${
                                      isSelected
                                        ? "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                                        : "bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                                    }`}
                                  >
                                    {item.shortcut}
                                  </kbd>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Keyboard Hint Footer */}
              <div className="flex h-8 shrink-0 items-center justify-between border-t border-zinc-200/80 dark:border-zinc-800/80 px-3 bg-zinc-50/50 dark:bg-[#0B0B0E] text-[10px] font-mono text-zinc-400 select-none">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.2 rounded-[2px] bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.2 rounded-[2px] bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">↵</kbd>
                    select
                  </span>
                </div>
                <span>ESC to close</span>
              </div>
            </div>

            {/* Right Column: 7Ovr-Style Preview Pane */}
            <div className="hidden sm:flex flex-col border-l border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#090A0E] p-4 select-none">
              {activeItem ? (
                <>
                  {/* Large Icon Preview Avatar */}
                  <div
                    className={`flex size-11 items-center justify-center rounded-[8px] border shadow-2xs ${
                      activeItem.iconBg ||
                      "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {React.createElement(activeItem.icon, { className: "size-5" })}
                  </div>

                  {/* Title & Badge */}
                  <div className="mt-3.5 flex items-center gap-2 flex-wrap min-w-0">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {activeItem.label}
                    </h3>
                    {activeItem.badge && (
                      <span className="px-1.5 py-0.5 rounded-[3.5px] text-[9px] font-mono font-medium bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        {activeItem.badge}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-3">
                    {activeItem.description}
                  </p>

                  {/* Key-Value Metadata List */}
                  {activeItem.metadata && activeItem.metadata.length > 0 && (
                    <dl className="mt-4 flex flex-col gap-1.5 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-3 text-[11px]">
                      {activeItem.metadata.map((meta, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <dt className="text-zinc-400 dark:text-zinc-500">{meta.label}</dt>
                          <dd className="font-mono font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]">
                            {meta.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {/* Execute Button */}
                  <div className="mt-auto pt-3">
                    <button
                      type="button"
                      onClick={activeItem.action}
                      className="flex w-full items-center justify-center gap-1.5 py-1.5 px-3 rounded-[5px] bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                    >
                      <span>Execute</span>
                      <CornerDownLeft className="size-3 stroke-[2.5]" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center text-xs text-zinc-400">
                  <p>Select a command to preview</p>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
