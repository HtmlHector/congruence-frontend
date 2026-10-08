"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ClaudeIcon, OpenAIIcon, AntigravityIcon } from "@/components/ui/brand-icons";
import {
  Plus,
  Terminal,
  Columns2,
  Rows2,
  Sparkles,
  Search,
  FolderPlus,
  RefreshCw,
  Copy,
  LayoutDashboard,
  PanelLeft,
  XSquare,
  FolderKanban,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

interface WorkspaceContextMenuProps {
  children: React.ReactNode;
}

export function WorkspaceContextMenu({ children }: WorkspaceContextMenuProps) {
  const router = useRouter();
  const {
    currentTenant,
    activeLaneId,
    createChat,
    openSplit,
    closeSplit,
    splitState,
    toggleSidebar,
    sidebarCollapsed,
    setIsSearchOpen,
    setIsIntegrationsOpen,
    setIsCloneOpen,
    setIsNewWorkspaceOpen,
    refreshProjectData,
    submitPrompt,
    setMode,
  } = useWorkspace();

  const handleNewProject = () => {
    setIsCloneOpen(true);
  };

  const handleLaunchAgent = (harness: "Claude" | "Codex" | "Antigravity" | "Shell") => {
    const targetLane = activeLaneId || "lane-main";
    createChat(targetLane, harness);
    toast.success(`Launched ${harness} agent`);
  };

  const handleCopyWorkspaceUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Workspace URL copied to clipboard");
    }
  };

  const handleReloadWorkspace = async () => {
    toast.promise(refreshProjectData(), {
      loading: "Refreshing workspace context...",
      success: "Workspace context refreshed",
      error: "Failed to refresh workspace",
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild className="w-full h-full flex flex-1 overflow-hidden select-none">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64 bg-white/95 dark:bg-[#121216]/95 border border-zinc-200 dark:border-zinc-800 rounded-[3.5px] shadow-2xl p-1 text-xs">
        <ContextMenuLabel className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-500 px-2 py-1 flex items-center justify-between">
          <span>{currentTenant.name || "Workspace"}</span>
          <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
            {currentTenant.plan}
          </span>
        </ContextMenuLabel>

        <ContextMenuSeparator />

        {/* Primary Agent & Worktree Actions */}
        <ContextMenuItem
          onSelect={handleNewProject}
          onClick={handleNewProject}
          className="gap-2 cursor-pointer"
        >
          <Plus className="size-3.5 text-zinc-500 shrink-0" />
          <span>New Project</span>
          <ContextMenuShortcut>⌘N</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <Terminal className="size-3.5 text-zinc-500 shrink-0" />
            <span>Launch Agent / Terminal</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56 bg-white dark:bg-[#141418] border border-zinc-200 dark:border-zinc-800 rounded-[3.5px] p-1">
            <ContextMenuItem
              onSelect={() => handleLaunchAgent("Claude")}
              onClick={() => handleLaunchAgent("Claude")}
              className="gap-2 cursor-pointer"
            >
              <ClaudeIcon className="size-3.5 text-[#E8804A] shrink-0" />
              <span>Claude Code Agent</span>
              <ContextMenuShortcut>⌥1</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => handleLaunchAgent("Codex")}
              onClick={() => handleLaunchAgent("Codex")}
              className="gap-2 cursor-pointer"
            >
              <OpenAIIcon className="size-3.5 text-emerald-500 shrink-0" />
              <span>OpenAI Codex Agent</span>
              <ContextMenuShortcut>⌥2</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => handleLaunchAgent("Antigravity")}
              onClick={() => handleLaunchAgent("Antigravity")}
              className="gap-2 cursor-pointer"
            >
              <AntigravityIcon className="size-3.5 text-indigo-500 shrink-0" />
              <span>Google Antigravity</span>
              <ContextMenuShortcut>⌥3</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onSelect={() => handleLaunchAgent("Shell")}
              onClick={() => handleLaunchAgent("Shell")}
              className="gap-2 cursor-pointer"
            >
              <Terminal className="size-3.5 text-zinc-500 shrink-0" />
              <span>Raw Shell / PTY Terminal</span>
              <ContextMenuShortcut>⌥T</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* Layout & Split Panes */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <Columns2 className="size-3.5 text-zinc-500 shrink-0" />
            <span>Split Panes & Layout</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56 bg-white dark:bg-[#141418] border border-zinc-200 dark:border-zinc-800 rounded-[3.5px] p-1">
            <ContextMenuItem
              onSelect={() => openSplit({ tabType: "preview" }, "vertical", "right")}
              onClick={() => openSplit({ tabType: "preview" }, "vertical", "right")}
              className="gap-2 cursor-pointer"
            >
              <Columns2 className="size-3.5 text-zinc-500 shrink-0" />
              <span>Split Pane Right</span>
              <ContextMenuShortcut>⌘\</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => openSplit({ tabType: "preview" }, "horizontal", "bottom")}
              onClick={() => openSplit({ tabType: "preview" }, "horizontal", "bottom")}
              className="gap-2 cursor-pointer"
            >
              <Rows2 className="size-3.5 text-zinc-500 shrink-0" />
              <span>Split Pane Down</span>
              <ContextMenuShortcut>⌘⇧\</ContextMenuShortcut>
            </ContextMenuItem>
            {splitState.isSplit && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onSelect={closeSplit}
                  onClick={closeSplit}
                  className="gap-2 text-red-600 dark:text-red-400 cursor-pointer"
                >
                  <XSquare className="size-3.5 shrink-0" />
                  <span>Close Active Split</span>
                </ContextMenuItem>
              </>
            )}
            <ContextMenuSeparator />
            <ContextMenuItem
              onSelect={toggleSidebar}
              onClick={toggleSidebar}
              className="gap-2 cursor-pointer"
            >
              <PanelLeft className="size-3.5 text-zinc-500 shrink-0" />
              <span>{sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}</span>
              <ContextMenuShortcut>⌘B</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem
          onSelect={() => {
            setMode("deck");
          }}
          onClick={() => {
            setMode("deck");
          }}
          className="gap-2 cursor-pointer"
        >
          <LayoutDashboard className="size-3.5 text-zinc-500 shrink-0" />
          <span>Mission Control</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Omnibar, Repositories & Tools */}
        <ContextMenuItem
          onSelect={() => setIsSearchOpen(true)}
          onClick={() => setIsSearchOpen(true)}
          className="gap-2 cursor-pointer"
        >
          <Search className="size-3.5 text-zinc-500 shrink-0" />
          <span>Command Palette</span>
          <ContextMenuShortcut>⌘K</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem
          onSelect={() => setIsCloneOpen(true)}
          onClick={() => setIsCloneOpen(true)}
          className="gap-2 cursor-pointer"
        >
          <FolderPlus className="size-3.5 text-zinc-500 shrink-0" />
          <span>Open / Clone Repository</span>
        </ContextMenuItem>

        <ContextMenuItem
          onSelect={() => setIsIntegrationsOpen(true)}
          onClick={() => setIsIntegrationsOpen(true)}
          className="gap-2 cursor-pointer"
        >
          <Sparkles className="size-3.5 text-zinc-500 shrink-0" />
          <span>Integrations & Environment Vault</span>
        </ContextMenuItem>

        <ContextMenuItem
          onSelect={() => router.push("/settings")}
          onClick={() => router.push("/settings")}
          className="gap-2 cursor-pointer"
        >
          <SlidersHorizontal className="size-3.5 text-zinc-500 shrink-0" />
          <span>Workspace Settings</span>
          <ContextMenuShortcut>⌘,</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem
          onSelect={() => setIsNewWorkspaceOpen(true)}
          onClick={() => setIsNewWorkspaceOpen(true)}
          className="gap-2 cursor-pointer"
        >
          <FolderKanban className="size-3.5 text-emerald-500 shrink-0" />
          <span>Create New Workspace</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Utility / Refresh / Copy */}
        <ContextMenuItem
          onSelect={handleCopyWorkspaceUrl}
          onClick={handleCopyWorkspaceUrl}
          className="gap-2 cursor-pointer"
        >
          <Copy className="size-3.5 text-zinc-500 shrink-0" />
          <span>Copy Workspace URL</span>
        </ContextMenuItem>

        <ContextMenuItem
          onSelect={handleReloadWorkspace}
          onClick={handleReloadWorkspace}
          className="gap-2 cursor-pointer"
        >
          <RefreshCw className="size-3.5 text-zinc-500 shrink-0" />
          <span>Reload Workspace State</span>
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
