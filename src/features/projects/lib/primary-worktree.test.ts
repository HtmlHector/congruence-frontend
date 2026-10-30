import { describe, expect, it } from "vitest";

import { primaryWorktreeId } from "./primary-worktree";

const worktree = (id: string, branch: string, isPrimary = false) => ({
  id,
  branch,
  isPrimary,
});

describe("primaryWorktreeId", () => {
  it("prefers the worktree the backend flags as primary", () => {
    expect(
      primaryWorktreeId({ defaultBranch: "main" }, [
        worktree("w1", "main"),
        worktree("w2", "feature/checkout-flow", true),
      ]),
    ).toBe("w2");
  });

  it("picks the worktree checked out on the project's default branch", () => {
    expect(
      primaryWorktreeId({ defaultBranch: "main" }, [
        worktree("w1", "congruence/fix-auth"),
        worktree("w2", "main"),
      ]),
    ).toBe("w2");
  });

  it("falls back to the oldest worktree when no checkout is on the default branch", () => {
    expect(
      primaryWorktreeId({ defaultBranch: "main" }, [
        worktree("w1", "congruence/fix-auth"),
        worktree("w2", "congruence/polish"),
      ]),
    ).toBe("w1");
  });

  it("returns null while a project has no worktrees", () => {
    expect(primaryWorktreeId({ defaultBranch: "main" }, [])).toBeNull();
  });
});
