"use client";

import React, { useEffect, useState } from "react";
import { Laptop, GitBranch } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { api, HostUsageData } from "@/lib/api";

export function StatusBar() {
  const { hostState, activeLane, project, services } = useWorkspace();
  const [usage, setUsage] = useState<HostUsageData | null>(null);

  const activeService = services.find((s) => s.is_active) || services[0];

  // Refresh spend when the project or host state changes (awake time accrues on sleep).
  useEffect(() => {
    if (!project?.id) return;
    let cancelled = false;
    api
      .getHostUsage(project.id)
      .then((data) => {
        if (!cancelled) setUsage(data);
      })
      .catch(() => {
        if (!cancelled) setUsage(null);
      });
    return () => {
      cancelled = true;
    };
  }, [project?.id, hostState]);

  return (
    <div className="flex h-8 w-full items-center justify-between border-t border-[var(--border)] px-4 bg-[var(--surface-sidebar)] text-[10px] font-mono text-[var(--muted-foreground)] select-none">
      <div className="flex items-center gap-4">
        {/* Host / Device Indicator */}
        <div className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors">
          <Laptop className="size-3" />
          <span>Host</span>
          <span className="text-[var(--subtle-foreground)]">/</span>
          <span className="text-[var(--accent-claude)]">Local Runner</span>
          <span
            className={`size-1.5 rounded-full ${
              hostState === "awake" ? "bg-[var(--status-awake)]" : "bg-[var(--status-asleep)]"
            }`}
          />
        </div>

        {/* Project Tag */}
        {project && (
          <div className="hidden sm:flex items-center gap-1 hover:text-[var(--foreground)] transition-colors">
            <span className="text-[var(--foreground)] font-medium">{project.slug}</span>
          </div>
        )}

        {/* Worktree & Branch Indicator */}
        <div className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors">
          <GitBranch className="size-3" />
          <span>Worktree</span>
          <span className="text-[var(--subtle-foreground)]">⇕</span>
          <span className="text-[var(--foreground)] font-medium">
            {activeLane?.branch || "main"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {usage && (
          <span title="Estimated from awake time this month">
            {`~$${usage.estimated_cost_usd_month.toFixed(2)}/mo · ${(usage.awake_seconds_month / 3600).toFixed(1)}h awake`}
          </span>
        )}
        <span>
          {activeService
            ? `Port ${activeService.port} · HTTPS private`
            : "No service listening"}
        </span>
      </div>
    </div>
  );
}
