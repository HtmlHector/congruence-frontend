import type { Metadata } from "next";

import { StorageSettings } from "@/features/settings/components/storage-settings";

export const metadata: Metadata = {
  title: "Storage settings",
  description: "Review files and artifacts stored by this workspace.",
};

export default async function StorageSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return <StorageSettings workspaceId={workspaceId} />;
}
