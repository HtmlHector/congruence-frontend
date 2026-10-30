import type { Project, Worktree } from "../types";

/**
 * The primary worktree is the project's root checkout: the clone the devbox was
 * provisioned with, checked out on the project's default branch. The backend
 * flags it explicitly; branch matching and "oldest" remain as fallbacks for API
 * responses that predate the flag.
 */
export function primaryWorktreeId(
  project: Pick<Project, "defaultBranch">,
  worktrees: Pick<Worktree, "id" | "branch" | "isPrimary">[],
): string | null {
  const flagged = worktrees.find((worktree) => worktree.isPrimary);
  if (flagged) return flagged.id;

  const onDefaultBranch = worktrees.find(
    (worktree) => worktree.branch === project.defaultBranch,
  );
  return onDefaultBranch?.id ?? worktrees[0]?.id ?? null;
}
