"use client";

import { useState } from "react";
import { GitBranch, Loader2 } from "lucide-react";

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

import { useCreateWorktree } from "../hooks/use-projects";
import type { Worktree } from "../types";

export function NewWorktreeDialog({
  projectId,
  defaultBranch,
  open,
  onOpenChange,
  onCreated,
}: {
  projectId: string;
  defaultBranch: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (worktree: Worktree) => void;
}) {
  const createWorktree = useCreateWorktree(projectId);
  const [title, setTitle] = useState("");
  const [branch, setBranch] = useState("");
  const [baseBranch, setBaseBranch] = useState(defaultBranch);
  const [initialPrompt, setInitialPrompt] = useState("");

  const canSubmit = title.trim().length > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      const worktree = await createWorktree.mutateAsync({
        title: title.trim(),
        baseBranch: baseBranch.trim() || defaultBranch,
        branch: branch.trim() || undefined,
        initialPrompt: initialPrompt.trim(),
      });
      onOpenChange(false);
      setTitle("");
      setBranch("");
      setInitialPrompt("");
      onCreated?.(worktree);
    } catch {
      // Toast is raised by the mutation; keep the form open.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">New worktree</DialogTitle>
          <DialogDescription>
            A worktree is a real git checkout with its own branch, port block, and
            terminals. It shares the project&apos;s machine and installed dependencies.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="worktree-title"
              className="text-xs font-medium text-foundation-ink-secondary"
            >
              Task title
            </label>
            <Input
              id="worktree-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Fix flaky auth test"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="worktree-branch"
              className="text-xs font-medium text-foundation-ink-secondary"
            >
              Branch <span className="font-normal">(optional)</span>
            </label>
            <Input
              id="worktree-branch"
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
              placeholder="feature/checkout-flow-v2"
            />
            <p className="text-[11px] text-foundation-ink-tertiary">
              Name the branch yourself, or leave it blank to use{" "}
              <span className="font-mono">congruence/&lt;slug&gt;</span>.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="worktree-base"
              className="text-xs font-medium text-foundation-ink-secondary"
            >
              Base branch
            </label>
            <Input
              id="worktree-base"
              value={baseBranch}
              onChange={(event) => setBaseBranch(event.target.value)}
              placeholder={defaultBranch}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="worktree-prompt"
              className="text-xs font-medium text-foundation-ink-secondary"
            >
              Initial prompt <span className="font-normal">(optional)</span>
            </label>
            <textarea
              id="worktree-prompt"
              value={initialPrompt}
              onChange={(event) => setInitialPrompt(event.target.value)}
              rows={3}
              placeholder="The auth test is flaky under parallel load. Find and fix it."
              className="w-full resize-y rounded-fd-md border border-foundation-line-strong bg-foundation-surface px-3 py-2 text-sm text-foundation-ink outline-none transition-colors duration-150 ease-fd placeholder:text-foundation-ink-tertiary hover:border-foundation-ink-secondary focus-visible:border-foundation-ink focus-visible:foundation-focus"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={createWorktree.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createWorktree.isPending}>
              {createWorktree.isPending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <GitBranch className="size-3.5" aria-hidden="true" />
              )}
              Create worktree
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
