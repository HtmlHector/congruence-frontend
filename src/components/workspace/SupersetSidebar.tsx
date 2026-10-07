"use client";

import React, { useState } from "react";
import {
  Search,
  Layers,
  Zap,
  CheckSquare,
  GitPullRequest,
  FileText,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
  GitBranch,
  Circle,
  Loader2,
  Folder,
  SlidersHorizontal,
  Key,
  Lock,
  Github,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function SupersetSidebar() {
  const {
    lanes,
    activeLaneId,
    activeLane,
    switchLane,
    mode,
    setMode,
    setIsIntegrationsOpen,
    setIsSearchOpen,
    setIsCloneOpen,
    project,
    toggleTaskCompletion,
  } = useWorkspace();
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);

  const dynamicSessions = lanes.map((l) => ({
    id: l.id,
    title: l.name,
    diff: l.branch,
    state: l.status === "Ready" ? "live" : "loading"
  }));

  return (
    <aside className="flex h-full w-[232px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-sidebar)] text-[11px] select-none">
      {/* Top Sidebar Header & Navigation Controls */}
      <div className="flex h-11 items-center justify-between px-3 border-b border-[var(--border)]/40">
        <div className="flex items-center gap-2">
          <div className="flex h-4 w-4 flex-col justify-center gap-[2px] rounded-[2px] bg-[var(--surface-tertiary)] p-0.5 border border-[var(--border)]">
            <span className="h-[1.5px] w-full rounded-full bg-[var(--foreground)]" />
            <span className="h-[1.5px] w-3/4 rounded-full bg-[var(--muted-foreground)]" />
            <span className="h-[1.5px] w-full rounded-full bg-[var(--foreground)]" />
          </div>
          <span className="font-mono text-[11px] font-medium tracking-tight text-[var(--foreground)]">
            congruence
          </span>
        </div>
        <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
          <button
            type="button"
            onClick={() => setIsIntegrationsOpen(true)}
            title="Connected Integrations & Vault"
            className="p-1 hover:text-[var(--foreground)] transition-colors rounded"
          >
            <Key className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => setMode("hub")}
            title="Prompt Hub"
            className="p-1 hover:text-[var(--foreground)] transition-colors rounded"
          >
            <SlidersHorizontal className="size-3" />
          </button>
        </div>
      </div>

      {/* New Workspace & Clone Repo Action Buttons */}
      <div className="px-2 pt-2 pb-1 space-y-1">
        <button
          type="button"
          onClick={() => setMode("hub")}
          className="flex h-7 w-full items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] hover:border-[var(--border-strong)] transition-all font-medium text-[11px]"
        >
          <Plus className="size-3 text-[var(--muted-foreground)]" />
          <span>New Workspace</span>
        </button>
        <button
          type="button"
          onClick={() => setIsCloneOpen(true)}
          className="flex h-6.5 w-full items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)]/60 text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-all text-[10px]"
        >
          <Github className="size-3" />
          <span>Clone from GitHub</span>
        </button>
      </div>

      {/* Core Navigation Items */}
      <div className="space-y-0.5 px-1.5 py-1">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)] transition-colors"
        >
          <Search className="size-3.5" />
          <span>Search</span>
          <kbd className="ml-auto font-mono text-[9px] text-[var(--subtle-foreground)]">⌘K</kbd>
        </button>

        <button
          type="button"
          onClick={() => setMode("deck")}
          className={`flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 transition-colors ${
            mode === "deck"
              ? "text-[var(--foreground)] bg-[var(--wash)] font-medium"
              : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
          }`}
        >
          <Layers className={`size-3.5 ${mode === "deck" ? "text-[var(--accent-claude)]" : ""}`} />
          <span>Workspaces</span>
        </button>

        <button
          type="button"
          onClick={() => setIsIntegrationsOpen(true)}
          className="flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 text-[var(--accent-claude)] hover:bg-[var(--wash)] transition-colors font-medium"
        >
          <Key className="size-3.5 text-[var(--accent-claude)]" />
          <span>Integrations & Vault</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("automations")}
          className={`flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 transition-colors ${
            mode === "automations"
              ? "text-[var(--foreground)] bg-[var(--wash)] font-medium"
              : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
          }`}
        >
          <Zap className={`size-3.5 ${mode === "automations" ? "text-[var(--accent-claude)]" : ""}`} />
          <span>Automations</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("tasks")}
          className={`flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 transition-colors ${
            mode === "tasks"
              ? "text-[var(--foreground)] bg-[var(--wash)] font-medium"
              : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
          }`}
        >
          <CheckSquare className={`size-3.5 ${mode === "tasks" ? "text-[var(--accent-claude)]" : ""}`} />
          <span>Tasks</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("pull-requests")}
          className={`flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 transition-colors ${
            mode === "pull-requests"
              ? "text-[var(--foreground)] bg-[var(--wash)] font-medium"
              : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
          }`}
        >
          <GitPullRequest className={`size-3.5 ${mode === "pull-requests" ? "text-[var(--accent-claude)]" : ""}`} />
          <span>Pull requests</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("pages")}
          className={`flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 transition-colors ${
            mode === "pages"
              ? "text-[var(--foreground)] bg-[var(--wash)] font-medium"
              : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
          }`}
        >
          <FileText className={`size-3.5 ${mode === "pages" ? "text-[var(--accent-claude)]" : ""}`} />
          <span>Pages</span>
        </button>
      </div>

      {/* SESSIONS / Worktrees Section */}
      <div className="mt-3 flex-1 overflow-y-auto px-1.5 scrollbar-thin">
        <div
          onClick={() => setSessionsOpen(!sessionsOpen)}
          className="flex h-6 cursor-pointer items-center gap-1.5 px-2 text-[10px] font-mono uppercase tracking-[0.08em] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          {sessionsOpen ? <ChevronDown className="size-2.5" /> : <ChevronRight className="size-2.5" />}
          <span>Worktrees</span>
          <span className="ml-auto font-mono text-[9px] text-[var(--subtle-foreground)]">
            {lanes.length}
          </span>
        </div>

        {sessionsOpen && (
          <div className="mt-1 space-y-0.5">
            {/* Live Context Worktree Lanes */}
            {lanes.map((lane) => {
              const isActive = lane.id === activeLaneId;
              return (
                <div
                  key={lane.id}
                  onClick={() => {
                    switchLane(lane.id);
                    setMode("deck");
                  }}
                  className={`group relative flex h-7 cursor-pointer items-center gap-2 rounded px-2 text-[11px] transition-all ${
                    isActive
                      ? "bg-[var(--wash-strong)] text-[var(--foreground)] font-medium"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--wash-subtle)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full shrink-0 ${
                      lane.isDevRunning ? "bg-[var(--status-awake)]" : "bg-[var(--muted-foreground)]/40"
                    }`}
                  />
                  <span className="truncate">{lane.name}</span>
                  <span className="ml-auto font-mono text-[9px] text-[var(--subtle-foreground)] tabular-nums">
                    {lane.branch}
                  </span>
                </div>
              );
            })}

            {/* Real Active Lane Tasks */}
            {activeLane?.tasks && activeLane.tasks.length > 0 && (
              <div className="pt-2 border-t border-[var(--border)]/40 mt-2">
                <span className="px-2 font-mono text-[9px] uppercase tracking-wider text-[var(--subtle-foreground)] block mb-1">
                  Active Tasks ({activeLane.tasks.length})
                </span>
                {activeLane.tasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTaskCompletion(t.id)}
                    className="flex h-6.5 cursor-pointer items-center gap-2 rounded px-2 text-[11px] text-[var(--muted-foreground)] hover:bg-[var(--wash-subtle)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <span
                      className={`size-1.5 rounded-full shrink-0 ${
                        t.completed ? "bg-emerald-400" : "bg-[var(--accent-claude)]"
                      }`}
                    />
                    <span className={`truncate min-w-0 flex-1 ${t.completed ? "line-through opacity-60" : ""}`}>
                      {t.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Profile Footer */}
      <div className="flex h-12 items-center justify-between border-t border-[var(--border)] px-3 bg-[var(--surface-sidebar)]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-5 shrink-0 items-center justify-center rounded bg-[var(--surface-tertiary)] border border-[var(--border)] font-mono text-[9px] font-bold text-[var(--foreground)]">
            {(project?.name || "Workspace").slice(0, 2).toUpperCase()}
          </div>
          <span className="truncate text-[11px] font-medium text-[var(--foreground)]">
            {project?.name || "Workspace"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsIntegrationsOpen(true)}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
          title="Connected Integrations & Vault"
        >
          <Settings className="size-3.5" />
        </button>
      </div>
    </aside>
  );
}
