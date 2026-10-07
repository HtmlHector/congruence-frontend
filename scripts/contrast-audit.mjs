// WCAG contrast audit for the Congruence token palettes in globals.css.
// Parses :root (dark) and the prefers-color-scheme:light block, resolves the
// mode-independent aliases, then checks every foreground/background pair that
// actually appears in the components.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/globals.css", import.meta.url), "utf8");

function block(start, end) {
  const i = css.indexOf(start);
  const j = css.indexOf(end, i);
  return css.slice(i + start.length, j);
}

// Split on the light media query.
const lightStart = css.indexOf("@media (prefers-color-scheme: light)");
const head = css.slice(0, lightStart);
const lightBody = css.slice(lightStart);
const darkBody = head.slice(head.indexOf(":root {"));
const lightRoot = lightBody.slice(lightBody.indexOf(":root {"));

function tokens(src) {
  const out = {};
  for (const m of src.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    out[m[1]] = m[2].trim();
  }
  return out;
}

function resolve(map, name, seen = new Set()) {
  let v = map[name];
  while (typeof v === "string" && v.startsWith("var(") && !seen.has(name)) {
    seen.add(name);
    const inner = v.slice(4, v.indexOf(")")).trim();
    v = map[inner];
  }
  return v;
}

function hexToRgb(h) {
  h = h.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function luminance(h) {
  const [r, g, b] = hexToRgb(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Composite `top` over `bottom` at `alpha`, as sRGB channels. */
function blendHex(top, bottom, alpha) {
  const t = hexToRgb(top);
  const b = hexToRgb(bottom);
  const mixed = t.map((c, i) => Math.round(c * alpha + b[i] * (1 - alpha)));
  return "#" + mixed.map((c) => c.toString(16).padStart(2, "0")).join("");
}

// [foreground, background, label, minimum]
const PAIRS = [
  ["--foreground", "--background", "body text", 4.5],
  ["--foreground", "--surface-card", "card text", 4.5],
  ["--foreground", "--surface-primary", "raised surface text", 4.5],
  ["--foreground", "--surface-secondary", "secondary surface text", 4.5],
  ["--foreground", "--surface-sidebar", "sidebar text", 4.5],
  ["--muted-foreground", "--background", "muted text", 4.5],
  ["--muted-foreground", "--surface-card", "muted on card", 4.5],
  ["--muted-foreground", "--surface-primary", "muted on raised", 4.5],
  ["--muted-foreground", "--surface-secondary", "muted on secondary", 4.5],
  ["--muted-foreground", "--surface-tertiary", "muted on tertiary", 4.5],
  ["--muted-foreground", "--surface-sidebar", "muted on sidebar", 4.5],
  ["--subtle-foreground", "--background", "subtle text / meta", 4.5],
  ["--subtle-foreground", "--surface-primary", "subtle on raised", 4.5],
  ["--subtle-foreground", "--surface-tertiary", "subtle on tertiary", 4.5],
  ["--primary-foreground", "--primary", "inverted button label", 4.5],
  ["--secondary-foreground", "--secondary", "secondary button", 4.5],
  ["--accent-claude", "--background", "claude accent", 4.5],
  ["--accent-claude", "--surface-primary", "claude accent on raised", 4.5],
  ["--accent-codex", "--background", "codex accent", 4.5],
  ["--accent-opencode", "--background", "opencode accent", 4.5],
  ["--accent-aider", "--background", "aider accent", 4.5],
  ["--accent-amber", "--background", "running indicator", 4.5],
  ["--accent-danger", "--background", "danger text", 4.5],
  ["--accent-info", "--background", "info icon", 4.5],
  ["--status-awake", "--background", "awake status", 4.5],
  ["--status-asleep", "--background", "asleep status", 4.5],
  ["--status-running", "--background", "running status", 4.5],
  ["--terminal-foreground", "--surface-terminal", "terminal text", 4.5],
  ["--terminal-muted", "--surface-terminal", "terminal muted", 4.5],
  ["--terminal-subtle", "--surface-terminal", "terminal subtle/placeholder", 4.5],
  ["--terminal-accent", "--surface-terminal", "terminal accent", 4.5],
  ["--terminal-link", "--surface-terminal", "terminal url", 4.5],
  ["--diff-add-fg", "--surface-terminal-inset", "diff add fg", 4.5],
  ["--diff-del-fg", "--surface-terminal-inset", "diff del fg", 4.5],
];

// Control boundaries must clear 3:1 (WCAG 1.4.11): these identify the control.
const UI = [
  ["--input-border", "--input", "input border on input surface", 3],
  ["--input-border", "--background", "input border on canvas", 3],
  ["--ring", "--background", "focus ring", 3],
];

// Purely decorative separators and hover affordances. WCAG exempts these from
// 1.4.11, and the obsidian aesthetic depends on them sitting close to the
// canvas. Reported for visibility, never counted as a failure.
const DECORATIVE = [
  ["--border", "--background", "hairline separator"],
  ["--border-subtle", "--background", "subtle separator"],
  ["--border-strong", "--background", "hover emphasis border"],
];

// Terminal tokens are declared once in :root and deliberately not overridden,
// so light mode must resolve against the MERGED map (light on top of dark).
const darkTokens = tokens(darkBody);
const lightTokens = { ...darkTokens, ...tokens(lightRoot) };

let failures = 0;

for (const [modeName, map] of [["DARK", darkTokens], ["LIGHT", lightTokens]]) {
  console.log(`\n${modeName}`);
  console.log("-".repeat(72));
  for (const [fg, bg, label, min] of [...PAIRS, ...UI]) {
    const f = resolve(map, fg);
    const b = resolve(map, bg);
    if (!f || !b || !f.startsWith("#") || !b.startsWith("#")) {
      console.log(`  ??  ${label.padEnd(30)} ${fg} -> ${f} on ${bg} -> ${b} (unresolved)`);
      failures++;
      continue;
    }
    const ratio = contrast(f, b);
    const ok = ratio >= min;
    if (!ok) failures++;
    console.log(
      `  ${ok ? "PASS" : "FAIL"}  ${ratio.toFixed(2).padStart(6)}:1  (min ${min})  ${label}`
    );
  }

  // Diff badge: coloured text on a 20% wash of that same colour. The wash is
  // composited over the surface first, so this needs a real alpha blend.
  for (const [ink, hue, label] of [
    ["--diff-add-ink", "--diff-add", "diff badge text on its own wash"],
    ["--diff-del-ink", "--diff-del", "diff badge del text on its own wash"],
  ]) {
    const f = resolve(map, ink);
    const hueHex = resolve(map, hue);
    const over = resolve(map, "--surface-primary");
    if (!f?.startsWith("#") || !hueHex?.startsWith("#") || !over?.startsWith("#")) continue;
    const blend = blendHex(hueHex, over, 0.2);
    const ratio = contrast(f, blend);
    const ok = ratio >= 4.5;
    if (!ok) failures++;
    console.log(
      `  ${ok ? "PASS" : "FAIL"}  ${ratio.toFixed(2).padStart(6)}:1  (min 4.5)  ${label}`
    );
  }

  console.log("  -- decorative (exempt from 1.4.11, informational) --");
  for (const [fg, bg, label] of DECORATIVE) {
    const f = resolve(map, fg);
    const b = resolve(map, bg);
    if (!f?.startsWith("#") || !b?.startsWith("#")) continue;
    console.log(
      `  ----  ${contrast(f, b).toFixed(2).padStart(6)}:1            ${label}`
    );
  }
}

console.log(`\n${failures === 0 ? "All checks passed." : `${failures} check(s) failed.`}`);
process.exit(failures === 0 ? 0 : 1);
