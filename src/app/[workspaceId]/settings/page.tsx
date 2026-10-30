import type { Metadata } from "next";

import { WorkspaceSettings } from "@/features/workspace/components/workspace-settings";

export const metadata: Metadata = {
  title: "General settings",
  description: "Manage this workspace's identity, plan and lifecycle.",
};

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return <WorkspaceSettings workspaceId={workspaceId} />;
}
