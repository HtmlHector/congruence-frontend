import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/lib/api";

import { fetchRepositories } from "./integrations";

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

beforeEach(() => {
  apiFetchMock.mockReset();
});

describe("fetchRepositories", () => {
  it("calls the provider repositories endpoint and maps the response", async () => {
    apiFetchMock.mockResolvedValue([
      { full_name: "acme/web-app", private: false, default_branch: "develop" },
      { full_name: "acme/api", private: true, default_branch: null },
    ]);

    const repositories = await fetchRepositories("GITHUB", "ws-1");

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/integrations/github/repositories",
      { headers: { "X-Workspace-Id": "ws-1" } },
    );
    expect(repositories).toEqual([
      { fullName: "acme/web-app", isPrivate: false, defaultBranch: "develop" },
      { fullName: "acme/api", isPrivate: true, defaultBranch: null },
    ]);
  });

  it("treats a missing list as empty", async () => {
    apiFetchMock.mockResolvedValue(null);

    await expect(fetchRepositories("GITLAB")).resolves.toEqual([]);
    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/v1/integrations/gitlab/repositories",
      undefined,
    );
  });
});
