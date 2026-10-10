"use client";

import React from "react";
import { useRouter } from "next/navigation";

export interface WorkspaceOption {
  id: string;
  name: string;
  slug?: string;
  plan?: string;
}

export interface WorkspaceSwitcherProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  currentWorkspaceId?: string;
  workspaces: WorkspaceOption[];
  onSelect?: (workspace: WorkspaceOption) => void;
  renderTrigger?: (current: WorkspaceOption | undefined) => React.ReactNode;
}

/**
 * Headless, unstyled workspace switcher selector primitive.
 * Emits change handlers and handles client navigation between /[workspaceId] routes.
 */
export function WorkspaceSwitcher({
  currentWorkspaceId,
  workspaces,
  onSelect,
  renderTrigger,
  className = "",
  ...props
}: WorkspaceSwitcherProps) {
  const router = useRouter();

  const current = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const found = workspaces.find((w) => w.id === selectedId);
    if (!found) return;

    if (onSelect) {
      onSelect(found);
    } else {
      router.push(`/${found.id}`);
    }
  };

  return (
    <div data-slot="workspace-switcher" className={className} {...props}>
      {renderTrigger ? (
        renderTrigger(current)
      ) : (
        <select
          data-slot="workspace-switcher-select"
          value={current?.id || ""}
          onChange={handleSelect}
          aria-label="Switch active workspace"
        >
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
