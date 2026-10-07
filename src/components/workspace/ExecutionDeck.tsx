"use client";

import React from "react";
import { Lock, Moon, Sun, ArrowLeft, Key } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { LanesSidebar } from "./LanesSidebar";
import { CenterCanvas } from "./CenterCanvas";
import { ActorSidebar } from "./ActorSidebar";
import { StatusBar } from "./StatusBar";

export function ExecutionDeck() {
  const {
    project,
    hostState,
    toggleSleepWake,
    setIsIntegrationsOpen,
    setMode,
  } = useWorkspace();

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[var(--background)]">
      {/* Top Deck Navigation Bar */}
      <div className="flex h-11 items-center justify-between border-b border-[var(--border)] bg-[var(--surface-primary)] px-4 text-xs select-none">
        {/* Breadcrumb & Visibility */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("hub")}
            className="flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mr-2 pr-2 border-r border-[var(--border)]"
            title="Return to Prompt Hub"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline text-[11px]">Hub</span>
          </button>

          <span className="font-mono text-[10px] text-[var(--muted-foreground)] hidden sm:inline">
            CONGRUENCE /
          </span>
          <span className="font-medium text-[var(--foreground)]">
            {project?.name || "Workspace"}
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-[var(--surface-secondary)] border border-[var(--border)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--muted-foreground)]">
            <Lock className="size-2 text-[var(--subtle-foreground)]" />
            Private
          </span>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Status Dot */}
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span
              className={`size-2 rounded-full ${
                hostState === "awake"
                  ? "bg-[var(--status-awake)] shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : hostState === "asleep"
                  ? "bg-[var(--status-asleep)]"
                  : "bg-[var(--accent-amber)] animate-ping"
              }`}
            />
            <span className="text-[var(--muted-foreground)]">
              {hostState === "awake" && "Host awake"}
              {hostState === "asleep" && (
                <>
                  <span>Host asleep</span>
                  <span className="ml-1 text-[var(--accent-amber)]">(Compute paused)</span>
                </>
              )}
              {hostState === "sleeping" && "Suspending compute..."}
              {hostState === "waking" && "Waking host..."}
            </span>
          </div>

          {/* Connect Agents & Vault Trigger */}
          <button
            type="button"
            onClick={() => setIsIntegrationsOpen(true)}
            className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[rgba(232,128,74,0.3)] bg-[rgba(232,128,74,0.08)] px-2.5 py-1 font-sans text-xs text-[var(--accent-claude)] hover:bg-[rgba(232,128,74,0.16)] transition-all cursor-pointer"
            title="Connect Anthropic (Claude Code), OpenAI, and GitHub"
          >
            <Key className="size-3" />
            <span className="font-medium">Connect Agents / Keys</span>
          </button>

          {/* Sleep / Wake Power Button */}
          <button
            type="button"
            onClick={toggleSleepWake}
            disabled={hostState === "sleeping" || hostState === "waking"}
            className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-1 font-sans text-xs text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] hover:border-[var(--border-strong)] transition-all disabled:opacity-40"
          >
            {hostState === "awake" ? (
              <>
                <Moon className="size-3 text-[var(--muted-foreground)]" />
                <span>Sleep host</span>
              </>
            ) : (
              <>
                <Sun className="size-3 text-[var(--accent-amber)]" />
                <span>Wake host</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3-Column Split Execution Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sub-Sidebar (Lanes) */}
        <div className="hidden md:flex">
          <LanesSidebar />
        </div>

        {/* Center Canvas (Tabs + Preview + Terminal + Changes) */}
        <CenterCanvas />

        {/* Right Actor & Lease Sidebar */}
        <div className="hidden lg:flex">
          <ActorSidebar />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  );
}
