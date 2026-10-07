// Screenshot every route in both OS colour schemes and report any element
// whose computed colours are unreadable in that mode.
import { chromium } from "@playwright/test";

const ROUTES = [
  ["landing", "/"],
  ["workspace", "/workspace"],
  ["login", "/login"],
  ["dashboard", "/dashboard"],
];

const OUT = process.argv[2] || "./theme-shots";

const browser = await chromium.launch();

for (const scheme of ["dark", "light"]) {
  const ctx = await browser.newContext({
    colorScheme: scheme,
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  for (const [name, route] of ROUTES) {
    await page.goto(`http://localhost:3000${route}`, {
      waitUntil: "networkidle",
    }).catch(() => {});
    await page.waitForTimeout(700);

    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );

    // Find text that has collapsed to (near) the same colour as its backdrop.
    const problems = await page.evaluate(() => {
      const lum = (c) => {
        const m = c.match(/\d+(\.\d+)?/g);
        if (!m) return null;
        const [r, g, b] = m.slice(0, 3).map(Number);
        const f = (v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const ratio = (a, b) => {
        const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
        return (x + 0.05) / (y + 0.05);
      };
      // Walk up for the first non-transparent background.
      const bgOf = (el) => {
        let n = el;
        while (n && n !== document.documentElement) {
          const bg = getComputedStyle(n).backgroundColor;
          if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
          n = n.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
      };

      const out = [];
      for (const el of document.querySelectorAll("*")) {
        const txt = [...el.childNodes]
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent.trim())
          .join("")
          .trim();
        if (!txt || txt.length < 2) continue;
        const st = getComputedStyle(el);
        if (st.visibility === "hidden" || st.display === "none") continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;

        const cr = ratio(st.color, bgOf(el));
        const size = parseFloat(st.fontSize);
        const bold = parseInt(st.fontWeight, 10) >= 700;
        const large = size >= 24 || (size >= 18.66 && bold);
        const min = large ? 3 : 4.5;
        if (cr < min) {
          out.push({
            text: txt.slice(0, 45),
            color: st.color,
            bg: bgOf(el),
            ratio: +cr.toFixed(2),
            min,
            size,
          });
        }
      }
      // De-duplicate identical (text, ratio) reports.
      const seen = new Set();
      return out.filter((p) => {
        const k = `${p.text}|${p.ratio}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    });

    await page.screenshot({
      path: `${OUT}/${name}-${scheme}.png`,
      fullPage: false,
    });

    console.log(
      `\n[${scheme}] ${name.padEnd(10)} body bg ${bg.padEnd(20)} ` +
        (problems.length === 0
          ? "no contrast problems"
          : `${problems.length} BELOW THRESHOLD`)
    );
    for (const p of problems) {
      console.log(
        `    ${p.ratio}:1 (min ${p.min})  ${p.size}px  "${p.text}"  ${p.color} on ${p.bg}`
      );
    }
  }
  await ctx.close();
}

await browser.close();
