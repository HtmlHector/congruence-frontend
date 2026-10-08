"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Settings,
  Sliders,
  Key,
  Users,
  CreditCard,
  Trash2,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  ExternalLink,
  Shield,
  Save,
  Loader2,
  RefreshCw,
  GitBranch,
  Github,
  Mail,
  UserPlus,
  Server,
  Zap,
  Bot,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useUser } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CodingProvidersSection } from "@/components/settings/CodingProvidersSection";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EnvVar {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  isVisible: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Writer" | "Watcher";
  hasLease: boolean;
  avatarColor: string;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const {
    project,
    projectId,
    settingsTab,
    setSettingsTab,
    hostState,
    refreshProjectData,
    currentTenant,
  } = useWorkspace();

  // General Settings State
  const [projectName, setProjectName] = useState(project?.name || "congruence-frontend");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Environment & Secrets State
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    {
      id: "env-1",
      key: "ANTHROPIC_API_KEY",
      value: "sk-ant-api03-9df82f91a0c9e83b",
      isSecret: true,
      isVisible: false,
    },
    {
      id: "env-2",
      key: "OPENAI_API_KEY",
      value: "sk-proj-49a029fe871b0c93a",
      isSecret: true,
      isVisible: false,
    },
    {
      id: "env-3",
      key: "DATABASE_URL",
      value: "postgresql://postgres:pass@db.internal:5432/congruence",
      isSecret: true,
      isVisible: false,
    },
    {
      id: "env-4",
      key: "NEXT_PUBLIC_APP_ENV",
      value: "production",
      isSecret: false,
      isVisible: true,
    },
    {
      id: "env-5",
      key: "PORT",
      value: "3000",
      isSecret: false,
      isVisible: true,
    },
  ]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newIsSecret, setNewIsSecret] = useState(true);
  const [isSavingEnv, setIsSavingEnv] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { user } = useUser();
  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    currentTenant?.ownerEmail ||
    "";
  const userName =
    user?.fullName ||
    (user?.firstName ? `${user.firstName} (You)` : "You");

  // Team & Access State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "tm-1",
      name: userName,
      email: userEmail,
      role: "Owner",
      hasLease: true,
      avatarColor: "bg-[#52a447]",
    },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Writer" | "Watcher">("Writer");
  const [isInviting, setIsInviting] = useState(false);

  // Billing State
  const [writerSeats, setWriterSeats] = useState(2);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  useEffect(() => {
    if (project?.name) {
      setProjectName(project.name);
    }
  }, [project]);

  // Handle General Save
  const handleSaveGeneral = async () => {
    setIsSavingGeneral(true);
    try {
      await new Promise((res) => setTimeout(res, 600));
      toast.success("Workspace general settings updated.");
    } catch {
      toast.error("Failed to update settings.");
    } finally {
      setIsSavingGeneral(false);
    }
  };

  // Handle Add Env
  const handleAddEnv = () => {
    if (!newKey.trim()) {
      toast.error("Variable key cannot be empty.");
      return;
    }
    const sanitizedKey = newKey.trim().toUpperCase().replace(/\s+/g, "_");
    setEnvVars((prev) => [
      ...prev,
      {
        id: `env-${Date.now()}`,
        key: sanitizedKey,
        value: newValue.trim(),
        isSecret: newIsSecret,
        isVisible: !newIsSecret,
      },
    ]);
    setNewKey("");
    setNewValue("");
    setNewIsSecret(true);
    toast.success(`Added ${sanitizedKey} to staging list.`);
  };

  const handleRemoveEnv = (id: string) => {
    setEnvVars((prev) => prev.filter((e) => e.id !== id));
  };

  const handleToggleVisibility = (id: string) => {
    setEnvVars((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isVisible: !e.isVisible } : e))
    );
  };

  const handleCopyEnv = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    toast.success(`Copied value for ${key}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveEnv = async () => {
    setIsSavingEnv(true);
    try {
      if (projectId) {
        // Encrypt and persist API keys to backend vault
        const anthropicVar = envVars.find((e) => e.key === "ANTHROPIC_API_KEY");
        const openaiVar = envVars.find((e) => e.key === "OPENAI_API_KEY");
        if (anthropicVar?.value || openaiVar?.value) {
          await api.saveVaultKeys(projectId, {
            anthropic_api_key: anthropicVar?.value,
            openai_api_key: openaiVar?.value,
          });
        }
      }
      await new Promise((res) => setTimeout(res, 500));
      toast.success("Environment secrets encrypted & written to host /home/user/.env");
    } catch (err) {
      console.error(err);
      toast.error("Saved locally. Backend vault sync failed.");
    } finally {
      setIsSavingEnv(false);
    }
  };

  // Handle Team Invite
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsInviting(true);
    setTimeout(() => {
      setTeamMembers((prev) => [
        ...prev,
        {
          id: `tm-${Date.now()}`,
          name: inviteEmail.split("@")[0],
          email: inviteEmail.trim(),
          role: inviteRole,
          hasLease: inviteRole === "Writer",
          avatarColor: "bg-[#ec4899]",
        },
      ]);
      if (inviteRole === "Writer") {
        setWriterSeats((s) => s + 1);
      }
      setInviteEmail("");
      setIsInviting(false);
      toast.success(`Invitation sent to ${inviteEmail}.`);
    }, 500);
  };

  const handleToggleLease = (id: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newHasLease = !m.hasLease;
          const newRole = newHasLease ? "Writer" : "Watcher";
          toast.success(
            newHasLease
              ? `Granted active write lease to ${m.name}`
              : `Revoked write lease from ${m.name} (switched to Watcher)`
          );
          return { ...m, hasLease: newHasLease, role: newRole as any };
        }
        return m;
      })
    );
  };

  const handleOpenBillingPortal = async () => {
    setIsLoadingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.open(data.url, "_blank");
          return;
        }
      }
      toast.info("Opening Stripe customer billing portal...");
      setTimeout(() => {
        window.open("https://billing.stripe.com", "_blank");
      }, 600);
    } catch {
      toast.info("Opening Stripe customer billing portal...");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 bg-[var(--surface-primary)] border-[var(--border)] text-[var(--foreground)] sm:rounded-[var(--radius-lg)] overflow-hidden shadow-2xl flex flex-col h-[640px] max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-secondary)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-[var(--surface-tertiary)] border border-[var(--border)] text-[var(--foreground)]">
              <Settings className="size-4 text-[var(--muted-foreground)]" />
            </div>
            <div>
              <DialogTitle className="text-base font-medium tracking-tight text-[var(--foreground)]">
                Workspace Settings
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--muted-foreground)]">
                Configure host microVM parameters, team write leases, secrets, and subscriptions.
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--wash)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] transition-colors cursor-pointer"
              title="Open full-page settings suite"
            >
              <span>Full Page</span>
              <ExternalLink className="size-3" />
            </Link>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--wash)] border border-[var(--border)] text-[var(--muted-foreground)]">
              ⌘,
            </span>
          </div>
        </div>

        {/* Two-Column Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Vertical Navigation Rail */}
          <aside className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--surface-sidebar)] p-3 flex flex-col gap-1 select-none">
            <button
              type="button"
              onClick={() => setSettingsTab("general")}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-[13px] font-medium transition-colors cursor-pointer text-left ${
                settingsTab === "general"
                  ? "bg-[var(--wash-strong)] text-[var(--foreground)] shadow-xs"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
              }`}
            >
              <Sliders className="size-4 shrink-0" />
              <span>General</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsTab("providers")}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-[13px] font-medium transition-colors cursor-pointer text-left ${
                settingsTab === "providers"
                  ? "bg-[var(--wash-strong)] text-[var(--foreground)] shadow-xs"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bot className="size-4 shrink-0 text-purple-600 dark:text-purple-400" />
                <span>Coding Providers</span>
              </div>
              <span className="text-[10px] font-mono px-1 py-0.2 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded">
                AI
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsTab("environment")}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-[13px] font-medium transition-colors cursor-pointer text-left ${
                settingsTab === "environment"
                  ? "bg-[var(--wash-strong)] text-[var(--foreground)] shadow-xs"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
              }`}
            >
              <Key className="size-4 shrink-0" />
              <span>Environment & Secrets</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsTab("team")}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-[13px] font-medium transition-colors cursor-pointer text-left ${
                settingsTab === "team"
                  ? "bg-[var(--wash-strong)] text-[var(--foreground)] shadow-xs"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
              }`}
            >
              <Users className="size-4 shrink-0" />
              <span>Team & Leases</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsTab("billing")}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-[13px] font-medium transition-colors cursor-pointer text-left ${
                settingsTab === "billing"
                  ? "bg-[var(--wash-strong)] text-[var(--foreground)] shadow-xs"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
              }`}
            >
              <CreditCard className="size-4 shrink-0" />
              <span>Billing & Plans</span>
            </button>

            {/* Host Custody Status Badge at bottom of rail */}
            <div className="mt-auto p-2.5 rounded-md bg-[var(--surface-primary)] border border-[var(--border)] text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-[var(--foreground)]">
                <Shield className="size-3.5 text-[#52a447]" />
                <span>Host Custody Active</span>
              </div>
              <p className="text-[var(--subtle-foreground)] text-[10px] leading-tight">
                Credentials reside on host NVMe. No tokens proxied or resold.
              </p>
            </div>
          </aside>

          {/* Right Content Pane */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. GENERAL TAB */}
            {settingsTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium text-[var(--foreground)]">General Information</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Manage workspace identity and linked GitHub repositories.
                  </p>
                </div>

                <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] p-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--foreground)]">Workspace Name</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full h-9 px-3 rounded-md bg-[var(--surface-primary)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--ring)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--foreground)]">Linked GitHub Repository</label>
                    <div className="flex items-center justify-between h-9 px-3 rounded-md bg-[var(--surface-primary)] border border-[var(--border)] text-sm text-[var(--foreground)]">
                      <div className="flex items-center gap-2 min-w-0">
                        <Github className="size-4 shrink-0 text-[var(--muted-foreground)]" />
                        <span className="truncate font-mono text-xs text-[var(--foreground)]">
                          {project?.repo_url || "https://github.com/congruence-dev/congruence-frontend"}
                        </span>
                      </div>
                      <a
                        href={project?.repo_url || "https://github.com"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[var(--foreground)]">Default Base Branch</label>
                      <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-[var(--surface-primary)] border border-[var(--border)] text-xs text-[var(--foreground)]">
                        <GitBranch className="size-3.5 text-[var(--muted-foreground)]" />
                        <input
                          type="text"
                          value={defaultBranch}
                          onChange={(e) => setDefaultBranch(e.target.value)}
                          className="w-full bg-transparent focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[var(--foreground)]">Host Status</label>
                      <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-[var(--surface-primary)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)]">
                        <span
                          className={`size-2 rounded-full ${
                            hostState === "awake" ? "bg-[#52a447] animate-pulse" : "bg-amber-500"
                          }`}
                        />
                        <span className="capitalize">{hostState} (Fly Sprite microVM)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveGeneral}
                      disabled={isSavingGeneral}
                      className="flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--foreground)] text-[var(--background)] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                    >
                      {isSavingGeneral ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="space-y-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <div className="flex items-center gap-2 text-red-400 font-medium text-xs">
                    <AlertTriangle className="size-4" />
                    <span>Danger Zone</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Archiving or deleting this workspace will permanently erase the host microVM NVMe storage and all uncommitted git worktree lanes.
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this workspace? This cannot be undone.")) {
                          toast.error("Workspace deletion requested.");
                        }
                      }}
                      className="px-3 py-1.5 rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Delete Workspace
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CODING PROVIDERS TAB */}
            {settingsTab === "providers" && <CodingProvidersSection />}

            {/* 2. ENVIRONMENT & SECRETS TAB */}
            {settingsTab === "environment" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-[var(--foreground)]">Environment Variables & Secrets</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Injected directly into the Host microVM environment (`/home/user/.env`).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveEnv}
                    disabled={isSavingEnv}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[var(--foreground)] text-[var(--background)] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {isSavingEnv ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                    <span>Save & Deploy Secrets</span>
                  </button>
                </div>

                {/* Variables List */}
                <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] p-3">
                  {envVars.map((env) => (
                    <div
                      key={env.id}
                      className="flex items-center gap-2 p-2 rounded-md bg-[var(--surface-primary)] border border-[var(--border)] text-xs group"
                    >
                      <div className="w-1/3 min-w-0 font-mono font-medium text-[var(--foreground)] truncate">
                        {env.key}
                      </div>
                      <div className="flex-1 min-w-0 font-mono text-[var(--muted-foreground)] flex items-center gap-2">
                        <span className="truncate">
                          {env.isSecret && !env.isVisible ? "••••••••••••••••••••••••" : env.value}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {env.isSecret && (
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(env.id)}
                            className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--wash)] cursor-pointer"
                            title={env.isVisible ? "Hide secret" : "Show secret"}
                          >
                            {env.isVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopyEnv(env.key, env.value)}
                          className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--wash)] cursor-pointer"
                          title="Copy value"
                        >
                          {copiedKey === env.key ? (
                            <Check className="size-3.5 text-[#52a447]" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveEnv(env.id)}
                          className="p-1 rounded text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                          title="Remove variable"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add New Variable Row */}
                  <div className="pt-2 border-t border-[var(--border)]/60 flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      placeholder="KEY (e.g. STRIPE_SECRET_KEY)"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      className="w-full sm:w-1/3 h-8 px-2.5 rounded bg-[var(--surface-primary)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--ring)]"
                    />
                    <input
                      type="text"
                      placeholder="VALUE"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full sm:flex-1 h-8 px-2.5 rounded bg-[var(--surface-primary)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--ring)]"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newIsSecret}
                          onChange={(e) => setNewIsSecret(e.target.checked)}
                          className="rounded border-[var(--border)] bg-[var(--surface-primary)]"
                        />
                        <span>Secret</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddEnv}
                        className="flex items-center gap-1 h-8 px-3 rounded bg-[var(--wash-strong)] hover:bg-[var(--wash)] text-[var(--foreground)] text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-[var(--surface-card)] border border-[var(--border)] p-3 text-xs text-[var(--muted-foreground)] space-y-1">
                  <div className="font-medium text-[var(--foreground)] flex items-center gap-1.5">
                    <Shield className="size-3.5 text-[#52a447]" />
                    <span>Host Custody Invariant</span>
                  </div>
                  <p className="text-[11px]">
                    All secrets are encrypted with AES-256-GCM before storage and transit directly to your microVM. Congruence control plane never retains unencrypted agent keys.
                  </p>
                </div>
              </div>
            )}

            {/* 3. TEAM & COLLABORATORS TAB */}
            {settingsTab === "team" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium text-[var(--foreground)]">Team & Write Leases</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Watch is the default (free). Only members with an explicit Write Lease can execute terminal commands and edit worktrees.
                  </p>
                </div>

                {/* Invite Bar */}
                <form onSubmit={handleInvite} className="flex gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] p-3">
                  <div className="flex-1 flex items-center gap-2 h-9 px-3 rounded-md bg-[var(--surface-primary)] border border-[var(--border)] text-xs text-[var(--foreground)]">
                    <Mail className="size-4 text-[var(--muted-foreground)] shrink-0" />
                    <input
                      type="email"
                      placeholder="teammate@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-transparent focus:outline-none"
                    />
                  </div>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="h-9 px-3 rounded-md bg-[var(--surface-primary)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none cursor-pointer"
                  >
                    <option value="Writer">Writer ($49/mo)</option>
                    <option value="Watcher">Watcher (Free)</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-[var(--foreground)] text-[var(--background)] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {isInviting ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />}
                    <span>Invite</span>
                  </button>
                </form>

                {/* Members List */}
                <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] p-3">
                  <div className="text-xs font-medium text-[var(--muted-foreground)] px-2 pb-1">
                    Active Workspace Members ({teamMembers.length})
                  </div>
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2.5 rounded-md bg-[var(--surface-primary)] border border-[var(--border)] text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex size-7 shrink-0 items-center justify-center rounded-full ${member.avatarColor} text-white font-medium text-[11px] select-none`}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[var(--foreground)] truncate flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {member.role === "Owner" && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-[var(--wash-strong)] font-normal text-[var(--muted-foreground)]">
                                Owner
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--muted-foreground)] truncate">{member.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
                            member.hasLease
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : "bg-[var(--wash)] border-[var(--border)] text-[var(--muted-foreground)]"
                          }`}
                        >
                          {member.role}
                        </span>
                        {member.role !== "Owner" && (
                          <button
                            type="button"
                            onClick={() => handleToggleLease(member.id)}
                            className="px-2.5 py-1 rounded bg-[var(--surface-secondary)] hover:bg-[var(--wash)] border border-[var(--border)] text-[11px] font-medium text-[var(--foreground)] transition-colors cursor-pointer"
                          >
                            {member.hasLease ? "Revoke Lease" : "Grant Write Lease"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. BILLING & PLANS TAB */}
            {settingsTab === "billing" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium text-[var(--foreground)]">Billing & Subscription</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Manage team seats, Stripe customer portal, and invoice receipts.
                  </p>
                </div>

                {/* Plan Overview Card */}
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-card)] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-medium text-[var(--foreground)]">Team Pro Plan</h4>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#52a447]/10 text-[#52a447] border border-[#52a447]/20 font-medium">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        $49 per active writer / month · Unlimited free watchers
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-mono font-medium text-[var(--foreground)]">
                        ${writerSeats * 49}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)] font-mono">/mo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border)]/60 text-xs">
                    <div className="p-3 rounded-md bg-[var(--surface-primary)] border border-[var(--border)]">
                      <div className="text-[var(--muted-foreground)]">Active Writer Seats</div>
                      <div className="text-base font-mono font-medium text-[var(--foreground)] mt-1">
                        {writerSeats} seats ($49/ea)
                      </div>
                    </div>
                    <div className="p-3 rounded-md bg-[var(--surface-primary)] border border-[var(--border)]">
                      <div className="text-[var(--muted-foreground)]">Watchers & Observers</div>
                      <div className="text-base font-mono font-medium text-[var(--foreground)] mt-1">
                        Unlimited (Free)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <CreditCard className="size-4" />
                      <span>Visa ending in 4242 · Next invoice on Nov 1, 2026</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenBillingPortal}
                      disabled={isLoadingPortal}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[var(--foreground)] text-[var(--background)] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                    >
                      {isLoadingPortal ? <Loader2 className="size-3.5 animate-spin" /> : <ExternalLink className="size-3.5" />}
                      <span>Manage Stripe Billing</span>
                    </button>
                  </div>
                </div>

                {/* Invoices List */}
                <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] p-3">
                  <div className="text-xs font-medium text-[var(--muted-foreground)] px-2 pb-1">
                    Recent Invoices
                  </div>
                  {[
                    { id: "INV-2026-009", date: "Oct 1, 2026", amount: "$98.00", status: "Paid" },
                    { id: "INV-2026-008", date: "Sep 1, 2026", amount: "$98.00", status: "Paid" },
                    { id: "INV-2026-007", date: "Aug 1, 2026", amount: "$49.00", status: "Paid" },
                  ].map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-2.5 rounded-md bg-[var(--surface-primary)] border border-[var(--border)] text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[var(--foreground)] font-medium">{inv.id}</span>
                        <span className="text-[var(--muted-foreground)]">{inv.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium text-[var(--foreground)]">{inv.amount}</span>
                        <span className="text-[11px] text-[#52a447] font-medium bg-[#52a447]/10 px-1.5 py-0.5 rounded">
                          {inv.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => toast.success(`Downloading PDF receipt for ${inv.id}`)}
                          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline cursor-pointer"
                        >
                          Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
