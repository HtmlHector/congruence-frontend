import type { Metadata } from "next";

import { AppearanceSettings } from "@/features/settings/components/appearance-settings";

export const metadata: Metadata = {
  title: "Appearance settings",
  description: "Choose how the interface looks on this device.",
};

export default function AppearanceSettingsPage() {
  return <AppearanceSettings />;
}
