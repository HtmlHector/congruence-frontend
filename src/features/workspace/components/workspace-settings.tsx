"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/foundation/copy-button";
import { SettingsPage } from "@/features/settings/components/settings-page";
import {
  useDeleteWorkspace,
  useUpdateWorkspace,
  useWorkspaceQuery,
} from "@/features/workspace/hooks/use-workspace-query";
import type { Workspace } from "@/features/workspace/types";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error-message";

const MAX_NAME_LENGTH = 64;

export function WorkspaceSettings({ workspaceId }: { workspaceId: string }) {
  const { data: workspace, isLoading, error } = useWorkspaceQuery(workspaceId);

  if (isLoading) {
    return <WorkspaceSettingsSkeleton />;
  }

  if (error || !workspace) {
    return (
      <div className="flex min-h-[50vh] w-full max-w-[880px] flex-col items-start justify-center">
        <span className="grid size-9 place-items-center rounded-fd-md border border-foundation-line bg-foundation-sunken text-foundation-ink-secondary">
          <AlertTriangle className="size-4" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-[24px] leading-8 font-semibold tracking-[-0.02em] text-foundation-ink">
          Workspace not found
        </h1>
        <p className="mt-2 max-w-[56ch] text-[14px] leading-[22px] text-foundation-ink-secondary">
          You may not have access to this workspace, or it may have been
          deleted.
        </p>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
        >
          Return home
        </Link>
      </div>
    );
  }

  return (
    <SettingsPage
      title="General"
      description="Manage this workspace's identity, plan and lifecycle."
      className="max-w-[880px]"
    >
      <WorkspaceIdentity workspaceId={workspaceId} workspace={workspace} />
      <WorkspaceIdentifiers workspace={workspace} />
      <DangerZone workspaceId={workspaceId} workspaceName={workspace.name} />
    </SettingsPage>
  );
}

/**
 * The workspace as an object: its mark, its name, when it was created and the
 * plan it is on. This is the focal point of the page, so the rename field sits
 * beside it instead of arriving as another anonymous form section.
 */
function WorkspaceIdentity({
  workspaceId,
  workspace,
}: {
  workspaceId: string;
  workspace: Workspace;
}) {
  const titleId = useId();
  const initial = workspace.name.trim().charAt(0).toUpperCase() || "W";
  const planLabel = workspace.plan
    ? `${workspace.plan.charAt(0).toUpperCase()}${workspace.plan.slice(1)}`
    : "Free";
  const isPaid = planLabel.toLowerCase() !== "free";

  return (
    <section
      aria-labelledby={titleId}
      className="scroll-mt-8 overflow-hidden rounded-fd-lg border border-foundation-line bg-foundation-surface"
    >
      <div className="grid xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="flex min-h-[240px] flex-col justify-between bg-foundation-ink p-6 text-foundation-bg dark:bg-foundation-sunken dark:text-foundation-ink sm:p-8">
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-fd-md border border-foundation-bg/20 bg-foundation-bg/10 font-mono text-[20px] leading-none font-medium dark:border-foundation-line-strong dark:bg-foundation-ink/10"
          >
            {initial}
          </span>

          <div className="mt-8 min-w-0">
            <p className="text-[12px] leading-4 font-medium text-foundation-bg/65 dark:text-foundation-ink-secondary">
              Workspace
            </p>
            <h2
              id={titleId}
              className="mt-2 max-w-[16ch] text-[24px] leading-8 font-semibold tracking-[-0.03em] text-foundation-bg [text-wrap:balance] dark:text-foundation-ink sm:text-[32px] sm:leading-10"
            >
              {workspace.name}
            </h2>
            <p className="mt-2 flex items-center gap-1.5 text-[12px] leading-5 text-foundation-bg/70 dark:text-foundation-ink-secondary">
              <span>Created</span>
              <time dateTime={workspace.createdAt} className="tabular-nums">
                {formatDate(workspace.createdAt)}
              </time>
            </p>
          </div>
        </div>

        <div className="flex flex-col p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4 border-b border-foundation-line pb-4">
            <div className="min-w-0">
              <p className="text-[12px] leading-4 text-foundation-ink-tertiary">
                Current plan
              </p>
              <p className="mt-2 inline-flex h-6 items-center rounded-fd-xs bg-foundation-sunken px-2 font-mono text-[11px] leading-none font-medium tracking-[0.04em] text-foundation-ink">
                {planLabel}
              </p>
            </div>
            <Link
              href={`/${workspaceId}/settings/billing`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "shrink-0",
              )}
            >
              {isPaid ? "Manage plan" : "Upgrade"}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          <WorkspaceNameForm
            key={workspace.name}
            workspaceId={workspaceId}
            name={workspace.name}
          />
        </div>
      </div>
    </section>
  );
}

function WorkspaceNameForm({
  workspaceId,
  name,
}: {
  workspaceId: string;
  name: string;
}) {
  const formId = useId();
  const inputId = useId();
  const helperId = useId();
  const errorId = useId();
  const apiErrorId = useId();
  const [draft, setDraft] = useState(name);
  const [touched, setTouched] = useState(false);
  const updateWorkspace = useUpdateWorkspace(workspaceId);

  const trimmed = draft.trim();
  const isEmpty = trimmed.length === 0;
  const isUnchanged = trimmed === name;
  const canSave = !isEmpty && !isUnchanged && !updateWorkspace.isPending;
  const showEmptyError = touched && isEmpty;
  const apiError = updateWorkspace.error;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    if (!canSave) return;

    updateWorkspace.mutate(
      { name: trimmed },
      {
        onSuccess: () => toast.success("Workspace name updated."),
      },
    );
  };

  const describedBy = [
    helperId,
    showEmptyError ? errorId : null,
    apiError ? apiErrorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      className="mt-5"
    >
      <div className="mb-2">
        <Label
          htmlFor={inputId}
          className="text-[13px] leading-5 font-medium"
        >
          Workspace name
        </Label>
        <p
          id={helperId}
          className="mt-0.5 text-[12px] leading-4 text-foundation-ink-tertiary"
        >
          Visible to every member.
        </p>
      </div>

      <div className="min-w-0">
        <div className="relative">
          <Input
            id={inputId}
            name="workspace-name"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => setTouched(true)}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="organization"
            aria-invalid={showEmptyError}
            aria-describedby={describedBy}
            className="h-9 pr-16 text-[14px]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-[11px] tabular-nums text-foundation-ink-tertiary"
          >
            {draft.length}/{MAX_NAME_LENGTH}
          </span>
        </div>

        {showEmptyError ? (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-[12px] leading-5 text-foundation-danger"
          >
            Enter a workspace name.
          </p>
        ) : null}

        {apiError ? (
          <p
            id={apiErrorId}
            role="alert"
            className="mt-1.5 text-[12px] leading-5 text-foundation-danger"
          >
            {getErrorMessage(apiError)}
          </p>
        ) : null}

        <div className="mt-2 flex min-h-9 items-center justify-between gap-3">
          <p
            aria-live="polite"
            className="text-[12px] leading-4 text-foundation-ink-tertiary"
          >
            {updateWorkspace.isPending ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2
                  className="size-3 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Saving changes
              </span>
            ) : !isUnchanged ? (
              <span>Unsaved changes</span>
            ) : (
              <span>Up to {MAX_NAME_LENGTH} characters</span>
            )}
          </p>

          <Button
            type="submit"
            form={formId}
            size="lg"
            disabled={!canSave}
            className="cursor-pointer"
          >
            Save changes
          </Button>
        </div>
      </div>
    </form>
  );
}

/**
 * Two read-only values in one spec sheet. The heading explains the section;
 * the surface keeps both values on the same reading line.
 */
function WorkspaceIdentifiers({ workspace }: { workspace: Workspace }) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="scroll-mt-8 grid gap-4 md:grid-cols-[minmax(200px,0.65fr)_minmax(0,1.35fr)] md:gap-8"
    >
      <div className="max-w-[28ch]">
        <h2
          id={titleId}
          className="text-[16px] leading-6 font-semibold tracking-[-0.01em] text-foundation-ink"
        >
          Identifiers
        </h2>
        <p className="mt-1 text-[12px] leading-4 text-foundation-ink-tertiary">
          How this workspace is referenced in the app and API.
        </p>
      </div>

      <dl className="overflow-hidden rounded-fd-lg border border-foundation-line bg-foundation-surface">
        <div className="min-w-0 p-4">
          <dt className="font-mono text-[11px] leading-4 font-medium tracking-[0.06em] text-foundation-ink-tertiary uppercase">
            Workspace ID
          </dt>
          <dd className="mt-2 flex min-w-0 items-center gap-1">
            <span className="min-w-0 truncate font-mono text-[13px] leading-5 text-foundation-ink select-all">
              {workspace.id}
            </span>
            <CopyButton
              value={workspace.id}
              label="Copy workspace ID"
              className="-my-1 shrink-0"
            />
          </dd>
        </div>

        <div className="min-w-0 border-t border-foundation-line p-4">
          <dt className="font-mono text-[11px] leading-4 font-medium tracking-[0.06em] text-foundation-ink-tertiary uppercase">
            Slug
          </dt>
          <dd className="mt-2 font-mono text-[13px] leading-5 text-foundation-ink">
            {workspace.slug || "Not set"}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function DangerZone({
  workspaceId,
  workspaceName,
}: {
  workspaceId: string;
  workspaceName: string;
}) {
  const router = useRouter();
  const titleId = useId();
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const deleteWorkspace = useDeleteWorkspace(workspaceId);

  const canDelete = confirmation === workspaceName;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      deleteWorkspace.reset();
    } else {
      setConfirmation("");
    }
  };

  const handleDelete = () => {
    if (!canDelete || deleteWorkspace.isPending) return;

    deleteWorkspace.mutate(undefined, {
      onSuccess: () => {
        toast.success("Workspace deleted.");
        setOpen(false);
        router.push("/");
      },
    });
  };

  return (
    <>
      <section
        aria-labelledby={titleId}
        className="scroll-mt-8 overflow-hidden rounded-fd-lg border border-foundation-line bg-foundation-surface"
      >
        <div className="grid xl:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)]">
          <div className="flex items-start gap-3 p-5 sm:gap-4">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-fd-md border border-foundation-danger/20 bg-foundation-danger/10 text-foundation-danger">
              <AlertTriangle className="size-4" aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-[16px] leading-6 font-semibold tracking-[-0.01em] text-foundation-ink"
              >
                Danger zone
              </h2>
              <p className="mt-1 text-[12px] leading-4 text-foundation-ink-tertiary">
                Permanent actions. Workspace removal cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-foundation-line p-5 sm:flex-row sm:items-center sm:justify-between xl:border-t-0 xl:border-l">
            <div className="min-w-0">
              <h3 className="text-[14px] leading-5 font-medium text-foundation-ink">
                Delete this workspace
              </h3>
              <p className="mt-1 max-w-[56ch] text-[12px] leading-4 text-foundation-ink-tertiary">
                Removes the workspace, its integrations and its data for every
                member. This cannot be undone.
              </p>
            </div>

            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={() => handleOpenChange(true)}
              className="w-full shrink-0 cursor-pointer sm:w-auto"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete workspace
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete workspace</DialogTitle>
            <DialogDescription>
              This permanently deletes{" "}
              <span className="font-medium text-foundation-ink">
                {workspaceName}
              </span>{" "}
              and its integrations for every member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor={inputId}>
              Type{" "}
              <span className="font-mono text-[12px] text-foundation-ink">
                {workspaceName}
              </span>{" "}
              to confirm
            </Label>
            <Input
              id={inputId}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              autoFocus
            />
          </div>

          {deleteWorkspace.error && (
            <p
              role="alert"
              className="text-[12px] leading-5 text-foundation-danger"
            >
              {getErrorMessage(deleteWorkspace.error)}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete || deleteWorkspace.isPending}
              className="cursor-pointer"
            >
              {deleteWorkspace.isPending && (
                <Loader2
                  className="size-3.5 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              Delete workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function WorkspaceSettingsSkeleton() {
  return (
    <div className="w-full max-w-[880px]" aria-busy="true">
      <span role="status" className="sr-only">
        Loading settings
      </span>

      <div aria-hidden="true">
        <div className="animate-pulse space-y-2 motion-reduce:animate-none">
          <div className="h-6 w-32 rounded-fd-xs bg-foundation-sunken" />
          <div className="h-4 w-80 max-w-full rounded-fd-xs bg-foundation-sunken/70" />
        </div>

        <div className="mt-8 overflow-hidden rounded-fd-lg border border-foundation-line bg-foundation-surface">
          <div className="grid xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="flex min-h-[240px] flex-col justify-between bg-foundation-ink p-6 dark:bg-foundation-sunken sm:p-8">
              <div className="size-11 rounded-fd-md bg-foundation-bg/15 dark:bg-foundation-ink/10" />
              <div className="mt-8 animate-pulse space-y-2 motion-reduce:animate-none">
                <div className="h-3 w-20 rounded-fd-xs bg-foundation-bg/30 dark:bg-foundation-ink/20" />
                <div className="h-7 w-40 max-w-full rounded-fd-xs bg-foundation-bg/50 dark:bg-foundation-ink/30" />
                <div className="h-3 w-28 rounded-fd-xs bg-foundation-bg/25 dark:bg-foundation-ink/20" />
              </div>
            </div>

            <div className="animate-pulse p-5 motion-reduce:animate-none sm:p-8">
              <div className="flex items-start justify-between gap-4 border-b border-foundation-line pb-4">
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded-fd-xs bg-foundation-sunken" />
                  <div className="h-4 w-12 rounded-fd-xs bg-foundation-sunken/70" />
                </div>
                <div className="h-7 w-20 rounded-fd-sm bg-foundation-sunken" />
              </div>

              <div className="mt-5 space-y-2">
                <div className="h-3 w-28 rounded-fd-xs bg-foundation-sunken" />
                <div className="h-3 w-40 rounded-fd-xs bg-foundation-sunken/70" />
                <div className="mt-3 h-9 w-full rounded-fd-md bg-foundation-sunken" />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="h-3 w-24 rounded-fd-xs bg-foundation-sunken/70" />
                  <div className="h-9 w-28 rounded-fd-sm bg-foundation-sunken" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-[minmax(200px,0.65fr)_minmax(0,1.35fr)] md:gap-8">
          <div className="animate-pulse space-y-2 motion-reduce:animate-none">
            <div className="h-4 w-24 rounded-fd-xs bg-foundation-sunken" />
            <div className="h-3 w-48 max-w-full rounded-fd-xs bg-foundation-sunken/70" />
          </div>

          <div className="overflow-hidden rounded-fd-lg border border-foundation-line bg-foundation-surface">
            <div className="animate-pulse space-y-2 p-4 motion-reduce:animate-none">
              <div className="h-3 w-24 rounded-fd-xs bg-foundation-sunken" />
              <div className="h-3.5 w-56 max-w-full rounded-fd-xs bg-foundation-sunken/70" />
            </div>
            <div className="animate-pulse space-y-2 border-t border-foundation-line p-4 motion-reduce:animate-none">
              <div className="h-3 w-12 rounded-fd-xs bg-foundation-sunken" />
              <div className="h-3.5 w-24 rounded-fd-xs bg-foundation-sunken/70" />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-fd-lg border border-foundation-line bg-foundation-surface p-5">
          <div className="animate-pulse space-y-2 motion-reduce:animate-none">
            <div className="h-4 w-24 rounded-fd-xs bg-foundation-sunken" />
            <div className="h-3 w-64 max-w-full rounded-fd-xs bg-foundation-sunken/70" />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}
