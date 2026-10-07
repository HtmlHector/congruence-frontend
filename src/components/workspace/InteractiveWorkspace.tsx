"use client";

import React from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { SupersetSidebar } from "./SupersetSidebar";
import { PromptHub } from "./PromptHub";
import { ExecutionDeck } from "./ExecutionDeck";

export function InteractiveWorkspace() {
  const { mode } = useWorkspace();

  return (
    <div
      id="demo"
      className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-12 select-none"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 px-2 gap-2">
        <div>
          <span className="font-mono text-xs text-[var(--muted-foreground)] uppercase tracking-wider block mb-1">
            A look inside
          </span>
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--foreground)]">
            The work stays together.
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[var(--status-awake)] animate-pulse" />
            Interactive · simulated workspace
          </span>
          <a
            href="/workspace"
            className="hover:text-[var(--foreground)] underline underline-offset-4 hidden sm:inline"
          >
            Open full preview ↗
          </a>
        </div>
      </div>

      {/* Main Outer Browser Window Frame */}
      <div className="relative flex h-[680px] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-frame)] ring-1 ring-[var(--edge-hairline)]">
        {/* Left Superset Sidebar */}
        <div className="hidden sm:flex">
          <SupersetSidebar />
        </div>

        {/* Dynamic Center Stage: Hub or Execution Deck */}
        <div className="flex flex-1 overflow-hidden">
          {mode === "hub" ? <PromptHub /> : <ExecutionDeck />}
        </div>
      </div>

      {/* Workspace Caption Note matching the mockup */}
      <p className="mt-3 text-center text-xs text-[var(--subtle-foreground)] font-mono">
        Try Run dev, give an agent its own lane, or put the workspace to sleep. This demo runs
        entirely in your browser; it does not start real compute or connect accounts.
      </p>
    </div>
  );
}
