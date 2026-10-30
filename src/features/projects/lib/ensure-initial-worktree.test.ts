import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  getWorktrees: vi.fn(),
  ensurePrimaryWorktree: vi.fn(),
}));

vi.mock("../api/congruence-api", () => api);

import { ensureInitialWorktree } from "./ensure-initial-worktree";

const project = { id: "p1", name: "acme-web", defaultBranch: "main" };
const fast = { attempts: 3, intervalMs: 0 };

beforeEach(() => {
  api.getWorktrees.mockReset();
  api.ensurePrimaryWorktree.mockReset();
});

describe("ensureInitialWorktree", () => {
  it("keeps the primary worktree the backend already provisioned", async () => {
    api.getWorktrees.mockResolvedValue([{ id: "w1", isPrimary: true }]);

    await ensureInitialWorktree(project, fast);

    expect(api.ensurePrimaryWorktree).not.toHaveBeenCalled();
  });

  it("stops polling as soon as a worktree appears", async () => {
    api.getWorktrees
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: "w1", isPrimary: true }]);

    await ensureInitialWorktree(project, fast);

    expect(api.getWorktrees).toHaveBeenCalledTimes(2);
    expect(api.ensurePrimaryWorktree).not.toHaveBeenCalled();
  });

  it("asks the backend for the primary checkout when none ever appears", async () => {
    api.getWorktrees.mockResolvedValue([]);
    api.ensurePrimaryWorktree.mockResolvedValue({ id: "w1", isPrimary: true });

    await ensureInitialWorktree(project, fast);

    expect(api.getWorktrees).toHaveBeenCalledTimes(3);
    expect(api.ensurePrimaryWorktree).toHaveBeenCalledWith("p1");
  });

  it("swallows a provisioning failure and leaves the project usable", async () => {
    api.getWorktrees.mockResolvedValue([]);
    api.ensurePrimaryWorktree.mockRejectedValue(new Error("box unavailable"));

    await expect(
      ensureInitialWorktree(project, { attempts: 1, intervalMs: 0 }),
    ).resolves.toBeUndefined();
  });
});
