"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, CornerDownLeft, Trash2 } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function TerminalPane() {
  const { activeLane, hostState } = useWorkspace();
  const [cmdInput, setCmdInput] = useState("");
  const [extraLogs, setExtraLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeLane.terminalLogs, extraLogs]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = cmdInput.trim();
    if (!trimmed) return;

    const userPrompt = `admin@congruence:~/sample-app (${activeLane.branch})$ ${trimmed}`;
    let response: string[] = [];

    if (trimmed === "clear") {
      setExtraLogs([]);
      setCmdInput("");
      return;
    } else if (trimmed === "git status") {
      response = [
        `On branch ${activeLane.branch}`,
        `Your branch is up to date with origin.`,
        activeLane.changesCount > 0
          ? `Changes not staged for commit: (${activeLane.changesCount} file modified)`
          : `nothing to commit, working tree clean`,
      ];
    } else if (trimmed.startsWith("git worktree")) {
      response = [
        `/repo                      [main]`,
        `/lanes/claude-progress     [claude/progress]`,
        `/lanes/codex-copy          [codex/copy]`,
      ];
    } else if (trimmed === "pnpm dev" || trimmed === "npm run dev") {
      response = [
        `[vite] dev server running at:`,
        `> Local:    http://localhost:3000/`,
        `> Rewritten to Private HTTPS: https://sample-app.congruence.example`,
      ];
    } else if (trimmed.includes("claude")) {
      response = [
        `[Claude Code 1.0.12] Authenticated via Vault.`,
        `Ready for instructions on branch ${activeLane.branch}.`,
      ];
    } else {
      response = [`congruence: command executed in worktree (${activeLane.branch}): ${trimmed}`];
    }

    setExtraLogs((prev) => [...prev, userPrompt, ...response]);
    setCmdInput("");
  };

  const allLogs = [...activeLane.terminalLogs, ...extraLogs];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[#08080A] font-mono text-xs text-[var(--foreground)]">
      {/* Terminal Title Bar */}
      <div className="flex h-8 items-center justify-between border-b border-[var(--border)] bg-[var(--surface-secondary)]/40 px-3 text-[11px] text-[var(--muted-foreground)]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="size-3 text-[var(--accent-claude)]" />
          <span>PTY 1 · {activeLane.branch}</span>
        </div>
        <button
          type="button"
          onClick={() => setExtraLogs([])}
          title="Clear screen"
          className="hover:text-[var(--foreground)] transition-colors p-1"
        >
          <Trash2 className="size-3" />
        </button>
      </div>

      {/* Terminal Output Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin select-text">
        <div className="text-[11px] text-[var(--subtle-foreground)] mb-2">
          Fly Sprite microVM session attached · persistent NVMe mounted at /repo
        </div>
        {allLogs.map((log, i) => {
          const isUrl = log.includes("https://");
          const isPrompt = log.startsWith("admin@") || log.startsWith("claude@") || log.startsWith("codex@");

          return (
            <div
              key={i}
              className={`leading-relaxed ${
                isPrompt
                  ? "text-[var(--foreground)] font-medium pt-1"
                  : isUrl
                  ? "text-[var(--status-awake)] font-medium"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              {log}
            </div>
          );
        })}
      </div>

      {/* Interactive Command Input */}
      <form
        onSubmit={handleCommand}
        className="flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-inset)] px-3 py-2"
      >
        <span className="text-[var(--accent-claude)] font-bold">›</span>
        <input
          type="text"
          value={cmdInput}
          onChange={(e) => setCmdInput(e.target.value)}
          placeholder={
            activeLane.currentWriter === "You"
              ? "Type shell or agent command (e.g. pnpm dev, git status)..."
              : `Observation mode · ${activeLane.currentWriter} holds write lease`
          }
          disabled={activeLane.currentWriter !== "You" || hostState === "asleep"}
          className="flex-1 bg-transparent font-mono text-xs text-[var(--foreground)] placeholder:text-[var(--subtle-foreground)] focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!cmdInput.trim() || activeLane.currentWriter !== "You"}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-20 transition-colors"
        >
          <CornerDownLeft className="size-3.5" />
        </button>
      </form>
    </div>
  );
}
