/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Terminal, Globe, GitBranch, Layers, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";
import { ClaudeIcon, AntigravityIcon, OpenAIIcon } from "@/components/ui/brand-icons";

export function LandingHero() {
  const [activeTab, setActiveTab] = useState<"congruence" | "fragmented">("congruence");

  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[var(--border)] bg-[var(--background)]">
      {/* Subtle geometric hairline background grid */}
      <div 
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Subtag Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-[3.5px] border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]">
            <span className="size-1.5 rounded-[3.5px] bg-[var(--accent-codex)]" />
            <span>Multi-Agent Workspace · Browser Native</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-4 mb-8">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[var(--foreground)] leading-[1.12]">
            The AI coding workspace
            <br />
            <span className="text-[var(--foreground)]">anyone on your team can run.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-[var(--muted-foreground)] leading-relaxed font-normal pt-2">
            Turn any GitHub repo into a shared browser workspace. Run <strong className="text-[var(--foreground)] font-medium">Claude Code</strong>, <strong className="text-[var(--foreground)] font-medium">Google Antigravity</strong>, and <strong className="text-[var(--foreground)] font-medium">OpenAI Codex</strong> on isolated parallel lanes with an instant live web preview. No local setup required.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link
            href="/u2XIBWLrbdEamg45Nq"
            className="group flex h-11 items-center justify-center gap-2 rounded-[3.5px] bg-[var(--foreground)] px-6 text-xs sm:text-sm font-mono font-medium text-[var(--background)] hover:bg-[var(--primary-hover)] transition-all w-full sm:w-auto shadow-sm"
          >
            <span>Open Shared Workspace</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#workspace-preview"
            className="flex h-11 items-center justify-center gap-2 rounded-[3.5px] border border-[var(--border)] bg-[var(--surface-primary)] px-6 text-xs sm:text-sm font-mono text-[var(--foreground)] hover:bg-[var(--surface-secondary)] hover:border-[var(--border-strong)] transition-all w-full sm:w-auto"
          >
            <span>Interactive Simulator</span>
            <ArrowUpRight className="size-3.5 text-[var(--muted-foreground)]" />
          </a>
        </div>

        {/* Supported Frontier Agents Bar */}
        <div className="mb-14 border border-[var(--border)] bg-[var(--surface-primary)] p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
            <span className="text-[var(--muted-foreground)] uppercase tracking-wider text-[10px]">
              Supported Frontier Agents & Engines:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[var(--foreground)]">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">
                <ClaudeIcon className="size-3.5 text-[var(--accent-claude)]" />
                <span className="font-medium text-[11px]">Claude Code</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">
                <AntigravityIcon className="size-3.5 text-[var(--accent-antigravity)]" />
                <span className="font-medium text-[11px]">Google Antigravity</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">
                <OpenAIIcon className="size-3.5 text-[var(--accent-codex)]" />
                <span className="font-medium text-[11px]">OpenAI Codex</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">
                <Globe className="size-3.5 text-blue-400" />
                <span className="font-medium text-[11px]">Live Chromium Preview</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">
                <GitBranch className="size-3.5 text-amber-400" />
                <span className="font-medium text-[11px]">Zero-Collision Worktrees</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Comparison Card (The Broken Way vs The Congruence Way) */}
        <div className="border border-[var(--border)] bg-[var(--surface-primary)]">
          {/* Card Header Strip with Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[var(--border)] bg-[var(--surface-sidebar)] px-4 py-2.5 gap-2">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-[3.5px] bg-[var(--accent-codex)]" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--foreground)] font-medium">
                Workflow Contrast
              </span>
            </div>
            {/* Mode Switcher Buttons */}
            <div className="flex items-center border border-[var(--border)] bg-[var(--background)]">
              <button
                onClick={() => setActiveTab("congruence")}
                className={`px-3 py-1 font-mono text-[11px] transition-all rounded-[3.5px] ${
                  activeTab === "congruence"
                    ? "bg-[var(--surface-secondary)] text-[var(--foreground)] font-medium border-r border-[var(--border)] shadow-inner"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-r border-[var(--border)]"
                }`}
              >
                ⚡ The Congruence Way
              </button>
              <button
                onClick={() => setActiveTab("fragmented")}
                className={`px-3 py-1 font-mono text-[11px] transition-all rounded-[3.5px] ${
                  activeTab === "fragmented"
                    ? "bg-[var(--surface-secondary)] text-[var(--foreground)] font-medium shadow-inner"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                ❌ The Fragmented Way
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6">
            {activeTab === "congruence" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[var(--accent-codex)]">
                    <CheckCircle2 className="size-4" />
                    <span className="font-mono text-xs uppercase font-medium">1. Instant Browser URL</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Paste any GitHub URL. Non-technical founders, PMs, and developers immediately get a running sandbox with zero terminal setup or node installations.
                  </p>
                </div>
                <div className="border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[var(--accent-claude)]">
                    <CheckCircle2 className="size-4" />
                    <span className="font-mono text-xs uppercase font-medium">2. Parallel Agent Lanes</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Claude Code works on backend APIs while Google Antigravity styles the frontend in isolated git worktrees. Zero git conflicts or overwritten files.
                  </p>
                </div>
                <div className="border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400">
                    <CheckCircle2 className="size-4" />
                    <span className="font-mono text-xs uppercase font-medium">3. Live Visual Verification</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Click through the running web app side-by-side with your agent chat. See immediate UI updates without switching between 5 separate browser windows.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
                <div className="border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="size-4" />
                    <span className="font-mono text-xs uppercase font-medium">Local Setup Hell</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Requires installing Node, Python, Docker, Homebrew, and matching SDK versions. Non-technical team members are completely blocked.
                  </p>
                </div>
                <div className="border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="size-4" />
                    <span className="font-mono text-xs uppercase font-medium">Git Collisions & Overwrites</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Running two AI agents on the same directory corrupts files, overrides uncommitted changes, and leads to messy merge conflicts.
                  </p>
                </div>
                <div className="border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="size-4" />
                    <span className="font-mono text-xs uppercase font-medium">Blind Terminal Execution</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Agents say "Server started on port 3000", but you cannot see or interact with the UI without manual port forwarding and local browser management.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="border-t border-[var(--border)] bg-[var(--surface-sidebar)] px-4 py-2 flex items-center justify-between text-[11px] font-mono text-[var(--muted-foreground)]">
            <span>ENVIRONMENT: BROWSER_HOSTED · MULTI_LANE</span>
            <span>NO LOCAL DEPENDENCIES NEEDED</span>
          </div>
        </div>
      </div>
    </section>
  );
}
