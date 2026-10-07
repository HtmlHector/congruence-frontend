"use client";

import React from "react";
import { Globe, RefreshCcw, MonitorPlay } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { FieldnotesApp } from "./FieldnotesApp";

export function PreviewPane() {
  const { activeLane } = useWorkspace();

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)]">
      {/* Header */}
      <div className="flex h-10 items-center justify-between border-b border-[var(--border)] px-4 bg-[var(--surface-sidebar)]">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-[var(--muted-foreground)]" />
          <span className="text-xs font-medium text-[var(--muted-foreground)]">
            Preview Environment
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
              activeLane.isDevRunning
                ? "bg-[rgba(34,197,94,0.15)] text-emerald-400 border border-[rgba(34,197,94,0.3)]"
                : "bg-[var(--surface-tertiary)] text-[var(--subtle-foreground)] border border-[var(--border)]"
            }`}
          >
            {activeLane.isDevRunning ? "Live service" : "Saved preview"}
          </span>
          <div className="flex items-center gap-2 rounded bg-[var(--surface-secondary)] px-2 py-1 text-xs text-[var(--muted-foreground)]">
            <div
              className={`size-1.5 rounded-full ${
                activeLane.isDevRunning ? "bg-emerald-400 animate-pulse" : "bg-[var(--border)]"
              }`}
            />
            <span className="font-mono text-[10px]">localhost:3000</span>
          </div>
          <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            <RefreshCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-[var(--surface-tertiary)] relative">
        {activeLane.isDevRunning ? (
          <div className="h-full w-full relative">
            <FieldnotesApp />
            <div className="absolute top-2 right-2 rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-mono text-emerald-400 pointer-events-none">
              Live Dev Hot Reload Active
            </div>
          </div>
        ) : (
          <FieldnotesApp />
        )}
      </div>
    </div>
  );
}
