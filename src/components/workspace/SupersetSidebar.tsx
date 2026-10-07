"use client";

import React, { useState, useEffect } from "react";
import {
  PanelLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Flag,
  Sparkles,
  Search,
  SlidersHorizontal,
  FolderPlus,
  ChevronDown,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { createClient } from "@/lib/supabase/client";

export function SupersetSidebar() {
  const {
    projects,
    project,
    projectId,
    switchProject,
    lanes,
    activeLaneId,
    switchLane,
    mode,
    setMode,
    setIsIntegrationsOpen,
    setIsSearchOpen,
    setIsCloneOpen,
    sidebarCollapsed,
    toggleSidebar,
  } = useWorkspace();

  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("trashdev098@gmail.com");

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch {
        // Fallback email in place
      }
    }
    loadUser();
  }, []);

  const userInitial = (userEmail ? userEmail[0] : "H").toUpperCase();

  // Collapsed Sidebar View (⌘B)
  if (sidebarCollapsed) {
    return (
      <aside className="flex h-full w-[48px] shrink-0 flex-col items-center border-r border-[var(--border)] bg-[var(--surface-sidebar)] py-2 text-[12px] select-none transition-all duration-200">
        {/* Top Expand Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          title="Expand sidebar (⌘B)"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-colors"
        >
          <PanelLeft className="size-4" />
        </button>

        <div className="my-2 h-[1px] w-6 bg-[var(--border)]/60" />

        {/* Quick Nav Actions */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setMode("hub")}
            title="New Session"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode("deck")}
            title="Mission Control"
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              mode === "deck"
                ? "bg-[var(--surface-tertiary)] text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]"
            }`}
          >
            <Flag className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode("pull-requests")}
            title="Automations"
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              mode === "pull-requests"
                ? "bg-[var(--surface-tertiary)] text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]"
            }`}
          >
            <Sparkles className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            title="Search (⌘K)"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <Search className="size-4" />
          </button>
        </div>

        {/* Bottom Profile / Settings */}
        <div className="mt-auto flex flex-col items-center gap-2 pt-2 border-t border-[var(--border)]/60 w-full">
          <div
            title={userEmail}
            className="flex size-7 items-center justify-center rounded-full bg-[#5b9e2d] font-sans text-xs font-semibold text-white shadow-sm"
          >
            {userInitial}
          </div>
          <button
            type="button"
            onClick={() => setIsIntegrationsOpen(true)}
            title="Settings & Integrations"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </aside>
    );
  }

  const projectName = project?.name || "congruence";

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-sidebar)] text-[13px] select-none transition-all duration-200">
      {/* 1. Top Header Bar: Sidebar toggle icon on left, History chevrons on right */}
      <div className="flex h-11 items-center justify-between px-3 pt-1">
        <button
          type="button"
          onClick={toggleSidebar}
          title="Collapse sidebar (⌘B)"
          className="flex h-7 w-7 items-center justify-center rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          <PanelLeft className="size-4 stroke-[1.75]" />
        </button>

        <div className="flex items-center gap-1 text-[var(--muted-foreground)]/80">
          <button
            type="button"
            title="Back"
            className="flex h-7 w-7 items-center justify-center rounded hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <ChevronLeft className="size-4 stroke-[1.75]" />
          </button>
          <button
            type="button"
            title="Forward"
            className="flex h-7 w-7 items-center justify-center rounded hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <ChevronRight className="size-4 stroke-[1.75]" />
          </button>
        </div>
      </div>

      {/* 2. Primary Navigation Actions */}
      <div className="px-2 pt-2 pb-3 space-y-0.5">
        <button
          type="button"
          onClick={() => setMode("hub")}
          className="flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-[13px] font-normal text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          <Plus className="size-4 text-[var(--foreground)] stroke-[1.75]" />
          <span>New Session</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("deck")}
          className={`flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-[13px] font-normal transition-colors ${
            mode === "deck"
              ? "text-[var(--foreground)] font-medium"
              : "text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
          }`}
        >
          <Flag className="size-4 text-[var(--foreground)] stroke-[1.75]" />
          <span>Mission Control</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("pull-requests")}
          className={`flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-[13px] font-normal transition-colors ${
            mode === "pull-requests"
              ? "text-[var(--foreground)] font-medium"
              : "text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
          }`}
        >
          <Sparkles className="size-4 text-[var(--foreground)] stroke-[1.75]" />
          <span>Automations</span>
        </button>

        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-[13px] font-normal text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          <Search className="size-4 text-[var(--foreground)] stroke-[1.75]" />
          <span>Search</span>
        </button>
      </div>

      {/* 3. Projects Section */}
      <div className="flex-1 overflow-y-auto px-2 pt-1 scrollbar-none">
        {/* Section Header */}
        <div className="flex h-7 items-center justify-between px-2.5 mb-1 text-[var(--muted-foreground)]">
          <span className="text-[13px] font-normal">Projects</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              title="Filter / Sort"
              className="p-1 hover:text-[var(--foreground)] transition-colors rounded"
            >
              <SlidersHorizontal className="size-3.5 stroke-[1.5]" />
            </button>
            <button
              type="button"
              onClick={() => setIsCloneOpen(true)}
              title="Add Project / Clone Repository"
              className="p-1 hover:text-[var(--foreground)] transition-colors rounded"
            >
              <FolderPlus className="size-3.5 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Project Accordion Item */}
        <div className="space-y-0.5">
          <div
            onClick={() => setProjectsExpanded(!projectsExpanded)}
            className="group flex h-8 w-full cursor-pointer items-center justify-between rounded-md bg-[var(--surface-secondary)] px-2.5 text-[13px] font-medium text-[var(--foreground)] transition-colors"
          >
            <div className="flex items-center gap-2 truncate min-w-0">
              <ChevronDown
                className={`size-3.5 text-[var(--muted-foreground)] transition-transform duration-150 ${
                  projectsExpanded ? "" : "-rotate-90"
                }`}
              />
              <span className="truncate">{projectName}</span>
            </div>
            <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsIntegrationsOpen(true);
                }}
                title="Project Options"
                className="p-0.5 hover:text-[var(--foreground)] rounded"
              >
                <MoreHorizontal className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMode("hub");
                }}
                title="New Session in Project"
                className="p-0.5 hover:text-[var(--foreground)] rounded"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Nested Project Children (Sessions / Lanes) */}
          {projectsExpanded && (
            <div className="pt-0.5 space-y-0.5">
              {lanes.length > 0 ? (
                lanes.map((lane) => {
                  const isActive = lane.id === activeLaneId;
                  return (
                    <div
                      key={lane.id}
                      onClick={() => {
                        switchLane(lane.id);
                        setMode("deck");
                      }}
                      className={`flex h-7 cursor-pointer items-center justify-between rounded-md pl-7 pr-2.5 text-[13px] transition-colors ${
                        isActive
                          ? "text-[var(--foreground)] font-medium"
                          : "text-[var(--foreground)]/80 hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      <span className="truncate">{lane.name || "Untitled"}</span>
                      <span className="text-[12px] text-[var(--muted-foreground)] font-normal ml-2 shrink-0">
                        2m
                      </span>
                    </div>
                  );
                })
              ) : (
                <div
                  onClick={() => setMode("deck")}
                  className="flex h-7 cursor-pointer items-center justify-between rounded-md pl-7 pr-2.5 text-[13px] text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
                >
                  <span className="truncate">Untitled</span>
                  <span className="text-[12px] text-[var(--muted-foreground)] font-normal ml-2 shrink-0">
                    2m
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Profile Footer */}
      <div className="flex h-14 items-center justify-between px-3 border-t border-[var(--border)]/60 bg-[var(--surface-sidebar)]">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          <div
            title={userEmail}
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#5b9e2d] font-sans text-xs font-semibold text-white shadow-sm"
          >
            {userInitial}
          </div>
          <span
            className="truncate text-[13px] font-normal text-[var(--foreground)]"
            title={userEmail}
          >
            {userEmail}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsIntegrationsOpen(true)}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 rounded hover:bg-[var(--surface-secondary)]"
          title="Settings & Integrations"
        >
          <Settings className="size-4 stroke-[1.75]" />
        </button>
      </div>
    </aside>
  );
}
