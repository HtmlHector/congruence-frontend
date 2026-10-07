"use client";

import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  Zap,
  CheckSquare,
  GitPullRequest,
  FileText,
  Key,
  Layers,
  Sparkles,
  Terminal,
  ArrowRight,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPaletteModal({ open, onOpenChange }: CommandPaletteProps) {
  const { setMode, setIsIntegrationsOpen, executeTerminalCommand, lanes, switchLane } = useWorkspace();
  const [query, setQuery] = useState("");

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

  const items = [
    {
      category: "Navigation",
      id: "nav-deck",
      label: "Open Workspaces & Terminal Deck",
      icon: Layers,
      action: () => {
        setMode("deck");
        onOpenChange(false);
      },
    },
    {
      category: "Navigation",
      id: "nav-hub",
      label: "Open Prompt Hub & Agent Dispatcher",
      icon: SlidersHorizontal,
      action: () => {
        setMode("hub");
        onOpenChange(false);
      },
    },
    {
      category: "Navigation",
      id: "nav-automations",
      label: "Automations & Scheduled Agent Jobs",
      icon: Zap,
      action: () => {
        setMode("automations");
        onOpenChange(false);
      },
    },
    {
      category: "Navigation",
      id: "nav-tasks",
      label: "Task Backlog & Agent Kanban Board",
      icon: CheckSquare,
      action: () => {
        setMode("tasks");
        onOpenChange(false);
      },
    },
    {
      category: "Navigation",
      id: "nav-prs",
      label: "Pull Requests & Diffs",
      icon: GitPullRequest,
      action: () => {
        setMode("pull-requests");
        onOpenChange(false);
      },
    },
    {
      category: "Navigation",
      id: "nav-pages",
      label: "Project Docs & Engineering Pages",
      icon: FileText,
      action: () => {
        setMode("pages");
        onOpenChange(false);
      },
    },
    {
      category: "Integrations & Vault",
      id: "int-vault",
      label: "Manage API Keys & Anthropic Device OAuth",
      icon: Key,
      action: () => {
        setIsIntegrationsOpen(true);
        onOpenChange(false);
      },
    },
    {
      category: "Agent Actions",
      id: "act-claude-auth",
      label: "Run 'claude auth login' in Active Terminal",
      icon: Terminal,
      action: () => {
        setMode("deck");
        executeTerminalCommand("claude auth login");
        onOpenChange(false);
      },
    },
    {
      category: "Agent Actions",
      id: "act-git-status",
      label: "Run 'git status' across Worktrees",
      icon: Terminal,
      action: () => {
        setMode("deck");
        executeTerminalCommand("git status");
        onOpenChange(false);
      },
    },
  ];

  // Dynamic lane items
  const laneItems = (lanes || []).map((lane) => ({
    category: "Lanes",
    id: `lane-${lane.id}`,
    label: `Switch to Worktree: ${lane.name} (${lane.branch})`,
    icon: Sparkles,
    action: () => {
      switchLane(lane.id);
      setMode("deck");
      onOpenChange(false);
    },
  }));

  const allItems = [...items, ...laneItems];
  const filtered = allItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 rounded-xl border border-[var(--border-strong)] bg-[#0d0e12] p-0 shadow-2xl focus:outline-none overflow-hidden animate-in zoom-in-95">
          {/* Search Header */}
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3 bg-[var(--surface-primary)]">
            <Search className="size-4 text-[var(--muted-foreground)] shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search views, lanes, tasks, or run commands (e.g. 'claude', 'prs', 'tasks')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--subtle-foreground)] focus:outline-none"
            />
            <button
              onClick={() => onOpenChange(false)}
              className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* List Items */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1 scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--subtle-foreground)]">
                No commands or resources matching &ldquo;{query}&rdquo;
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs text-[var(--foreground)] hover:bg-[var(--surface-secondary)] hover:text-white transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--surface-tertiary)] border border-[var(--border)] text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] group-hover:border-[var(--border-strong)]">
                        <Icon className="size-3.5" />
                      </div>
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-[10px] text-[var(--subtle-foreground)]">{item.category}</div>
                      </div>
                    </div>
                    <ArrowRight className="size-3 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-[var(--border)]/60 bg-[var(--surface-sidebar)] px-4 py-2 text-[10px] text-[var(--subtle-foreground)] font-mono">
            <span>Use ↑↓ to navigate</span>
            <span>ESC to close</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
