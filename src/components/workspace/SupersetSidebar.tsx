"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Search,
  Plus,
  Settings,
  Folder,
  FolderOpen,
  FolderPlus,
  PanelLeft,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  Sparkles,
  GitBranch,
  LayoutDashboard,
  Check,
  Github,
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
import { api } from "@/lib/api";
import { useGithubStatusQuery, useGithubReposQuery } from "@/hooks/queries/useWorkspaceQueries";

export function SupersetSidebar() {
  const {
    currentTenant,
    tenants,
    switchTenant,
    setIsNewWorkspaceOpen,
    projects,
    projectId,
    switchProject,
    lanes,
    activeLaneId,
    switchLane,
    mode,
    setMode,
    chats,
    setIsIntegrationsOpen,
    setIsSearchOpen,
    setIsCloneOpen,
    openNewWorktreeModal,
    sidebarCollapsed,
    toggleSidebar,
  } = useWorkspace();

  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();

  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    currentTenant?.ownerEmail ||
    "";
  const userInitial = (user?.firstName || user?.fullName || userEmail || "U")
    .charAt(0)
    .toUpperCase();
  const userAvatarUrl = user?.imageUrl;

  const [activeNav, setActiveNav] = useState<string>("deck");
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});

  // TanStack Query for GitHub Status and prefetching repos into local storage cache
  const { data: ghStatus } = useGithubStatusQuery();
  useGithubReposQuery({
    enabled: Boolean(isUserLoaded && isSignedIn && ghStatus?.connected),
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

  // Keyboard shortcut for New Project (⌘N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        setIsCloneOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsCloneOpen]);

  // Active agents badge inside a worktree lane
  const getWorktreeAgentBadges = (laneId: string, isDefaultBranch: boolean = false) => {
    const laneChats = chats.filter((c) => c.laneId === laneId);
    const hasClaude = laneChats.some((c) => c.harness === "Claude");
    const hasCodex = laneChats.some((c) => c.harness === "Codex");
    const hasAntigravity = laneChats.some((c) => c.harness === "Antigravity");

    if (isDefaultBranch && laneChats.length === 0) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08]" title="Codex & Antigravity">
          <span title="OpenAI Codex" className="flex items-center">
            <OpenAIIcon className="size-3 text-[#10B981]" />
          </span>
          <span title="Google Antigravity" className="flex items-center">
            <AntigravityIcon className="size-3 text-[#818CF8]" />
          </span>
        </div>
      );
    }

    const showCodex = hasCodex || (!hasClaude && !hasAntigravity);
    const showGemini = hasAntigravity || (!hasClaude && !hasCodex);

    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08]" title="Active agents">
        {hasClaude && (
          <span title="Claude Code" className="flex items-center">
            <ClaudeIcon className="size-3 text-[#E8804A]" />
          </span>
        )}
        {showCodex && (
          <span title="OpenAI Codex" className="flex items-center">
            <OpenAIIcon className="size-3 text-[#10B981]" />
          </span>
        )}
        {showGemini && (
          <span title="Google Antigravity" className="flex items-center">
            <AntigravityIcon className="size-3 text-[#818CF8]" />
          </span>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`relative flex h-full shrink-0 flex-col border-r border-zinc-200/80 dark:border-zinc-800/80 bg-[#FAFAFA] dark:bg-[#0E0E12] text-xs select-none z-30 font-sans overflow-hidden transition-[width] duration-150 ease-out ${
        sidebarCollapsed ? "w-[52px]" : "w-[270px]"
      }`}
    >
      {/* Top Workspace Header */}
      <div className="flex h-10 shrink-0 items-center justify-between px-2 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#0E0E12]/80">
        {sidebarCollapsed ? (
          <div className="w-full flex items-center justify-center">
            <button
              type="button"
              onClick={toggleSidebar}
              title="Expand sidebar (⌘B)"
              className="flex size-7 items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-[3.5px] transition-colors cursor-pointer"
            >
              <PanelLeftOpen className="size-3.5" />
            </button>
          </div>
        ) : (
          <>
            {/* Workspace Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 px-1.5 py-1 text-left rounded-[3.5px] hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer flex-1 min-w-0 mr-1 group data-[state=open]:bg-zinc-200/60 dark:data-[state=open]:bg-zinc-800/60"
                >
                  <div className="flex size-5.5 shrink-0 items-center justify-center bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-[11px] rounded-[3.5px] shadow-[0_1px_2px_rgba(0,0,0,0.1)] ring-1 ring-black/10 dark:ring-white/10">
                    {currentTenant?.name?.charAt(0) || userInitial || "H"}
                  </div>
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <span className="truncate font-medium text-xs text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {currentTenant?.name || `${user?.firstName || "Hector"}'s Workspace`}
                    </span>
                    <ChevronDown className="size-3 text-zinc-400 shrink-0 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-transform duration-150 group-data-[state=open]:rotate-180 ml-auto" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={6}
                className="w-60 bg-white dark:bg-[#121216] border border-zinc-200/90 dark:border-zinc-800/90 rounded-[3.5px] shadow-xl p-1 text-xs select-none z-50 font-sans"
              >
                <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1 tracking-wider">
                  Workspaces
                </DropdownMenuLabel>
                {tenants.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => switchTenant(t.id)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-[3.5px] cursor-pointer text-xs transition-colors duration-100 ${
                      t.id === currentTenant?.id
                        ? "bg-zinc-100 dark:bg-zinc-800/80 font-medium text-zinc-950 dark:text-white"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex size-5 items-center justify-center bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-[10px] rounded-[3px]">
                        {t.name.charAt(0)}
                      </div>
                      <span className="truncate">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-[2.5px] bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase font-medium">
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
                  className="flex items-center gap-2 px-2 py-1.5 rounded-[3.5px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-emerald-600 dark:text-emerald-400 text-xs transition-colors"
                >
                  <Plus className="size-3.5" />
                  <span>Create Workspace</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              onClick={toggleSidebar}
              title="Collapse sidebar (⌘B)"
              className="flex size-7 shrink-0 items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-[3.5px] transition-colors cursor-pointer"
            >
              <PanelLeft className="size-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Primary Actions Navigation */}
      <div className="p-2 space-y-0.5 font-sans">
        {/* New Project Button */}
        <button
          type="button"
          onClick={() => {
            setActiveNav("new-project");
            handleNewProject();
          }}
          title={sidebarCollapsed ? "New Project (⌘N)" : undefined}
          className={`relative flex w-full items-center ${
            sidebarCollapsed ? "justify-center px-0" : "justify-between px-2"
          } py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer rounded-[3.5px] group font-medium`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Plus className="size-3.5 text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 shrink-0 transition-colors" />
            {!sidebarCollapsed && <span className="truncate">New Project</span>}
          </div>
          {!sidebarCollapsed && (
            <kbd className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-200/40 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 px-1 py-0.5 rounded-[3px] font-medium leading-none tabular-nums shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              ⌘N
            </kbd>
          )}
        </button>

        {/* Mission Control Button */}
        <button
          type="button"
          onClick={() => {
            setActiveNav("deck");
            setMode("deck");
          }}
          title={sidebarCollapsed ? "Mission Control" : undefined}
          className={`relative flex w-full items-center ${
            sidebarCollapsed ? "justify-center px-0" : "gap-2 px-2"
          } py-1.5 text-xs transition-colors cursor-pointer rounded-[3.5px] font-medium ${
            mode === "deck"
              ? "bg-zinc-200/70 dark:bg-zinc-800/80 text-zinc-950 dark:text-white font-semibold shadow-xs"
              : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <LayoutDashboard className={`size-3.5 shrink-0 transition-colors ${
            mode === "deck" ? "text-zinc-950 dark:text-white" : "text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
          }`} />
          {!sidebarCollapsed && <span className="truncate">Mission Control</span>}
        </button>

        {/* Automations Button */}
        <button
          type="button"
          onClick={() => {
            setActiveNav("automations");
            setIsIntegrationsOpen(true);
          }}
          title={sidebarCollapsed ? "Automations" : undefined}
          className={`relative flex w-full items-center ${
            sidebarCollapsed ? "justify-center px-0" : "gap-2 px-2"
          } py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer rounded-[3.5px] font-medium group`}
        >
          <Sparkles className="size-3.5 text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
          {!sidebarCollapsed && <span className="truncate">Automations</span>}
        </button>

        {/* Search Button */}
        <button
          type="button"
          onClick={() => {
            setActiveNav("search");
            setIsSearchOpen(true);
          }}
          title={sidebarCollapsed ? "Search Workspace (⌘K)" : undefined}
          className={`relative flex w-full items-center ${
            sidebarCollapsed ? "justify-center px-0" : "justify-between px-2"
          } py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer rounded-[3.5px] group font-medium`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="size-3.5 text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Search</span>}
          </div>
          {!sidebarCollapsed && (
            <kbd className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-200/40 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 px-1 py-0.5 rounded-[3px] font-medium leading-none tabular-nums shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              ⌘K
            </kbd>
          )}
        </button>
      </div>

      <div className="mx-2.5 h-px bg-zinc-200/80 dark:bg-zinc-800/80 my-1" />

      {/* Projects Hierarchy Tree */}
      {!sidebarCollapsed && (
        <div className="flex-1 overflow-y-auto px-2 scrollbar-thin font-sans">
          {/* Section Header */}
          <div className="flex h-6 items-center justify-between px-2 text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 tracking-[0.06em]">
            <span>Projects</span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleNewProject}
                title="New Project"
                className="flex size-5 items-center justify-center hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-[3.5px] transition-colors cursor-pointer text-zinc-400"
              >
                <Plus className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsCloneOpen(true)}
                title="Open repository"
                className="flex size-5 items-center justify-center hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-[3.5px] transition-colors cursor-pointer text-zinc-400"
              >
                <FolderPlus className="size-3" />
              </button>
            </div>
          </div>

          {/* Project Items & Nested Worktrees */}
          <div className="mt-1 space-y-0.5">
            {projects.length === 0 ? (
              ghStatus?.connected ? (
                <div className="px-3 py-4 text-center border border-zinc-200/80 dark:border-zinc-800/80 my-2 rounded-[3.5px] bg-zinc-50/50 dark:bg-[#121216]/60">
                  <Folder className="size-4 text-zinc-400 mx-auto mb-1.5" />
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">No repositories</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5 mb-2.5">Open a repo to start working</p>
                  <button
                    type="button"
                    onClick={() => setIsCloneOpen(true)}
                    className="px-2.5 py-1 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium cursor-pointer rounded-[3.5px] hover:opacity-90 transition-opacity"
                  >
                    + Open Repository
                  </button>
                </div>
              ) : (
                <div className="px-3 py-4 text-center border border-zinc-200/80 dark:border-zinc-800/80 my-2 rounded-[3.5px] bg-zinc-50/50 dark:bg-[#121216]/60">
                  <Github className="size-4 text-zinc-600 dark:text-zinc-400 mx-auto mb-1.5" />
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 font-semibold">Connect GitHub</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 mb-2.5 leading-tight">
                    Access and clone your repositories
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await api.getGithubConnectUrl();
                        if (res.authorize_url) {
                          window.location.href = res.authorize_url;
                          return;
                        }
                      } catch {
                        // fallback
                      }
                      setIsCloneOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold cursor-pointer rounded-[3.5px] hover:opacity-90 transition-opacity shadow-xs"
                  >
                    <Github className="size-3.5" />
                    <span>Connect GitHub</span>
                  </button>
                </div>
              )
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
                      className={`group/proj flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs transition-colors rounded-[3.5px] ${
                        isCurrentProj
                          ? "font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40"
                          : "text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-zinc-400 dark:text-zinc-500">
                          {isOpen ? (
                            <ChevronDown className="size-3 text-zinc-400 group-hover/proj:text-zinc-700 dark:group-hover/proj:text-zinc-200 transition-transform" />
                          ) : (
                            <ChevronRight className="size-3 text-zinc-400 group-hover/proj:text-zinc-700 dark:group-hover/proj:text-zinc-200 transition-transform" />
                          )}
                        </span>
                        {isOpen ? (
                          <FolderOpen className="size-3.5 text-zinc-600 dark:text-zinc-300 shrink-0" />
                        ) : (
                          <Folder className="size-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                        )}
                        <span className="truncate font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                          {proj.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openNewWorktreeModal(proj.id);
                          }}
                          title="Create new worktree"
                          className="opacity-0 group-hover/proj:opacity-100 flex size-5 items-center justify-center hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 transition-all rounded-[2.5px] cursor-pointer text-zinc-400"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>

                    {/* Nested Worktrees */}
                    {isOpen && isCurrentProj && (
                      <div className="space-y-0.5 ml-3 pl-2.5 border-l border-zinc-200/80 dark:border-zinc-800/80 my-1">
                        {lanes.length === 0 ? (
                          <div className="px-2 py-1 text-[11px] text-zinc-400">
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
                                className={`group flex flex-col cursor-pointer px-2 py-1.5 text-xs transition-colors rounded-[3.5px] ${
                                  isLaneActive
                                    ? "bg-zinc-200/75 dark:bg-zinc-800/80 text-zinc-950 dark:text-white shadow-2xs"
                                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40 hover:text-zinc-950 dark:hover:text-zinc-100"
                                }`}
                                title={`Git worktree branch: ${worktreeBranch}`}
                              >
                                {/* Line 1: Branch info and timestamp */}
                                <div className="flex items-center justify-between gap-1.5 min-w-0 w-full">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <GitBranch
                                      className={`size-3.5 shrink-0 transition-colors ${
                                        isLaneActive
                                          ? "text-emerald-500 dark:text-emerald-400"
                                          : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                                      }`}
                                    />
                                    <span
                                      className={`truncate text-xs ${
                                        isLaneActive ? "font-semibold text-zinc-950 dark:text-white" : "font-medium text-zinc-800 dark:text-zinc-200"
                                      }`}
                                    >
                                      {worktreeBranch}
                                    </span>
                                    {isDefaultBranch && (
                                      <span className="text-[9px] px-1 py-0.2 rounded-[2.5px] bg-zinc-200/60 dark:bg-zinc-800/90 text-zinc-500 dark:text-zinc-400 font-mono font-normal uppercase tracking-wider leading-none shrink-0 border border-zinc-200/50 dark:border-zinc-700/50">
                                        default
                                      </span>
                                    )}
                                  </div>

                                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tabular-nums shrink-0 ml-1">
                                    {displayTime}
                                  </span>
                                </div>

                                {/* Line 2: Open Agents on a new line */}
                                <div className="flex items-center mt-1 pl-5">
                                  {getWorktreeAgentBadges(lane.id, isDefaultBranch)}
                                </div>
                              </div>
                            );
                          })
                        )}

                        {/* Add Worktree Button */}
                        <button
                          type="button"
                          onClick={() => openNewWorktreeModal(proj.id)}
                          className="flex w-full items-center gap-1.5 px-2 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer rounded-[3.5px] mt-1 group"
                        >
                          <Plus className="size-3 text-zinc-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors shrink-0" />
                          <span className="text-[11px] font-medium">New worktree...</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {sidebarCollapsed && <div className="flex-1" />}

      {/* Bottom User Profile Footer */}
      <div
        className={`mt-auto flex h-12 shrink-0 items-center ${
          sidebarCollapsed ? "justify-center px-0 flex-col gap-1 py-1.5" : "justify-between px-2"
        } border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#0E0E12]/90 font-sans`}
      >
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-1">
            <div
              title={userEmail}
              className="relative flex size-6.5 shrink-0 items-center justify-center rounded-[3.5px] overflow-hidden bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-[10px] shadow-xs ring-1 ring-black/10 dark:ring-white/10"
            >
              {userAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userAvatarUrl}
                  alt={userEmail || "User"}
                  className="size-full object-cover"
                />
              ) : (
                userInitial
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
              <div className="relative flex size-6.5 shrink-0 items-center justify-center rounded-[3.5px] overflow-hidden bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-[10px] shadow-xs ring-1 ring-black/10 dark:ring-white/10">
                {userAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userAvatarUrl}
                    alt={userEmail || "User"}
                    className="size-full object-cover"
                  />
                ) : (
                  userInitial
                )}
                <span className="absolute bottom-0 right-0 size-1.5 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-[#0E0E12]" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-tight">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Hector"}
                </span>
                <span className="truncate text-[10.5px] text-zinc-400 dark:text-zinc-500 font-mono leading-tight">
                  {userEmail || "ashdev098@gmail.com"}
                </span>
              </div>
            </div>
            <Link
              href={currentTenant?.id || projectId ? `/${currentTenant?.id || projectId}/settings` : "/settings"}
              className="flex size-7 shrink-0 items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors rounded-[3.5px] cursor-pointer"
              title="Workspace Settings (⌘,)"
            >
              <Settings className="size-3.5" />
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}


