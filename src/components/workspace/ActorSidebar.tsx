"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Clock,
  ChevronDown,
  PanelRightClose,
  PanelRightOpen,
  PanelRight,
  Activity,
  Users,
  KeyRound,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export function ActorSidebar() {
  const {
    actors,
    activeLane,
    grantControl,
    revokeControl,
    toggleAllowWatchers,
    activityEvents,
    setIsIntegrationsOpen,
    actorSidebarCollapsed,
    toggleActorSidebar,
  } = useWorkspace();

  const [selectedActorId, setSelectedActorId] = useState<string>("");

  useEffect(() => {
    if (actors.length > 0 && !selectedActorId) {
      setSelectedActorId(actors[0].id);
    }
  }, [actors, selectedActorId]);

  const handleGrant = () => {
    if (selectedActorId) {
      grantControl(selectedActorId);
    }
  };

  const handleRevoke = () => {
    revokeControl();
  };

  if (actorSidebarCollapsed) {
    return (
      <aside className="flex h-full w-[44px] shrink-0 flex-col items-center border-l border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#0E0E12] py-2.5 text-xs select-none transition-all duration-200">
        {/* Expand Button */}
        <button
          type="button"
          onClick={toggleActorSidebar}
          title="Expand sidebar (⌘J)"
          className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <PanelRightOpen className="size-4" />
        </button>

        <div className="my-2 h-[1px] w-6 bg-zinc-200 dark:bg-zinc-800" />

        {/* Collapsed Quick Actions */}
        <div className="flex flex-col items-center gap-2">
          {/* Actors trigger */}
          <button
            type="button"
            onClick={toggleActorSidebar}
            title="Actors in workspace"
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative"
          >
            <Users className="size-3.5" />
            <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-500" />
          </button>

          {/* Lease shield */}
          <button
            type="button"
            onClick={toggleActorSidebar}
            title="Lane Write Lease"
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Shield className="size-3.5 text-[var(--accent-claude)]" />
          </button>

          {/* Recent activity */}
          <button
            type="button"
            onClick={toggleActorSidebar}
            title="Recent Activity"
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Clock className="size-3.5" />
          </button>
        </div>

        {/* Bottom Keys config */}
        <div className="mt-auto pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setIsIntegrationsOpen(true)}
            title="Connect / API Keys"
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <KeyRound className="size-3.5" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-l border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#0E0E12] text-xs select-none transition-all duration-200">
      {/* IN THIS WORKSPACE Section */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-3">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
          <span className="font-semibold">In this workspace</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsIntegrationsOpen(true)}
              className="text-[10px] text-[var(--accent-claude)] hover:underline cursor-pointer"
            >
              Connect / Keys ↗
            </button>
            <button
              type="button"
              onClick={toggleActorSidebar}
              title="Collapse sidebar (⌘J)"
              className="p-0.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer ml-1"
            >
              <PanelRightClose className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          {actors.length === 0 ? (
            <div className="text-[10px] text-zinc-400 py-1">
              No actors active
            </div>
          ) : (
            actors.map((actor) => (
              <div
                key={actor.id}
                onClick={() => actor.actor_type !== "human" && setIsIntegrationsOpen(true)}
                className={`flex items-center justify-between p-1.5 rounded-md transition-colors ${
                  actor.actor_type !== "human" ? "hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer" : ""
                }`}
                title={actor.actor_type !== "human" ? "Click to configure API credentials" : undefined}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold ${
                      actor.actor_type === "human"
                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        : "bg-[rgba(232,128,74,0.15)] text-[var(--accent-claude)]"
                    }`}
                  >
                    {actor.display_name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-medium text-zinc-900 dark:text-zinc-100">
                      {actor.display_name}
                    </div>
                    <div className="truncate text-[9px] text-zinc-500">
                      {actor.role}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                  {actor.presence}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* LANE CONTROL Section */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-3 space-y-3">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold">Lane write lease</span>
          <Shield className="size-3 text-[var(--accent-claude)]" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-zinc-500 block">
            Target actor
          </label>
          <div className="relative">
            <select
              value={selectedActorId}
              onChange={(e) => setSelectedActorId(e.target.value)}
              className="w-full appearance-none rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 focus:outline-hidden cursor-pointer"
            >
              {actors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.display_name} ({a.role})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-zinc-400" />
          </div>
        </div>

        {/* Dynamic Status Helper Text */}
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          Watching is the default. Write is an explicit, revocable grant on this worktree.
        </p>

        {/* Grant or Revoke Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGrant}
            className="flex-1 flex h-7 items-center justify-center rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium text-[11px] hover:opacity-90 transition-all shadow-2xs cursor-pointer"
          >
            Grant control
          </button>
          <button
            type="button"
            onClick={handleRevoke}
            className="flex h-7 px-3 items-center justify-center rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-medium text-[11px] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            Revoke
          </button>
        </div>

        {/* Watcher Note */}
        <label className="flex items-start gap-2 pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={true}
            readOnly
            className="mt-0.5 size-3 rounded border-zinc-300 text-zinc-900"
          />
          <span className="text-[9px] text-zinc-500 leading-snug">
            Allow other actors to watch. Watching is read-only.
          </span>
        </label>
      </div>

      {/* RECENT ACTIVITY Section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold">Recent activity</span>
          <Clock className="size-3 text-zinc-400" />
        </div>

        <div className="space-y-2">
          {activityEvents.length === 0 ? (
            <div className="text-[10px] text-zinc-400 py-1">
              No recent activity recorded
            </div>
          ) : (
            activityEvents.map((event) => (
              <div key={event.id} className="text-[10px] space-y-0.5">
                <div className="text-zinc-800 dark:text-zinc-200 font-normal leading-snug">{event.text}</div>
                <div className="font-mono text-[9px] text-zinc-400">
                  {event.timestamp}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
