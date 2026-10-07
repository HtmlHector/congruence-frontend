"use client";

import React, { useState } from "react";
import { Globe, RefreshCcw, Lock, ExternalLink, Terminal } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { API_BASE_URL } from "@/lib/api";

export function PreviewPane() {
  const { activeLane, services, setActiveTab, executeTerminalCommand } = useWorkspace();
  const [iframeKey, setIframeKey] = useState(0);

  // Find active service for this lane, or fallback to first active service
  const activeService =
    services.find((s) => s.lane_id === activeLane?.id && s.is_active) ||
    services.find((s) => s.is_active) ||
    services[0];

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const previewUrl = activeService
    ? `${API_BASE_URL.replace("/api/v1", "")}${activeService.url}`
    : null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)]">
      {/* Header Chrome */}
      <div className="flex h-10 items-center justify-between border-b border-[var(--border)] px-4 bg-[var(--surface-sidebar)]">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-[var(--muted-foreground)]" />
          <span className="text-xs font-medium text-[var(--muted-foreground)]">
            Service Address
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
              activeService?.is_active
                ? "bg-[rgba(34,197,94,0.15)] text-emerald-400 border border-[rgba(34,197,94,0.3)]"
                : "bg-[var(--surface-tertiary)] text-[var(--subtle-foreground)] border border-[var(--border)]"
            }`}
          >
            {activeService?.is_active ? "Live HTTPS Service" : "No listening port"}
          </span>
          <div className="flex items-center gap-2 rounded bg-[var(--surface-secondary)] px-2.5 py-1 text-xs text-[var(--muted-foreground)] border border-[var(--border-subtle)]">
            <Lock className="size-3 text-emerald-400" />
            <span className="font-mono text-[10px] text-[var(--foreground)]">
              {activeService ? `Port ${activeService.port} · private` : "idle"}
            </span>
          </div>
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
              title="Open preview in new window"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
          <button
            onClick={handleRefresh}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
            title="Refresh preview"
          >
            <RefreshCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Preview Frame or Empty State */}
      <div className="flex-1 overflow-hidden bg-[var(--surface-tertiary)] relative">
        {activeService && activeService.is_active && previewUrl ? (
          <iframe
            key={iframeKey}
            src={previewUrl}
            title="Live Preview"
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center text-lg mb-4 text-[var(--muted-foreground)]">
              <Terminal className="size-5" />
            </div>
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">
              No service listening yet
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] max-w-sm mb-5 leading-relaxed">
              Start your dev server in the terminal (e.g. <code className="bg-[var(--surface-secondary)] px-1 py-0.5 rounded font-mono text-[11px]">npm run dev</code> or <code className="bg-[var(--surface-secondary)] px-1 py-0.5 rounded font-mono text-[11px]">pnpm dev</code>) to bind a port and stream live changes here.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  executeTerminalCommand("npm run dev");
                  setActiveTab("terminal");
                }}
                className="px-3.5 py-1.5 bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] rounded-md transition-colors"
              >
                Run <span className="text-[var(--accent-claude)]">npm run dev</span>
              </button>
              <button
                onClick={() => setActiveTab("terminal")}
                className="px-3.5 py-1.5 bg-[var(--foreground)] text-[var(--background)] text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
              >
                Open Terminal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
