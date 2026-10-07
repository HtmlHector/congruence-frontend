"use client";

import React, { useState } from "react";
import { Users, Shield, Clock, Check, ChevronDown } from "lucide-react";
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

  const [selectedWriter, setSelectedWriter] = useState(activeLane.currentWriter);

  React.useEffect(() => {
    setSelectedWriter(activeLane.currentWriter);
  }, [activeLane.currentWriter]);

  const handleGrant = () => {
    grantControl(selectedWriter);
  };

  const handleRevoke = () => {
    revokeControl();
    setSelectedWriter("You");
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
            Connect / Vault ↗
          </button>
        </div>

        <div className="space-y-2">
          {actors.map((actor) => (
            <div
              key={actor.id}
              onClick={() => actor.id !== "act_you" && setIsIntegrationsOpen(true)}
              className={`flex items-center justify-between p-1 rounded transition-colors ${
                actor.id !== "act_you" ? "hover:bg-[var(--wash)] cursor-pointer" : ""
              }`}
              title={actor.id !== "act_you" ? "Click to configure API credentials & OAuth" : undefined}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-[var(--radius-xs)] font-mono text-[10px] font-bold ${actor.badgeBg} ${actor.badgeFg}`}
                >
                  {actor.badge}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-medium text-[var(--foreground)]">
                    {actor.name}
                  </div>
                  <div className="truncate text-[9px] text-[var(--muted-foreground)]">
                    {actor.role}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[var(--status-awake)] shrink-0">
                {actor.statusText}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* LANE CONTROL Section */}
      <div className="border-b border-[var(--border)] p-3 space-y-3">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          <span>Lane control</span>
          <Shield className="size-3 text-[var(--accent-claude)]" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-[var(--subtle-foreground)] block">
            Current writer
          </label>
          <div className="relative">
            <select
              value={selectedWriter}
              onChange={(e) => setSelectedWriter(e.target.value)}
              className="w-full appearance-none rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-primary)] px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--border-strong)] focus:outline-none cursor-pointer"
            >
              {actors.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-[var(--muted-foreground)]" />
          </div>
        </div>

        {/* Dynamic Status Helper Text */}
        <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
          {activeLane.currentWriter === "You"
            ? "You can write in pair lane. Agents can watch until you grant control."
            : `${activeLane.currentWriter} has active write lease. Owner can revoke.`}
        </p>

        {/* Grant or Revoke Action Button */}
        {activeLane.currentWriter === "You" ? (
          <button
            type="button"
            onClick={handleGrant}
            className="flex h-7 w-full items-center justify-center rounded-[var(--radius-sm)] bg-[var(--foreground)] text-[var(--background)] font-medium text-[11px] hover:bg-[var(--primary-hover)] transition-all shadow-xs"
          >
            Grant control
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRevoke}
            className="flex h-7 w-full items-center justify-center rounded-[var(--radius-sm)] border border-[var(--accent-danger-border)] bg-[var(--accent-danger-wash)] text-[var(--accent-danger)] font-medium text-[11px] hover:bg-[var(--accent-danger-border)] transition-all"
          >
            Revoke control
          </button>
        )}

        {/* Watcher Checkbox */}
        <label className="flex items-start gap-2 pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={activeLane.allowWatchers}
            onChange={(e) => toggleAllowWatchers(e.target.checked)}
            className="mt-0.5 size-3 rounded border-[var(--border)] bg-[var(--surface-primary)] accent-[var(--foreground)]"
          />
          <span className="text-[9px] text-[var(--muted-foreground)] leading-snug">
            Allow other actors to watch. Watching is read-only. Control is explicit, scoped to this lane, and revocable.
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
          {activityEvents.map((event) => (
            <div key={event.id} className="text-[10px] space-y-0.5">
              <div className="text-[var(--foreground)] font-normal">{event.text}</div>
              <div className="font-mono text-[9px] text-[var(--subtle-foreground)]">
                {event.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
