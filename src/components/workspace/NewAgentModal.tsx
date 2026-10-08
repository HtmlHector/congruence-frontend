"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ClaudeIcon, AnthropicIcon, OpenAIIcon, AntigravityIcon } from "@/components/ui/brand-icons";
import { Sparkles, Terminal, GitBranch, ArrowRight, ShieldCheck } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

interface NewAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultHarness?: "Claude" | "Codex" | "Antigravity" | "Pair";
}

export function NewAgentModal({
  open,
  onOpenChange,
  defaultHarness = "Claude",
}: NewAgentModalProps) {
  const { submitPrompt, project } = useWorkspace();
  const [harness, setHarness] = useState<"Claude" | "Codex" | "Antigravity" | "Pair">(defaultHarness);
  const [taskName, setTaskName] = useState("");
  const [promptInput, setPromptInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const taskText = promptInput.trim() || taskName.trim() || "new-task";
    setIsSubmitting(true);
    try {
      await submitPrompt(taskText, harness === "Pair" ? "Pair" : harness, "default", "default");
      setTaskName("");
      setPromptInput("");
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to spin up agent:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-[var(--surface-primary)] border border-[var(--border)] text-[var(--foreground)] p-0 overflow-hidden shadow-2xl rounded-[3.5px] select-none">
        {/* Header */}
        <div className="border-b border-[var(--border)] px-5 py-4 bg-[var(--surface-secondary)]">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-[3.5px] bg-[var(--accent-claude-subtle)] text-[var(--accent-claude)] border border-[rgba(232,128,74,0.3)]">
                <Sparkles className="size-3.5" />
              </span>
              <DialogTitle className="text-sm font-semibold text-[var(--foreground)] tracking-tight">
                Spin Up Agent Worktree
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[var(--muted-foreground)]">
              Spawns an isolated git worktree in <span className="font-mono text-[var(--foreground)]">{project?.repo_full_name || "repository"}</span> with its own branch, live dev server, and agent PTY.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Harness Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
              Agent Harness
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Claude Code */}
              <button
                type="button"
                onClick={() => setHarness("Claude")}
                className={`flex flex-col items-start p-2.5 rounded-[3.5px] border text-left transition-all cursor-pointer ${
                  harness === "Claude"
                    ? "border-[rgba(232,128,74,0.5)] bg-[var(--accent-claude-subtle)] text-[var(--foreground)] shadow-2xs"
                    : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <ClaudeIcon className="size-3.5 text-[var(--accent-claude)]" />
                  <span className="text-xs font-semibold">Claude</span>
                </div>
                <span className="text-[10px] text-[var(--muted-foreground)] leading-snug">
                  Anthropic CLI
                </span>
              </button>

              {/* OpenAI Codex */}
              <button
                type="button"
                onClick={() => setHarness("Codex")}
                className={`flex flex-col items-start p-2.5 rounded-[3.5px] border text-left transition-all cursor-pointer ${
                  harness === "Codex"
                    ? "border-[rgba(16,185,129,0.5)] bg-[var(--accent-codex-subtle)] text-[var(--foreground)] shadow-2xs"
                    : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <OpenAIIcon className="size-3.5 text-[var(--status-awake)]" />
                  <span className="text-xs font-semibold">Codex</span>
                </div>
                <span className="text-[10px] text-[var(--muted-foreground)] leading-snug">
                  OpenAI runner
                </span>
              </button>

              {/* Google Antigravity */}
              <button
                type="button"
                onClick={() => setHarness("Antigravity")}
                className={`flex flex-col items-start p-2.5 rounded-[3.5px] border text-left transition-all cursor-pointer ${
                  harness === "Antigravity"
                    ? "border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/30 text-[var(--foreground)] shadow-2xs"
                    : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <AntigravityIcon className="size-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span className="text-xs font-semibold">Antigravity</span>
                </div>
                <span className="text-[10px] text-[var(--muted-foreground)] leading-snug">
                  Google DeepMind
                </span>
              </button>

              {/* Pair Worktree */}
              <button
                type="button"
                onClick={() => setHarness("Pair")}
                className={`flex flex-col items-start p-2.5 rounded-[3.5px] border text-left transition-all cursor-pointer ${
                  harness === "Pair"
                    ? "border-[var(--border-strong)] bg-[var(--wash-strong)] text-[var(--foreground)] shadow-2xs"
                    : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Terminal className="size-3.5 text-[var(--foreground)]" />
                  <span className="text-xs font-semibold">Pair Shell</span>
                </div>
                <span className="text-[10px] text-[var(--muted-foreground)] leading-snug">
                  Human worktree
                </span>
              </button>
            </div>
          </div>

          {/* Task / Branch Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] flex items-center justify-between">
              <span>Task / Branch Slug</span>
              <span className="text-[10px] lowercase text-[var(--muted-foreground)] font-normal">
                {harness.toLowerCase()}/&lt;slug&gt;
              </span>
            </label>
            <div className="relative">
              <GitBranch className="absolute left-3 top-2.5 size-3.5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g. fix-checkout-stripe, refactor-auth"
                className="w-full rounded-[3.5px] border border-[var(--border)] bg-[var(--surface-card)] pl-8 pr-3 py-1.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--border-strong)] focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Initial Prompt (Optional for Pair, Primary for Agents) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
              Initial Agent Prompt (Optional)
            </label>
            <textarea
              rows={3}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="What should this agent investigate or build in its worktree?"
              className="w-full resize-none rounded-[3.5px] border border-[var(--border)] bg-[var(--surface-card)] p-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--border-strong)] focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-mono text-[var(--muted-foreground)] mr-1">
              Presets:
            </span>
            {[
              "Run test suite and fix failures",
              "Refactor component styles",
              "Add webhook handler",
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setPromptInput(preset)}
                className="text-[10px] px-2 py-0.5 rounded-[3.5px] bg-[var(--wash)] text-[var(--foreground)] hover:bg-[var(--wash-strong)] transition-colors border border-[var(--border-subtle)] cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              <span>Isolated worktree & port</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-[3.5px] px-3 py-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-[3.5px] bg-[var(--foreground)] text-[var(--background)] px-3.5 py-1.5 text-xs font-medium hover:opacity-90 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? "Spinning up..." : "Spin Up Agent"}</span>
                <ArrowRight className="size-3" />
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
