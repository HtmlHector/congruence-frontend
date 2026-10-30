"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Repository } from "@/features/integrations/types";

import { useCreateProject } from "../hooks/use-projects";
import { RepositoryPicker } from "./repository-picker";

export function NewProjectDialog({
  workspaceId,
  open,
  onOpenChange,
}: {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const createProject = useCreateProject();
  const [name, setName] = useState("");
  const [repositoryId, setRepositoryId] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [setupCommand, setSetupCommand] = useState("");
  const [manualRepository, setManualRepository] = useState(false);
  // The picker may prefill the base branch; stop once the user edits it.
  const [branchTouched, setBranchTouched] = useState(false);

  const canSubmit = name.trim().length > 0 && repositoryId.trim().length > 0;

  const handleRepositoryChange = (repository: Repository) => {
    setRepositoryId(repository.fullName);
    if (!branchTouched && repository.defaultBranch) {
      setDefaultBranch(repository.defaultBranch);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      const project = await createProject.mutateAsync({
        name: name.trim(),
        repositoryId: repositoryId.trim(),
        defaultBranch: defaultBranch.trim() || "main",
        setupCommand: setupCommand.trim(),
      });
      onOpenChange(false);
      setName("");
      setRepositoryId("");
      setSetupCommand("");
      setManualRepository(false);
      setBranchTouched(false);
      router.push(`/${workspaceId}/projects/${project.id}`);
    } catch {
      // The mutation surfaces the error as a toast; keep the dialog open.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">New project</DialogTitle>
          <DialogDescription>
            Congruence clones the repository into a persistent cloud devbox and
            keeps it warm for every worktree you open.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="project-name"
              className="text-xs font-medium text-foundation-ink-secondary"
            >
              Project name
            </label>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Web app"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="project-repo"
              className="text-xs font-medium text-foundation-ink-secondary"
            >
              Repository
            </label>
            {manualRepository ? (
              <Input
                id="project-repo"
                value={repositoryId}
                onChange={(event) => setRepositoryId(event.target.value)}
                placeholder="acme/web-app"
                required
              />
            ) : (
              <RepositoryPicker
                id="project-repo"
                workspaceId={workspaceId}
                value={repositoryId}
                onChange={handleRepositoryChange}
              />
            )}
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] leading-4 text-foundation-ink-tertiary">
                {manualRepository
                  ? "GitHub or GitLab owner/repo. The workspace integration supplies the clone token."
                  : "Repositories from this workspace's GitHub connection."}
              </p>
              <button
                type="button"
                onClick={() => setManualRepository((manual) => !manual)}
                className="shrink-0 text-[11px] font-medium text-foundation-ink-secondary underline-offset-2 transition-colors duration-150 ease-fd hover:text-foundation-ink hover:underline focus-visible:foundation-focus"
              >
                {manualRepository ? "Choose from GitHub" : "Enter manually"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="project-branch"
                className="text-xs font-medium text-foundation-ink-secondary"
              >
                Base branch
              </label>
              <Input
                id="project-branch"
                value={defaultBranch}
                onChange={(event) => {
                  setDefaultBranch(event.target.value);
                  setBranchTouched(true);
                }}
                placeholder="main"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="project-setup"
                className="text-xs font-medium text-foundation-ink-secondary"
              >
                Setup command
              </label>
              <Input
                id="project-setup"
                value={setupCommand}
                onChange={(event) => setSetupCommand(event.target.value)}
                placeholder="npm ci"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={createProject.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createProject.isPending}>
              {createProject.isPending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="size-3.5" aria-hidden="true" />
              )}
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
