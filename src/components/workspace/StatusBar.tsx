"use client";

import React, { useEffect, useState } from "react";
import { Laptop } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { api, HostUsageData } from "@/lib/api";

export function StatusBar() {
  const { hostState, activeLane, project, services, chats, activeChatId } = useWorkspace();
  const [usage, setUsage] = useState<HostUsageData | null>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const isClaude = activeChat?.harness === "Claude";
  const isCodex = activeChat?.harness === "Codex";
  const isAntigravity = activeChat?.harness === "Antigravity";

  const sessionName =
    activeChat?.title ||
    (isAntigravity
      ? "Google Antigravity"
      : isCodex
      ? "OpenAI Codex"
      : isClaude
      ? "Claude Code"
      : activeLane?.name || "Terminal Shell");

  const activeService = services.find((s) => s.is_active) || services[0];

  // Refresh spend when the project or host state changes (awake time accrues on sleep).
  useEffect(() => {
    if (!project?.id) return;
    let cancelled = false;
    api
      .getHostUsage(project.id)
      .then((data) => {
        if (!cancelled) setUsage(data);
      })
      .catch(() => {
        if (!cancelled) setUsage(null);
      });
    return () => {
      cancelled = true;
    };
  }, [project?.id, hostState]);

  return (
    <footer className="flex h-7 w-full shrink-0 items-center justify-between border-t border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#0E0E12] px-3 font-sans text-[11px] text-zinc-500 dark:text-zinc-400 select-none rounded-[3.5px]">
      {/* Left: Session, Branch, Worktree, Host */}
      <div className="flex items-center gap-3 min-w-0 overflow-x-auto scrollbar-none">
        {/* Session Indicator */}
        <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-medium shrink-0">
          <span className="size-1.5 bg-emerald-500 rounded-full" />
          <span>SESSION: {sessionName}</span>
        </div>

        <span className="text-zinc-300 dark:text-zinc-700 shrink-0">|</span>

        {/* Branch */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-zinc-400">BRANCH:</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{activeLane?.branch || "main"}</span>
        </div>

        <span className="text-zinc-300 dark:text-zinc-700 shrink-0">|</span>

        {/* Worktree Repo */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 truncate">
          <span className="text-zinc-400">WORKTREE:</span>
          <span className="text-zinc-700 dark:text-zinc-300 truncate">{project?.repo_full_name || project?.name || "No Active Repo"}</span>
        </div>

        <span className="hidden md:inline text-zinc-300 dark:text-zinc-700 shrink-0">|</span>

        {/* Host Status */}
        <div className="hidden md:flex items-center gap-1.5 text-zinc-500 shrink-0">
          <Laptop className="size-3" />
          <span>HOST: Local Runner</span>
          <span
            className={`size-1.5 rounded-full ${
              hostState === "awake"
                ? "bg-emerald-500"
                : hostState === "waking" || hostState === "sleeping"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-zinc-400"
            }`}
          />
          <span className="text-zinc-500 dark:text-zinc-400">
            {hostState === "waking"
              ? "waking…"
              : hostState === "sleeping"
                ? "sleeping…"
                : hostState === "asleep"
                  ? "asleep"
                  : "awake"}
          </span>
        </div>
      </div>

      {/* Right: Write Lease Active Badge & Port */}
      <div className="flex items-center gap-3 shrink-0 ml-2">
        {usage && (
          <span title="Estimated from awake time this month" className="text-zinc-500 dark:text-zinc-400">
            {`~$${usage.estimated_cost_usd_month.toFixed(2)}/mo · ${(usage.awake_seconds_month / 3600).toFixed(1)}h awake`}
          </span>
        )}
        {activeService && (
          <span className="hidden lg:inline text-zinc-400">
            Port {activeService.port} · HTTPS
          </span>
        )}
        <span className="px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold rounded-[3.5px]">
          WRITE LEASE ACTIVE
        </span>
      </div>
    </footer>
  );
}
