"use client";

import React from "react";
import { FileCode, GitCommit } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function ChangesPane() {
  const { activeLane, diff } = useWorkspace();

  const filesChanged = diff?.files_changed ?? 0;
  const insertions = diff?.insertions ?? 0;
  const deletions = diff?.deletions ?? 0;
  const diffText = diff?.diff_text || "";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--terminal-border)] bg-[var(--surface-terminal)] font-mono text-xs text-[var(--terminal-foreground)]">
      {/* Changes Header */}
      <div className="flex h-8 items-center justify-between border-b border-[var(--terminal-border)] bg-[var(--surface-terminal-header)] px-3 text-[11px] text-[var(--terminal-muted)]">
        <div className="flex items-center gap-2">
          <FileCode className="size-3 text-[var(--terminal-accent)]" />
          <span>Worktree Diff · {activeLane?.branch || "main"}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          {insertions > 0 && <span className="text-emerald-400">+{insertions}</span>}
          {deletions > 0 && <span className="text-rose-400">-{deletions}</span>}
          <span className="text-[var(--terminal-subtle)]">
            {filesChanged} file{filesChanged !== 1 ? "s" : ""} modified
          </span>
        </div>
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {!diffText ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-[var(--terminal-muted)]">
            <GitCommit className="size-6 text-[var(--terminal-subtle)] mb-2" />
            <p className="text-xs">Working tree clean on branch {activeLane?.branch || "main"}.</p>
            <p className="text-[10px] text-[var(--terminal-subtle)] mt-1">
              File mutations produced by agents or human edits in this worktree will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded border border-[var(--terminal-border)] bg-[var(--surface-terminal-inset)] overflow-hidden">
            <pre className="p-4 text-[11px] leading-relaxed overflow-x-auto whitespace-pre font-mono text-[var(--terminal-foreground)]">
              {diffText.split("\n").map((line, idx) => {
                let lineClass = "text-[var(--terminal-muted)]";
                if (line.startsWith("+") && !line.startsWith("+++")) {
                  lineClass = "bg-emerald-500/10 text-emerald-400 px-1 -mx-1 rounded-xs block";
                } else if (line.startsWith("-") && !line.startsWith("---")) {
                  lineClass = "bg-rose-500/10 text-rose-400 px-1 -mx-1 rounded-xs block";
                } else if (line.startsWith("@@")) {
                  lineClass = "text-[var(--accent-claude)] block";
                } else if (line.startsWith("diff ") || line.startsWith("index ")) {
                  lineClass = "text-[var(--foreground)] font-bold block";
                }
                return (
                  <span key={idx} className={lineClass}>
                    {line}
                    {"\n"}
                  </span>
                );
              })}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
