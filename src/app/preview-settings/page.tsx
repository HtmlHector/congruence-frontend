import { AlertTriangle, Check, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsSidebarPanel } from "@/app/[workspaceId]/settings/settings-sidebar";
import {
  SettingsDetailRow,
  SettingsPage,
  SettingsPanel,
  SettingsRow,
} from "@/features/settings/components/settings-page";

const WORKSPACE_ID = "01a16a3a-4a35-71b8-bd6b-2c9d29a43dfc";

export default function PreviewSettingsPage() {
  return (
    <div className="min-h-svh bg-foundation-bg text-foundation-ink">
      <aside
        aria-label="Settings"
        className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-foundation-line bg-foundation-bg lg:flex"
      >
        <SettingsSidebarPanel
          workspaceId="personal"
          workspaceName="Personal"
          pathname="/personal/settings"
        />
      </aside>

      <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-foundation-line bg-foundation-bg/95 px-3 backdrop-blur-sm lg:hidden">
        <span className="grid size-8 place-items-center rounded-fd-sm text-foundation-ink-secondary">
          <Menu className="size-4" aria-hidden="true" />
        </span>
        <span className="grid size-6 place-items-center rounded-fd-xs bg-foundation-ink font-mono text-[10px] font-semibold text-foundation-bg">
          P
        </span>
        <span className="text-[13px] font-medium">Personal</span>
        <span className="text-foundation-ink-tertiary">/</span>
        <span className="text-[13px] text-foundation-ink-secondary">Settings</span>
      </header>

      <div className="lg:pl-[264px]">
        <main className="min-h-[calc(100svh-3rem)] bg-foundation-surface lg:min-h-svh lg:border-l lg:border-foundation-line">
          <div className="mx-auto w-full max-w-[800px] px-5 pt-8 pb-16 sm:px-8 lg:mx-0 lg:px-12 lg:pt-14 lg:pb-24 xl:px-16">
            <SettingsPage
              title="General"
              description="Manage this workspace's identity, plan and lifecycle."
            >
              <SettingsPanel
                title="Workspace name"
                description="Use a short, recognizable name. Up to 64 characters."
              >
                <form>
                  <SettingsRow
                    label="Name"
                    description="Shown to every member of this workspace."
                    htmlFor="preview-name"
                    className="py-5"
                  >
                    <div className="relative">
                      <Input
                        id="preview-name"
                        defaultValue="Personal"
                        className="h-9 pr-16 text-[13px]"
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-[11px] tabular-nums text-foundation-ink-tertiary"
                      >
                        8/64
                      </span>
                    </div>

                    <div className="mt-2 flex min-h-7 items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-[12px] leading-5 text-foundation-ink-tertiary">
                        <Check className="size-3" aria-hidden="true" />
                        Saved
                      </p>
                    </div>
                  </SettingsRow>
                </form>
              </SettingsPanel>

              <SettingsPanel
                title="Workspace details"
                description="Identifiers and plan information."
              >
                <dl className="divide-y divide-foundation-line">
                  <SettingsDetailRow label="Workspace ID">
                    <span className="truncate font-mono text-[12px]">
                      {WORKSPACE_ID}
                    </span>
                  </SettingsDetailRow>
                  <SettingsDetailRow label="Slug">
                    <span className="font-mono text-[12px]">personal</span>
                  </SettingsDetailRow>
                  <SettingsDetailRow label="Plan">
                    <span className="inline-flex h-5 items-center rounded-fd-xs bg-foundation-sunken px-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] uppercase">
                      Free
                    </span>
                    <span className="ml-1 text-[12px] text-foundation-ink-secondary">
                      Manage
                    </span>
                  </SettingsDetailRow>
                  <SettingsDetailRow label="Created">
                    <span className="tabular-nums">Oct 23, 2026</span>
                  </SettingsDetailRow>
                </dl>
              </SettingsPanel>

              <SettingsPanel
                title="Danger zone"
                description="Permanent actions for this workspace."
              >
                <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="mt-px grid size-7 shrink-0 place-items-center rounded-full border border-foundation-danger/20 bg-foundation-danger/[0.06] text-foundation-danger">
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-[13px] leading-5 font-medium">
                        Delete this workspace
                      </h3>
                      <p className="mt-0.5 max-w-[56ch] text-[12px] leading-[18px] text-foundation-ink-tertiary">
                        Removes the workspace, its integrations and its data for
                        every member. This cannot be undone.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    className="shrink-0 self-start sm:self-auto"
                  >
                    Delete workspace
                  </Button>
                </div>
              </SettingsPanel>
            </SettingsPage>
          </div>
        </main>
      </div>
    </div>
  );
}
