"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Settings,
  SlidersHorizontal,
  Folder,
  FolderPlus,
  PanelLeft,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flag,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function SupersetSidebar() {
  const {
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
    setIsIntegrationsOpen,
    setIsSearchOpen,
    setIsCloneOpen,
    sidebarCollapsed,
    toggleSidebar,
  } = useWorkspace();
  const [activeItem, setActiveItem] = useState<string>("automations");

  const handleAddLane = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const laneName = prompt("Enter new session task or branch name:", "New Session");
    if (laneName && laneName.trim()) {
      submitPrompt(laneName.trim(), "Claude", "default", "default");
    }
  };

  if (sidebarCollapsed) {
    return (
      <aside className="flex h-full w-[48px] shrink-0 flex-col items-center border-r border-[var(--border)] bg-[var(--surface-sidebar)] py-2.5 text-[12px] select-none transition-all duration-200">
        {/* Top Expand Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          title="Expand sidebar (⌘B)"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
        >
          <PanelLeftOpen className="size-4" />
        </button>

        <div className="my-2 h-[1px] w-6 bg-[var(--border)]/60" />

        {/* Quick Actions */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={handleAddLane}
            title="New Session"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode("deck")}
            title="Mission Control"
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors cursor-pointer ${
              mode === "deck"
                ? "bg-[var(--wash)] text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
            }`}
          >
            <Flag className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsIntegrationsOpen(true)}
            title="Automations"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--wash)] text-[var(--foreground)] hover:bg-[var(--wash-strong)] transition-colors cursor-pointer"
          >
            <Sparkles className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            title="Search"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <Search className="size-4" />
          </button>
        </div>

        {/* Bottom Profile / Settings */}
        <div className="mt-auto flex flex-col items-center gap-2 pt-2 border-t border-[var(--border)]/60">
          <div
            title="trashdev098@gmail.com"
            className="flex size-6 items-center justify-center rounded-full bg-[#52a447] text-white font-medium text-[11px]"
          >
            H
          </div>
          <button
            type="button"
            onClick={() => setIsIntegrationsOpen(true)}
            title="Settings"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 cursor-pointer"
          >
            <Settings className="size-3.5" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-[250px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-sidebar)] text-[13px] select-none transition-all duration-200">
      {/* Top Sidebar Header & Panel Controls */}
      <div className="flex h-10 items-center justify-between px-3">
        <button
          type="button"
          onClick={toggleSidebar}
          title="Collapse sidebar (⌘B)"
          className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--wash)] rounded transition-colors cursor-pointer"
        >
          <PanelLeft className="size-4" />
        </button>
        <div className="flex items-center gap-0.5 text-[var(--muted-foreground)]">
          <button
            type="button"
            className="p-1 hover:text-[var(--foreground)] hover:bg-[var(--wash)] rounded transition-colors cursor-pointer"
            title="Back"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            className="p-1 hover:text-[var(--foreground)] hover:bg-[var(--wash)] rounded transition-colors cursor-pointer"
            title="Forward"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Global Action List */}
      <div className="space-y-0.5 px-2 pt-1">
        <button
          type="button"
          onClick={() => {
            setActiveItem("new-session");
            handleAddLane();
          }}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-[var(--foreground)] hover:bg-[var(--wash)] transition-colors cursor-pointer"
        >
          <Plus className="size-4 text-[var(--muted-foreground)] shrink-0" />
          <span>New Session</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveItem("mission-control");
            setMode("deck");
          }}
          className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors cursor-pointer ${
            activeItem === "mission-control" && mode === "deck"
              ? "bg-[var(--wash)] font-medium text-[var(--foreground)]"
              : "text-[var(--foreground)] hover:bg-[var(--wash)]"
          }`}
        >
          <Flag className="size-4 text-[var(--muted-foreground)] shrink-0" />
          <span>Mission Control</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveItem("automations");
            setIsIntegrationsOpen(true);
          }}
          className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors cursor-pointer ${
            activeItem === "automations"
              ? "bg-[var(--wash-strong)] font-medium text-[var(--foreground)]"
              : "bg-[var(--wash)] font-medium text-[var(--foreground)] hover:bg-[var(--wash-strong)]"
          }`}
        >
          <Sparkles className="size-4 text-[var(--foreground)] shrink-0" />
          <span>Automations</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveItem("search");
            setIsSearchOpen(true);
          }}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-[var(--foreground)] hover:bg-[var(--wash)] transition-colors cursor-pointer"
        >
          <Search className="size-4 text-[var(--muted-foreground)] shrink-0" />
          <span>Search</span>
        </button>
      </div>

      {/* Projects Hierarchy Tree */}
      <div className="mt-5 flex-1 overflow-y-auto px-2 scrollbar-thin">
        {/* Section Header */}
        <div className="flex h-7 items-center justify-between px-2.5 text-[12px] font-medium text-[var(--muted-foreground)]">
          <span>Projects</span>
          <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <button
              type="button"
              title="Filter / sort projects"
              className="p-0.5 hover:text-[var(--foreground)] rounded transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsCloneOpen(true)}
              title="New project or clone repository"
              className="p-0.5 hover:text-[var(--foreground)] rounded transition-colors cursor-pointer"
            >
              <FolderPlus className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Project Items & Sessions */}
        <div className="mt-1 space-y-0.5">
          {projects.length === 0 ? (
            <div className="space-y-0.5">
              <div className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-[var(--foreground)] hover:bg-[var(--wash)] transition-colors">
                <Folder className="size-4 text-[var(--muted-foreground)] shrink-0" />
                <span className="truncate">congruence</span>
              </div>
              <div
                onClick={handleAddLane}
                className="flex cursor-pointer items-center justify-between rounded-md pl-8 pr-2.5 py-1.5 text-[13px] text-[var(--foreground)] hover:bg-[var(--wash)] transition-colors"
              >
                <span>New Session</span>
                <span className="font-mono text-[11px] text-[var(--subtle-foreground)]">13m</span>
              </div>
            </div>
          ) : (
            projects.map((p) => {
              const isActiveProject = p.id === projectId;
              return (
                <div key={p.id} className="space-y-0.5">
                  {/* Project Folder Row */}
                  <div
                    onClick={() => {
                      switchProject(p.id);
                      setMode("deck");
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-[var(--foreground)] hover:bg-[var(--wash)] transition-colors"
                  >
                    <Folder className="size-4 text-[var(--muted-foreground)] shrink-0" />
                    <span className="truncate font-normal">
                      {p.name || p.repo_full_name || "congruence"}
                    </span>
                  </div>

                  {/* Sessions / Worktree Lanes under project */}
                  {isActiveProject && (
                    <div className="space-y-0.5">
                      {lanes.length === 0 ? (
                        <div
                          onClick={handleAddLane}
                          className="flex cursor-pointer items-center justify-between rounded-md pl-8 pr-2.5 py-1.5 text-[13px] text-[var(--foreground)] hover:bg-[var(--wash)] transition-colors"
                        >
                          <span>New Session</span>
                          <span className="font-mono text-[11px] text-[var(--subtle-foreground)]">13m</span>
                        </div>
                      ) : (
                        lanes.map((lane, idx) => {
                          const isLaneActive = lane.id === activeLaneId;
                          const relativeTimes = ["13m", "42m", "2h", "1d"];
                          const displayTime = relativeTimes[idx % relativeTimes.length];
                          const displayName = lane.name.includes(" · ")
                            ? lane.name.split(" · ")[1]
                            : lane.name.startsWith("Claude") || lane.name.startsWith("Pair")
                            ? lane.name
                            : lane.name || "New Session";

                          return (
                            <div
                              key={lane.id}
                              onClick={() => {
                                switchLane(lane.id);
                                setMode("deck");
                              }}
                              className={`group flex cursor-pointer items-center justify-between rounded-md pl-8 pr-2.5 py-1.5 text-[13px] transition-colors ${
                                isLaneActive
                                  ? "text-[var(--foreground)] font-normal bg-[var(--wash-subtle)]"
                                  : "text-[var(--foreground)] hover:bg-[var(--wash)]"
                              }`}
                            >
                              <span className="truncate">{displayName}</span>
                              <span className="font-mono text-[11px] text-[var(--subtle-foreground)] shrink-0 ml-2">
                                {displayTime}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom User Profile Footer */}
      <div className="mt-auto flex h-12 items-center justify-between border-t border-[var(--border)]/60 px-3 bg-[var(--surface-sidebar)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#52a447] text-white font-medium text-[11px] select-none">
            H
          </div>
          <span className="truncate text-[12px] text-[var(--foreground)] font-normal">
            trashdev098@gmail.com
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsIntegrationsOpen(true)}
          className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded cursor-pointer"
          title="Settings"
        >
          <Settings className="size-4" />
        </button>
      </div>
    </aside>
  );
}

