import { test, expect } from "@playwright/test";

test.describe("congruence.dev - Concept Preview & Interactive Workspace", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders editorial landing page, hero narrative, and pillars", async ({ page }) => {
    // 1. Header Wordmark
    await expect(page.locator("header a", { hasText: "congruence.dev" })).toBeVisible();

    // 2. Hero Headline & Subhead
    await expect(page.locator("h1")).toContainText("Your repository, your agents");
    await expect(page.locator("h1")).toContainText("In one place.");
    await expect(
      page.getByText("A shared browser workspace for the coding agents you already use.")
    ).toBeVisible();

    // 3. Section 01 / The Idea
    await expect(page.getByText("01 / The Idea")).toBeVisible();
    await expect(
      page.getByText("Changing devices shouldn't mean rebuilding your context.")
    ).toBeVisible();

    // 4. Section 02 / The Workflow
    await expect(page.getByText("02 / The Workflow")).toBeVisible();
    await expect(page.getByText("From a repository to a running app.")).toBeVisible();
    await expect(page.getByText("Bring your repository")).toBeVisible();
    await expect(page.getByText("Use your own agents")).toBeVisible();

    // 5. Section 03 / Built Around Shared Work
    await expect(page.getByText("03 / Built around shared work")).toBeVisible();
    await expect(page.getByText("One context. Room for more than one writer.")).toBeVisible();
    await expect(page.getByText("Keep the important parts.")).toBeVisible();
    await expect(page.getByText("Give each writer a lane.")).toBeVisible();
    await expect(page.getByText("Watch first. Grant when needed.")).toBeVisible();

    // 6. Section 04 / The Details (FAQ Accordion)
    await expect(page.getByText("04 / The Details")).toBeVisible();
    await expect(page.getByText("A small product with a clear boundary.")).toBeVisible();
    
    // Toggle accordion item 2
    const faqItem2 = page.getByRole("button", { name: "Are you building another coding agent?" });
    await expect(faqItem2).toBeVisible();
    await faqItem2.click();
    await expect(page.getByText("No. The planned product uses existing CLI harnesses")).toBeVisible();

    // 7. Footer
    await expect(page.locator("footer")).toContainText("congruence.dev");
    await expect(page.locator("footer")).toContainText("A Parabox product");
  });

  test("interactive workspace: sleep and wake transitions", async ({ page }) => {
    const demo = page.locator("#demo");
    await expect(demo).toBeVisible();

    // Initial state: Awake
    await expect(demo.getByText("Workspace awake", { exact: true })).toBeVisible();

    // Click Sleep workspace
    const sleepBtn = demo.getByRole("button", { name: "Sleep workspace" });
    await sleepBtn.click();

    // Transition to Asleep
    await expect(demo.getByText("Workspace asleep", { exact: true })).toBeVisible();
    await expect(demo.getByText("Host Asleep")).toBeVisible();

    // Click Wake workspace
    const wakeBtn = demo.getByRole("button", { name: "Wake workspace" });
    await wakeBtn.click();

    // Transition back to Awake
    await expect(demo.getByText("Workspace awake", { exact: true })).toBeVisible();
    await expect(demo.getByText("Good ideas start here.")).toBeVisible();
  });

  test("interactive workspace: multi-lane worktrees and tabs", async ({ page }) => {
    const demo = page.locator("#demo");

    // 1. Initial Lane is Pair lane (main)
    await expect(demo.getByText("Pair lane").first()).toBeVisible();

    // 2. Switch to Claude Code lane
    const claudeLane = demo.getByText("Claude Code").first();
    await claudeLane.click();

    // Verify context switch
    await expect(demo.getByText("claude/progress").first()).toBeVisible();

    // 3. Switch to Terminal tab
    const terminalTab = demo.getByRole("button", { name: "Terminal 1" });
    await terminalTab.click();
    await expect(demo.getByText("[Claude Code 1.0.12] Authenticated with Anthropic account.")).toBeVisible();

    // 4. Switch to Changes tab
    const changesTab = demo.getByRole("button", { name: /Changes/ });
    await changesTab.click();
    await expect(demo.getByText("src/components/FieldnotesApp.tsx")).toBeVisible();

    // 5. Switch back to Preview tab
    const previewTab = demo.getByRole("button", { name: "Preview" });
    await previewTab.click();
    await expect(demo.getByText("Good ideas start here.")).toBeVisible();
  });

  test("interactive workspace: run dev server and simulate edit", async ({ page }) => {
    const demo = page.locator("#demo");

    // 1. Run Dev Server
    const runDevBtn = demo.getByRole("button", { name: "Run dev" });
    await runDevBtn.click();

    // Button changes to Stop dev and preview badge changes to Live service
    await expect(demo.getByRole("button", { name: "Stop dev" })).toBeVisible();
    await expect(demo.getByText("Live service", { exact: true })).toBeVisible();

    // Check terminal for rewritten port
    await demo.getByRole("button", { name: "Terminal 1" }).click();
    await expect(
      demo.getByText("https://sample-app.congruence.example [HTTPS private]")
    ).toBeVisible();

    // 2. Simulate an Edit
    await demo.getByRole("button", { name: "Simulate an edit" }).click();
    await demo.getByRole("button", { name: "Preview" }).click();

    // Verify new task item added
    await expect(demo.getByText("Review changes from You")).toBeVisible();
  });

  test("interactive workspace: lane control grant and revoke flow", async ({ page }) => {
    const demo = page.locator("#demo");

    // Default state: You has write control
    await expect(
      demo.getByText("You can write in pair lane. Agents can watch until you grant control.")
    ).toBeVisible();

    // Select Claude Code from dropdown
    const select = demo.locator("select");
    await select.selectOption("Claude Code");

    // Click Grant control
    await demo.getByRole("button", { name: "Grant control" }).click();

    // Status updates
    await expect(
      demo.getByText("Claude Code has active write lease. Owner can revoke.")
    ).toBeVisible();
    await expect(demo.getByRole("button", { name: "Revoke control" })).toBeVisible();

    // Click Revoke control
    await demo.getByRole("button", { name: "Revoke control" }).click();

    // Returns to You
    await expect(
      demo.getByText("You can write in pair lane. Agents can watch until you grant control.")
    ).toBeVisible();
  });

  test("interactive workspace: Superset prompt hub and omnibar task dispatch", async ({ page }) => {
    const demo = page.locator("#demo");

    // 1. Switch to Prompt Hub using the header button
    const hubBtn = demo.getByRole("button", { name: "Hub", exact: true });
    if (await hubBtn.isVisible()) {
      await hubBtn.click();
    } else {
      await demo.getByRole("button", { name: "Prompt Hub" }).click();
    }

    // Verify Hub Elements
    await expect(demo.getByText("What should we build next?")).toBeVisible();
    await expect(demo.getByText("Star on GitHub")).toBeVisible();
    await expect(demo.getByText("Set up this project for Congruence")).toBeVisible();

    // 2. Dispatch task via prompt suggestion chip
    await demo.getByText("Find and fix a small bug").click();

    // Transitions to Execution Deck
    await expect(demo.getByText("Codex Task").first()).toBeVisible();
    await expect(demo.getByText("agent/find-and-fix-a-small-bug").first()).toBeVisible();
  });

  test("interactive workspace: product details modal", async ({ page }) => {
    const demo = page.locator("#demo");

    // Click The product info button
    const infoBtn = demo.getByRole("button", { name: /The product/i });
    await infoBtn.click();

    // Modal opens
    const modal = page.locator("[role='dialog']");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("congruence.dev System Brief")).toBeVisible();
    await expect(modal.getByText("Three-Plane Architecture")).toBeVisible();
    await expect(modal.getByText("Account Custody (Zero Token Resale)")).toBeVisible();

    // Dismiss modal
    await modal.getByRole("button", { name: "Got it" }).click();
    await expect(modal).not.toBeVisible();
  });

  test("standalone full-screen workspace page at /workspace", async ({ page }) => {
    await page.goto("/workspace");

    // Verify full-screen Superset sidebar
    await expect(page.getByText("Hector's Team")).toBeVisible();

    // Switch to Hub if starting in Deck mode
    const hubBtn = page.getByRole("button", { name: "Hub", exact: true });
    if (await hubBtn.isVisible()) {
      await hubBtn.click();
    }

    // Verify Prompt Hub elements
    await expect(page.getByText("What should we build next?")).toBeVisible();
    await expect(page.getByPlaceholder("Upgrade a dependency and fix what breaks...")).toBeVisible();

    // Switch to Execution Deck
    await page.getByRole("button", { name: "Open Execution Deck" }).click();
    await expect(page.getByText("Pair lane").first()).toBeVisible();
    await expect(page.getByText("Workspace awake", { exact: true })).toBeVisible();
  });
});
