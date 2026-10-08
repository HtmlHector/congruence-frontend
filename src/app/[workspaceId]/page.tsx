"use client";

import React, { useState, useEffect } from "react";
import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";
import { SupersetSidebar } from "@/components/workspace/SupersetSidebar";
import { PromptHub } from "@/components/workspace/PromptHub";
import { ExecutionDeck } from "@/components/workspace/ExecutionDeck";
import { PullRequestsView } from "@/components/workspace/PullRequestsView";
import { IntegrationsModal } from "@/components/workspace/IntegrationsModal";
import { SettingsModal } from "@/components/workspace/SettingsModal";
import { CommandPaletteModal } from "@/components/workspace/CommandPaletteModal";
import { CloneRepoModal } from "@/components/workspace/CloneRepoModal";
import { NewWorkspaceModal } from "@/components/workspace/NewWorkspaceModal";
import { NewWorktreeModal } from "@/components/workspace/NewWorktreeModal";
import { WorkspaceContextMenu } from "@/components/workspace/WorkspaceContextMenu";
import { Github, FolderGit2, Plus, Sparkles } from "lucide-react";
import { api, GitHubStatusData } from "@/lib/api";

import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

function WorkspaceAppContent() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [ghStatus, setGhStatus] = useState<GitHubStatusData | null>(null);
  const {
    currentTenant,
    tenants,
    workspaceNotFound,
    isWorkspaceLoading,
    mode,
    project,
    isLoading,
    isIntegrationsOpen,
    setIsIntegrationsOpen,
    isSearchOpen,
    setIsSearchOpen,
    isCloneOpen,
    setIsCloneOpen,
    isNewWorkspaceOpen,
    setIsNewWorkspaceOpen,
    isNewWorktreeOpen,
    setIsNewWorktreeOpen,
    worktreeTargetProjectId,
    isSettingsOpen,
    setIsSettingsOpen,
  } = useWorkspace();

  useEffect(() => {
    api.getGithubStatus()
      .then(setGhStatus)
      .catch(() => setGhStatus({ connected: false, username: null, avatar_url: null, github_user_id: null }));
  }, [isCloneOpen]);

  if (!isLoaded || isWorkspaceLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span className="animate-spin text-emerald-500">⠋</span>
          <span>Loading workspace context...</span>
        </div>
      </div>
    );
  }

  if (isLoaded && !isSignedIn) {
    router.replace("/sign-in");
    return null;
  }

  if (workspaceNotFound) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-6">
        <div className="max-w-md w-full text-center border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 bg-white dark:bg-[#121216] shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            !
          </div>
          <h1 className="text-base font-semibold mb-2">Workspace Not Found</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            The requested workspace does not exist or you do not have permission to view it.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push("/workspace")}
              className="w-full py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-medium rounded-[3.5px] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Go to Your Workspaces
            </button>
            <button
              onClick={() => setIsNewWorkspaceOpen(true)}
              className="w-full py-2 border border-zinc-300 dark:border-zinc-700 text-xs font-medium rounded-[3.5px] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              + Create New Workspace
            </button>
          </div>
        </div>
        <NewWorkspaceModal open={isNewWorkspaceOpen} onOpenChange={setIsNewWorkspaceOpen} />
      </div>
    );
  }

  if (tenants.length === 0 && !currentTenant) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-6">
        <div className="max-w-md w-full text-center border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 bg-white dark:bg-[#121216] shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            +
          </div>
          <h1 className="text-base font-semibold mb-2">No Workspaces Found</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            You haven't created any workspaces yet. Create your first workspace to start collaborating.
          </p>
          <button
            onClick={() => setIsNewWorkspaceOpen(true)}
            className="w-full py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-medium rounded-[3.5px] hover:opacity-90 transition-opacity cursor-pointer"
          >
            + Create Your First Workspace
          </button>
        </div>
        <NewWorkspaceModal open={isNewWorkspaceOpen} onOpenChange={setIsNewWorkspaceOpen} />
      </div>
    );
  }

  const renderActiveView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-1 items-center justify-center text-sm text-[var(--foreground-muted)]">
          <div className="flex items-center gap-2">
            <span className="animate-spin text-[var(--accent-claude)]">⠋</span>
            <span>Loading workspace context...</span>
          </div>
        </div>
      );
    }

    if (!project && mode !== "hub") {
      return (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
          {ghStatus?.connected ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl mx-auto">
                <FolderGit2 className="size-7" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  No Active Repository in Workspace
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                  Connected as <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">@{ghStatus.username}</span>. Open or clone a GitHub repository to start multi-agent execution with Claude and Codex.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloneOpen(true)}
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-[3.5px] hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Open Repository</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mx-auto shadow-xs">
                <Github className="size-7" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Connect GitHub to Your Workspace
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                  Connect your GitHub account or paste a token to clone and collaborate on your repositories with AI pair programmers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 w-full max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => setIsCloneOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-[3.5px] hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Github className="size-4" />
                  <span>Connect GitHub</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCloneOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-[3.5px] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <span>Open Starter Kit / URL</span>
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    switch (mode) {
      case "hub":
        return <PromptHub />;
      case "pull-requests":
        return <PullRequestsView />;
      case "deck":
      default:
        return <ExecutionDeck />;
    }
  };

  return (
    <WorkspaceContextMenu>
      <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">
        {/* Full-Height Left Navigation Sidebar */}
        <SupersetSidebar />

        {/* Full-Height Center Canvas */}
        <main className="flex flex-1 overflow-hidden relative">
          {renderActiveView()}
        </main>

        {/* Connected Integrations & Vault Modal */}
        <IntegrationsModal open={isIntegrationsOpen} onOpenChange={setIsIntegrationsOpen} />

        {/* Workspace Settings Modal (⌘,) */}
        <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

        {/* Omnibar Search / Command Palette (⌘K) */}
        <CommandPaletteModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />

        {/* Clone GitHub Repo Modal */}
        <CloneRepoModal open={isCloneOpen} onOpenChange={setIsCloneOpen} />

        {/* Create New Isolated Workspace / Tenant Modal */}
        <NewWorkspaceModal open={isNewWorkspaceOpen} onOpenChange={setIsNewWorkspaceOpen} />

        {/* Create New Git Worktree Modal */}
        <NewWorktreeModal
          open={isNewWorktreeOpen}
          onOpenChange={setIsNewWorktreeOpen}
          targetProjectId={worktreeTargetProjectId || undefined}
        />
      </div>
    </WorkspaceContextMenu>
  );
}

export default function WorkspaceByIdPage() {
  return (
    <WorkspaceProvider>
      <WorkspaceAppContent />
    </WorkspaceProvider>
  );
}
