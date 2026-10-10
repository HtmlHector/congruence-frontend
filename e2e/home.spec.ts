import { expect, test } from "@playwright/test";

const persistedCacheKey = "frontend-starter-query-cache-v1";

test("public starter page persists the local query example", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Frontend Starter");
  await expect(
    page.getByRole("heading", { name: "Your foundation is ready." }),
  ).toBeVisible();
  await expect(page.getByText("TanStack Query example")).toBeVisible();
  await expect(page.getByText("Ready for your product")).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate((key) => {
        const persisted = window.localStorage.getItem(key);
        return persisted ? JSON.parse(persisted).clientState.queries.length : 0;
      }, persistedCacheKey),
    )
    .toBeGreaterThan(0);

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your foundation is ready." }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate((key) => {
        const persisted = window.localStorage.getItem(key);
        if (!persisted) return false;
        return JSON.parse(persisted).clientState.queries.some(
          (query: { queryKey: string[] }) => query.queryKey[0] === "starter-note",
        );
      }, persistedCacheKey),
    )
    .toBe(true);
});
