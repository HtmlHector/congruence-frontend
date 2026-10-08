/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ClaudeIcon, OpenAIIcon, AntigravityIcon } from "@/components/ui/brand-icons";
import { GitBranch, GitFork, Sparkles, Terminal, ArrowRight, Loader2, Folder, Check } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

interface NewWorktreeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetProjectId?: string;
}

export function NewWorktreeModal({
  open,
  onOpenChange,
  targetProjectId,
}: NewWorktreeModalProps) {
  const { projects, projectId, project, createWorktree, switchProject } = useWorkspace();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(targetProjectId || projectId || "");
  const [branchName, setBranchName] = useState<string>("");
  const [baseBranch, setBaseBranch] = useState<string>("main");
  const [harness, setHarness] = useState<"Claude" | "Codex" | "Antigravity" | "Shell">("Claude");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedProjectId(targetProjectId || projectId || "");
      setBranchName("");
      setErrorMsg(null);
    }
  }, [open, targetProjectId, projectId]);

  const activeProj = projects.find((p) => p.id === selectedProjectId) || project;

  const handleBranchPreset = (prefix: string) => {
    if (!branchName.startsWith(prefix)) {
      setBranchName(`${prefix}${branchName.replace(/^(feat\/|fix\/|agent\/|test\/|refactor\/)/, "")}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBranch = branchName.trim();
    if (!cleanBranch) {
      setErrorMsg("Please enter a valid branch name for the new worktree.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (selectedProjectId && selectedProjectId !== projectId) {
        await switchProject(selectedProjectId);
      }
      await createWorktree(cleanBranch, selectedProjectId, harness);
      onOpenChange(false);
      setBranchName("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create worktree. Please check branch name.");
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
                <GitBranch className="size-3.5" />
              </span>
              <DialogTitle className="text-sm font-semibold text-[var(--foreground)] tracking-tight">
                Create Isolated Git Worktree
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[var(--muted-foreground)]">
              Spawns an independent Git worktree directory on disk for concurrent agent or human development without file collisions.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Target Project Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
              Target Project / Repository
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {projects.map((p) => {
                const isSelected = p.id === selectedProjectId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`flex items-center justify-between p-2.5 rounded-[3.5px] border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[var(--foreground)] bg-[var(--surface-secondary)] font-medium text-[var(--foreground)]"
                        : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Folder className="size-3.5 shrink-0 text-zinc-500" />
                      <span className="truncate text-xs font-mono">{p.name}</span>
                    </div>
                    {isSelected && <Check className="size-3 text-emerald-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Worktree Branch Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                New Worktree Branch Name
              </label>
              <div className="flex items-center gap-1">
                {["feat/", "fix/", "agent/", "refactor/"].map((prefix) => (
                  <button
                    key={prefix}
                    type="button"
                    onClick={() => handleBranchPreset(prefix)}
                    className="px-1.5 py-0.5 font-mono text-[9px] bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border)] transition-colors rounded-[3.5px]"
                  >
                    {prefix}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2 focus-within:border-[var(--border-strong)] rounded-[3.5px]">
              <GitFork className="size-3.5 text-zinc-500 mr-2 shrink-0" />
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. feat/payment-flow or agent/auth-refactor"
                className="w-full bg-transparent border-none outline-none font-mono text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                autoFocus
              />
            </div>
          </div>

          {/* Base Branch Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
              Base Branch (Fork from)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 border border-[var(--border)] bg-[var(--surface-card)] font-mono text-xs text-[var(--foreground)] w-full">
                <GitBranch className="size-3 text-emerald-500" />
                <span>main (default worktree branch)</span>
              </div>
            </div>
          </div>

          {/* Initial Agent Harness / Driver */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
              Initial Agent or Shell Driver
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Claude */}
              <button
                type="button"
                onClick={() => setHarness("Claude")}
                className={`flex flex-col items-start p-2.5 rounded-[3.5px] border text-left transition-all cursor-pointer ${
                  harness === "Claude"
                    ? "border-[rgba(232,128,74,0.6)] bg-[var(--accent-claude-subtle)] text-[var(--foreground)] font-medium"
                    : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <ClaudeIcon className="size-3.5 text-[var(--accent-claude)]" />
                  <span className="text-xs">Claude Code</span>
                </div>
                <span className="text-[10px] text-[var(--muted-foreground)]">Anthropic Sonnet</span>
              </button>

              {/* Antigravity */}
              <button
                type="button"
                onClick={() => setHarness("Antigravity")}
                className={`flex flex-col items-start p-2.5 rounded-[3.5px] border text-left transition-all cursor-pointer ${
                  harness === "Antigravity"
                    ? "border-indigo-500/60 bg-indigo-500/10 text-[var(--foreground)] font-medium"
                    : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <AntigravityIcon className="size-3.5 text-indigo-500" />
                  <span className="text-xs">Antigravity</span>
                </div>
                <span className="text-[10px] text-[var(--muted-foreground)]">DeepMind Gemini</span>
              </button>

              {/* Codex */}
              <button
                type="button"
                onClick={() => setHarness("Codex")}
                className={`flex flex-col items-start p-2.5 rounded-[3.5px] border text-left transition-all cursor-pointer ${
                  harness === "Codex"
                    ? "border-emerald-500/60 bg-emerald-500/10 text-[var(--foreground)] font-medium"
                    : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <OpenAIIcon className="size-3.5 text-emerald-500" />
                  <span className="text-xs">OpenAI Codex</span>
                </div>
                <span className="text-[10px] text-[var(--muted-foreground)]">GPT Reasoning</span>
              </button>

              {/* Shell */}
              <button
                type="button"
                onClick={() => setHarness("Shell")}
                className={`flex flex-col items-start p-2.5 rounded-[3.5px] border text-left transition-all cursor-pointer ${
                  harness === "Shell"
                    ? "border-zinc-400 bg-[var(--surface-secondary)] text-[var(--foreground)] font-medium"
                    : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Terminal className="size-3.5 text-zinc-400" />
                  <span className="text-xs">Human Shell</span>
                </div>
                <span className="text-[10px] text-[var(--muted-foreground)]">Interactive PTY</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
              Disk: <code className="text-[var(--foreground)]">/worktrees/{branchName ? branchName.replace(/[^a-zA-Z0-9_-]/g, "-") : "new"}</code>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-3 py-1.5 text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded-[3.5px]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !branchName.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--primary-hover)] text-xs font-mono font-medium disabled:opacity-40 transition-all rounded-[3.5px] shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Creating Worktree...</span>
                  </>
                ) : (
                  <>
                    <span>Create Worktree</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
