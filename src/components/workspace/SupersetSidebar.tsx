"use client";

import React, { useState } from "react";
import {
  Search,
  Layers,
  GitPullRequest,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
  SlidersHorizontal,
  Key,
  Github,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function SupersetSidebar() {
  const {
    projects,
    project,
    projectId,
    switchProject,
    mode,
    setMode,
    setIsIntegrationsOpen,
    setIsSearchOpen,
    setIsCloneOpen,
    sidebarCollapsed,
    toggleSidebar,
  } = useWorkspace();
  const [workspacesOpen, setWorkspacesOpen] = useState(true);

  if (sidebarCollapsed) {
    return (
      <aside className="flex h-full w-[48px] shrink-0 flex-col items-center border-r border-[var(--border)] bg-[var(--surface-sidebar)] py-3 text-[11px] select-none transition-all duration-200">
        {/* Top Expand Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          title="Expand sidebar (⌘B)"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)] transition-colors"
        >
          <PanelLeftOpen className="size-4" />
        </button>

        <div className="my-2 h-[1px] w-6 bg-[var(--border)]/60" />

        {/* Quick Actions */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setMode("hub")}
            title="New Workspace"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] transition-colors"
          >
            <Plus className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsCloneOpen(true)}
            title="Clone from GitHub"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <Github className="size-3.5" />
          </button>
        </div>

        <div className="my-2 h-[1px] w-6 bg-[var(--border)]/60" />

        {/* Navigation Icons */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            title="Search (⌘K)"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)] transition-colors"
          >
            <Search className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode("deck")}
            title="Workspaces"
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              mode === "deck"
                ? "bg-[var(--wash)] text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
            }`}
          >
            <Layers className={`size-4 ${mode === "deck" ? "text-[var(--accent-claude)]" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsIntegrationsOpen(true)}
            title="Integrations & Keys"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--accent-claude)] hover:bg-[var(--wash)] transition-colors"
          >
            <Key className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode("pull-requests")}
            title="Pull Requests"
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              mode === "pull-requests"
                ? "bg-[var(--wash)] text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
            }`}
          >
            <GitPullRequest className={`size-4 ${mode === "pull-requests" ? "text-[var(--accent-claude)]" : ""}`} />
          </button>
        </div>

        {/* Bottom Profile / Settings */}
        <div className="mt-auto flex flex-col items-center gap-2 pt-2 border-t border-[var(--border)]/60">
          <div
            title={project?.name || "Workspace"}
            className="flex size-6 items-center justify-center rounded bg-[var(--surface-tertiary)] border border-[var(--border)] font-mono text-[9px] font-bold text-[var(--foreground)]"
          >
            {(project?.name || "WS").slice(0, 2).toUpperCase()}
          </div>
          <button
            type="button"
            onClick={() => setIsIntegrationsOpen(true)}
            title="Settings"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
          >
            <Settings className="size-3.5" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-[232px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-sidebar)] text-[11px] select-none transition-all duration-200">
      {/* Top Sidebar Header & Navigation Controls */}
      <div className="flex h-11 items-center justify-between px-3 border-b border-[var(--border)]/40">
        <div className="flex items-center gap-2">
          <div className="flex h-4 w-4 flex-col justify-center gap-[2px] rounded-[2px] bg-[var(--surface-tertiary)] p-0.5 border border-[var(--border)]">
            <span className="h-[1.5px] w-full rounded-full bg-[var(--foreground)]" />
            <span className="h-[1.5px] w-3/4 rounded-full bg-[var(--muted-foreground)]" />
            <span className="h-[1.5px] w-full rounded-full bg-[var(--foreground)]" />
          </div>
          <span className="font-mono text-[11px] font-medium tracking-tight text-[var(--foreground)]">
            congruence
          </span>
        </div>
        <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
          <button
            type="button"
            onClick={() => setIsIntegrationsOpen(true)}
            title="Connected Integrations & Vault"
            className="p-1 hover:text-[var(--foreground)] transition-colors rounded"
          >
            <Key className="size-3" />
          </button>
          <button
            type="button"
            onClick={toggleSidebar}
            title="Collapse sidebar (⌘B)"
            className="p-1 hover:text-[var(--foreground)] transition-colors rounded"
          >
            <PanelLeftClose className="size-3.5" />
          </button>
        </div>
      </div>

      {/* New Workspace & Clone Repo Action Buttons */}
      <div className="px-2 pt-2 pb-1 space-y-1">
        <button
          type="button"
          onClick={() => setMode("hub")}
          className="flex h-7 w-full items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] hover:border-[var(--border-strong)] transition-all font-medium text-[11px]"
        >
          <Plus className="size-3 text-[var(--muted-foreground)]" />
          <span>New Workspace</span>
        </button>
        <button
          type="button"
          onClick={() => setIsCloneOpen(true)}
          className="flex h-6.5 w-full items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)]/60 text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-all text-[10px]"
        >
          <Github className="size-3" />
          <span>Clone from GitHub</span>
        </button>
      </div>

      {/* Core Navigation Items */}
      <div className="space-y-0.5 px-1.5 py-1">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)] transition-colors"
        >
          <Search className="size-3.5" />
          <span>Search</span>
          <kbd className="ml-auto font-mono text-[9px] text-[var(--subtle-foreground)]">⌘K</kbd>
        </button>

        <button
          type="button"
          onClick={() => setMode("deck")}
          className={`flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 transition-colors ${
            mode === "deck"
              ? "text-[var(--foreground)] bg-[var(--wash)] font-medium"
              : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
          }`}
        >
          <Layers className={`size-3.5 ${mode === "deck" ? "text-[var(--accent-claude)]" : ""}`} />
          <span>Workspaces</span>
        </button>

        <button
          type="button"
          onClick={() => setIsIntegrationsOpen(true)}
          className="flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 text-[var(--accent-claude)] hover:bg-[var(--wash)] transition-colors font-medium"
        >
          <Key className="size-3.5 text-[var(--accent-claude)]" />
          <span>Integrations & Keys</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("pull-requests")}
          className={`flex h-6.5 w-full cursor-pointer items-center gap-2 rounded px-2 transition-colors ${
            mode === "pull-requests"
              ? "text-[var(--foreground)] bg-[var(--wash)] font-medium"
              : "text-[var(--muted-foreground)] hover:bg-[var(--wash)] hover:text-[var(--foreground)]"
          }`}
        >
          <GitPullRequest className={`size-3.5 ${mode === "pull-requests" ? "text-[var(--accent-claude)]" : ""}`} />
          <span>Pull requests</span>
        </button>
      </div>

      {/* WORKSPACES / Projects Section */}
      <div className="mt-3 flex-1 overflow-y-auto px-1.5 scrollbar-thin">
        <div
          onClick={() => setWorkspacesOpen(!workspacesOpen)}
          className="flex h-6 cursor-pointer items-center gap-1.5 px-2 text-[10px] font-mono uppercase tracking-[0.08em] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          {workspacesOpen ? <ChevronDown className="size-2.5" /> : <ChevronRight className="size-2.5" />}
          <span>Workspaces</span>
          <span className="ml-auto font-mono text-[9px] text-[var(--subtle-foreground)]">
            {projects.length}
          </span>
        </div>

        {workspacesOpen && (
          <div className="mt-1 space-y-0.5">
            {projects.length === 0 ? (
              <div className="px-2 py-3 text-[10px] text-[var(--muted-foreground)] text-center">
                No active workspaces
              </div>
            ) : (
              projects.map((p) => {
                const isActive = p.id === projectId;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      switchProject(p.id);
                      setMode("deck");
                    }}
                    className={`group relative flex h-7 cursor-pointer items-center gap-2 rounded px-2 text-[11px] transition-all ${
                      isActive
                        ? "bg-[var(--wash-strong)] text-[var(--foreground)] font-medium"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--wash-subtle)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full shrink-0 ${
                        isActive ? "bg-emerald-400" : "bg-[var(--muted-foreground)]"
                      }`}
                    />
                    <span className="truncate" title={p.repo_full_name || p.name}>
                      {p.name || p.repo_full_name}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Bottom Profile Footer */}
      <div className="flex h-12 items-center justify-between border-t border-[var(--border)] px-3 bg-[var(--surface-sidebar)]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-5 shrink-0 items-center justify-center rounded bg-[var(--surface-tertiary)] border border-[var(--border)] font-mono text-[9px] font-bold text-[var(--foreground)]">
            {(project?.name || "Workspace").slice(0, 2).toUpperCase()}
          </div>
          <span className="truncate text-[11px] font-medium text-[var(--foreground)]">
            {project?.name || "Workspace"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsIntegrationsOpen(true)}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
          title="Connected Integrations & Vault"
        >
          <Settings className="size-3.5" />
        </button>
      </div>
    </aside>
  );
}
