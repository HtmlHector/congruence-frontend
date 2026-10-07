"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
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
  LogOut,
} from "lucide-react";

export function RailSidebar({ userEmail = "trashdev098@gmail.com" }: { userEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  };

  const userInitial = (userEmail ? userEmail[0] : "H").toUpperCase();

  if (collapsed) {
    return (
      <aside className="flex h-screen w-[48px] shrink-0 flex-col items-center border-r border-[var(--border)] bg-[var(--surface-sidebar)] py-2 text-[12px] select-none sticky top-0 transition-all duration-200">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          title="Expand sidebar"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-colors"
        >
          <PanelLeft className="size-4" />
        </button>

        <div className="my-2 h-[1px] w-6 bg-[var(--border)]/60" />

        <div className="flex flex-col items-center gap-1">
          <Link
            href="/workspace"
            title="New Session"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <Plus className="size-4" />
          </Link>
          <Link
            href="/dashboard"
            title="Mission Control"
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              pathname === "/dashboard"
                ? "bg-[var(--surface-tertiary)] text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]"
            }`}
          >
            <Flag className="size-4" />
          </Link>
          <Link
            href="/dashboard/resources"
            title="Automations"
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              pathname === "/dashboard/resources"
                ? "bg-[var(--surface-tertiary)] text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]"
            }`}
          >
            <Sparkles className="size-4" />
          </Link>
        </div>

        <div className="mt-auto flex flex-col items-center gap-2 pt-2 border-t border-[var(--border)]/60 w-full">
          <div
            title={userEmail}
            className="flex size-7 items-center justify-center rounded-full bg-[#5b9e2d] font-sans text-xs font-semibold text-white shadow-sm"
          >
            {userInitial}
          </div>
          <Link
            href="/dashboard/billing"
            title="Settings"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
          >
            <Settings className="size-4" />
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-screen w-full md:w-[240px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-sidebar)] text-[13px] select-none sticky top-0 transition-all duration-200">
      {/* 1. Top Header Bar */}
      <div className="flex h-11 items-center justify-between px-3 pt-1">
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          title="Collapse sidebar"
          className="flex h-7 w-7 items-center justify-center rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          <PanelLeft className="size-4 stroke-[1.75]" />
        </button>

        <div className="flex items-center gap-1 text-[var(--muted-foreground)]/80">
          <button
            type="button"
            onClick={() => router.back()}
            title="Back"
            className="flex h-7 w-7 items-center justify-center rounded hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <ChevronLeft className="size-4 stroke-[1.75]" />
          </button>
          <button
            type="button"
            onClick={() => router.forward()}
            title="Forward"
            className="flex h-7 w-7 items-center justify-center rounded hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <ChevronRight className="size-4 stroke-[1.75]" />
          </button>
        </div>
      </div>

      {/* 2. Primary Navigation Actions */}
      <div className="px-2 pt-2 pb-3 space-y-0.5">
        <Link
          href="/workspace"
          className="flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-[13px] font-normal text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          <Plus className="size-4 text-[var(--foreground)] stroke-[1.75]" />
          <span>New Session</span>
        </Link>

        <Link
          href="/dashboard"
          className={`flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-[13px] font-normal transition-colors ${
            pathname === "/dashboard"
              ? "text-[var(--foreground)] font-medium bg-[var(--surface-secondary)]"
              : "text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
          }`}
        >
          <Flag className="size-4 text-[var(--foreground)] stroke-[1.75]" />
          <span>Mission Control</span>
        </Link>

        <Link
          href="/dashboard/resources"
          className={`flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-[13px] font-normal transition-colors ${
            pathname === "/dashboard/resources"
              ? "text-[var(--foreground)] font-medium bg-[var(--surface-secondary)]"
              : "text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
          }`}
        >
          <Sparkles className="size-4 text-[var(--foreground)] stroke-[1.75]" />
          <span>Automations</span>
        </Link>

        <Link
          href="/workspace"
          className="flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-[13px] font-normal text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          <Search className="size-4 text-[var(--foreground)] stroke-[1.75]" />
          <span>Search</span>
        </Link>
      </div>

      {/* 3. Projects Section */}
      <div className="flex-1 overflow-y-auto px-2 pt-1 scrollbar-none">
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
            <Link
              href="/workspace"
              title="Add Project"
              className="p-1 hover:text-[var(--foreground)] transition-colors rounded"
            >
              <FolderPlus className="size-3.5 stroke-[1.5]" />
            </Link>
          </div>
        </div>

        {/* Project Item */}
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
              <span className="truncate">congruence</span>
            </div>
            <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/dashboard/settings");
                }}
                title="Options"
                className="p-0.5 hover:text-[var(--foreground)] rounded"
              >
                <MoreHorizontal className="size-3.5" />
              </button>
              <Link
                href="/workspace"
                onClick={(e) => e.stopPropagation()}
                title="New Session"
                className="p-0.5 hover:text-[var(--foreground)] rounded"
              >
                <Plus className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Nested Children */}
          {projectsExpanded && (
            <div className="pt-0.5 space-y-0.5">
              <Link
                href="/workspace"
                className="flex h-7 cursor-pointer items-center justify-between rounded-md pl-7 pr-2.5 text-[13px] text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
              >
                <span className="truncate">Untitled</span>
                <span className="text-[12px] text-[var(--muted-foreground)] font-normal ml-2 shrink-0">
                  2m
                </span>
              </Link>
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
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard/billing"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 rounded hover:bg-[var(--surface-secondary)]"
            title="Settings"
          >
            <Settings className="size-4 stroke-[1.75]" />
          </Link>
          <button
            onClick={handleSignOut}
            className="text-[var(--muted-foreground)] hover:text-red-400 transition-colors p-1 rounded hover:bg-[var(--surface-secondary)]"
            title="Sign Out"
          >
            <LogOut className="size-3.5 stroke-[1.75]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
