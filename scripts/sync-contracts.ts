/**
 * Copy implemented contracts from demos/contracts into data/ for standalone
 * builds (GitHub Pages, etc.). Only top-level envs/*.json and models/*.json —
 * subfolders like nonimplemented/ are skipped, matching lib/contracts.ts.
 *
 * Usage (from hud-robotics-page/):
 *   npm run sync-contracts
 *
 * Source resolution:
 *   1. CONTRACTS_SOURCE env var (absolute or relative path)
 *   2. ../demos/contracts (monorepo layout)
 *   3. skip with a warning if neither exists (relies on committed data/)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const DEST = path.join(ROOT, "data");

function resolveSource(): string | null {
  const fromEnv = process.env.CONTRACTS_SOURCE;
  if (fromEnv) {
    const resolved = path.isAbsolute(fromEnv)
      ? fromEnv
      : path.join(ROOT, fromEnv);
    if (fs.existsSync(resolved)) return resolved;
    console.error(`CONTRACTS_SOURCE not found: ${resolved}`);
    process.exit(1);
  }
  const monorepo = path.join(ROOT, "..", "demos", "contracts");
  if (fs.existsSync(monorepo)) return monorepo;
  return null;
}

function copyJsonDir(sourceRoot: string, kind: "envs" | "models") {
  const srcDir = path.join(sourceRoot, kind);
  const destDir = path.join(DEST, kind);
  fs.mkdirSync(destDir, { recursive: true });

  const srcFiles = new Set(
    fs
      .readdirSync(srcDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => path.join(srcDir, f)),
  );
  const srcNames = new Set([...srcFiles].map((f) => path.basename(f)));

  for (const src of srcFiles) {
    const name = path.basename(src);
    fs.copyFileSync(src, path.join(destDir, name));
    console.log(`  copied ${kind}/${name}`);
  }

  // Drop stale bundled copies that no longer exist in the source.
  for (const existing of fs.readdirSync(destDir)) {
    if (!existing.endsWith(".json")) continue;
    if (!srcNames.has(existing)) {
      fs.unlinkSync(path.join(destDir, existing));
      console.log(`  removed stale ${kind}/${existing}`);
    }
  }
}

const source = resolveSource();
if (!source) {
  console.warn(
    "No contract source found (set CONTRACTS_SOURCE or run from monorepo). Using committed data/.",
  );
  process.exit(0);
}

console.log(`Syncing contracts from ${source} -> ${DEST}`);
fs.mkdirSync(DEST, { recursive: true });

const specSrc = path.join(source, "SPEC.md");
if (fs.existsSync(specSrc)) {
  fs.copyFileSync(specSrc, path.join(DEST, "SPEC.md"));
  console.log("  copied SPEC.md");
}

for (const kind of ["envs", "models"] as const) {
  copyJsonDir(source, kind);
}

console.log("Done.");
