"use client";

import React, { useState, useEffect } from "react";
import { Shield, Clock, ChevronDown } from "lucide-react";
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

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-l border-[var(--border)] bg-[var(--surface-sidebar)] text-xs select-none">
      {/* IN THIS WORKSPACE Section */}
      <div className="border-b border-[var(--border)] p-3">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-2.5">
          <span>In this workspace</span>
          <button
            type="button"
            onClick={() => setIsIntegrationsOpen(true)}
            className="text-[9px] text-[var(--accent-claude)] hover:underline cursor-pointer"
          >
            Connect / Keys ↗
          </button>
        </div>

        <div className="space-y-2">
          {actors.length === 0 ? (
            <div className="text-[10px] text-[var(--muted-foreground)] py-2">
              No actors active
            </div>
          ) : (
            actors.map((actor) => (
              <div
                key={actor.id}
                onClick={() => actor.actor_type !== "human" && setIsIntegrationsOpen(true)}
                className={`flex items-center justify-between p-1 rounded transition-colors ${
                  actor.actor_type !== "human" ? "hover:bg-[var(--wash)] cursor-pointer" : ""
                }`}
                title={actor.actor_type !== "human" ? "Click to configure API credentials" : undefined}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-[var(--radius-xs)] font-mono text-[10px] font-bold ${
                      actor.actor_type === "human"
                        ? "bg-[var(--surface-tertiary)] text-[var(--foreground)]"
                        : "bg-[rgba(232,128,74,0.15)] text-[var(--accent-claude)]"
                    }`}
                  >
                    {actor.display_name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-medium text-[var(--foreground)]">
                      {actor.display_name}
                    </div>
                    <div className="truncate text-[9px] text-[var(--muted-foreground)]">
                      {actor.role}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[var(--status-awake)] shrink-0">
                  {actor.presence}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* LANE CONTROL Section */}
      <div className="border-b border-[var(--border)] p-3 space-y-3">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          <span>Lane write lease</span>
          <Shield className="size-3 text-[var(--accent-claude)]" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-[var(--subtle-foreground)] block">
            Target actor
          </label>
          <div className="relative">
            <select
              value={selectedActorId}
              onChange={(e) => setSelectedActorId(e.target.value)}
              className="w-full appearance-none rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-primary)] px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--border-strong)] focus:outline-none cursor-pointer"
            >
              {actors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.display_name} ({a.role})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-[var(--muted-foreground)]" />
          </div>
        </div>

        {/* Dynamic Status Helper Text */}
        <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
          Watching is the default. Write is an explicit, revocable grant on this worktree.
        </p>

        {/* Grant or Revoke Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGrant}
            className="flex-1 flex h-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--foreground)] text-[var(--background)] font-medium text-[11px] hover:bg-[var(--primary-hover)] transition-all shadow-xs"
          >
            Grant control
          </button>
          <button
            type="button"
            onClick={handleRevoke}
            className="flex h-7 px-3 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--foreground)] font-medium text-[11px] hover:bg-[var(--surface-tertiary)] transition-all"
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
            className="mt-0.5 size-3 rounded border-[var(--border)] bg-[var(--surface-primary)] accent-[var(--foreground)]"
          />
          <span className="text-[9px] text-[var(--muted-foreground)] leading-snug">
            Allow other actors to watch. Watching is read-only.
          </span>
        </label>
      </div>

      {/* RECENT ACTIVITY Section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          <span>Recent activity</span>
          <Clock className="size-3 text-[var(--subtle-foreground)]" />
        </div>

        <div className="space-y-2">
          {activityEvents.length === 0 ? (
            <div className="text-[10px] text-[var(--muted-foreground)] py-2">
              No recent activity recorded
            </div>
          ) : (
            activityEvents.map((event) => (
              <div key={event.id} className="text-[10px] space-y-0.5">
                <div className="text-[var(--foreground)] font-normal">{event.text}</div>
                <div className="font-mono text-[9px] text-[var(--subtle-foreground)]">
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
