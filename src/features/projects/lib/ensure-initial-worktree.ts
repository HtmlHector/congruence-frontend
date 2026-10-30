import { ensurePrimaryWorktree, getWorktrees } from "../api/congruence-api";
import type { Project } from "../types";

// Project creation records the primary checkout server-side, but the response can
// land before that write is visible. Give it a moment before asking the backend to
// provision it, so a project never ends up with two worktrees for one branch.
export const INITIAL_WORKTREE_POLL_INTERVAL_MS = 750;
export const INITIAL_WORKTREE_POLL_ATTEMPTS = 6;

async function hasWorktrees(projectId: string): Promise<boolean> {
  try {
    return (await getWorktrees(projectId)).length > 0;
  } catch {
    // A failed list is indistinguishable from "not provisioned yet"; the
    // ensure below is the fallback once the attempts run out.
    return false;
  }
}

/**
 * Gives every new project the worktree the user actually works in. The backend
 * creates the primary checkout itself, so this normally observes it; when it does
 * not, the idempotent ensure provisions it instead of inventing a branch.
 */
export async function ensureInitialWorktree(
  project: Pick<Project, "id" | "name" | "defaultBranch">,
  options: { attempts?: number; intervalMs?: number } = {},
): Promise<void> {
  const attempts = options.attempts ?? INITIAL_WORKTREE_POLL_ATTEMPTS;
  const intervalMs = options.intervalMs ?? INITIAL_WORKTREE_POLL_INTERVAL_MS;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await hasWorktrees(project.id)) return;
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  try {
    await ensurePrimaryWorktree(project.id);
  } catch {
    // The backend may have created it after the last poll, or the devbox may
    // still be provisioning. The list refetch shows whatever exists.
  }
}
