"use client";

import React from "react";
import { FileCode, GitCommit, Plus, Minus } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function ChangesPane() {
  const { activeLane } = useWorkspace();

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--terminal-border)] bg-[var(--surface-terminal)] font-mono text-xs text-[var(--terminal-foreground)]">
      {/* Changes Header */}
      <div className="flex h-8 items-center justify-between border-b border-[var(--terminal-border)] bg-[var(--surface-terminal-header)] px-3 text-[11px] text-[var(--terminal-muted)]">
        <div className="flex items-center gap-2">
          <FileCode className="size-3 text-[var(--terminal-accent)]" />
          <span>Worktree Diff · {activeLane.branch}</span>
        </div>
        <span className="text-[10px] text-[var(--terminal-subtle)]">
          {activeLane.changesCount} file{activeLane.changesCount !== 1 ? "s" : ""} modified
        </span>
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {activeLane.changesCount === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-[var(--terminal-muted)]">
            <GitCommit className="size-6 text-[var(--terminal-subtle)] mb-2" />
            <p className="text-xs">No uncommitted changes in this lane.</p>
            <p className="text-[10px] text-[var(--terminal-subtle)] mt-1">
              Click &quot;Simulate an edit&quot; above to trigger agent mutations.
            </p>
          </div>
        ) : (
          <div className="rounded border border-[var(--terminal-border)] bg-[var(--surface-terminal-inset)] overflow-hidden">
            {/* Diff File Header */}
            <div className="flex items-center justify-between bg-[var(--surface-terminal-header)] px-3 py-1.5 border-b border-[var(--terminal-border)] text-[11px]">
              <span className="text-[var(--terminal-foreground)]">src/components/FieldnotesApp.tsx</span>
              <span className="text-[10px] text-[var(--diff-add-fg)]">+12 <span className="text-[var(--diff-del-fg)]">−4</span></span>
            </div>

            {/* Diff Lines */}
            <div className="p-3 text-[11px] space-y-0.5 leading-relaxed">
              <div className="text-[var(--terminal-subtle)]">@@ -14,6 +14,8 @@ export function FieldnotesApp() &#123;</div>
              <div className="text-[var(--terminal-muted)]">   const &#123; tasks &#125; = useNotes();</div>
              <div className="text-[var(--diff-del-fg)] bg-[var(--diff-del-bg)] px-1 rounded flex items-center gap-1.5">
                <Minus className="size-2.5" />
                <span>- const defaultTitle = &quot;Untitled project&quot;;</span>
              </div>
              <div className="text-[var(--diff-add-fg)] bg-[var(--diff-add-bg)] px-1 rounded flex items-center gap-1.5">
                <Plus className="size-2.5" />
                <span>+ const defaultTitle = &quot;Good ideas start here.&quot;;</span>
              </div>
              <div className="text-[var(--diff-add-fg)] bg-[var(--diff-add-bg)] px-1 rounded flex items-center gap-1.5">
                <Plus className="size-2.5" />
                <span>+ const autoPersistToDisk = true;</span>
              </div>
              <div className="text-[var(--terminal-muted)]">   return (</div>
              <div className="text-[var(--terminal-muted)]">     &lt;div className=&quot;workspace-notes&quot;&gt;</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
