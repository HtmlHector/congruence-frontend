"use client";

import React, { useEffect, useState } from "react";
import { FileCode, GitCommit, Plus, Minus, FileText } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function ChangesPane() {
  const { activeLane, activeLaneId, projectId } = useWorkspace();
  const [diffData, setDiffData] = useState<any>(null);

  useEffect(() => {
    if (!projectId || !activeLaneId) return;
    const fetchDiff = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/projects/${projectId}/git/status?lane_id=${activeLaneId}`
        );
        if (res.ok) {
          const data = await res.json();
          setDiffData(data);
        }
      } catch (err) {
        // Fallback to local lane state
      }
    };
    fetchDiff();
  }, [projectId, activeLaneId]);

  const filesChanged =
    diffData && diffData.files_changed > 0 ? diffData.files_changed : activeLane.changesCount;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--terminal-border)] bg-[var(--surface-terminal)] font-mono text-xs text-[var(--terminal-foreground)]">
      {/* Changes Header */}
      <div className="flex h-8 items-center justify-between border-b border-[var(--terminal-border)] bg-[var(--surface-terminal-header)] px-3 text-[11px] text-[var(--terminal-muted)]">
        <div className="flex items-center gap-2">
          <FileCode className="size-3 text-[var(--terminal-accent)]" />
          <span>Worktree Diff · {activeLane.branch || "main"}</span>
        </div>
        <span className="text-[10px] text-[var(--terminal-subtle)]">
          {filesChanged} file{filesChanged !== 1 ? "s" : ""} modified
        </span>
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {filesChanged === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-[var(--terminal-muted)]">
            <GitCommit className="size-6 text-[var(--terminal-subtle)] mb-2" />
            <p className="text-xs">No uncommitted changes in this lane.</p>
            <p className="text-[10px] text-[var(--terminal-subtle)] mt-1">
              Click &quot;Simulate an edit&quot; above to trigger agent mutations.
            </p>
          </div>
        ) : (
          <div className="rounded border border-[var(--terminal-border)] bg-[var(--surface-terminal-inset)] overflow-hidden">
            {/* File Path Header */}
            <div className="flex items-center justify-between border-b border-[var(--terminal-border)] bg-[var(--surface-terminal-header)] px-3 py-1.5 text-[11px] text-[var(--terminal-foreground)]">
              <div className="flex items-center gap-2">
                <FileText className="size-3 text-[var(--accent-claude)]" />
                <span className="font-semibold">src/components/FieldnotesApp.tsx</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">+1 line</span>
            </div>

            {/* Diff Patch */}
            <div className="p-3 text-[11px] space-y-0.5 leading-relaxed">
              <div className="text-[var(--terminal-subtle)]">
                @@ -28,6 +28,7 @@ export function FieldnotesApp() &#123;
              </div>
              <div className="text-[var(--terminal-muted)]">
                &nbsp;&nbsp;const [tasks, setTasks] = useState(initialTasks);
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 px-1 rounded-xs">
                +&nbsp;&nbsp;const author = &quot;{activeLane.currentWriter || "Claude Code"}&quot;;
              </div>
              <div className="text-[var(--terminal-muted)]">
                &nbsp;&nbsp;return (
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
