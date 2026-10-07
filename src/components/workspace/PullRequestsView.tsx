"use client";

import React, { useState, useEffect } from "react";
import {
  GitPullRequest,
  GitBranch,
  ExternalLink,
  Plus,
  Loader2,
  Github,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { api, PullRequestData } from "@/lib/api";

export function PullRequestsView() {
  const { setMode, setActiveTab, activeLane, projectId, project } = useWorkspace();
  const [prs, setPrs] = useState<PullRequestData[]>([]);
  const [isLoadingPrs, setIsLoadingPrs] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [prTitle, setPrTitle] = useState("");

  const fetchPRs = async () => {
    if (!projectId) return;
    setIsLoadingPrs(true);
    try {
      const data = await api.getPullRequests(projectId);
      setPrs(data);
    } catch (err) {
      console.error("Failed to load PRs:", err);
      setPrs([]);
    } finally {
      setIsLoadingPrs(false);
    }
  };

  useEffect(() => {
    fetchPRs();
  }, [projectId]);

  const viewDiffInDeck = () => {
    setActiveTab("changes");
    setMode("deck");
  };

  const handlePublishPR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prTitle.trim() || !projectId || !activeLane) return;

    setIsPublishing(true);
    try {
      await api.createPullRequest(projectId, {
        lane_id: activeLane.id,
        title: prTitle.trim(),
        target_branch: project?.default_branch || "main",
      });
      await fetchPRs();
      setShowPublishModal(false);
      setPrTitle("");
    } catch (err) {
      console.error("Failed to create PR:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto bg-[var(--background)] p-8">
      {/* View Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitPullRequest className="size-5 text-[var(--accent-claude)]" />
            <h1 className="text-xl font-medium text-[var(--foreground)]">Pull Requests</h1>
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            Review, sync, and publish agent worktrees back to GitHub remote repositories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={viewDiffInDeck}
            className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] transition-colors"
          >
            <GitBranch className="size-3.5 text-[var(--muted-foreground)]" />
            <span>Inspect Worktree Diff</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--foreground)] px-3.5 py-1.5 text-xs font-medium text-[var(--background)] hover:opacity-90 transition-opacity"
          >
            <Plus className="size-3.5" />
            <span>New Pull Request</span>
          </button>
        </div>
      </div>

      {/* PR Listing */}
      {isLoadingPrs ? (
        <div className="flex flex-1 items-center justify-center text-xs text-[var(--foreground-muted)]">
          <Loader2 className="size-4 animate-spin mr-2" /> Loading pull requests...
        </div>
      ) : prs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)]/20">
          <div className="w-12 h-12 rounded-xl bg-[var(--surface-tertiary)] border border-[var(--border)] flex items-center justify-center text-lg mb-4 text-[var(--muted-foreground)]">
            <GitPullRequest className="size-5" />
          </div>
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">
            No pull requests registered yet
          </h3>
          <p className="text-xs text-[var(--foreground-muted)] max-w-sm mb-5 leading-relaxed">
            When you or your CLI agents are ready to propose code changes back to GitHub, create a pull request from the active worktree.
          </p>
          <button
            onClick={() => setShowPublishModal(true)}
            className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            + Create Pull Request from {activeLane?.name || "active lane"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {prs.map((pr) => (
            <div
              key={pr.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)]/30 p-4 hover:border-[var(--border-strong)] transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-[rgba(16,185,129,0.1)] p-1.5 border border-[rgba(16,185,129,0.2)] text-emerald-400">
                  <GitPullRequest className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--foreground)]">
                      {pr.title}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--foreground-muted)]">
                      #{pr.pr_number}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-[var(--foreground-muted)]">
                    <span className="rounded bg-[var(--surface-tertiary)] px-1.5 py-0.5">
                      {pr.status}
                    </span>
                    {pr.created_at && (
                      <span>{new Date(pr.created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {pr.pr_url && (
                <a
                  href={pr.pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] rounded-md hover:bg-[var(--surface-tertiary)] transition-colors"
                >
                  <Github className="size-3.5" />
                  <span>View on GitHub</span>
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Publish PR Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <GitPullRequest className="size-4 text-[var(--accent-claude)]" />
              <h3 className="text-sm font-medium text-[var(--foreground)]">
                Publish Pull Request to GitHub
              </h3>
            </div>
            <form onSubmit={handlePublishPR}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-[var(--muted-foreground)] mb-1">
                    Source Worktree Lane
                  </label>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs font-mono text-[var(--foreground)]">
                    {activeLane?.name || "Pair lane"} ({activeLane?.branch || "main"})
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[var(--muted-foreground)] mb-1">
                    Target Branch
                  </label>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs font-mono text-[var(--foreground)]">
                    {project?.default_branch || "main"}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[var(--muted-foreground)] mb-1">
                    Pull Request Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. feat: add isolated worker pool"
                    value={prTitle}
                    onChange={(e) => setPrTitle(e.target.value)}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--subtle-foreground)] focus:border-[var(--accent-claude)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-3 py-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing || !prTitle.trim()}
                  className="flex items-center gap-1.5 rounded-md bg-[var(--foreground)] px-4 py-1.5 text-xs font-medium text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isPublishing && <Loader2 className="size-3 animate-spin" />}
                  <span>{isPublishing ? "Publishing..." : "Publish to GitHub"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
