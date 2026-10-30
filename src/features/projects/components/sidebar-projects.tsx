"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronRight,
  FolderGit2,
  Globe2,
  LogIn,
  Plus,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useProjectTreeQuery } from "../hooks/use-projects";
import { primaryWorktreeId } from "../lib/primary-worktree";
import type { WorktreeStatus } from "../types";
import { NewWorktreeDialog } from "./new-worktree-dialog";

const STATUS_DOT: Record<WorktreeStatus, string> = {
  creating: "bg-foundation-info animate-pulse motion-reduce:animate-none",
  ready: "bg-foundation-info",
  working: "bg-foundation-warning",
  needs_review: "bg-foundation-warning",
  merged: "bg-foundation-success",
  failed: "bg-foundation-danger",
  deleted: "bg-foundation-line-strong",
};

const STATUS_LABEL: Record<WorktreeStatus, string> = {
  creating: "Creating",
  ready: "Ready",
  working: "Working",
  needs_review: "Needs review",
  merged: "Merged",
  failed: "Failed",
  deleted: "Deleted",
};

function worktreeCountLabel(count: number) {
  return `${count} ${count === 1 ? "worktree" : "worktrees"}`;
}

export function SidebarProjects({
  workspaceId,
  onNavigate,
}: {
  workspaceId: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const listId = useId();
  const [newWorktreeProject, setNewWorktreeProject] = useState<{
    id: string;
    defaultBranch: string;
  } | null>(null);
  const { entries, isLoading, isAuthLoading, isSignedIn, isError, refetch } =
    useProjectTreeQuery(workspaceId);

  const showSkeleton = isAuthLoading || (isSignedIn && isLoading);
  const signedOut = !showSkeleton && !isSignedIn;

  const projectsHref = `/${workspaceId}/projects`;

  return (
    <section
      aria-label="Projects"
      aria-busy={showSkeleton || undefined}
      className="mt-4 border-t border-foundation-line pt-3"
    >
      <div className="flex h-7 items-center justify-between gap-2 px-2">
        <p className="truncate font-mono text-[11px] font-medium uppercase leading-4 tracking-[0.06em] text-foundation-ink-tertiary">
          Projects
        </p>

        {!signedOut && (
          <Link
            href={`${projectsHref}?new=1`}
            onClick={onNavigate}
            aria-label="New project"
            title="New project"
            className="grid size-6 shrink-0 place-items-center rounded-fd-sm text-foundation-ink-tertiary transition-colors duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:foundation-focus"
          >
            <Plus className="size-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div id={listId} className="mt-0.5 space-y-0.5">
        {showSkeleton ? (
          <div
            role="status"
            aria-label="Loading projects"
            className="space-y-1.5 px-1 py-1"
          >
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                aria-hidden="true"
                className="flex h-10 items-center gap-2 px-1"
              >
                <span className="size-4 shrink-0 animate-pulse rounded-fd-xs bg-foundation-sunken motion-reduce:animate-none" />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span
                    className={cn(
                      "h-2.5 animate-pulse rounded-full bg-foundation-sunken motion-reduce:animate-none",
                      index === 0 ? "w-3/4" : index === 1 ? "w-2/3" : "w-1/2",
                    )}
                  />
                  <span className="h-2 w-1/3 animate-pulse rounded-full bg-foundation-sunken/70 motion-reduce:animate-none" />
                </span>
              </div>
            ))}
          </div>
        ) : !isSignedIn ? (
          <Link
            href="/sign-in"
            onClick={onNavigate}
            className="group mx-1 flex items-center gap-2 rounded-fd-md border border-foundation-line bg-foundation-surface p-3 transition-colors duration-150 ease-fd hover:border-foundation-line-strong focus-visible:foundation-focus"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-fd-sm bg-foundation-sunken text-foundation-ink-tertiary transition-colors duration-150 ease-fd group-hover:text-foundation-ink">
              <LogIn className="size-3.5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium leading-5 text-foundation-ink">
                Sign in to see your projects
              </span>
              <span className="mt-0.5 block truncate text-[12px] leading-4 text-foundation-ink-tertiary">
                Your worktrees appear here.
              </span>
            </span>
            <ChevronRight
              className="size-3.5 shrink-0 text-foundation-ink-tertiary transition-transform duration-150 ease-fd group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        ) : isError ? (
          <div
            role="alert"
            className="mx-1 rounded-fd-md border border-foundation-danger/25 bg-foundation-danger/5 p-3"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className="mt-0.5 size-3.5 shrink-0 text-foundation-danger"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-[13px] font-medium leading-5 text-foundation-ink">
                  Projects unavailable
                </p>
                <p className="mt-0.5 text-[12px] leading-4 text-foundation-ink-secondary">
                  Check your connection and try again.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        ) : entries.length === 0 ? (
          <div className="mx-1 rounded-fd-md border border-dashed border-foundation-line-strong/50 bg-foundation-surface/60 p-3">
            <span className="grid size-7 place-items-center rounded-fd-sm bg-foundation-sunken text-foundation-ink-secondary">
              <FolderGit2 className="size-3.5" aria-hidden="true" />
            </span>
            <p className="mt-2 text-[13px] font-medium leading-5 text-foundation-ink">
              No projects yet
            </p>
            <p className="mt-0.5 text-[12px] leading-4 text-foundation-ink-tertiary">
              Create a project to provision its devbox and open a worktree.
            </p>
            <Link
              href={`${projectsHref}?new=1`}
              onClick={onNavigate}
              className={cn(
                buttonVariants({ size: "sm" }),
                "mt-2 w-full justify-center",
              )}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              New project
            </Link>
          </div>
        ) : (
          entries.map(({ project, worktrees }) => {
            const primaryId = primaryWorktreeId(project, worktrees);
            const Icon = project.repoProvider === "gitlab" ? FolderGit2 : Globe2;

            return (
              <div key={project.id} className="group/project">
                {/* The project is the heading for its worktrees; only the
                    checkouts below are navigable. */}
                <div className="flex h-8 items-center gap-2 rounded-fd-sm px-2">
                  <Icon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-foundation-ink-tertiary"
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-5 text-foundation-ink">
                    {project.name}
                  </span>

                  {worktrees.length > 0 ? (
                    <span
                      title={worktreeCountLabel(worktrees.length)}
                      className="shrink-0 rounded-fd-xs bg-foundation-sunken px-1.5 py-0.5 font-mono text-[11px] leading-4 tabular-nums text-foundation-ink-tertiary"
                    >
                      {worktrees.length}
                      <span className="sr-only">
                        {" "}
                        {worktrees.length === 1 ? "worktree" : "worktrees"}
                      </span>
                    </span>
                  ) : null}

                  <button
                    type="button"
                    aria-label={`New worktree in ${project.name}`}
                    title="New worktree"
                    onClick={() =>
                      setNewWorktreeProject({
                        id: project.id,
                        defaultBranch: project.defaultBranch,
                      })
                    }
                    className="grid size-6 shrink-0 place-items-center rounded-fd-xs text-foundation-ink-tertiary opacity-0 transition-[color,background-color,opacity] duration-150 ease-fd hover:bg-foundation-sunken hover:text-foundation-ink focus-visible:opacity-100 focus-visible:foundation-focus group-hover/project:opacity-100 group-focus-within/project:opacity-100 [@media(hover:none)]:opacity-100"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                  </button>
                </div>

                {worktrees.length > 0 ? (
                  <ul className="ml-4 space-y-0.5 border-l border-foundation-line/70 pl-2">
                    {worktrees.map((worktree) => {
                      const isPrimary = worktree.id === primaryId;
                      const worktreeHref = `${projectsHref}/${project.id}/worktrees/${worktree.id}`;
                      const isWorktreeActive = pathname === worktreeHref;

                      return (
                        <li key={worktree.id}>
                          <Link
                            href={worktreeHref}
                            onClick={onNavigate}
                            aria-current={isWorktreeActive ? "page" : undefined}
                            title={`${worktree.title} on ${worktree.branch}`}
                            className={cn(
                              "group flex items-start gap-2 rounded-fd-sm px-2 py-1 transition-colors duration-150 ease-fd hover:bg-foundation-sunken/60 focus-visible:foundation-focus",
                              isWorktreeActive && "bg-foundation-sunken",
                            )}
                          >
                            <span
                              aria-hidden="true"
                              title={STATUS_LABEL[worktree.status]}
                              className={cn(
                                "mt-2 size-1.5 shrink-0 rounded-full",
                                STATUS_DOT[worktree.status],
                              )}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    "min-w-0 truncate text-[13px] leading-5 text-foundation-ink-secondary transition-colors duration-150 ease-fd group-hover:text-foundation-ink",
                                    isWorktreeActive && "text-foundation-ink",
                                  )}
                                >
                                  {worktree.title}
                                </span>
                                {isPrimary ? (
                                  <span className="ml-auto shrink-0 rounded-fd-xs border border-foundation-line bg-foundation-surface px-1 font-mono text-[11px] leading-4 text-foundation-ink-tertiary">
                                    primary
                                  </span>
                                ) : null}
                              </span>
                              <span className="block truncate font-mono text-[11px] leading-4 text-foundation-ink-tertiary">
                                {worktree.branch}
                              </span>
                              <span className="sr-only">
                                {STATUS_LABEL[worktree.status]}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="ml-6 pb-1 text-[12px] leading-4 text-foundation-ink-tertiary">
                    No worktrees yet
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {newWorktreeProject ? (
        <NewWorktreeDialog
          projectId={newWorktreeProject.id}
          defaultBranch={newWorktreeProject.defaultBranch}
          open
          onOpenChange={(open) => {
            if (!open) setNewWorktreeProject(null);
          }}
          onCreated={(worktree) => {
            const href = `/${workspaceId}/projects/${newWorktreeProject.id}/worktrees/${worktree.id}`;
            setNewWorktreeProject(null);
            onNavigate?.();
            router.push(href);
          }}
        />
      ) : null}
    </section>
  );
}
