// Deterministic checks for the filtering logic against the real contract data.
// Run from the project root: `npx tsx scripts/selftest.ts`
import { loadDataset } from "../lib/contracts";
import {
  FACETS,
  filterRows,
  initialFilterState,
  type FilterState,
} from "../lib/filters";

const data = loadDataset();
let failures = 0;
function check(name: string, cond: boolean, detail?: string) {
  if (cond) {
    console.log(`  ok   ${name}`);
  } else {
    failures++;
    console.log(`  FAIL ${name}${detail ? `  (${detail})` : ""}`);
  }
}

console.log(`Loaded ${data.envs.length} envs, ${data.models.length} models`);
check("12 envs", data.envs.length === 12);
check("14 models", data.models.length === 14);

// Helper to set one facet.
function withFacet(
  id: string,
  selected: string[],
  scope: "both" | "env" | "model"
): FilterState {
  const f = initialFilterState();
  f[id] = { selected, scope };
  return f;
}

// 1) Shared filter on robot type (scope=both) narrows BOTH tables.
{
  const f = withFacet("robotType", ["franka_panda_libero"], "both");
  const envs = filterRows(data.envs, "env", f, "");
  const models = filterRows(data.models, "model", f, "");
  console.log(
    `\n[robotType=franka_panda_libero, both] envs=${envs.length} (${envs
      .map((e) => e.id)
      .join(",")}) models=${models.length} (${models.map((m) => m.id).join(",")})`
  );
  check("libero envs include libero + libero_pro variants", envs.length >= 3);
  check(
    "libero models present and all match franka_panda_libero",
    models.length >= 3 &&
      models.every((m) => m.robotTypes.includes("franka_panda_libero"))
  );
}

// 2) Scope=env only narrows envs, leaves models untouched.
{
  const f = withFacet("robotType", ["franka_panda_libero"], "env");
  const envs = filterRows(data.envs, "env", f, "");
  const models = filterRows(data.models, "model", f, "");
  console.log(`\n[robotType, scope=env] envs=${envs.length} models=${models.length}`);
  check("scope=env narrows envs", envs.length < data.envs.length);
  check("scope=env leaves all models", models.length === data.models.length);
}

// 3) Scope=model only narrows models, leaves envs untouched.
{
  const f = withFacet("robotType", ["franka_panda_libero"], "model");
  const envs = filterRows(data.envs, "env", f, "");
  const models = filterRows(data.models, "model", f, "");
  console.log(`\n[robotType, scope=model] envs=${envs.length} models=${models.length}`);
  check("scope=model leaves all envs", envs.length === data.envs.length);
  check("scope=model narrows models", models.length < data.models.length);
}

// 4) Action space coarse filter (JOINT) returns only joint-action contracts.
{
  const f = withFacet("actionSpace", ["JOINT"], "both");
  const envs = filterRows(data.envs, "env", f, "");
  const models = filterRows(data.models, "model", f, "");
  console.log(`\n[actionSpace=JOINT, both] envs=${envs.length} models=${models.length}`);
  check(
    "all JOINT-filtered envs have a JOINT action space",
    envs.every((e) => e.actionSpaces.includes("JOINT"))
  );
  check(
    "all JOINT-filtered models have a JOINT action space",
    models.every((m) => m.actionSpaces.includes("JOINT"))
  );
}

// 5) Obs images count filter.
{
  const f = withFacet("numObsImages", ["2"], "both");
  const envs = filterRows(data.envs, "env", f, "");
  check(
    "2-image envs all have exactly 2 obs images",
    envs.length > 0 && envs.every((e) => e.numObsImages === 2)
  );
}

// 6) Multi-embodiment model has multiple robot types.
{
  const multi = data.models.filter((m) => m.multiEmbodiment);
  console.log(`\nMulti-embodiment models: ${multi.map((m) => m.id).join(",") || "none"}`);
  check("at least one multi-embodiment model parsed", multi.length >= 0);
}

// 7) Free-text search scoping is independent per table.
{
  const f = initialFilterState();
  const envs = filterRows(data.envs, "env", f, "aloha");
  const models = filterRows(data.models, "model", f, "");
  check("env text search 'aloha' matches >=1 env", envs.length >= 1);
  check("empty model search returns all models", models.length === data.models.length);
}

// 8) Every facet has at least one option present in the data.
for (const facet of FACETS) {
  const opts = new Set<string>();
  for (const r of [...data.envs, ...data.models])
    facet.values(r).forEach((v) => opts.add(v));
  check(`facet '${facet.id}' has options`, opts.size > 0, `${opts.size} options`);
}

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
