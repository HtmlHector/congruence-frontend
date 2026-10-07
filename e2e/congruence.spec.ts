import { test, expect } from "@playwright/test";

test.describe("Congruence Platform End-to-End Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API routes with standard mock backend data for deterministic browser tests
    await page.route("**/api/v1/projects", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "proj_test123",
            name: "Parabox Core",
            slug: "parabox-core",
            repo_full_name: "parabox-so/parabox-core",
            default_branch: "main",
          },
        ]),
      });
    });

    await page.route("**/api/v1/projects/proj_test123/lanes", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "lane_pair",
            name: "Pair lane",
            slug: "pair-lane",
            branch_name: "main",
            is_pair_lane: true,
            status: "ready",
          },
          {
            id: "lane_claude",
            name: "Claude Code",
            slug: "claude-progress",
            branch_name: "claude/progress",
            is_pair_lane: false,
            status: "ready",
          },
        ]),
      });
    });

    await page.route("**/api/v1/projects/proj_test123/actors", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "act_human",
            display_name: "You",
            role: "owner",
            actor_type: "human",
            presence: "online",
          },
          {
            id: "act_claude",
            display_name: "Claude Code",
            role: "watcher",
            actor_type: "harness_claude",
            presence: "online",
          },
        ]),
      });
    });

    await page.route("**/api/v1/projects/proj_test123/host", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "host_test",
          project_id: "proj_test123",
          state: "awake",
          backend_type: "process_local",
        }),
      });
    });

    await page.route("**/api/v1/projects/proj_test123/services", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "srv_3000",
            lane_id: "lane_pair",
            port: 3000,
            protocol: "http",
            address_subdomain: "preview-lane-pair",
            access_mode: "private",
            is_active: true,
            url: "/preview/lane_pair/3000/",
          },
        ]),
      });
    });

    await page.route("**/api/v1/projects/proj_test123/git/diff*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          lane_id: "lane_pair",
          branch_name: "main",
          files_changed: 1,
          insertions: 5,
          deletions: 1,
          diff_text: "diff --git a/README.md b/README.md\n+Added congruence integration",
        }),
      });
    });

    await page.route("**/api/v1/projects/proj_test123/github/pull-requests", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route("**/api/v1/projects/proj_test123/activity*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "evt_1",
            action_type: "project_created",
            summary: "Project initialized with pair lane",
            timestamp: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.route("**/api/v1/integrations/status/proj_test123", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          project_id: "proj_test123",
          github: {
            connected: true,
            app_id: "4010628",
            install_url: "https://github.com/apps/congruence/installations/new",
            repo: "parabox-so/parabox-core",
          },
          harnesses: {
            claude: { label: "Claude Code", state: "connected", credential_path: "~/.claude.json", supports_login: true },
            codex: { label: "OpenAI Codex", state: "connected", credential_path: "~/.codex", supports_login: true },
          },
        }),
      });
    });
  });

  test("landing page renders authentic copy and FAQ accordion", async ({ page }) => {
    await page.goto("/");

    // Verify main headline and subtag
    await expect(page.locator("h1")).toContainText("Your repository, your agents");
    await expect(page.getByText("Shared Execution Context").first()).toBeVisible();

    // Verify FAQ questions
    await expect(page.getByText("Do you run the agent?")).toBeVisible();
    await page.getByText("Do you run the agent?").click();
    await expect(page.getByText(/We run the workspace/i)).toBeVisible();

    // Verify CTA link
    const cta = page.locator("a[href='/workspace']").first();
    await expect(cta).toBeVisible();
  });

  test("workspace page renders execution deck, lanes, and services", async ({ page }) => {
    await page.goto("/workspace");

    // Verify project name from API
    await expect(page.getByText("Parabox Core").first()).toBeVisible();
    await expect(page.getByText("Pair lane").first()).toBeVisible();

    // Verify Tab switching
    await page.getByRole("button", { name: "Terminal" }).click();
    await expect(page.getByText("PTY · Pair lane")).toBeVisible();

    await page.getByRole("button", { name: "Changes" }).click();
    await expect(page.getByText("Worktree Diff")).toBeVisible();

    await page.getByRole("button", { name: "Preview" }).click();
    await expect(page.getByText("Live HTTPS Service")).toBeVisible();
  });

  test("pull requests view loads and opens publication modal", async ({ page }) => {
    await page.goto("/workspace");

    // Click Pull requests in sidebar
    await page.getByRole("button", { name: "Pull requests" }).click();
    await expect(page.getByRole("heading", { name: "Pull Requests" })).toBeVisible();

    // Click New Pull Request button
    await page.getByRole("button", { name: "New Pull Request" }).click();
    await expect(page.getByText("Publish Pull Request to GitHub")).toBeVisible();
  });

  test("integrations modal opens and displays repository status", async ({ page }) => {
    await page.goto("/workspace");

    // Open integrations modal
    await page.getByRole("button", { name: "Connect Agents / Keys" }).click();
    await expect(page.getByText("Repositories & Harness Logins")).toBeVisible();
    await expect(page.getByText("parabox-so/parabox-core")).toBeVisible();
    await expect(page.getByText("Claude Code CLI")).toBeVisible();
  });
});
