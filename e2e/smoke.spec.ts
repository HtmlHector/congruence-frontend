import { test, expect } from "@playwright/test";

test.describe("Congruence App Smoke Tests", () => {
  test("home page loads with brand wordmark and core CTAs", async ({ page }) => {
    await page.goto("/");

    // Verify brand wordmark
    await expect(page.locator("header").getByText("Congruence").first()).toBeVisible();

    // Verify primary hero heading
    await expect(page.locator("h1")).toContainText("Your repository, your agents, and the running app.");

    // Verify auth navigation links
    await expect(page.locator("header a[href='/sign-in']")).toBeVisible();
    await expect(page.locator("header a[href='/sign-up']")).toBeVisible();
  });

  test("sign-in page loads Clerk authentication component", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/.*sign-in.*/);
    await expect(page.getByText("Congruence").first()).toBeVisible();
  });

  test("sign-up page loads Clerk registration component", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page).toHaveURL(/.*sign-up.*/);
    await expect(page.getByText("Congruence").first()).toBeVisible();
  });
});
