"use client";

import React from "react";
import { FolderGit2, Plus, GitBranch, ShieldCheck } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function LanesSidebar() {
  const { lanes, activeLaneId, switchLane, submitPrompt } = useWorkspace();

  const handleAddLane = () => {
    const laneName = prompt("Enter new lane name or agent task:", "Refactor auth");
    if (laneName && laneName.trim()) {
      submitPrompt(laneName.trim(), "Claude", "claude-3-7-sonnet", "Default effort");
    }
  };

  return (
    <div className="flex h-full w-[210px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-sidebar)] p-3 text-xs select-none">
      {/* PROJECT Section */}
      <div className="border-b border-[var(--border)]/60 pb-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5">
          Project
        </span>
        <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-primary)] p-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--foreground)] truncate">
            <FolderGit2 className="size-3.5 text-[var(--accent-claude)] shrink-0" />
            <span className="truncate">parabox / sample-app</span>
          </div>
          <span className="mt-1 inline-block font-mono text-[9px] text-[var(--subtle-foreground)]">
            Fictional repository
          </span>
        </div>
      </div>

      {/* WORK LANES Section */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2 scrollbar-thin">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          <span>Work lanes</span>
          <button
            type="button"
            onClick={handleAddLane}
            className="hover:text-[var(--foreground)] transition-colors p-0.5 rounded"
            title="Add worktree lane"
          >
            <Plus className="size-3" />
          </button>
        </div>

        <div className="space-y-1">
          {lanes.map((lane) => {
            const isActive = lane.id === activeLaneId;
            return (
              <div
                key={lane.id}
                onClick={() => switchLane(lane.id)}
                className={`group flex cursor-pointer items-center justify-between rounded-[var(--radius-sm)] border p-2 transition-all ${
                  isActive
                    ? "border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-xs"
                    : "border-transparent bg-transparent hover:bg-[var(--wash-subtle)] text-[var(--muted-foreground)]"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded-[2px] font-mono text-[9px] font-bold ${lane.badgeBg} ${lane.badgeFg}`}
                  >
                    {lane.badge}
                  </span>
                  <div className="min-w-0">
                    <div
                      className={`truncate text-[11px] font-medium ${
                        isActive ? "text-[var(--foreground)]" : "group-hover:text-[var(--foreground)]"
                      }`}
                    >
                      {lane.name}
                    </div>
                    <div className="font-mono text-[9px] text-[var(--subtle-foreground)] truncate">
                      {lane.branch}
                    </div>
                  </div>
                </div>

                {lane.isDevRunning && (
                  <span className="size-1.5 rounded-full bg-[var(--status-awake)] shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        <p className="pt-2 text-[10px] text-[var(--subtle-foreground)] leading-relaxed font-normal">
          One worktree per writer. One shared place to work.
        </p>
      </div>

      {/* WORKSPACE CONTEXT Section */}
      <div className="border-t border-[var(--border)]/60 pt-3 space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] block">
          Workspace context
        </span>
        <div className="space-y-1.5 text-[10px] font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)]">Files & Git</span>
            <span className="text-[var(--foreground)] font-medium">Persistent</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)]">Tool identities</span>
            <span className="text-[var(--foreground)] font-medium">Retained</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)]">Running processes</span>
            <span className="text-[var(--accent-claude)] font-medium">Ephemeral</span>
          </div>
        </div>
      </div>
    </div>
  );
}
