"use client";

import React from "react";
import { Play, Square, Edit3, Terminal, Eye, FileCode, CheckCircle2 } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PreviewPane } from "./PreviewPane";
import { TerminalPane } from "./TerminalPane";
import { ChangesPane } from "./ChangesPane";

export function CenterCanvas() {
  const {
    activeLane,
    activeTab,
    setActiveTab,
    toggleDevServer,
    simulateEdit,
    hostState,
  } = useWorkspace();

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[var(--background)]">
      {/* Center Subheader: Active Lane, Branch, and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] px-4 py-2 gap-2 bg-[var(--surface-primary)]">
        {/* Lane Name & Branch */}
        <div className="flex items-center gap-2">
          <span
            className={`flex size-5 items-center justify-center rounded-[var(--radius-xs)] font-mono text-[10px] font-bold ${activeLane.badgeBg} ${activeLane.badgeFg}`}
          >
            {activeLane.badge}
          </span>
          <span className="font-medium text-xs text-[var(--foreground)]">
            {activeLane.name}
          </span>
          <span className="rounded bg-[var(--surface-secondary)] border border-[var(--border)] px-2 py-0.5 font-mono text-[10px] text-[var(--muted-foreground)]">
            {activeLane.branch}
          </span>
          <span className="text-[10px] font-mono text-[var(--subtle-foreground)]">
            {activeLane.status}
          </span>
        </div>

        {/* Tab Deck */}
        <div className="flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--surface-secondary)] p-0.5 border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 rounded-[var(--radius-xs)] px-2.5 py-1 text-xs transition-colors ${
              activeTab === "preview"
                ? "bg-[var(--surface-primary)] text-[var(--foreground)] font-medium shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Eye className="size-3" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-1.5 rounded-[var(--radius-xs)] px-2.5 py-1 text-xs transition-colors ${
              activeTab === "terminal"
                ? "bg-[var(--surface-primary)] text-[var(--foreground)] font-medium shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Terminal className="size-3" />
            <span>Terminal</span>
            <span className="font-mono text-[9px] text-[var(--subtle-foreground)]">1</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("changes")}
            className={`flex items-center gap-1.5 rounded-[var(--radius-xs)] px-2.5 py-1 text-xs transition-colors ${
              activeTab === "changes"
                ? "bg-[var(--surface-primary)] text-[var(--foreground)] font-medium shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <FileCode className="size-3" />
            <span>Changes</span>
            <span
              className={`font-mono text-[9px] px-1 rounded ${
                activeLane.changesCount > 0
                  ? "bg-[var(--diff-add)]/20 text-[var(--diff-add)] font-bold"
                  : "text-[var(--subtle-foreground)]"
              }`}
            >
              {activeLane.changesCount}
            </span>
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between border-b border-[var(--border)]/60 bg-[var(--surface-secondary)]/20 px-4 py-2">
        <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
          Try the workspace
        </span>

        <div className="flex items-center gap-2">
          {/* Run dev button */}
          <button
            type="button"
            onClick={toggleDevServer}
            disabled={hostState === "asleep"}
            className={`flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 py-1 font-sans text-xs font-medium transition-all ${
              activeLane.isDevRunning
                ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                : "bg-[var(--foreground)] border-transparent text-[var(--background)] hover:bg-white"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {activeLane.isDevRunning ? (
              <>
                <Square className="size-3 fill-current" />
                <span>Stop dev</span>
              </>
            ) : (
              <>
                <Play className="size-3 fill-current" />
                <span>Run dev</span>
              </>
            )}
          </button>

          {/* Simulate an edit button */}
          <button
            type="button"
            onClick={simulateEdit}
            disabled={hostState === "asleep"}
            className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-1 font-sans text-xs text-[var(--foreground)] hover:bg-[var(--surface-secondary)] hover:border-[var(--border-strong)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Edit3 className="size-3 text-[var(--accent-claude)]" />
            <span>Simulate an edit</span>
          </button>
        </div>
      </div>

      {/* Main Tab View Canvas */}
      <div className="flex-1 overflow-hidden p-3 bg-[var(--background)]">
        {activeTab === "preview" && <PreviewPane />}
        {activeTab === "terminal" && <TerminalPane />}
        {activeTab === "changes" && <ChangesPane />}
      </div>
    </div>
  );
}
