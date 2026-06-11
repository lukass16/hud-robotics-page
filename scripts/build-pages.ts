/**
 * Static export for GitHub Pages: sync contracts, temporarily move server-only
 * routes aside, build with output: "export", then restore.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const STASH = path.join(ROOT, ".pages-stash");
const SERVER_ONLY = ["app/api", "app/launch"];

function stashRoutes() {
  fs.mkdirSync(STASH, { recursive: true });
  for (const rel of SERVER_ONLY) {
    const src = path.join(ROOT, rel);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(STASH, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(src, dest);
    console.log(`Stashed ${rel}`);
  }
}

function restoreRoutes() {
  if (!fs.existsSync(STASH)) return;
  for (const rel of SERVER_ONLY) {
    const src = path.join(STASH, rel);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(src, dest);
    console.log(`Restored ${rel}`);
  }
  fs.rmSync(STASH, { recursive: true, force: true });
}

process.chdir(ROOT);
execSync("npm run sync-contracts", { stdio: "inherit" });

stashRoutes();
try {
  execSync("next build", {
    stdio: "inherit",
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      NEXT_PUBLIC_GITHUB_PAGES: "true",
    },
  });
  console.log("Static export written to out/");
} finally {
  restoreRoutes();
}
