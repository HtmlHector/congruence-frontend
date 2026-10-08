/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
"use client";

import Link from "next/link";
import { Github, Play } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-sm font-medium tracking-tight text-[var(--foreground)]"
          >
            {/* Geometric triple bar icon mark */}
            <div className="flex h-5 w-5 flex-col justify-center gap-[3px] rounded-[3.5px] bg-[var(--surface-tertiary)] p-1 border border-[var(--border)] group-hover:border-[var(--muted-foreground)] transition-colors">
              <span className="h-[2px] w-full rounded-[3.5px] bg-[var(--foreground)]" />
              <span className="h-[2px] w-3/4 rounded-[3.5px] bg-[var(--muted-foreground)]" />
              <span className="h-[2px] w-full rounded-[3.5px] bg-[var(--foreground)]" />
            </div>
            <span className="font-mono text-sm tracking-tight text-[var(--foreground)]">
              congruence<span className="text-[var(--muted-foreground)]">.dev</span>
            </span>
          </Link>

          <span className="hidden text-[11px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] sm:inline-block border-l border-[var(--border)] pl-3">
            Shared Execution Context
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center gap-4 sm:gap-6 text-xs text-[var(--muted-foreground)]">
          <a
            href="#workspace-preview"
            className="hover:text-[var(--foreground)] transition-colors hidden sm:inline-block"
          >
            Interactive Workspace
          </a>
          <a
            href="#how-it-works"
            className="hover:text-[var(--foreground)] transition-colors hidden sm:inline-block"
          >
            How it works
          </a>
          <a
            href="#for-teams"
            className="hover:text-[var(--foreground)] transition-colors hidden md:inline-block"
          >
            For Teams
          </a>
          <a
            href="#the-details"
            className="hover:text-[var(--foreground)] transition-colors hidden sm:inline-block"
          >
            Architecture
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors font-mono text-[11px]"
          >
            <Github className="size-3.5" />
            <span className="hidden md:inline">GitHub</span>
          </a>
          <Link
            href="/sign-in"
            className="hover:text-[var(--foreground)] transition-colors hidden sm:inline-block font-mono text-[11px]"
          >
            Sign in
          </Link>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-1.5 rounded-[3.5px] bg-[var(--foreground)] px-3.5 py-1.5 font-mono text-xs font-medium text-[var(--background)] hover:bg-[var(--primary-hover)] transition-all shadow-sm"
          >
            <Play className="size-3 fill-current" />
            <span>Launch Workspace</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
