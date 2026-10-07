// The terminal and git-diff panes are intentionally dark in BOTH modes. This
// drives the workspace tabs and captures each pane in light mode so that
// inversion can be eyeballed, plus asserts the pane background stays dark
// while the page chrome goes light.
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  colorScheme: "light",
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

await page.goto("http://localhost:3000/workspace", { waitUntil: "networkidle" });

// Generate some diff content, then open the Changes tab.
const edit = page.getByRole("button", { name: /Simulate an edit/i });
if (await edit.count()) await edit.first().click();
await page.waitForTimeout(500);

for (const [tab, label] of [
  ["Terminal", "terminal"],
  ["Changes", "changes"],
  ["Preview", "preview"],
]) {
  const btn = page.getByRole("button", { name: new RegExp(tab, "i") }).first();
  await btn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `./theme-shots/ws-${label}-light.png` });

  const probe = await page.evaluate(() => {
    const lum = (css) => {
      const cv = document.createElement("canvas");
      const c = cv.getContext("2d");
      c.fillStyle = css;
      c.fillRect(0, 0, 1, 1);
      const d = c.getImageData(0, 0, 1, 1).data;
      const f = (v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(d[0]) + 0.7152 * f(d[1]) + 0.0722 * f(d[2]);
    };
    // A dark pane has low relative luminance; a light page does not.
    const dark = [...document.querySelectorAll("div")].filter((d) => {
      const st = getComputedStyle(d);
      if (!st.backgroundColor) return false;
      const m = st.backgroundColor.match(/\d+/g);
      if (!m) return false;
      const [r, g, b] = m.slice(0, 3).map(Number);
      return r < 40 && g < 40 && b < 45 && d.clientHeight > 120;
    });
    return {
      pageLum: +lum(getComputedStyle(document.body).backgroundColor).toFixed(3),
      darkPanes: dark.length,
    };
  });
  console.log(`${label.padEnd(9)} page lum ${probe.pageLum}  dark panes kept dark: ${probe.darkPanes}`);
}

await browser.close();
