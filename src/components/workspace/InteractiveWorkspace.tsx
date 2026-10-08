/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
"use client";

import React from "react";
import Link from "next/link";
import { useWorkspace } from "@/context/WorkspaceContext";
import { SupersetSidebar } from "./SupersetSidebar";
import { PromptHub } from "./PromptHub";
import { ExecutionDeck } from "./ExecutionDeck";
import { IntegrationsModal } from "./IntegrationsModal";
import { SettingsModal } from "./SettingsModal";
import { NewWorktreeModal } from "./NewWorktreeModal";
import { WorkspaceContextMenu } from "./WorkspaceContextMenu";

export function InteractiveWorkspace() {
  const {
    mode,
    isIntegrationsOpen,
    setIsIntegrationsOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isNewWorktreeOpen,
    setIsNewWorktreeOpen,
    worktreeTargetProjectId,
  } = useWorkspace();

  return (
    <div
      id="workspace-preview"
      className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-12 select-none"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 px-2 gap-2">
        <div>
          <span className="font-mono text-xs text-[var(--muted-foreground)] uppercase tracking-wider block mb-1">
            01 / Interactive Simulator
          </span>
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--foreground)]">
            Explore the multi-agent workspace live.
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-[3.5px] bg-[var(--status-awake)] animate-pulse" />
            Live Simulator
          </span>
          <Link
            href="/workspace"
            className="hover:text-[var(--foreground)] underline underline-offset-4 hidden sm:inline"
          >
            Open production workspace ↗
          </Link>
        </div>
      </div>

      {/* Main Outer Browser Window Frame */}
      <WorkspaceContextMenu>
        <div className="relative flex h-[680px] w-full overflow-hidden rounded-[3.5px] border border-[var(--border)] bg-[var(--background)] shadow-2xl ring-1 ring-[var(--edge-hairline)]">
          {/* Left Superset Sidebar */}
          <div className="hidden sm:flex">
            <SupersetSidebar />
          </div>

          {/* Dynamic Center Stage: Hub or Execution Deck */}
          <div className="flex flex-1 overflow-hidden">
            {mode === "hub" ? <PromptHub /> : <ExecutionDeck />}
          </div>
        </div>
      </WorkspaceContextMenu>

      {/* Integrations & Vault Modal */}
      <IntegrationsModal open={isIntegrationsOpen} onOpenChange={setIsIntegrationsOpen} />
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <NewWorktreeModal
        open={isNewWorktreeOpen}
        onOpenChange={setIsNewWorktreeOpen}
        targetProjectId={worktreeTargetProjectId || undefined}
      />
    </div>
  );
}

