"use client";

import React from "react";
import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";
import { SupersetSidebar } from "@/components/workspace/SupersetSidebar";
import { PromptHub } from "@/components/workspace/PromptHub";
import { ExecutionDeck } from "@/components/workspace/ExecutionDeck";
import { AutomationsView } from "@/components/workspace/AutomationsView";
import { TasksView } from "@/components/workspace/TasksView";
import { PullRequestsView } from "@/components/workspace/PullRequestsView";
import { PagesView } from "@/components/workspace/PagesView";
import { IntegrationsModal } from "@/components/workspace/IntegrationsModal";
import { CommandPaletteModal } from "@/components/workspace/CommandPaletteModal";
import { CloneRepoModal } from "@/components/workspace/CloneRepoModal";

function WorkspaceAppContent() {
  const {
    mode,
    isIntegrationsOpen,
    setIsIntegrationsOpen,
    isSearchOpen,
    setIsSearchOpen,
    isCloneOpen,
    setIsCloneOpen,
  } = useWorkspace();

  const renderActiveView = () => {
    switch (mode) {
      case "hub":
        return <PromptHub />;
      case "deck":
        return <ExecutionDeck />;
      case "automations":
        return <AutomationsView />;
      case "tasks":
        return <TasksView />;
      case "pull-requests":
        return <PullRequestsView />;
      case "pages":
        return <PagesView />;
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
