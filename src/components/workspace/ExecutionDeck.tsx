"use client";

import React from "react";
import { Lock, Info, Moon, Sun, ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { LanesSidebar } from "./LanesSidebar";
import { CenterCanvas } from "./CenterCanvas";
import { ActorSidebar } from "./ActorSidebar";
import { StatusBar } from "./StatusBar";
import { ProductInfoModal } from "./ProductInfoModal";

export function ExecutionDeck() {
  const {
    hostState,
    toggleSleepWake,
    setIsProductModalOpen,
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
            PARABOX / WORKSPACES /
          </span>
          <span className="font-medium text-[var(--foreground)]">Sample app</span>
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
                  : "bg-amber-400 animate-ping"
              }`}
            />
            <span className="text-[var(--muted-foreground)]">
              {hostState === "awake" && "Workspace awake"}
              {hostState === "asleep" && "Workspace asleep"}
              {hostState === "sleeping" && "Putting to sleep..."}
              {hostState === "waking" && "Waking host..."}
            </span>
          </div>

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
                <span>Sleep workspace</span>
              </>
            ) : (
              <>
                <Sun className="size-3 text-amber-400" />
                <span>Wake workspace</span>
              </>
            )}
          </button>

          {/* The Product Info Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
            title="View technical brief"
          >
            <span className="text-[11px] hidden md:inline">The product</span>
            <Info className="size-3.5 text-[var(--accent-claude)]" />
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

      {/* Architecture Brief Modal */}
      <ProductInfoModal />
    </div>
  );
}
