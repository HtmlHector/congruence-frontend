import { Metadata } from "next";

import { WorktreeWorkspace } from "@/app/[workspaceId]/workspace-tab-bar";

export const metadata: Metadata = {
  title: "Worktree | Congruence",
  description: "Tabs, terminals, and agents for this worktree.",
};

export default async function WorktreePage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string; worktreeId: string }>;
}) {
  const { projectId, worktreeId } = await params;

  return <WorktreeWorkspace projectId={projectId} worktreeId={worktreeId} />;
}
