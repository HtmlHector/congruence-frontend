"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Search,
  Plus,
  Settings,
  SlidersHorizontal,
  Folder,
  FolderOpen,
  FolderPlus,
  PanelLeft,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Flag,
  GitBranch,
  LayoutDashboard,
  Zap,
  Check,
  MoreHorizontal,
  GitFork,
  ExternalLink,
  Layers,
  Building2,
} from "lucide-react";
import {
  ClaudeIcon,
  OpenAIIcon,
  AntigravityIcon,
} from "@/components/ui/brand-icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/context/WorkspaceContext";

export function SupersetSidebar() {
  const {
    currentTenant,
    tenants,
    switchTenant,
    setIsNewWorkspaceOpen,
    projects,
    project,
    projectId,
    switchProject,
    lanes,
    activeLaneId,
    switchLane,
    submitPrompt,
    mode,
    setMode,
    chats,
    setIsIntegrationsOpen,
    setIsSettingsOpen,
    setSettingsTab,
    setIsSearchOpen,
    setIsCloneOpen,
    openNewWorktreeModal,
    sidebarCollapsed,
    toggleSidebar,
  } = useWorkspace();

  const { user } = useUser();
  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    currentTenant?.ownerEmail ||
    "";
  const userInitial = (user?.firstName || user?.fullName || userEmail || "U")
    .charAt(0)
    .toUpperCase();

  const [activeItem, setActiveItem] = useState<string>("deck");
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({
    "ecommerce-test-app": true,
    "spec-docs": false,
  });

  const toggleProjectFolder = (projName: string) => {
    setOpenProjects((prev) => ({
      ...prev,
      [projName]: !prev[projName],
    }));
  };

  const handleNewProject = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsCloneOpen(true);
  };

  const handleAddLane = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const branchName = prompt(
      "Enter new Git branch / worktree name (e.g. feat/payment-integration):",
      "feat/new-feature"
    );
    if (branchName && branchName.trim()) {
      submitPrompt(`Worktree branch: ${branchName.trim()}`, "Claude", "default", "default");
    }
  };

  // Keyboard shortcut for New Project (⌘N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        // Only trigger if not typing in an input or textarea
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        setIsCloneOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsCloneOpen]);

  // Get active agents inside a specific worktree lane
  const getWorktreeAgentBadges = (laneId: string) => {
    const laneChats = chats.filter((c) => c.laneId === laneId);
    const hasClaude = laneChats.some((c) => c.harness === "Claude");
    const hasCodex = laneChats.some((c) => c.harness === "Codex");
    const hasAntigravity = laneChats.some((c) => c.harness === "Antigravity");

    return (
      <div className="flex items-center -space-x-1 shrink-0">
        {hasClaude && (
          <div className="flex size-3.5 items-center justify-center rounded-[3.5px] bg-[#FAFAFA] dark:bg-[#16161B] ring-1 ring-zinc-300 dark:ring-zinc-700">
            <ClaudeIcon className="size-2.5 text-[#E8804A]" />
          </div>
        )}
        {hasCodex && (
          <div className="flex size-3.5 items-center justify-center rounded-[3.5px] bg-[#FAFAFA] dark:bg-[#16161B] ring-1 ring-zinc-300 dark:ring-zinc-700">
            <OpenAIIcon className="size-2.5 text-[#10B981]" />
          </div>
        )}
        {hasAntigravity && (
          <div className="flex size-3.5 items-center justify-center rounded-[3.5px] bg-[#FAFAFA] dark:bg-[#16161B] ring-1 ring-zinc-300 dark:ring-zinc-700">
            <AntigravityIcon className="size-2.5 text-indigo-500" />
          </div>
        )}
      </div>
    );
  };

  if (sidebarCollapsed) {
    return (
      <aside className="flex h-full w-[46px] shrink-0 flex-col items-center border-r border-zinc-200 dark:border-[#222227] bg-[#FAFAFA] dark:bg-[#0E0E12] py-2.5 text-xs select-none transition-all duration-150 rounded-[3.5px] z-30">
        {/* Top Expand Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          title="Expand sidebar (⌘B)"
          className="flex size-7 items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer rounded-[3.5px]"
        >
          <PanelLeftOpen className="size-4" />
        </button>

        <div className="my-2 h-[1px] w-5 bg-zinc-200 dark:bg-zinc-800" />

        {/* Quick Action Icons */}
        <div className="flex flex-col items-center gap-1.5 w-full px-1.5">
          <button
            type="button"
            onClick={handleNewProject}
            title="New Project (⌘N)"
            className="flex size-7 w-full items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer rounded-[3.5px]"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode("deck")}
            title="Mission Control"
            className={`flex size-7 w-full items-center justify-center transition-colors cursor-pointer rounded-[3.5px] ${
              mode === "deck"
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold"
                : "text-zinc-500 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <LayoutDashboard className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsIntegrationsOpen(true)}
            title="Automations"
            className="flex size-7 w-full items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer rounded-[3.5px]"
          >
            <Sparkles className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            title="Search Workspace (⌘K)"
            className="flex size-7 w-full items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer rounded-[3.5px]"
          >
            <Search className="size-3.5" />
          </button>
        </div>

        {/* Bottom User Profile */}
        <div className="mt-auto flex flex-col items-center gap-2 pt-2 border-t border-zinc-200 dark:border-[#222227] w-full">
          <div
            title={userEmail}
            className="flex size-6 items-center justify-center rounded-[3.5px] bg-[#16a34a] text-white font-mono font-bold text-[11px] select-none"
          >
            {userInitial}
          </div>
          <Link
            href="/settings"
            title="Workspace Settings (⌘,)"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1 cursor-pointer rounded-[3.5px]"
          >
            <Settings className="size-3.5" />
          </Link>
        </div>
      </aside>
    );
  }

  const activeProjectName =
    project?.name || project?.repo_full_name || "ecommerce-test-app";

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-zinc-200 dark:border-[#222227] bg-[#FAFAFA] dark:bg-[#0E0E12] text-xs select-none transition-all duration-150 z-30">
      {/* Top Workspace Tenant Selector (38px) */}
      <div className="flex h-10 shrink-0 items-center justify-between px-2.5 border-b border-zinc-200 dark:border-[#222227] bg-[#F4F4F6] dark:bg-[#0E0E12]">
        {/* Tenant Switcher Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 px-1.5 py-1 text-left rounded-[3.5px] hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer min-w-0 max-w-[190px]"
            >
              <div className="flex size-5 shrink-0 items-center justify-center bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-[10px] rounded-[3.5px]">
                {currentTenant?.name?.charAt(0) || "W"}
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="truncate font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                    {currentTenant?.name || "Select Workspace"}
                  </span>
                  <ChevronDown className="size-2.5 text-zinc-400 shrink-0" />
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-60 bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-[3.5px] shadow-2xl p-1 text-xs select-none z-50"
          >
            <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1">
              Your Workspaces
            </DropdownMenuLabel>
            {tenants.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => switchTenant(t.id)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-[3.5px] cursor-pointer ${
                  t.id === currentTenant?.id
                    ? "bg-zinc-100 dark:bg-zinc-800/80 font-semibold text-zinc-950 dark:text-white"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex size-4 items-center justify-center bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-[9px] rounded-[3.5px]">
                    {t.name.charAt(0)}
                  </div>
                  <span className="truncate">{t.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded-[3.5px] bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                    {t.plan}
                  </span>
                  {t.id === currentTenant?.id && (
                    <Check className="size-3 text-emerald-500" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />
            <DropdownMenuItem
              onClick={() => setIsNewWorkspaceOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-emerald-600 dark:text-emerald-400"
            >
              <Plus className="size-3.5" />
              <span>Create New Workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={toggleSidebar}
          title="Collapse sidebar (⌘B)"
          className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 rounded-[3.5px] transition-colors cursor-pointer"
        >
          <PanelLeft className="size-3.5" />
        </button>
      </div>

      {/* Primary Navigation Actions */}
      <div className="p-2 space-y-0.5">
        <button
          type="button"
          onClick={() => {
            setActiveItem("new-project");
            handleNewProject();
          }}
          className="flex w-full items-center justify-between px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer rounded-[3.5px] group"
        >
          <div className="flex items-center gap-2">
            <Plus className="size-3.5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 shrink-0" />
            <span className="font-medium">New Project</span>
          </div>
          <span className="font-mono text-[10px] text-zinc-400">⌘N</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveItem("deck");
            setMode("deck");
          }}
          className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-xs transition-colors cursor-pointer rounded-[3.5px] ${
            mode === "deck"
              ? "bg-zinc-200 dark:bg-[#1A1A22] text-zinc-950 dark:text-white font-semibold"
              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/80"
          }`}
        >
          <LayoutDashboard className="size-3.5 text-zinc-500 shrink-0" />
          <span>Mission Control</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveItem("automations");
            setIsIntegrationsOpen(true);
          }}
          className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer rounded-[3.5px]"
        >
          <Sparkles className="size-3.5 text-zinc-500 shrink-0" />
          <span>Automations</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveItem("search");
            setIsSearchOpen(true);
          }}
          className="flex w-full items-center justify-between px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer rounded-[3.5px] group"
        >
          <div className="flex items-center gap-2">
            <Search className="size-3.5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 shrink-0" />
            <span>Search</span>
          </div>
          <span className="font-mono text-[10px] text-zinc-400">⌘K</span>
        </button>
      </div>

      <div className="mx-2 h-[1px] bg-zinc-200 dark:bg-zinc-800/80 my-1" />

      {/* Projects Hierarchy Tree */}
      <div className="flex-1 overflow-y-auto px-2 scrollbar-thin">
        {/* Section Header */}
        <div className="flex h-6 items-center justify-between px-1 text-[10px] font-mono uppercase font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider">
          <span>Projects</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleNewProject}
              title="New Project"
              className="p-0.5 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <Plus className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => setIsCloneOpen(true)}
              title="Clone repository"
              className="p-0.5 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <FolderPlus className="size-3" />
            </button>
          </div>
        </div>

        {/* Project Items & Nested Worktrees */}
        <div className="mt-1 space-y-1">
          {projects.length === 0 ? (
            <div className="px-3 py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 my-2">
              <Folder className="size-4 text-zinc-400 mx-auto mb-1.5" />
              <p className="text-[11px] text-zinc-500 font-medium">No repositories</p>
              <p className="text-[10px] text-zinc-400 mt-0.5 mb-2.5">Add a repo to this workspace</p>
              <button
                type="button"
                onClick={() => setIsCloneOpen(true)}
                className="px-2.5 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-medium cursor-pointer rounded-[3.5px] hover:opacity-90 transition-opacity"
              >
                + Open Repository
              </button>
            </div>
          ) : (
            projects.map((proj) => {
              const isOpen = openProjects[proj.id] ?? true;
              const isCurrentProj = proj.id === projectId;

              return (
                <div key={proj.id} className="group/proj space-y-0.5">
                  <div
                    onClick={() => {
                      toggleProjectFolder(proj.id);
                      if (proj.id !== projectId) {
                        switchProject(proj.id);
                      }
                    }}
                    className={`flex cursor-pointer items-center justify-between px-2 py-1 text-xs transition-colors rounded-[3.5px] ${
                      isCurrentProj
                        ? "font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-200/50 dark:bg-zinc-800/50"
                        : "text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isOpen ? (
                        <FolderOpen className="size-3.5 text-zinc-600 dark:text-zinc-400 shrink-0" />
                      ) : (
                        <Folder className="size-3.5 text-zinc-600 dark:text-zinc-400 shrink-0" />
                      )}
                      <span className="truncate">{proj.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openNewWorktreeModal(proj.id);
                        }}
                        title="Create new worktree in this project"
                        className="opacity-0 group-hover/proj:opacity-100 p-0.5 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-300/60 dark:hover:bg-zinc-700/60 transition-all rounded-[3.5px] cursor-pointer"
                      >
                        <Plus className="size-3 text-emerald-600 dark:text-emerald-400" />
                      </button>
                      <ChevronDown
                        className={`size-3 text-zinc-400 transition-transform ${
                          isOpen ? "" : "-rotate-90"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Nested Worktrees for this project */}
                  {isOpen && isCurrentProj && (
                    <div className="space-y-0.5 pl-2 border-l border-zinc-200 dark:border-zinc-800 ml-3.5 my-0.5">
                      {lanes.length === 0 ? (
                        <div className="px-2 py-1 text-[10px] text-zinc-400">
                          No worktrees yet
                        </div>
                      ) : (
                        lanes.map((lane, idx) => {
                          const isLaneActive = lane.id === activeLaneId;
                          const relativeTimes = ["13m", "42m", "2h", "1d"];
                          const displayTime = relativeTimes[idx % relativeTimes.length];
                          const worktreeBranch = lane.branch || lane.name || "main";
                          const isDefaultBranch = lane.is_pair_lane || worktreeBranch === "main";

                          return (
                            <div
                              key={lane.id}
                              onClick={() => {
                                switchLane(lane.id);
                                setMode("deck");
                              }}
                              className={`group flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs transition-colors rounded-[3.5px] ${
                                isLaneActive
                                  ? "bg-zinc-200 dark:bg-[#1A1A22] text-zinc-950 dark:text-white font-medium"
                                  : "text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-zinc-200"
                              }`}
                              title={`Git worktree branch: ${worktreeBranch}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <GitBranch
                                  className={`size-3.5 shrink-0 ${
                                    isLaneActive
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                                  }`}
                                />
                                <span className="truncate font-mono text-[11px]">
                                  {worktreeBranch}
                                </span>
                                {isDefaultBranch && (
                                  <span className="text-[9px] font-mono px-1 py-0.2 rounded-[3.5px] bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                    default
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                {getWorktreeAgentBadges(lane.id)}
                                <span className="font-mono text-[10px] text-zinc-400">
                                  {displayTime}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}

                      {/* Add Worktree Button */}
                      <button
                        type="button"
                        onClick={() => openNewWorktreeModal(proj.id)}
                        className="flex w-full items-center gap-1.5 px-2 py-1 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer rounded-[3.5px] mt-1 border-t border-dashed border-zinc-200 dark:border-zinc-800/60 pt-1"
                      >
                        <Plus className="size-3 text-emerald-500 shrink-0" />
                        <span>New worktree...</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom User Profile Footer (42px, Zero-Rounding, No Dev Overlap) */}
      <div className="mt-auto flex h-11 items-center justify-between border-t border-zinc-200 dark:border-[#222227] px-2.5 bg-[#F4F4F6] dark:bg-[#0E0E12] rounded-[3.5px]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-5 shrink-0 items-center justify-center rounded-[3.5px] bg-[#16a34a] text-white font-mono font-bold text-[10px] select-none">
            {userInitial}
          </div>
          <span className="truncate font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
            {userEmail}
          </span>
        </div>
        <Link
          href="/settings"
          className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors rounded-[3.5px] cursor-pointer"
          title="Workspace Settings (⌘,)"
        >
          <Settings className="size-3.5" />
        </Link>
      </div>
    </aside>
  );
}
