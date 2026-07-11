import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicFiles = [];
const localReferencePattern = /(?:href|src)="([^"]+)"/g;
const sensitivePattern = /(tarojiosaburo|\/Users|Documents\/HP|\.codex|generated_images)/;

const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    if ([".git", "node_modules", "out"].includes(name)) continue;
    const fullPath = path.join(dir, name);
    if (statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      publicFiles.push(fullPath);
    }
  }
};

walk(root);

for (const file of publicFiles) {
  const relative = path.relative(root, file);
  if (relative === "scripts/validate-site.mjs") continue;
  if (/\.(png|jpg|jpeg|gif|webp|ico)$/i.test(relative)) continue;
  const text = readFileSync(file, "utf8");
  if (sensitivePattern.test(text) && relative !== "PUBLICATION_CHECKLIST.md") {
    throw new Error(`Sensitive local information found in ${relative}`);
  }
}

const htmlFiles = readdirSync(root).filter((file) => file.endsWith(".html"));
const missing = [];
for (const file of htmlFiles) {
  const text = readFileSync(path.join(root, file), "utf8");
  for (const match of text.matchAll(localReferencePattern)) {
    const url = match[1];
    if (url.startsWith("http") || url.startsWith("#") || url.startsWith("mailto:")) continue;
    const clean = url.split("#")[0];
    if (clean && !existsSync(path.join(root, clean))) {
      missing.push(`${file} -> ${url}`);
    }
  }
}

if (missing.length) {
  throw new Error(`Missing local references:\n${missing.join("\n")}`);
}

console.log("Site validation complete.");
