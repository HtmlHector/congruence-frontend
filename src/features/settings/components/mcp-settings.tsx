"use client";

import { Plug } from "lucide-react";

import { CopyButton } from "@/components/foundation/copy-button";
import {
  SettingsEmptyState,
  SettingsPage,
  SettingsPanel,
} from "@/features/settings/components/settings-page";

export function McpSettings({ workspaceId }: { workspaceId: string }) {
  return (
    <SettingsPage
      title="MCP"
      description="Connect external agents to tools scoped to this workspace."
    >
      <SettingsPanel
        title="MCP servers"
        description="Servers connected to this workspace."
      >
        <SettingsEmptyState
          icon={<Plug className="size-4" />}
          title="No MCP servers connected"
          description="MCP servers let external agents call tools scoped to this workspace. Connected servers will appear here."
        />
      </SettingsPanel>

      <SettingsPanel
        title="Workspace scope"
        description="Use this identifier when you configure a server."
      >
        <div className="py-4">
          <div className="flex min-w-0 items-center justify-between gap-3 rounded-fd-md border border-foundation-line bg-foundation-sunken/60 py-2 pr-1.5 pl-3">
            <code className="truncate font-mono text-[12px] leading-5 text-foundation-ink select-all">
              {workspaceId}
            </code>
            <CopyButton value={workspaceId} label="Copy workspace ID" />
          </div>
          <p className="mt-2.5 text-[12px] leading-[18px] text-foundation-ink-tertiary">
            Requests from a connected server are limited to this workspace.
          </p>
        </div>
      </SettingsPanel>
    </SettingsPage>
  );
}
