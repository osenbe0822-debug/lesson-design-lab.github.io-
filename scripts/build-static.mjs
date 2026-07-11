import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const entries = [
  "index.html",
  "classroom-english.html",
  "question-maker.html",
  "self-check.html",
  "ib-notes.html",
  "classroom-management.html",
  "about.html",
  "terms.html",
  "assets",
  "data",
  "content",
  "robots.txt",
  "sitemap.xml"
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const entry of entries) {
  const source = path.join(root, entry);
  if (!existsSync(source)) {
    throw new Error(`Build source not found: ${entry}`);
  }
  await cp(source, path.join(outDir, entry), { recursive: true });
}

await writeFile(path.join(outDir, ".nojekyll"), "");

if (!existsSync(path.join(outDir, "index.html"))) {
  throw new Error("Build failed: out/index.html was not generated.");
}

console.log("Static build complete: out/index.html");
