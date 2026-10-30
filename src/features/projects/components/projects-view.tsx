"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, FolderGit2, GitBranch, Loader2, Plus, Server } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useProjectsQuery, useUsageQuery } from "../hooks/use-projects";
import type { Project } from "../types";
import { NewProjectDialog } from "./new-project-dialog";
import { StatusPill, toneForStatus } from "./status-pill";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function ProjectCard({ project, workspaceId }: { project: Project; workspaceId: string }) {
  return (
    <Link
      href={`/${workspaceId}/projects/${project.id}`}
      className="group flex flex-col gap-4 rounded-fd-lg border border-foundation-line bg-foundation-surface p-5 transition-colors duration-150 ease-fd hover:border-foundation-line-strong focus-visible:foundation-focus"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-fd-md bg-foundation-sunken text-foundation-ink">
            <FolderGit2 className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-foundation-ink">
              {project.name}
            </h2>
            <p className="truncate font-mono text-[11px] text-foundation-ink-tertiary">
              {project.repositoryId ?? "No repository bound"}
            </p>
          </div>
        </div>
        <StatusPill
          label={project.setupStatus}
          tone={toneForStatus(project.setupStatus)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-foundation-ink-secondary">
        <span className="inline-flex items-center gap-1.5">
          <GitBranch className="size-3.5 text-foundation-ink-tertiary" aria-hidden="true" />
          {project.defaultBranch}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Server className="size-3.5 text-foundation-ink-tertiary" aria-hidden="true" />
          {project.setupCommand ?? "No setup command"}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-foundation-line pt-3 text-[11px] text-foundation-ink-tertiary">
        <span>Created {formatDate(project.createdAt)}</span>
        <span className="inline-flex items-center gap-1 text-foundation-ink-secondary transition-transform duration-150 ease-fd group-hover:translate-x-0.5">
          Open
          <ArrowRight className="size-3" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function ProjectsView({
  workspaceId,
  initialCreateOpen = false,
}: {
  workspaceId: string;
  initialCreateOpen?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(initialCreateOpen);
  const projects = useProjectsQuery(workspaceId);
  const usage = useUsageQuery();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-foundation-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-foundation-ink-tertiary">
            Congruence
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foundation-ink">Projects</h1>
          <p className="max-w-xl text-sm text-foundation-ink-secondary">
            Each project gets one persistent cloud devbox. Fan work out into git
            worktrees and run as many terminals and agents as you need inside them.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {usage.data ? (
            <div className="hidden min-w-40 rounded-fd-md border border-foundation-line bg-foundation-surface px-3 py-2 sm:block">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-foundation-ink-tertiary">
                <span>{usage.data.plan}</span>
                <span>{Math.round(usage.data.percentUsed)}%</span>
              </div>
              <div
                className="mt-1.5 h-1 overflow-hidden rounded-full bg-foundation-sunken"
                role="progressbar"
                aria-valuenow={Math.round(usage.data.percentUsed)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Included devbox hours used"
              >
                <div
                  className={cn(
                    "h-full rounded-full",
                    usage.data.percentUsed >= 90
                      ? "bg-foundation-danger"
                      : usage.data.percentUsed >= 70
                        ? "bg-foundation-warning"
                        : "bg-foundation-ink",
                  )}
                  style={{ width: `${Math.min(100, usage.data.percentUsed)}%` }}
                />
              </div>
            </div>
          ) : null}

          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-3.5" aria-hidden="true" />
            New project
          </Button>
        </div>
      </header>

      {projects.isLoading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-foundation-ink-secondary">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading projects…
        </div>
      ) : projects.isError ? (
        <div className="rounded-fd-lg border border-foundation-danger/25 bg-foundation-danger/5 p-6">
          <h2 className="text-sm font-semibold text-foundation-ink">
            Projects could not be loaded
          </h2>
          <p className="mt-1 text-xs text-foundation-ink-secondary">
            Check that the API is running and the workspace header is being sent.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => projects.refetch()}>
            Retry
          </Button>
        </div>
      ) : projects.data && projects.data.length > 0 ? (
        <section
          aria-label="Projects"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {projects.data.map((project) => (
            <ProjectCard key={project.id} project={project} workspaceId={workspaceId} />
          ))}
        </section>
      ) : (
        <section className="rounded-fd-lg border border-dashed border-foundation-line-strong bg-foundation-surface/50 p-10 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-fd-lg bg-foundation-sunken text-foundation-ink-secondary">
            <FolderGit2 className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-foundation-ink">
            Add your first project
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-foundation-ink-secondary">
            Point Congruence at a repository. We provision a devbox from the base
            image, then every worktree starts warm.
          </p>
          <Button className="mt-5" onClick={() => setDialogOpen(true)}>
            <Plus className="size-3.5" aria-hidden="true" />
            New project
          </Button>
        </section>
      )}

      <NewProjectDialog
        workspaceId={workspaceId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </main>
  );
}
