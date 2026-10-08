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
  SquareTerminal,
  KeyRound,
} from "lucide-react";
import { AnthropicIcon, OpenAIIcon, AntigravityIcon } from "@/components/ui/brand-icons";
import { useWorkspace } from "@/context/WorkspaceContext";
import { api, IntegrationsStatusData, SupportedHarness } from "@/lib/api";
import { HARNESS_LOGIN_COMMANDS, HARNESS_LOGIN_HINTS } from "@/lib/harness-login";
import { toast } from "sonner";

interface IntegrationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface HarnessLoginCardProps {
  name: SupportedHarness;
  icon: React.ReactNode;
  accentClass: string;
  title: string;
  subtitle: string;
  detail: React.ReactNode;
  statusData: IntegrationsStatusData | null;
  onLogin: (harness: SupportedHarness) => void;
}

function HarnessLoginCard({
  name,
  icon,
  accentClass,
  title,
  subtitle,
  detail,
  statusData,
  onLogin,
}: HarnessLoginCardProps) {
  const state = statusData?.harnesses?.[name]?.state ?? "disconnected";
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-card)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`flex size-8 items-center justify-center rounded-md border ${accentClass}`}>
            {icon}
          </div>
          <div>
            <h4 className="text-xs font-medium text-[var(--foreground)]">
              {title}{" "}
              {state === "connected" && (
                <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-[rgba(16,185,129,0.12)] px-1.5 py-0.5 text-[9px] font-mono text-emerald-400 border border-[rgba(16,185,129,0.2)] align-middle">
                  <CheckCircle2 className="size-2.5" /> Connected
                </span>
              )}
              {state === "awaiting_user" && (
                <span className="ml-1.5 inline-flex items-center rounded-full bg-[rgba(232,128,74,0.12)] px-1.5 py-0.5 text-[9px] font-mono text-[var(--accent-claude)] border border-[rgba(232,128,74,0.2)] align-middle">
                  Awaiting sign-in
                </span>
              )}
            </h4>
            <p className="text-[11px] text-[var(--muted-foreground)]">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onLogin(name)}
          className="px-3 py-1 bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] border border-[var(--border)] text-xs text-[var(--foreground)] rounded-md transition-colors cursor-pointer whitespace-nowrap"
        >
          Authenticate via Terminal
        </button>
      </div>
      <p className="text-[11px] text-[var(--muted-foreground)]">{detail}</p>
    </div>
  );
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

  const handleLaunchHarnessLogin = (harness: SupportedHarness) => {
    onOpenChange(false);
    setMode("deck");
    setActiveTab("terminal");
    executeTerminalCommand(HARNESS_LOGIN_COMMANDS[harness]);
    if (activeLaneId) {
      // Record that a sign-in is in flight so status polls report it. The
      // CLI login itself remains the source of truth; this is best-effort.
      api.startHarnessLogin(activeLaneId, harness).catch(() => {
        /* status reporting is best-effort */
      });
    }
    toast.success(HARNESS_LOGIN_HINTS[harness]);
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
          <HarnessLoginCard
            name="claude"
            icon={<AnthropicIcon className="size-4.5" />}
            accentClass="bg-[rgba(232,128,74,0.12)] border-[rgba(232,128,74,0.25)] text-[var(--accent-claude)]"
            title="Claude Code CLI"
            subtitle="Anthropic Pro / Max subscription custody"
            statusData={statusData}
            onLogin={handleLaunchHarnessLogin}
            detail={
              <>
                Runs <code className="font-mono text-[10px] bg-[var(--surface-secondary)] px-1 py-0.5 rounded">claude login</code> directly on the host VM. Follow the private bridge URL to sign in; the session token persists across host sleep cycles in <code className="font-mono text-[10px] bg-[var(--surface-secondary)] px-1 py-0.5 rounded">~/.claude/.credentials.json</code>.
              </>
            }
          />

          {/* 3. OpenAI Codex */}
          <HarnessLoginCard
            name="codex"
            icon={<OpenAIIcon className="size-4.5" />}
            accentClass="bg-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.25)] text-[var(--accent-codex)]"
            title="OpenAI Codex CLI"
            subtitle="OpenAI Plus / Team account custody"
            statusData={statusData}
            onLogin={handleLaunchHarnessLogin}
            detail={
              <>
                Runs <code className="font-mono text-[10px] bg-[var(--surface-secondary)] px-1 py-0.5 rounded">codex login</code> on the host VM and signs in via a private bridge URL.
              </>
            }
          />

          {/* 4. Google Antigravity */}
          <HarnessLoginCard
            name="antigravity"
            icon={<AntigravityIcon className="size-4.5" />}
            accentClass="bg-[rgba(99,102,241,0.12)] border-[rgba(99,102,241,0.25)] text-[var(--accent-antigravity)]"
            title="Google Antigravity CLI"
            subtitle="Google AI Pro / Ultra account custody"
            statusData={statusData}
            onLogin={handleLaunchHarnessLogin}
            detail={
              <>
                Launches <code className="font-mono text-[10px] bg-[var(--surface-secondary)] px-1 py-0.5 rounded">agy</code> on the host VM. It prints a one-time authorization URL in the terminal — open it on any device and paste the code back into the session. The token lands in the host OS keyring.
              </>
            }
          />

          {/* 5. OpenCode */}
          <HarnessLoginCard
            name="opencode"
            icon={<SquareTerminal className="size-4" />}
            accentClass="bg-[rgba(96,165,250,0.12)] border-[rgba(96,165,250,0.25)] text-[var(--accent-opencode)]"
            title="OpenCode CLI"
            subtitle="Bring-your-own provider, 100+ models"
            statusData={statusData}
            onLogin={handleLaunchHarnessLogin}
            detail={
              <>
                Runs <code className="font-mono text-[10px] bg-[var(--surface-secondary)] px-1 py-0.5 rounded">opencode auth login</code> on the host VM: an interactive provider picker in the session terminal. Any vendor authorize link passes through unmodified; credentials persist in <code className="font-mono text-[10px] bg-[var(--surface-secondary)] px-1 py-0.5 rounded">~/.local/share/opencode/auth.json</code>.
              </>
            }
          />

          {/* 6. Aider — no vendor sign-in exists to relay; keys come from the Vault */}
          {statusData?.harnesses?.aider && (
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-card)] p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-md bg-[var(--surface-tertiary)] border border-[var(--border)] text-[var(--muted-foreground)]">
                  <KeyRound className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-[var(--foreground)]">
                    {statusData.harnesses.aider.label || "Aider CLI"}
                  </h4>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    API-key driven — no vendor sign-in to relay
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                {statusData.harnesses.aider.note ??
                  "Aider reads API keys from the host environment or a .env file. Provide keys via the Vault."}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
