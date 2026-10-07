"use client";

import React from "react";
import { FileCode, GitCommit, Plus, Minus } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function ChangesPane() {
  const { activeLane } = useWorkspace();

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[#0A0A0D] font-mono text-xs text-[var(--foreground)]">
      {/* Changes Header */}
      <div className="flex h-8 items-center justify-between border-b border-[var(--border)] bg-[var(--surface-secondary)]/40 px-3 text-[11px] text-[var(--muted-foreground)]">
        <div className="flex items-center gap-2">
          <FileCode className="size-3 text-[var(--accent-claude)]" />
          <span>Worktree Diff · {activeLane.branch}</span>
        </div>
        <span className="text-[10px] text-[var(--subtle-foreground)]">
          {activeLane.changesCount} file{activeLane.changesCount !== 1 ? "s" : ""} modified
        </span>
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {activeLane.changesCount === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-[var(--muted-foreground)]">
            <GitCommit className="size-6 text-[var(--subtle-foreground)] mb-2" />
            <p className="text-xs">No uncommitted changes in this lane.</p>
            <p className="text-[10px] text-[var(--subtle-foreground)] mt-1">
              Click &quot;Simulate an edit&quot; above to trigger agent mutations.
            </p>
          </div>
        ) : (
          <div className="rounded border border-[var(--border)] bg-[var(--surface-inset)] overflow-hidden">
            {/* Diff File Header */}
            <div className="flex items-center justify-between bg-[var(--surface-primary)] px-3 py-1.5 border-b border-[var(--border)] text-[11px]">
              <span className="text-[var(--foreground)]">src/components/FieldnotesApp.tsx</span>
              <span className="text-[10px] text-[var(--diff-add)]">+12 <span className="text-[var(--diff-del)]">−4</span></span>
            </div>

            {/* Diff Lines */}
            <div className="p-3 text-[11px] space-y-0.5 leading-relaxed">
              <div className="text-[var(--subtle-foreground)]">@@ -14,6 +14,8 @@ export function FieldnotesApp() &#123;</div>
              <div className="text-[var(--muted-foreground)]">   const &#123; tasks &#125; = useNotes();</div>
              <div className="text-[var(--diff-del)] bg-red-950/20 px-1 rounded flex items-center gap-1.5">
                <Minus className="size-2.5" />
                <span>- const defaultTitle = &quot;Untitled project&quot;;</span>
              </div>
              <div className="text-[var(--diff-add)] bg-emerald-950/20 px-1 rounded flex items-center gap-1.5">
                <Plus className="size-2.5" />
                <span>+ const defaultTitle = &quot;Good ideas start here.&quot;;</span>
              </div>
              <div className="text-[var(--diff-add)] bg-emerald-950/20 px-1 rounded flex items-center gap-1.5">
                <Plus className="size-2.5" />
                <span>+ const autoPersistToDisk = true;</span>
              </div>
              <div className="text-[var(--muted-foreground)]">   return (</div>
              <div className="text-[var(--muted-foreground)]">     &lt;div className=&quot;workspace-notes&quot;&gt;</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
