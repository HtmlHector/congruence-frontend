"use client";

import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Github,
  Loader2,
  Lock,
  Globe,
  Search,
  Star,
  GitBranch,
  RefreshCw,
  ExternalLink,
  Link2,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { api, GitHubRepoItem, GitHubStatusData } from "@/lib/api";
import { toast } from "sonner";

interface CloneRepoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CloneRepoModal({ open, onOpenChange }: CloneRepoModalProps) {
  const { setMode, refreshProjectData, switchProject } = useWorkspace();
  const [tab, setTab] = useState<"github" | "manual">("github");

  // GitHub Auth & Repos state
  const [ghStatus, setGhStatus] = useState<GitHubStatusData | null>(null);
  const [repos, setRepos] = useState<GitHubRepoItem[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cloningRepoId, setCloningRepoId] = useState<number | null>(null);

  // Manual Clone state
  const [manualUrl, setManualUrl] = useState("");
  const [manualName, setManualName] = useState("");
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGithubStatusAndRepos = async () => {
    try {
      const status = await api.getGithubStatus();
      setGhStatus(status);
      if (status.connected) {
        setIsLoadingRepos(true);
        try {
          const repoList = await api.getGithubRepos();
          setRepos(repoList);
        } catch (err: any) {
          console.error("Failed to fetch repos:", err);
        } finally {
          setIsLoadingRepos(false);
        }
      }
    } catch (err: any) {
      console.error("Failed to load GitHub status:", err);
    }
  };

  useEffect(() => {
    if (open) {
      setError(null);
      fetchGithubStatusAndRepos();
    }
  }, [open]);

  const handleConnectGithub = async () => {
    try {
      const res = await api.getGithubConnectUrl();
      if (res.authorize_url) {
        window.location.href = res.authorize_url;
      }
    } catch (err: any) {
      setError(err.message || "Failed to initiate GitHub OAuth");
    }
  };

  const handleDisconnectGithub = async () => {
    try {
      await api.disconnectGithub();
      setGhStatus({ connected: false, username: null, avatar_url: null, github_user_id: null });
      setRepos([]);
      toast.success("Disconnected GitHub account");
    } catch (err: any) {
      toast.error("Failed to disconnect GitHub");
    }
  };

  const handleCloneGithubRepo = async (repo: GitHubRepoItem) => {
    setCloningRepoId(repo.id);
    setError(null);

    try {
      const cloneUrl = repo.clone_url || repo.html_url;
      const created = await api.cloneProject({
        name: repo.name,
        repo_url: cloneUrl,
        default_branch: repo.default_branch || "main",
      });

      setCloningRepoId(null);
      onOpenChange(false);
      setMode("deck");
      await refreshProjectData();
      if (created?.id) {
        await switchProject(created.id);
      }
      toast.success(`Repository ${repo.full_name} cloned into isolated host workspace.`);
    } catch (err: any) {
      setCloningRepoId(null);
      setError(err.message || "Failed to clone repository");
    }
  };

  const handleManualClone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;

    setIsManualLoading(true);
    setError(null);

    try {
      const created = await api.cloneProject({
        name: manualName || "Imported Repo",
        repo_url: manualUrl.trim(),
        default_branch: "main",
      });

      setIsManualLoading(false);
      onOpenChange(false);
      setMode("deck");
      await refreshProjectData();
      if (created?.id) {
        await switchProject(created.id);
      }
      toast.success("Project cloned and host provisioned.");
    } catch (err: any) {
      setIsManualLoading(false);
      setError(err.message || "An error occurred during clone");
    }
  };

  const filteredRepos = repos.filter((r) =>
    r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-primary)] p-6 shadow-2xl focus:outline-none animate-in zoom-in-95 flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-tertiary)] border border-[var(--border)] text-[var(--accent-claude)]">
                <Github className="size-5" />
              </div>
              <div>
                <Dialog.Title className="text-base font-semibold text-[var(--foreground)]">
                  Open Repository
                </Dialog.Title>
                <Dialog.Description className="text-xs text-[var(--muted-foreground)]">
                  Provision an isolated host runner with Git worktree isolation.
                </Dialog.Description>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[var(--border)] pt-3 pb-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => setTab("github")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                tab === "github"
                  ? "bg-[var(--surface-tertiary)] text-[var(--foreground)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <Github className="size-3.5" />
              <span>GitHub Repositories</span>
              {ghStatus?.connected && (
                <span className="size-1.5 rounded-full bg-emerald-400 ml-1" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setTab("manual")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                tab === "manual"
                  ? "bg-[var(--surface-tertiary)] text-[var(--foreground)] font-medium"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <Link2 className="size-3.5" />
              <span>Direct Git URL</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 font-mono">
              {error}
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto py-4 min-h-[300px]">
            {tab === "github" ? (
              !ghStatus?.connected ? (
                /* Disconnected State */
                <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-[var(--border)] rounded-xl bg-[var(--surface-secondary)] space-y-4 my-2">
                  <div className="size-12 rounded-full bg-[var(--surface-tertiary)] flex items-center justify-center text-[var(--foreground)]">
                    <Github className="size-6" />
                  </div>
                  <div className="max-w-md space-y-1">
                    <h3 className="text-sm font-medium text-[var(--foreground)]">
                      Connect your GitHub Account
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Authenticate with GitHub OAuth to browse your repositories and clone them directly into isolated execution hosts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectGithub}
                    className="flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-4 py-2 text-xs font-semibold text-[var(--background)] hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Github className="size-4" />
                    <span>Authorize with GitHub</span>
                  </button>
                </div>
              ) : (

                /* Connected State with Repo List */
                <div className="space-y-3">
                  {/* Status header & Search bar */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--muted-foreground)]" />
                      <input
                        type="text"
                        placeholder="Search your repositories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-primary)] pl-8 pr-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--subtle-foreground)] focus:border-[var(--accent-claude)] focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={fetchGithubStatusAndRepos}
                      disabled={isLoadingRepos}
                      className="p-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-primary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
                      title="Refresh repositories"
                    >
                      <RefreshCw className={`size-3.5 ${isLoadingRepos ? "animate-spin" : ""}`} />
                    </button>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted-foreground)] bg-[var(--surface-secondary)] px-2.5 py-1 rounded-md border border-[var(--border)]">
                      {ghStatus.avatar_url && (
                        <img
                          src={ghStatus.avatar_url}
                          alt={ghStatus.username || ""}
                          className="size-4 rounded-full"
                        />
                      )}
                      <span>@{ghStatus.username}</span>
                      <button
                        type="button"
                        onClick={handleDisconnectGithub}
                        className="text-[10px] text-rose-400 hover:underline ml-1"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>

                  {/* Repository Cards */}
                  {isLoadingRepos ? (
                    <div className="flex flex-col items-center justify-center py-16 text-[var(--muted-foreground)] gap-2">
                      <Loader2 className="size-5 animate-spin text-[var(--accent-claude)]" />
                      <span className="text-xs">Fetching repositories from GitHub...</span>
                    </div>
                  ) : filteredRepos.length === 0 ? (
                    <div className="text-center py-12 text-xs text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-lg">
                      {searchQuery ? "No repositories match your search." : "No repositories found for this account."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {filteredRepos.map((repo) => {
                        const isCloning = cloningRepoId === repo.id;
                        return (
                          <div
                            key={repo.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] hover:border-[var(--border-strong)] transition-all"
                          >
                            <div className="space-y-1 min-w-0 flex-1 pr-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-[var(--foreground)] truncate">
                                  {repo.full_name}
                                </span>
                                {repo.private ? (
                                  <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    <Lock className="size-2.5" /> Private
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <Globe className="size-2.5" /> Public
                                  </span>
                                )}
                              </div>
                              {repo.description && (
                                <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-1">
                                  {repo.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--subtle-foreground)] pt-0.5">
                                <span className="flex items-center gap-1">
                                  <GitBranch className="size-2.5" /> {repo.default_branch || "main"}
                                </span>
                                {(repo.stargazers_count ?? 0) > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Star className="size-2.5" /> {repo.stargazers_count}
                                  </span>
                                )}
                                {repo.updated_at && (
                                  <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCloneGithubRepo(repo)}
                              disabled={isCloning || cloningRepoId !== null}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] transition-colors disabled:opacity-50 shrink-0"
                            >
                              {isCloning ? (
                                <>
                                  <Loader2 className="size-3 animate-spin text-[var(--accent-claude)]" />
                                  <span>Cloning...</span>
                                </>
                              ) : (
                                <span>Clone & Open</span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
            ) : (
              /* Manual Clone Form */
              <form onSubmit={handleManualClone} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-[var(--muted-foreground)]">
                    Git Repository URL
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://github.com/org/repo.git"
                    value={manualUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setManualUrl(val);
                      if (!manualName && val) {
                        const parts = val.replace(".git", "").split("/");
                        const last = parts[parts.length - 1];
                        if (last) setManualName(last);
                      }
                    }}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-2 text-xs font-mono text-[var(--foreground)] placeholder:text-[var(--subtle-foreground)] focus:border-[var(--accent-claude)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-[var(--muted-foreground)]">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    placeholder="My Application"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--subtle-foreground)] focus:border-[var(--accent-claude)] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="px-3 py-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isManualLoading || !manualUrl.trim()}
                    className="flex items-center gap-1.5 rounded-md bg-[var(--foreground)] px-4 py-1.5 text-xs font-medium text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isManualLoading && <Loader2 className="size-3 animate-spin" />}
                    <span>{isManualLoading ? "Cloning..." : "Clone Repository"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
