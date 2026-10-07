"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Github,
  CheckCircle2,
  Lock,
  ExternalLink,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { api, IntegrationsStatusData } from "@/lib/api";
import { toast } from "sonner";

interface IntegrationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntegrationsModal({ open, onOpenChange }: IntegrationsModalProps) {
  const { project, projectId, activeLaneId, setActiveTab, setMode, executeTerminalCommand } = useWorkspace();
  const [statusData, setStatusData] = useState<IntegrationsStatusData | null>(null);

  useEffect(() => {
    if (open && projectId) {
      api
        .getIntegrationsStatus(projectId)
        .then(setStatusData)
        .catch((err) => console.error("Failed to load integrations status:", err));
    }
  }, [open, projectId]);

  const handleLaunchHarnessLogin = (harness: "claude" | "codex") => {
    onOpenChange(false);
    setMode("deck");
    setActiveTab("terminal");
    executeTerminalCommand(`${harness} login`);
    toast.success(`${harness} authentication initiated in terminal.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-[var(--surface-primary)] border-[var(--border)] text-[var(--foreground)] sm:rounded-[var(--radius-lg)] p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-[var(--border)] bg-[var(--surface-secondary)]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            <Lock className="size-3.5 text-[var(--accent-claude)]" />
            <span>Connected Integrations & Host Custody</span>
          </div>
          <DialogTitle className="text-xl font-medium tracking-tight text-[var(--foreground)]">
            Repositories & Harness Logins
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--foreground-muted)]">
            Your accounts. Your subscriptions. Credentials are authenticated directly via vendor CLIs and persisted to host NVMe storage without reselling tokens.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. GitHub App & OAuth Integration */}
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-card)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-md bg-[var(--surface-tertiary)] border border-[var(--border)] text-[var(--foreground)]">
                  <Github className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-[var(--foreground)]">GitHub Repository & OAuth</h4>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    {statusData?.github?.username
                      ? `Connected as @${statusData.github.username}`
                      : "Repository access and pull request publisher"}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono ${
                statusData?.github?.connected
                  ? "bg-[rgba(16,185,129,0.12)] text-[var(--accent-codex)] border border-[rgba(16,185,129,0.2)]"
                  : "bg-[var(--surface-tertiary)] text-[var(--muted-foreground)] border border-[var(--border)]"
              }`}>
                {statusData?.github?.connected ? (
                  <>
                    <CheckCircle2 className="size-3" /> Connected
                  </>
                ) : (
                  "Not Connected"
                )}
              </span>
            </div>

            <div className="rounded border border-[var(--border)] bg-[var(--surface-primary)] p-2.5 flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--foreground)]">
                {project?.repo_full_name || "No repository linked"}
              </span>
              <span className="text-[var(--subtle-foreground)] text-[10px]">
                branch: {project?.default_branch || "main"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[11px] text-[var(--muted-foreground)]">
                Publication is Git: pull requests without a second source of truth.
              </span>
              {statusData?.github?.install_url && (
                <a
                  href={statusData.github.install_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[var(--accent-claude)] hover:underline"
                >
                  <span>Reauthorize GitHub App</span>
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          </div>


          {/* 2. Anthropic Claude Code */}
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-card)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-md bg-[rgba(232,128,74,0.12)] border border-[rgba(232,128,74,0.25)] text-[var(--accent-claude)] font-bold text-sm">
                  C
                </div>
                <div>
                  <h4 className="text-xs font-medium text-[var(--foreground)]">Claude Code CLI</h4>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Anthropic Pro / Max subscription custody
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchHarnessLogin("claude")}
                className="px-3 py-1 bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] border border-[var(--border)] text-xs text-[var(--foreground)] rounded-md transition-colors"
              >
                Authenticate via Terminal
              </button>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Runs <code className="font-mono text-[10px] bg-[var(--surface-secondary)] px-1 py-0.5 rounded">claude login</code> directly on the host VM. Session tokens persist across host sleep cycles in <code className="font-mono text-[10px] bg-[var(--surface-secondary)] px-1 py-0.5 rounded">~/.claude.json</code>.
            </p>
          </div>

          {/* 3. OpenAI Codex */}
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-card)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm">
                  O
                </div>
                <div>
                  <h4 className="text-xs font-medium text-[var(--foreground)]">OpenAI Codex CLI</h4>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    OpenAI Plus / Team account custody
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchHarnessLogin("codex")}
                className="px-3 py-1 bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] border border-[var(--border)] text-xs text-[var(--foreground)] rounded-md transition-colors"
              >
                Authenticate via Terminal
              </button>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Runs <code className="font-mono text-[10px] bg-[var(--surface-secondary)] px-1 py-0.5 rounded">codex login</code> on the host VM.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
