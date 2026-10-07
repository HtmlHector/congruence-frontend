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
      // Normalise ANY CSS colour (rgb, oklch, oklab, color-mix, ...) to sRGB by
      // letting the canvas do the conversion. Hand-parsing oklab() and
      // color-mix() output silently produced nonsense ratios.
      const cv = document.createElement("canvas");
      cv.width = cv.height = 1;
      const ctx = cv.getContext("2d", { willReadFrequently: true });

      const toRGBA = (css) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = "#000";
        ctx.fillStyle = css;
        // A rejected value leaves fillStyle as the sentinel "#000".
        const normalised = ctx.fillStyle;
        if (normalised === "#000000" && !/^#0{3,6}$|black|rgb\(0,\s*0,\s*0\)/.test(css)) {
          return null;
        }
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        const d = ctx.getImageData(0, 0, 1, 1).data;
        return [d[0], d[1], d[2], d[3] / 255];
      };

      const lum = ([r, g, b]) => {
        const f = (v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };

      // Composite a translucent layer over an opaque backdrop.
      const over = (fg, bg) => {
        const a = fg[3];
        if (a >= 1) return fg;
        return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
      };

      const ratio = (fgCss, bgCss) => {
        const fg = toRGBA(fgCss);
        const bg = toRGBA(bgCss);
        if (!fg || !bg) return null;
        const f = over(fg, bg);
        const [x, y] = [lum(f), lum(bg)].sort((p, q) => q - p);
        return (x + 0.05) / (y + 0.05);
      };

      // Walk up for the first backdrop that actually paints something.
      const bgOf = (el) => {
        let n = el;
        while (n && n !== document.documentElement) {
          const c = toRGBA(getComputedStyle(n).backgroundColor);
          if (c && c[3] > 0.95) return getComputedStyle(n).backgroundColor;
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
        if (cr === null) continue;
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
