"use client";

import React, { useState } from "react";
import {
  Zap,
  Play,
  Pause,
  Plus,
  Clock,
  GitBranch,
  Bot,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Terminal,
  ShieldCheck,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

interface AutomationRule {
  id: string;
  name: string;
  trigger: "schedule" | "git_push" | "pr_opened" | "task_created";
  triggerLabel: string;
  agent: "claude-code" | "codex" | "aider";
  status: "active" | "paused";
  lastRun: string;
  lastRunStatus: "success" | "failed" | "running";
  prompt: string;
}

export function AutomationsView() {
  const { executeTerminalCommand, setMode } = useWorkspace();
  const [automations, setAutomations] = useState<AutomationRule[]>([
    {
      id: "auto-1",
      name: "Nightly Playwright & Contrast Audit",
      trigger: "schedule",
      triggerLabel: "Every day at 02:00 UTC",
      agent: "claude-code",
      status: "active",
      lastRun: "3 hours ago",
      lastRunStatus: "success",
      prompt: "Run `npx playwright test` and `npm run audit:contrast`. If any test fails, create a worktree lane and fix the failure.",
    },
    {
      id: "auto-2",
      name: "Auto PR Review & Diff Security Gate",
      trigger: "pr_opened",
      triggerLabel: "On pull request opened / synchronized",
      agent: "codex",
      status: "active",
      lastRun: "22 mins ago",
      lastRunStatus: "success",
      prompt: "Analyze the PR diff for secrets leakage, SQL injection vulnerabilities, and accessibility compliance. Post inline feedback.",
    },
    {
      id: "auto-3",
      name: "Background Dead Code & Import Pruner",
      trigger: "schedule",
      triggerLabel: "Every Monday at 09:00 UTC",
      agent: "aider",
      status: "paused",
      lastRun: "5 days ago",
      lastRunStatus: "success",
      prompt: "Find unused exports, orphaned css tokens, and dead component files. Open a draft cleanup PR.",
    },
  ]);

  const [isRunning, setIsRunning] = useState<string | null>(null);

  const toggleStatus = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a
      )
    );
  };

  const runNow = (auto: AutomationRule) => {
    setIsRunning(auto.id);
    setTimeout(() => {
      setIsRunning(null);
      setMode("deck");
      executeTerminalCommand(`claude --prompt "${auto.prompt}"`);
    }, 1000);
  };

  return (
    <div className="flex h-full w-full flex-col bg-[var(--surface-primary)] overflow-y-auto">
      {/* Header Bar */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-6 bg-[var(--surface-sidebar)]/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-tertiary)] border border-[var(--border)] text-[var(--accent-claude)]">
            <Zap className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
              Automations & Background Agents
              <span className="rounded-full bg-[var(--accent-claude)]/10 px-2 py-0.5 text-[10px] font-mono text-[var(--accent-claude)] border border-[var(--accent-claude)]/30">
                {automations.filter((a) => a.status === "active").length} Active
              </span>
            </h1>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Scheduled cron triggers and event webhooks for Claude Code, Codex, and Aider worktrees.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const newRule: AutomationRule = {
                id: `auto-${Date.now()}`,
                name: "New Agent Automation",
                trigger: "schedule",
                triggerLabel: "Every 6 hours",
                agent: "claude-code",
                status: "active",
                lastRun: "Never",
                lastRunStatus: "running",
                prompt: "Run smoke tests and report status.",
              };
              setAutomations([newRule, ...automations]);
            }}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] px-3 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] hover:border-[var(--border-strong)] transition-all"
          >
            <Plus className="size-3.5" />
            <span>Create Automation</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 max-w-5xl space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {automations.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl border border-[var(--border)] bg-[var(--surface-sidebar)] p-4 transition-all hover:border-[var(--border-strong)] hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-tertiary)] border border-[var(--border)] text-[var(--foreground)]">
                    <Bot className="size-4 text-[var(--accent-claude)]" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-[var(--foreground)]">{item.name}</h3>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-mono uppercase ${
                          item.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 text-[var(--subtle-foreground)]" />
                        {item.triggerLabel}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[10px] text-[var(--accent-claude)]">
                        <Bot className="size-3" />
                        {item.agent}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="size-3 text-emerald-400" />
                        Last run: {item.lastRun}
                      </span>
                    </div>

                    <div className="mt-2 rounded-md bg-[var(--surface-primary)] p-2 border border-[var(--border)] font-mono text-[11px] text-[var(--muted-foreground)] line-clamp-2">
                      <span className="text-[var(--accent-claude)]">$</span> {item.prompt}
                    </div>
                  </div>
                </div>

                {/* Automation Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => runNow(item)}
                    disabled={isRunning === item.id}
                    className="flex h-7 items-center gap-1.5 rounded bg-[var(--surface-secondary)] border border-[var(--border)] px-2.5 text-[11px] font-medium text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] hover:text-white transition-colors"
                  >
                    {isRunning === item.id ? (
                      <RotateCw className="size-3 animate-spin text-[var(--accent-claude)]" />
                    ) : (
                      <Play className="size-3 fill-current text-emerald-400" />
                    )}
                    <span>Run in Deck</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleStatus(item.id)}
                    className="flex h-7 items-center gap-1 rounded bg-[var(--surface-secondary)] border border-[var(--border)] px-2 text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {item.status === "active" ? (
                      <>
                        <Pause className="size-3" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="size-3" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
