#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";

const productName = process.argv.slice(2).join(" ").trim();

if (!productName) {
  console.error('Usage: pnpm rename:product -- "Product Name"');
  process.exit(1);
}

const packageName = productName
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

if (!packageName) {
  console.error("The product name must contain at least one letter or number.");
  process.exit(1);
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const readme = await readFile("README.md", "utf8");
const layoutPath = "src/app/layout.tsx";
const layout = await readFile(layoutPath, "utf8");

if (!readme.startsWith("# Product Frontend Starter\n")) {
  console.error("README title is not the expected starter identity; no files changed.");
  process.exit(1);
}
if (!layout.includes('title: "Frontend Starter"')) {
  console.error("App metadata is not the expected starter identity; no files changed.");
  process.exit(1);
}

packageJson.name = packageName;
await writeFile("package.json", `${JSON.stringify(packageJson, null, 2)}\n`);
await writeFile(
  "README.md",
  readme.replace(/^# Product Frontend Starter$/m, `# ${productName}`),
);
await writeFile(
  layoutPath,
  layout.replace('title: "Frontend Starter"', `title: ${JSON.stringify(productName)}`),
);

console.log(`Updated package name and app identity to "${productName}".`);
