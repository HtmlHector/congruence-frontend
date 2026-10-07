"use client";

import React from "react";
import { Laptop, GitBranch, FolderGit2 } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function StatusBar() {
  const { hostState, activeLane } = useWorkspace();

  return (
    <div className="flex h-8 w-full items-center justify-between border-t border-[var(--border)] px-4 bg-[var(--surface-sidebar)] text-[10px] font-mono text-[var(--muted-foreground)] select-none">
      <div className="flex items-center gap-4">
        {/* Host / Device Indicator */}
        <div className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors cursor-pointer">
          <Laptop className="size-3" />
          <span>This device</span>
          <span className="text-[var(--subtle-foreground)]">/</span>
          <span className="text-[var(--accent-claude)]">Fly Sprite</span>
          <span
            className={`size-1.5 rounded-full ${
              hostState === "awake" ? "bg-[var(--status-awake)]" : "bg-[var(--status-asleep)]"
            }`}
          />
        </div>

        {/* Workspace Tag */}
        <div className="hidden sm:flex items-center gap-1 hover:text-[var(--foreground)] transition-colors cursor-pointer">
          <span className="size-3 rounded-full bg-[var(--surface-tertiary)] flex items-center justify-center text-[8px] font-bold">
            S
          </span>
          <span>ss</span>
        </div>

        {/* Worktree & Branch Indicator */}
        <div className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors cursor-pointer">
          <GitBranch className="size-3" />
          <span>Worktree</span>
          <span className="text-[var(--subtle-foreground)]">⇕</span>
          <span className="text-[var(--foreground)] font-medium">{activeLane.branch}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span>Port 3000 · HTTPS private</span>
      </div>
    </div>
  );
}
