"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";
import { SupersetSidebar } from "@/components/workspace/SupersetSidebar";
import { PromptHub } from "@/components/workspace/PromptHub";
import { ExecutionDeck } from "@/components/workspace/ExecutionDeck";

function WorkspaceAppContent() {
  const { mode } = useWorkspace();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">
      {/* Full-Height Left Navigation Sidebar */}
      <SupersetSidebar />

      {/* Full-Height Center Canvas: Prompt Hub or Execution Deck */}
      <main className="flex flex-1 overflow-hidden relative">
        {mode === "hub" ? <PromptHub /> : <ExecutionDeck />}
      </main>
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
