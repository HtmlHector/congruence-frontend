import type { Metadata } from "next";

import { BillingSettings } from "@/features/settings/components/billing-settings";

export const metadata: Metadata = {
  title: "Billing settings",
  description: "Review this workspace's plan, credits and payment history.",
};

export default async function BillingSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return <BillingSettings workspaceId={workspaceId} />;
}
