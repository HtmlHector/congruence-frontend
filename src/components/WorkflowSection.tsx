/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
"use client";

import React from "react";
import { FolderGit2, Bot, MonitorPlay, GitPullRequest, ArrowRight, ShieldCheck } from "lucide-react";
import { ClaudeIcon, AntigravityIcon, OpenAIIcon } from "@/components/ui/brand-icons";

export function WorkflowSection() {
  const steps = [
    {
      num: "01",
      icon: FolderGit2,
      badge: "Zero Local Setup",
      title: "Connect any GitHub repo",
      body: "Paste your GitHub URL. Congruence provisions a cloud sandbox with your runtime and dependencies ready. No Docker, Node, or Python to configure locally.",
    },
    {
      num: "02",
      icon: Bot,
      badge: "Parallel Worktrees",
      title: "Instruct AI agents in plain English",
      body: "Ask Claude Code to build an API, Antigravity to craft the UI, and Codex to write tests. Each agent works on an isolated git branch without file collisions.",
    },
    {
      num: "03",
      icon: MonitorPlay,
      badge: "Real-Time Feedback",
      title: "Interact with the running web app",
      body: "Test changes immediately inside the integrated browser preview. Click buttons, submit forms, and see the UI update live as agents write code.",
    },
    {
      num: "04",
      icon: GitPullRequest,
      badge: "Production Ready",
      title: "Review diffs and ship cleanly",
      body: "Inspect line-by-line visual diffs across all lanes. Create a standard GitHub Pull Request or merge changes without messy terminal conflicts.",
    },
  ];

  return (
    <section id="how-it-works" className="w-full border-t border-[var(--border)] py-20 bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 items-baseline">
          <div className="md:col-span-3">
            <span className="font-mono text-xs text-[var(--muted-foreground)] uppercase tracking-widest block">
              02 / The Workflow
            </span>
          </div>
          <div className="md:col-span-9 max-w-3xl space-y-4">
            <h2 className="text-2xl sm:text-4xl font-medium tracking-tight text-[var(--foreground)] leading-tight">
              From an idea to a running, tested feature in minutes.
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed font-normal">
              Traditional AI coding tools force you to juggle terminal tabs, local port conflicts, and broken node versions. Congruence unifies your repository, frontier AI agents, and a live interactive web preview in one shareable browser window.
            </p>
          </div>
        </div>

        {/* 4-Step High Density Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="group flex flex-col justify-between border border-[var(--border)] bg-[var(--surface-primary)] p-6 transition-all hover:border-[var(--border-strong)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-[var(--accent-claude)] font-medium">
                      STEP {step.num}
                    </span>
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--muted-foreground)]">
                      {step.badge}
                    </span>
                  </div>

                  <div className="size-8 flex items-center justify-center border border-[var(--border)] bg-[var(--surface-sidebar)] mb-4 text-[var(--foreground)]">
                    <Icon className="size-4" />
                  </div>

                  <h3 className="text-sm sm:text-base font-medium text-[var(--foreground)] mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {step.body}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--subtle-foreground)]">
                  <span>Phase {step.num}</span>
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-world team scenario banner */}
        <div className="border border-[var(--border)] bg-[var(--surface-primary)] p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-[var(--accent-codex)]">
                <ShieldCheck className="size-4" />
                <span className="font-mono text-xs uppercase tracking-wider font-medium">
                  Collaborative & Isolated Execution
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-[var(--foreground)]">
                Designed for product managers, founders, and engineers alike.
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                Non-technical team members can prompt agents and test UI without asking developers for help. Developers get full terminal access, git worktrees, and clean diffs ready for review.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--surface-secondary)] border border-[var(--border)]">
                <div className="flex -space-x-1">
                  <span className="size-5 rounded-[3.5px] bg-[var(--surface-tertiary)] border border-[var(--border)] flex items-center justify-center">
                    <ClaudeIcon className="size-3 text-[var(--accent-claude)]" />
                  </span>
                  <span className="size-5 rounded-[3.5px] bg-[var(--surface-tertiary)] border border-[var(--border)] flex items-center justify-center">
                    <AntigravityIcon className="size-3 text-[var(--accent-antigravity)]" />
                  </span>
                  <span className="size-5 rounded-[3.5px] bg-[var(--surface-tertiary)] border border-[var(--border)] flex items-center justify-center">
                    <OpenAIIcon className="size-3 text-[var(--accent-codex)]" />
                  </span>
                </div>
                <span className="font-mono text-xs text-[var(--foreground)]">
                  3 Agents Concurrent
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
