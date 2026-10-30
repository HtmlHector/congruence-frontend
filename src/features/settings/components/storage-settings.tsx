"use client";

import Link from "next/link";
import { HardDrive } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  SettingsEmptyState,
  SettingsPage,
  SettingsPanel,
} from "@/features/settings/components/settings-page";
import { cn } from "@/lib/utils";

export function StorageSettings({ workspaceId }: { workspaceId: string }) {
  return (
    <SettingsPage
      title="Storage"
      description="Review uploads, exports and generated artifacts for this workspace."
    >
      <SettingsPanel
        title="Files"
        description="Uploads, exports and generated artifacts."
      >
        <SettingsEmptyState
          icon={<HardDrive className="size-4" />}
          title="No files yet"
          description="Files created in this workspace will appear here with their size and owner."
          action={
            <Link
              href={`/${workspaceId}/projects`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
              )}
            >
              Browse projects
            </Link>
          }
        />
      </SettingsPanel>
    </SettingsPage>
  );
}
