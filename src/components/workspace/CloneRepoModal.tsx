"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FolderGit2, X, Github, ArrowRight, Loader2, Key, CheckCircle2 } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

interface CloneRepoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CloneRepoModal({ open, onOpenChange }: CloneRepoModalProps) {
  const { setMode } = useWorkspace();
  const [repoUrl, setRepoUrl] = useState("");
  const [repoName, setRepoName] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRepoUrl(val);
    if (!repoName && val) {
      const parts = val.replace(".git", "").split("/");
      const last = parts[parts.length - 1];
      if (last) setRepoName(last);
    }
  };

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/api/v1/projects/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: repoName || "Imported Repo",
          repo_url: repoUrl.trim(),
          auth_token: authToken.trim() || undefined,
          default_branch: "main",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to clone remote repository");
      }

      const data = await res.json();
      setIsLoading(false);
      onOpenChange(false);
      setMode("deck");
      // Reload page to pick up fresh cloned repo
      window.location.reload();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "An error occurred during clone");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border-strong)] bg-[#0d0e12] p-6 shadow-2xl focus:outline-none animate-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-tertiary)] border border-[var(--border)] text-[var(--accent-claude)]">
                <Github className="size-4" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-semibold text-[var(--foreground)]">
                  Clone from GitHub
                </Dialog.Title>
                <Dialog.Description className="text-xs text-[var(--muted-foreground)]">
                  Provision an isolated runner host with dedicated worktrees.
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

          <form onSubmit={handleClone} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 font-mono">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--foreground)]">
                Repository URL
              </label>
              <input
                type="text"
                required
                placeholder="https://github.com/organization/repository"
                value={repoUrl}
                onChange={handleUrlChange}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-2 text-xs font-mono text-[var(--foreground)] placeholder:text-[var(--subtle-foreground)] focus:border-[var(--accent-claude)] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--foreground)]">
                Project Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. backend-api or web-app"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--subtle-foreground)] focus:border-[var(--accent-claude)] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                  <Key className="size-3 text-[var(--accent-claude)]" />
                  GitHub Token (Optional for private repos)
                </label>
                <span className="text-[10px] text-[var(--subtle-foreground)]">AES-256 Vault Scoped</span>
              </div>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-2 text-xs font-mono text-[var(--foreground)] placeholder:text-[var(--subtle-foreground)] focus:border-[var(--accent-claude)] focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg bg-[var(--surface-secondary)] px-3.5 py-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !repoUrl.trim()}
                className="flex items-center gap-2 rounded-lg bg-[var(--accent-claude)] px-4 py-1.5 text-xs font-medium text-black hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Cloning & Initializing Worktrees...</span>
                  </>
                ) : (
                  <>
                    <FolderGit2 className="size-3.5" />
                    <span>Clone & Open Workspace</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
