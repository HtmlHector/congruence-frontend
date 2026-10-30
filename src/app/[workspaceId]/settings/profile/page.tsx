import type { Metadata } from "next";

import { ProfileSettings } from "@/features/settings/components/profile-settings";

export const metadata: Metadata = {
  title: "Profile settings",
  description: "Your personal account details.",
};

export default function ProfileSettingsPage() {
  return <ProfileSettings />;
}
