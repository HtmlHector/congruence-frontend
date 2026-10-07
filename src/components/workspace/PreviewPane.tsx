"use client";

import React from "react";
import { Lock, RotateCw, ExternalLink } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { FieldnotesApp } from "./FieldnotesApp";

export function PreviewPane() {
  const { activeLane, hostState } = useWorkspace();

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-primary)]">
      {/* Browser URL Chrome Bar */}
      <div className="flex h-9 items-center justify-between border-b border-[var(--border)] bg-[var(--surface-secondary)]/60 px-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-inset)] border border-[var(--border)] px-2.5 py-1 text-[11px] font-mono text-[var(--foreground)] w-full">
            <Lock className="size-2.5 text-[var(--muted-foreground)]" />
            <span className="truncate">sample-app.congruence.example</span>
          </div>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-2">
          {activeLane.previewState === "live" && hostState === "awake" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.3)] px-2 py-0.5 font-mono text-[10px] text-[var(--status-awake)]">
              <span className="size-1.5 rounded-full bg-[var(--status-awake)] animate-pulse" />
              Live service
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-tertiary)] border border-[var(--border)] px-2 py-0.5 font-mono text-[10px] text-[var(--muted-foreground)]">
              <span className="size-1.5 rounded-full bg-[var(--muted-foreground)]" />
              Saved preview
            </span>
          )}
        </div>
      </div>

      {/* Rendered Application Body */}
      <div className="relative flex-1 overflow-y-auto">
        {hostState === "asleep" ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-[var(--muted-foreground)] bg-[var(--surface-inset)]">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--subtle-foreground)] mb-2">
              Host Asleep
            </span>
            <p className="text-sm font-medium text-[var(--foreground)] mb-1">
              Dev server suspended
            </p>
            <p className="text-xs max-w-xs">
              Persistent storage is preserved. Click &quot;Wake workspace&quot; above to restore live services.
            </p>
          </div>
        ) : (
          <FieldnotesApp />
        )}
      </div>

      {/* Preview Footer */}
      <div className="flex h-7 items-center justify-between border-t border-[var(--border)]/70 bg-[var(--surface-secondary)]/30 px-3 text-[10px] font-mono text-[var(--subtle-foreground)]">
        <span>Saved sample preview. Run dev to simulate a live service.</span>
        <span>Port 3000 · HTTPS private</span>
      </div>
    </div>
  );
}
