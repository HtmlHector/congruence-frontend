import { createServer } from "node:http";
import { expect, test } from "@playwright/test";

test.describe("Browser Preview & Google Web Search E2E", () => {
  let server: ReturnType<typeof createServer>;
  let serverPort: number;

  test.beforeAll(async () => {
    // Spin up a real local test web server to preview
    server = createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head><title>My Test Web App</title></head>
          <body style="font-family: sans-serif; padding: 24px;">
            <h1 id="app-heading">Hello from My Test App!</h1>
            <p>Running inside Congruence Browser Preview.</p>
          </body>
        </html>
      `);
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const addr = server.address();
        if (addr && typeof addr === "object") {
          serverPort = addr.port;
        }
        resolve();
      });
    });
  });

  test.afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  test("browses Google online, navigates to local devbox ports, and toggles responsive viewports", async ({
    page,
  }) => {
    // Intercept project queries to provide mock project data
    await page.route("**/api/v1/projects/proj-test", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "proj-test",
          workspace_id: "ws-1",
          name: "E2E Test Project",
          repository_id: "acme/e2e-app",
          default_branch: "main",
          status: "ready",
        }),
      });
    });

    await page.route("**/api/v1/projects/proj-test/worktrees", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Intercept preview ticket minting
    await page.route("**/api/v1/projects/proj-test/preview-ticket", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ticket: "e2e-valid-ticket",
          preview_base_url: "/api/v1/projects/proj-test/preview",
          expires_in: 3600,
        }),
      });
    });

    // Intercept ping requests: offline for port 9999, live for serverPort
    await page.route("**/api/v1/projects/proj-test/preview/*/ping*", async (route) => {
      const url = route.request().url();
      if (url.includes("/9999/ping")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ live: false, port: 9999 }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ live: true, port: serverPort }),
        });
      }
    });

    // Intercept direct iframe preview proxy call for local serverPort
    await page.route(`**/api/v1/projects/proj-test/preview/${serverPort}/**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `
          <!DOCTYPE html>
          <html>
            <head><title>My Test Web App</title></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 32px; background: #fafafa;">
              <h1 id="app-title" style="color: #111;">Welcome to My Site</h1>
              <p style="color: #666;">This site is running in the devbox and rendering in the Congruence tab.</p>
              <button id="cta-btn" style="padding: 8px 16px; background: #000; color: #fff; border: none; border-radius: 6px;">Click Me</button>
            </body>
          </html>
        `,
      });
    });

    // 1. Visit project page
    await page.goto("/ws-1/projects/proj-test");

    // Wait for client store hydration
    const tablist = page.getByRole("tablist", { name: "Terminal tabs" });
    await expect(tablist.getByRole("tab", { name: "Terminal 1" })).toBeVisible();

    // 2. Open tab creation menu and click "Browser preview"
    const newTabBtn = page.getByRole("button", { name: "New tab" });
    await expect(newTabBtn).toBeVisible();
    await newTabBtn.click();

    const browserOption = page.getByRole("option", { name: "Browser preview" });
    await expect(browserOption).toBeVisible();
    await browserOption.click();

    // 3. Assert "Browser 2" tab is active
    const browserTab = tablist.getByRole("tab", { name: "Browser 2" });
    await expect(browserTab).toBeVisible();
    await expect(browserTab).toHaveAttribute("aria-selected", "true");

    // 4. Verify Google start page is displayed by default
    await expect(page.getByText("Browse the web, search Google, or view your local devbox websites.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Google Home" })).toBeVisible();
    await expect(page.getByRole("button", { name: "GitHub" })).toBeVisible();

    // 5. Search Google online using the search bar
    const omnibox = page.getByLabel("Search or URL");
    await omnibox.fill("fastapi clean architecture");
    await page.getByRole("button", { name: "Go", exact: true }).click();

    // 6. Verify Google Search iframe loads with igu=1 (embeddable Google UI)
    const googleIframe = page.getByTitle(/Web Browser: https:\/\/www.google.com\/search\?igu=1/);
    await expect(googleIframe).toBeVisible();
    expect(await googleIframe.getAttribute("src")).toContain("https://www.google.com/search?igu=1&q=fastapi%20clean%20architecture");

    // 7. Click Home icon to return to start page
    await page.getByRole("button", { name: "Home" }).click();
    await expect(page.getByText("Browse the web, search Google, or view your local devbox websites.")).toBeVisible();

    // 8. Now enter local devbox server port to view local web app
    await omnibox.fill(String(serverPort));
    await page.getByRole("button", { name: "Go", exact: true }).click();

    // 9. Verify live devbox preview iframe appears
    const localIframe = page.getByTitle(`Devbox Preview :${serverPort}`);
    await expect(localIframe).toBeVisible();
    const frame = localIframe.contentFrame();
    await expect(frame.locator("#app-title")).toHaveText("Welcome to My Site");

    // 10. Test responsive viewport modes
    const frameContainer = localIframe.locator("..");
    await page.getByTitle("Mobile Viewport (375px)").click();
    await expect(frameContainer).toHaveClass(/w-\[375px\]/);

    await page.getByTitle("Tablet Viewport (768px)").click();
    await expect(frameContainer).toHaveClass(/w-\[768px\]/);

    await page.getByTitle("Desktop Viewport (1280px)").click();
    await expect(frameContainer).toHaveClass(/w-\[1280px\]/);

    await page.getByTitle("Responsive Viewport (100%)").click();
    await expect(frameContainer).toHaveClass(/w-full/);

    // Capture visual screenshot
    await page.screenshot({
      path: "e2e-google-and-local-browser-preview.png",
      fullPage: true,
    });
  });
});
