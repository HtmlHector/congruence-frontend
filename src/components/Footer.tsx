/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
"use client";

import React from "react";
import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--surface-sidebar)] py-12 text-xs text-[var(--muted-foreground)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[var(--border-subtle)] pb-8">
          {/* Logo & Tagline */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-4 w-4 flex-col justify-center gap-[2px] rounded-[3.5px] bg-[var(--surface-tertiary)] p-0.5 border border-[var(--border)]">
                <span className="h-[1.5px] w-full rounded-[3.5px] bg-[var(--foreground)]" />
                <span className="h-[1.5px] w-3/4 rounded-[3.5px] bg-[var(--muted-foreground)]" />
                <span className="h-[1.5px] w-full rounded-[3.5px] bg-[var(--foreground)]" />
              </div>
              <span className="font-mono text-sm tracking-tight text-[var(--foreground)] font-medium">
                congruence<span className="text-[var(--muted-foreground)]">.dev</span>
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              The repository, frontier AI agents, and live preview in one shared browser workspace.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px]">
            <a
              href="#workspace-preview"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              Simulator
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              Workflow
            </a>
            <a
              href="#for-teams"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              For Teams
            </a>
            <a
              href="#the-details"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              FAQ
            </a>
            <Link
              href="/u2XIBWLrbdEamg45Nq"
              className="hover:text-[var(--foreground)] transition-colors text-[var(--foreground)] font-medium"
            >
              Open Workspace ↗
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[var(--subtle-foreground)]">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-[3.5px] bg-[var(--status-awake)] animate-pulse" />
            <span>Operational · BYOK Zero Proxy Custody</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Congruence Dev. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
