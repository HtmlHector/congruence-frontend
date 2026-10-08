"use client";

import React from "react";
import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";
import { SupersetSidebar } from "@/components/workspace/SupersetSidebar";
import { PromptHub } from "@/components/workspace/PromptHub";
import { ExecutionDeck } from "@/components/workspace/ExecutionDeck";
import { PullRequestsView } from "@/components/workspace/PullRequestsView";
import { IntegrationsModal } from "@/components/workspace/IntegrationsModal";
import { SettingsModal } from "@/components/workspace/SettingsModal";
import { CommandPaletteModal } from "@/components/workspace/CommandPaletteModal";
import { CloneRepoModal } from "@/components/workspace/CloneRepoModal";

function WorkspaceAppContent() {
  const {
    mode,
    project,
    isLoading,
    isIntegrationsOpen,
    setIsIntegrationsOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isSearchOpen,
    setIsSearchOpen,
    isCloneOpen,
    setIsCloneOpen,
  } = useWorkspace();

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
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--surface-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center text-lg mb-4">
            ⎇
          </div>
          <h2 className="text-lg font-medium text-[var(--foreground)] mb-2">No Active Repository</h2>
          <p className="text-sm text-[var(--foreground-muted)] max-w-md mb-6 leading-relaxed">
            Open a GitHub repository or clone a project to start a collaborative execution workspace with Claude and Codex.
          </p>
          <button
            onClick={() => setIsCloneOpen(true)}
            className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] font-medium text-xs rounded-lg hover:opacity-90 transition-opacity"
          >
            + Open a repository
          </button>
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
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <WorkspaceProvider>
      <WorkspaceAppContent />
    </WorkspaceProvider>
  );
}
