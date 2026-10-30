import type { Metadata } from "next";

import { McpSettings } from "@/features/settings/components/mcp-settings";

export const metadata: Metadata = {
  title: "MCP settings",
  description: "Connect Model Context Protocol servers to this workspace.",
};

export default async function McpSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return <McpSettings workspaceId={workspaceId} />;
}
