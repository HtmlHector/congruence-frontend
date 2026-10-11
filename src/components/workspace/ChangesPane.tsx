"use client";

import React, { useState } from "react";
import { FileCode, GitCommit, GitMerge, RefreshCw, CheckCircle2, AlertCircle, ChevronRight, FileText } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useAuth } from "@clerk/nextjs";
import { API_BASE_URL } from "@/lib/api";

export function ChangesPane() {
  const { activeLane, diff: initialDiff, project } = useWorkspace();
  const { getToken } = useAuth();

  const [localDiff, setLocalDiff] = useState<any>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeStatus, setMergeStatus] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const diff = localDiff || initialDiff;
  const filesChanged = diff?.files_changed ?? 0;
  const insertions = diff?.insertions ?? 0;
  const deletions = diff?.deletions ?? 0;
  const diffText = diff?.diff_text || "";
  const rawFiles = (diff as any)?.raw_files || [];

  const handleRefreshDiff = async () => {
    if (!project?.id || !activeLane?.id) return;
    try {
      const token = await getToken();
      const res = await fetch(
        `${API_BASE_URL}/projects/${project.id}/git/status?lane_id=${activeLane.id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (res.ok) {
        const data = await res.json();
        setLocalDiff(data);
      }
    } catch {
      // Ignored
    }
  };

  const handleMergeToMain = async () => {
    if (!project?.id || !activeLane?.id) return;
    setIsMerging(true);
    setMergeStatus(null);
    try {
      const token = await getToken();
      const res = await fetch(
        `${API_BASE_URL}/projects/${project.id}/lanes/${activeLane.id}/merge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ target_branch: "main" }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setMergeStatus(data.success ? "Merge successful! Changes applied to main." : "Merge completed with warnings.");
        handleRefreshDiff();
      } else {
        setMergeStatus("Merge failed: Server error");
      }
    } catch (e: any) {
      setMergeStatus(`Merge failed: ${e.message}`);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--terminal-border)] bg-[var(--surface-terminal)] font-mono text-xs text-[var(--terminal-foreground)]">
      {/* Changes Header */}
      <div className="flex h-10 items-center justify-between border-b border-[var(--terminal-border)] bg-[var(--surface-terminal-header)] px-3 text-[11px] text-[var(--terminal-muted)]">
        <div className="flex items-center gap-2">
          <FileCode className="size-3.5 text-[var(--terminal-accent)]" />
          <span className="font-semibold text-zinc-200">
            Worktree Diff · {activeLane?.branch || "main"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px]">
            {insertions > 0 && <span className="text-emerald-400 font-bold">+{insertions}</span>}
            {deletions > 0 && <span className="text-rose-400 font-bold">-{deletions}</span>}
            <span className="text-[var(--terminal-subtle)]">
              {filesChanged} file{filesChanged !== 1 ? "s" : ""}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRefreshDiff}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer text-[10px]"
            title="Refresh Diffs"
          >
            <RefreshCw className="size-3" />
            <span>Refresh</span>
          </button>

          {activeLane?.branch !== "main" && (
            <button
              type="button"
              disabled={isMerging || !diffText}
              onClick={handleMergeToMain}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-medium text-[10px] transition-colors cursor-pointer"
            >
              <GitMerge className="size-3" />
              <span>{isMerging ? "Merging..." : "Merge to Main"}</span>
            </button>
          )}
        </div>
      </div>

      {mergeStatus && (
        <div className={`px-3 py-1.5 text-[11px] flex items-center gap-2 border-b ${mergeStatus.includes("successful") ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-300" : "bg-amber-950/40 border-amber-800/40 text-amber-300"}`}>
          {mergeStatus.includes("successful") ? <CheckCircle2 className="size-3.5 shrink-0" /> : <AlertCircle className="size-3.5 shrink-0" />}
          <span>{mergeStatus}</span>
        </div>
      )}

      {/* Main Diff Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* File List Rail if multiple files */}
        {rawFiles.length > 0 && (
          <div className="w-56 border-r border-[var(--terminal-border)] bg-[var(--surface-terminal-header)] overflow-y-auto p-2 space-y-1">
            <div className="text-[9px] uppercase tracking-wider text-[var(--terminal-muted)] px-2 py-1">
              Changed Files ({rawFiles.length})
            </div>
            {rawFiles.map((f: any, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedFile(f.file === selectedFile ? null : f.file)}
                className={`w-full flex items-center justify-between gap-1.5 px-2 py-1.5 rounded text-left transition-colors text-[10px] cursor-pointer ${
                  selectedFile === f.file ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <FileText className="size-3 shrink-0 text-[var(--terminal-accent)]" />
                  <span className="truncate">{f.file}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 font-mono text-[9px]">
                  {f.insertions > 0 && <span className="text-emerald-400">+{f.insertions}</span>}
                  {f.deletions > 0 && <span className="text-rose-400">-{f.deletions}</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Diff Viewer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {!diffText ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-[var(--terminal-muted)] py-12">
              <GitCommit className="size-8 text-[var(--terminal-subtle)] mb-2" />
              <p className="text-xs font-semibold text-zinc-300">Working tree clean on branch {activeLane?.branch || "main"}.</p>
              <p className="text-[10px] text-[var(--terminal-subtle)] mt-1 max-w-sm">
                Code edits and agent modifications generated in this worktree will appear here with live side-by-side diffs.
              </p>
            </div>
          ) : (
            <div className="rounded border border-[var(--terminal-border)] bg-[var(--surface-terminal-inset)] overflow-hidden">
              <pre className="p-4 text-[11px] leading-relaxed overflow-x-auto whitespace-pre font-mono text-[var(--terminal-foreground)]">
                {diffText.split("\n").map((line: string, idx: number) => {
                  let lineClass = "text-[var(--terminal-muted)]";
                  if (line.startsWith("+") && !line.startsWith("+++")) {
                    lineClass = "bg-emerald-500/10 text-emerald-400 px-1 -mx-1 rounded-xs block";
                  } else if (line.startsWith("-") && !line.startsWith("---")) {
                    lineClass = "bg-rose-500/10 text-rose-400 px-1 -mx-1 rounded-xs block";
                  } else if (line.startsWith("@@")) {
                    lineClass = "text-[var(--accent-claude)] bg-indigo-950/30 px-1 rounded-xs block font-bold";
                  } else if (line.startsWith("diff ") || line.startsWith("index ")) {
                    lineClass = "text-[var(--foreground)] font-bold block pt-2 border-t border-[var(--terminal-border)] first:border-none first:pt-0";
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
    </div>
  );
}
