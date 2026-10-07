import { test, expect } from "@playwright/test";

test.describe("Parabox App Smoke Tests", () => {
  test("home page loads with brand wordmark and core CTAs", async ({ page }) => {
    await page.goto("/");

    // Verify brand wordmark
    await expect(page.locator("header a", { hasText: "parabox" })).toBeVisible();

    // Verify primary hero heading
    await expect(page.locator("h1")).toContainText("A dependable foundation for your next useful product.");

    // Verify auth navigation links
    await expect(page.locator("a[href='/login']")).toBeVisible();
    await expect(page.locator("a[href='/signup']")).toBeVisible();
  });

  test("sign-in page renders email and password form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("h1")).toHaveText("Sign in");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toContainText("Sign In");
  });

  test("sign-up page renders registration form", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.locator("h1")).toHaveText("Create Account");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toContainText("Create Account");
  });
});
