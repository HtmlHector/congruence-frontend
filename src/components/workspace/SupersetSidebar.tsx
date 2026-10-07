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
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function SupersetSidebar() {
  const { lanes, activeLaneId, switchLane, setMode } = useWorkspace();
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);

  // Static mock sessions from superset.sh image
  const staticSessions = [
    { id: "s1", title: "fix onboarding crash", diff: "+46 −1", state: "loading" },
    { id: "s2", title: "billing webhooks", diff: "+193", state: "live" },
    { id: "s3", title: "refactor auth flow", diff: "+394 −23", state: "idle" },
    { id: "s4", title: "speed up cold start", diff: "+33", state: "ping" },
  ];

  return (
    <aside className="flex h-full w-[232px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-sidebar)] text-[11px] select-none">
      {/* Top OS Window Dots & Navigation Controls */}
      <div className="flex h-11 items-center justify-between px-3 border-b border-[var(--border)]/40">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-[#FF5F57]/80 hover:opacity-100 transition-opacity" />
          <div className="size-2.5 rounded-full bg-[#FEBC2E]/80 hover:opacity-100 transition-opacity" />
          <div className="size-2.5 rounded-full bg-[#28C840]/80 hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
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

      {/* New Workspace Action Button */}
      <div className="px-2 pt-2 pb-1">
        <button
          type="button"
          onClick={() => setMode("hub")}
          className="flex h-7 w-full items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] hover:border-[var(--border-strong)] transition-all font-medium text-[11px]"
        >
          <Plus className="size-3 text-[var(--muted-foreground)]" />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Core Navigation Items */}
      <div className="space-y-0.5 px-1.5 py-1">
        <button
          type="button"
          onClick={() => setMode("hub")}
          className="flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 text-[var(--muted-foreground)] hover:bg-white/[0.04] hover:text-[var(--foreground)] transition-colors"
        >
          <Search className="size-3.5" />
          <span>Search</span>
          <kbd className="ml-auto font-mono text-[9px] text-[var(--subtle-foreground)]">⌘K</kbd>
        </button>

        <button
          type="button"
          onClick={() => setMode("deck")}
          className="flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 text-[var(--foreground)] bg-white/[0.05] transition-colors"
        >
          <Layers className="size-3.5 text-[var(--accent-claude)]" />
          <span>Workspaces</span>
        </button>

        <button
          type="button"
          className="flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 text-[var(--muted-foreground)] hover:bg-white/[0.04] hover:text-[var(--foreground)] transition-colors"
        >
          <Zap className="size-3.5" />
          <span>Automations</span>
        </button>

        <button
          type="button"
          className="flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 text-[var(--muted-foreground)] hover:bg-white/[0.04] hover:text-[var(--foreground)] transition-colors"
        >
          <CheckSquare className="size-3.5" />
          <span>Tasks</span>
        </button>

        <button
          type="button"
          className="flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 text-[var(--muted-foreground)] hover:bg-white/[0.04] hover:text-[var(--foreground)] transition-colors"
        >
          <GitPullRequest className="size-3.5" />
          <span>Pull requests</span>
        </button>

        <button
          type="button"
          className="flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 text-[var(--muted-foreground)] hover:bg-white/[0.04] hover:text-[var(--foreground)] transition-colors"
        >
          <FileText className="size-3.5" />
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
                      ? "bg-white/[0.06] text-[var(--foreground)] font-medium"
                      : "text-[var(--muted-foreground)] hover:bg-white/[0.025] hover:text-[var(--foreground)]"
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

            {/* Static Simulated Worktree Tasks */}
            <div className="pt-2 border-t border-[var(--border)]/40 mt-2">
              <span className="px-2 font-mono text-[9px] uppercase tracking-wider text-[var(--subtle-foreground)] block mb-1">
                Recent Tasks
              </span>
              {staticSessions.map((s) => (
                <div
                  key={s.id}
                  className="flex h-6.5 cursor-pointer items-center gap-2 rounded px-2 text-[11px] text-[var(--muted-foreground)] hover:bg-white/[0.02] hover:text-[var(--foreground)] transition-colors"
                >
                  {s.state === "loading" && (
                    <Loader2 className="size-2.5 animate-spin text-[var(--accent-claude)] shrink-0" />
                  )}
                  {s.state === "live" && (
                    <span className="size-1.5 rounded-full bg-[var(--status-awake)] shrink-0" />
                  )}
                  {s.state === "idle" && (
                    <span className="size-1.5 rounded-full bg-[var(--subtle-foreground)] shrink-0" />
                  )}
                  {s.state === "ping" && (
                    <span className="relative flex size-1.5 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-amber-400" />
                    </span>
                  )}
                  <span className="truncate min-w-0 flex-1">{s.title}</span>
                  <span className="font-mono text-[9px] tabular-nums text-[var(--subtle-foreground)] shrink-0">
                    {s.diff}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Profile Footer */}
      <div className="flex h-12 items-center justify-between border-t border-[var(--border)] px-3 bg-[var(--surface-sidebar)]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-5 shrink-0 items-center justify-center rounded bg-[var(--surface-tertiary)] border border-[var(--border)] font-mono text-[9px] font-bold text-[var(--foreground)]">
            HT
          </div>
          <span className="truncate text-[11px] font-medium text-[var(--foreground)]">
            Hector's Team
          </span>
        </div>
        <button
          type="button"
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
          title="Team settings"
        >
          <Settings className="size-3.5" />
        </button>
      </div>
    </aside>
  );
}
