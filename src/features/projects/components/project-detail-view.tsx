"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  GitBranch,
  KeyRound,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { useDeleteWorktree, useProjectQuery, useWorktreesQuery } from "../hooks/use-projects";
import { CredentialsDialog } from "./credentials-dialog";
import { NewWorktreeDialog } from "./new-worktree-dialog";
import { StatusPill, toneForStatus } from "./status-pill";

export function ProjectDetailView({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) {
  const router = useRouter();
  const project = useProjectQuery(projectId);
  const worktrees = useWorktreesQuery(projectId);
  const deleteWorktree = useDeleteWorktree(projectId);

  const [createWorktreeOpen, setCreateWorktreeOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);

  if (project.isLoading || project.isPending) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex items-center gap-2 text-sm text-foundation-ink-secondary">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading project…
        </div>
      </main>
    );
  }

  if (project.isError || !project.data) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-fd-lg border border-foundation-line bg-foundation-surface p-8 text-center">
          <h1 className="text-lg font-semibold text-foundation-ink">Project not found</h1>
          <p className="mt-1.5 text-sm text-foundation-ink-secondary">
            It may belong to another workspace or have been deleted.
          </p>
          <Link
            href={`/${workspaceId}/projects`}
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-foundation-ink hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  const data = project.data;
  const list = worktrees.data ?? [];
  const worktreeHref = (worktreeId: string) =>
    `/${workspaceId}/projects/${projectId}/worktrees/${worktreeId}`;

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-5 overflow-y-auto px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/${workspaceId}/projects`}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foundation-ink-tertiary transition-colors hover:text-foundation-ink focus-visible:foundation-focus"
          >
            <ArrowLeft className="size-3" aria-hidden="true" />
            Projects
          </Link>
          <h1 className="mt-2 truncate text-lg font-semibold text-foundation-ink">
            {data.name}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-foundation-ink-tertiary">
            <span className="truncate">{data.repositoryId ?? "No repository"}</span>
            <span aria-hidden="true">·</span>
            <span>{data.defaultBranch}</span>
            <span aria-hidden="true">·</span>
            <span>setup {data.setupStatus}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCredentialsOpen(true)}
          >
            <KeyRound className="size-3.5" aria-hidden="true" />
            Credentials
          </Button>
          <Button size="sm" onClick={() => setCreateWorktreeOpen(true)}>
            <Plus className="size-3.5" aria-hidden="true" />
            New worktree
          </Button>
        </div>
      </header>

      <section
        aria-label="Worktrees"
        className="rounded-fd-lg border border-foundation-line bg-foundation-surface"
      >
        <header className="flex items-center justify-between border-b border-foundation-line px-4 py-2.5">
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-foundation-ink-tertiary">
            Worktrees
          </h2>
          <span className="font-mono text-[10px] text-foundation-ink-tertiary">
            {list.length}
          </span>
        </header>

        {worktrees.isLoading || worktrees.isPending ? (
          <p className="flex items-center gap-2 p-4 text-xs text-foundation-ink-secondary">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            Loading worktrees…
          </p>
        ) : list.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[13px] text-foundation-ink-secondary">
              No worktree in this project yet.
            </p>
            <p className="mt-1 text-[11px] text-foundation-ink-tertiary">
              Open a worktree to get its own tabs, shells, and agents.
            </p>
            <Button
              className="mt-4"
              size="sm"
              onClick={() => setCreateWorktreeOpen(true)}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              New worktree
            </Button>
          </div>
        ) : (
          <ul>
            {list.map((worktree) => (
              <li
                key={worktree.id}
                className="border-b border-foundation-line last:border-b-0"
              >
                <div className="group flex items-center gap-2 pr-3">
                  <Link
                    href={worktreeHref(worktree.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 transition-colors duration-150 ease-fd hover:bg-foundation-sunken/50 focus-visible:foundation-focus"
                  >
                    <GitBranch
                      className="size-4 shrink-0 text-foundation-ink-tertiary"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-medium text-foundation-ink">
                          {worktree.title}
                        </span>
                        {worktree.isPrimary ? (
                          <span className="shrink-0 rounded-full border border-foundation-line px-1.5 text-[10px] leading-4 text-foundation-ink-tertiary">
                            primary
                          </span>
                        ) : null}
                      </span>
                      <span className="block truncate font-mono text-[10px] leading-4 tracking-[0.01em] text-foundation-ink-tertiary">
                        {worktree.branch}
                      </span>
                      <span className="mt-1.5 flex items-center gap-1.5">
                        <StatusPill
                          label={worktree.status}
                          tone={toneForStatus(worktree.status)}
                        />
                        <span className="font-mono text-[10px] text-foundation-ink-tertiary">
                          ports {worktree.portBase}–{worktree.portBase + 9}
                        </span>
                      </span>
                    </span>
                  </Link>

                  {worktree.isPrimary ? null : (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Delete ${worktree.title}`}
                      className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                      disabled={deleteWorktree.isPending}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete "${worktree.title}"? Unpushed work in this worktree is removed after the retention window.`,
                          )
                        ) {
                          deleteWorktree.mutate(worktree.id);
                        }
                      }}
                    >
                      <Trash2 className="size-3" aria-hidden="true" />
                    </Button>
                  )}

                  <ChevronRight
                    className="size-4 shrink-0 text-foundation-ink-tertiary"
                    aria-hidden="true"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <NewWorktreeDialog
        projectId={projectId}
        defaultBranch={data.defaultBranch}
        open={createWorktreeOpen}
        onOpenChange={setCreateWorktreeOpen}
        onCreated={(worktree) => {
          router.push(worktreeHref(worktree.id));
        }}
      />
      <CredentialsDialog open={credentialsOpen} onOpenChange={setCredentialsOpen} />
    </main>
  );
}
