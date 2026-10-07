"use client";

import React from "react";
import { X, ShieldCheck, Server, Key, DollarSign } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function ProductInfoModal() {
  const { isProductModalOpen, setIsProductModalOpen } = useWorkspace();

  if (!isProductModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-primary)] p-6 shadow-2xl space-y-6 text-xs text-[var(--foreground)]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
              Architecture & Invariants
            </span>
            <h3 className="text-base font-medium text-[var(--foreground)] mt-0.5">
              congruence.dev System Brief
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsProductModalOpen(false)}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* 4 Pillars Summary */}
        <div className="space-y-3.5">
          <div className="flex items-start gap-3 rounded border border-[var(--border)] bg-[var(--surface-secondary)]/40 p-3">
            <Server className="size-4 text-[var(--accent-claude)] shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-[11px] text-[var(--foreground)]">
                Three-Plane Architecture
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                Vercel/Postgres control plane, Fly.io WebSocket gateway for streaming PTYs, and Fly Sprites persistent microVMs with wake-on-request.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded border border-[var(--border)] bg-[var(--surface-secondary)]/40 p-3">
            <Key className="size-4 text-[var(--status-awake)] shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-[11px] text-[var(--foreground)]">
                Account Custody (Zero Token Resale)
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                The Vault injects your Claude Max, OpenAI, and GitHub tokens directly into $HOME on the host. You are billed directly by AI providers without markups.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded border border-[var(--border)] bg-[var(--surface-secondary)]/40 p-3">
            <ShieldCheck className="size-4 text-[var(--accent-info)] shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-[11px] text-[var(--foreground)]">
                Watch First. Grant When Needed.
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                Anyone invited can observe terminals and test HTTPS preview links. Write leases are explicit, scoped to dedicated git worktrees, and revocable.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded border border-[var(--border)] bg-[var(--surface-secondary)]/40 p-3">
            <DollarSign className="size-4 text-[var(--accent-amber)] shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-[11px] text-[var(--foreground)]">
                Transparent Pricing
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                $49/mo per writer; unlimited free watchers. Awake compute passes through at ~$0.12/day.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setIsProductModalOpen(false)}
            className="rounded-[var(--radius-sm)] bg-[var(--foreground)] px-4 py-1.5 font-sans text-xs font-medium text-[var(--background)] hover:bg-[var(--primary-hover)] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
