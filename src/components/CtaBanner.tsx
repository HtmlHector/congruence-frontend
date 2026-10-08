/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Play, ShieldCheck, Sparkles } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="w-full border-t border-[var(--border)] py-20 bg-[var(--surface-inset)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="border border-[var(--border)] bg-[var(--surface-primary)] p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          
          {/* Subtle accent corner border */}
          <div className="absolute top-0 right-0 size-8 border-t-2 border-r-2 border-[var(--accent-claude)]" />
          <div className="absolute bottom-0 left-0 size-8 border-b-2 border-l-2 border-[var(--accent-codex)]" />

          <div className="inline-flex items-center gap-2 rounded-[3.5px] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]">
            <span className="size-1.5 rounded-[3.5px] bg-[var(--accent-codex)] animate-pulse" />
            <span>Instant Cloud Sandbox</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[var(--foreground)] leading-tight max-w-3xl mx-auto">
            Your repository. Your AI agents.
            <br />
            The running app. In one shared link.
          </h2>

          <p className="text-sm sm:text-base text-[var(--muted-foreground)] max-w-xl mx-auto font-normal">
            No terminal setup, no git merge conflicts, and no local machine overhead. Bring your GitHub repository and build immediately.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/workspace"
              className="group flex h-11 items-center justify-center gap-2 rounded-[3.5px] bg-[var(--foreground)] px-8 text-xs sm:text-sm font-mono font-medium text-[var(--background)] hover:bg-[var(--primary-hover)] transition-all w-full sm:w-auto shadow-sm"
            >
              <Play className="size-3.5 fill-current" />
              <span>Launch Shared Workspace</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#workspace-preview"
              className="flex h-11 items-center justify-center gap-2 rounded-[3.5px] border border-[var(--border)] bg-[var(--surface-secondary)] px-6 text-xs sm:text-sm font-mono text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] transition-all w-full sm:w-auto"
            >
              <span>Explore Live Preview</span>
            </a>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-[11px] font-mono text-[var(--subtle-foreground)]">
            <span>✓ No local dependencies</span>
            <span>✓ Bring your own keys</span>
            <span>✓ Works on any browser</span>
          </div>

        </div>
      </div>
    </section>
  );
}
