"use client";

import React, { useState } from "react";
import {
  GitPullRequest,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Bot,
  MessageSquare,
  FileCode,
  ArrowRight,
  GitMerge,
  Clock,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

interface PullRequestItem {
  id: string;
  number: number;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  author: string;
  authorType: "claude-code" | "codex" | "human";
  status: "open" | "merged" | "draft";
  diffStat: { additions: number; deletions: number; files: number };
  ciStatus: "passed" | "running" | "failed";
  reviews: number;
  createdAt: string;
}

export function PullRequestsView() {
  const { setMode, setActiveTab, switchLane } = useWorkspace();
  const [prs, setPrs] = useState<PullRequestItem[]>([
    {
      id: "pr-1",
      number: 42,
      title: "fix(auth): implement interactive Anthropic device OAuth flow in terminal",
      sourceBranch: "fix/anthropic-device-auth",
      targetBranch: "main",
      author: "Claude Code",
      authorType: "claude-code",
      status: "open",
      diffStat: { additions: 184, deletions: 12, files: 4 },
      ciStatus: "passed",
      reviews: 2,
      createdAt: "18 minutes ago",
    },
    {
      id: "pr-2",
      number: 41,
      title: "feat(preview): route lane proxy through FastAPI dynamic port mapper",
      sourceBranch: "feat/preview-port-proxy",
      targetBranch: "main",
      author: "OpenAI Codex",
      authorType: "codex",
      status: "open",
      diffStat: { additions: 92, deletions: 5, files: 2 },
      ciStatus: "passed",
      reviews: 1,
      createdAt: "1 hour ago",
    },
    {
      id: "pr-3",
      number: 40,
      title: "refactor(tokens): harmonize CSS typography scale and contrast ratios",
      sourceBranch: "refactor/typography-tokens",
      targetBranch: "main",
      author: "admin",
      authorType: "human",
      status: "merged",
      diffStat: { additions: 45, deletions: 38, files: 3 },
      ciStatus: "passed",
      reviews: 3,
      createdAt: "Yesterday",
    },
  ]);

  const viewDiffInDeck = () => {
    setActiveTab("changes");
    setMode("deck");
  };

  return (
    <div className="flex h-full w-full flex-col bg-[var(--surface-primary)] overflow-y-auto">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-6 bg-[var(--surface-sidebar)]/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-tertiary)] border border-[var(--border)] text-[var(--accent-claude)]">
            <GitPullRequest className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
              Pull Requests & Worktree Merges
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                {prs.filter((p) => p.status === "open").length} Open
              </span>
            </h1>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Review agent diffs, CI test suites, and merge isolated Git worktrees into main.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={viewDiffInDeck}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] px-3 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] hover:border-[var(--border-strong)] transition-all"
        >
          <FileCode className="size-3.5 text-[var(--accent-claude)]" />
          <span>Inspect Active Worktree Diff</span>
        </button>
      </div>

      {/* Main List */}
      <div className="p-6 max-w-5xl space-y-3">
        {prs.map((pr) => (
          <div
            key={pr.id}
            className="group rounded-xl border border-[var(--border)] bg-[var(--surface-sidebar)] p-4 transition-all hover:border-[var(--border-strong)] hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-tertiary)] border border-[var(--border)] text-[var(--foreground)]">
                  <GitPullRequest className="size-4 text-[var(--accent-claude)]" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-[var(--subtle-foreground)]">#{pr.number}</span>
                    <h3 className="text-xs font-semibold text-[var(--foreground)]">{pr.title}</h3>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-mono uppercase ${
                        pr.status === "open"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                      }`}
                    >
                      {pr.status}
                    </span>
                  </div>

                  {/* Branches and Author */}
                  <div className="flex items-center gap-3 text-[11px] text-[var(--muted-foreground)] flex-wrap">
                    <span className="flex items-center gap-1 font-mono text-[10px] text-[var(--foreground)] bg-[var(--surface-tertiary)] px-2 py-0.5 rounded border border-[var(--border)]">
                      <GitBranch className="size-3 text-[var(--accent-claude)]" />
                      {pr.sourceBranch}
                    </span>
                    <ArrowRight className="size-3 text-[var(--subtle-foreground)]" />
                    <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                      {pr.targetBranch}
                    </span>

                    <span className="flex items-center gap-1 font-mono text-[10px] text-[var(--accent-claude)]">
                      <Bot className="size-3" />
                      {pr.author}
                    </span>

                    <span className="flex items-center gap-1 text-[10px]">
                      <Clock className="size-3 text-[var(--subtle-foreground)]" />
                      {pr.createdAt}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Stats & Actions */}
              <div className="flex items-center gap-4 shrink-0">
                {/* Diff Stats */}
                <div className="font-mono text-xs text-right">
                  <span className="text-emerald-400 font-medium">+{pr.diffStat.additions}</span>{" "}
                  <span className="text-rose-400 font-medium">−{pr.diffStat.deletions}</span>
                  <div className="text-[10px] text-[var(--subtle-foreground)]">
                    {pr.diffStat.files} files changed
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={viewDiffInDeck}
                    className="flex h-7 items-center gap-1.5 rounded bg-[var(--surface-secondary)] border border-[var(--border)] px-2.5 text-[11px] font-medium text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] transition-colors"
                  >
                    <span>View Diff</span>
                  </button>
                  {pr.status === "open" && (
                    <button
                      type="button"
                      onClick={() => {
                        setPrs((prev) =>
                          prev.map((p) => (p.id === pr.id ? { ...p, status: "merged" } : p))
                        );
                      }}
                      className="flex h-7 items-center gap-1 rounded bg-[var(--surface-secondary)] border border-[var(--border)] px-2.5 text-[11px] font-medium text-purple-300 hover:bg-purple-950/40 hover:border-purple-800 transition-colors"
                    >
                      <GitMerge className="size-3" />
                      <span>Merge</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
