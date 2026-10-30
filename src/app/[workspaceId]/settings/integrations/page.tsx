import type { Metadata } from "next";

import { IntegrationsSettings } from "@/features/settings/components/integrations-settings";

export const metadata: Metadata = {
  title: "Integrations settings",
  description: "Connect third-party providers to this workspace.",
};

export default async function IntegrationsSettingsPage() {
  return <IntegrationsSettings />;
}
