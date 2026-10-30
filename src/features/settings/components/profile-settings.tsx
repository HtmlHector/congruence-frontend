"use client";

import { useClerk } from "@clerk/nextjs";
import { UserRound } from "lucide-react";

import { CopyButton } from "@/components/foundation/copy-button";
import { Button } from "@/components/ui/button";
import {
  SettingsDetailRow,
  SettingsEmptyState,
  SettingsPage,
  SettingsPanel,
} from "@/features/settings/components/settings-page";
import { useAuthContext } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function ProfileSettings() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <SettingsPage
        title="Profile"
        description="Your personal account details and sign-in settings."
      >
        <div aria-busy="true">
          <span role="status" className="sr-only">
            Loading profile
          </span>
          <div aria-hidden="true">
            <div className="border-b border-foundation-line pb-3">
              <div className="h-3.5 w-24 rounded-fd-xs bg-foundation-sunken" />
              <div className="mt-2 h-3 w-56 rounded-fd-xs bg-foundation-sunken/70" />
            </div>
            <div className="flex items-center gap-3 py-4">
              <div className="size-9 rounded-full bg-foundation-sunken" />
              <div className="space-y-2">
                <div className="h-3.5 w-32 rounded-fd-xs bg-foundation-sunken" />
                <div className="h-3 w-44 rounded-fd-xs bg-foundation-sunken/70" />
              </div>
            </div>
            <div className="h-11 border-t border-foundation-line" />
          </div>
        </div>
      </SettingsPage>
    );
  }

  if (!user) {
    return (
      <SettingsPage
        title="Profile"
        description="Your personal account details and sign-in settings."
      >
        <SettingsPanel
          title="Account"
          description="Personal details from your sign-in provider."
        >
          <SettingsEmptyState
            icon={<UserRound className="size-4" />}
            title="No profile available"
            description="Sign in to review and manage your personal account details."
          />
        </SettingsPanel>
      </SettingsPage>
    );
  }

  const initials = getInitials(user.full_name, user.email);

  return (
    <SettingsPage
      title="Profile"
      description="Your personal account details and sign-in settings."
    >
      <SettingsPanel
        title="Account"
        description="Personal details from your sign-in provider."
        action={<StatusChip status={user.status} />}
        footer={hasClerk ? <ManageAccountButton /> : undefined}
        footerClassName="justify-end"
      >
        <div className="flex items-center gap-3 py-4">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-foundation-ink font-mono text-[12px] font-semibold text-foundation-bg"
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] leading-5 font-medium text-foundation-ink">
              {user.full_name || "Unnamed account"}
            </p>
            <p className="truncate text-[12px] leading-[18px] text-foundation-ink-tertiary">
              Personal account
            </p>
          </div>
        </div>

        <dl className="divide-y divide-foundation-line border-t border-foundation-line">
          <SettingsDetailRow label="Email">
            <span className="truncate">{user.email}</span>
          </SettingsDetailRow>

          <SettingsDetailRow label="User ID">
            <span className="truncate font-mono text-[12px] select-all">
              {user.user_id}
            </span>
            <CopyButton value={user.user_id} label="Copy user ID" />
          </SettingsDetailRow>
        </dl>
      </SettingsPanel>
    </SettingsPage>
  );
}

function ManageAccountButton() {
  const { openUserProfile } = useClerk();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => openUserProfile()}
      className="cursor-pointer"
    >
      Manage account
    </Button>
  );
}

function StatusChip({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  const label =
    status === "ACTIVE"
      ? "Active"
      : status === "INCOMPLETE"
        ? "Incomplete"
        : status;

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-fd-xs px-1.5 text-[11px] font-medium",
        isActive
          ? "bg-foundation-success/10 text-foundation-success"
          : "bg-foundation-warning/10 text-foundation-warning",
      )}
    >
      {label}
    </span>
  );
}

function getInitials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return email.trim().charAt(0).toUpperCase() || "U";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
