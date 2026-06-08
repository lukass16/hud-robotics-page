import type { CommonSummary, EnvSummary, ModelSummary } from "./types";

export type Scope = "both" | "env" | "model";

export interface FacetDef {
  id: string;
  label: string;
  hint?: string;
  numeric?: boolean;
  values: (row: CommonSummary) => string[];
  format?: (v: string) => string;
}

// The set of fields we let users filter on. Many of these exist on BOTH envs
// and models (robot type, class, action space, control rate, image count),
// which is what makes "filter both tables at once" meaningful.
export const FACETS: FacetDef[] = [
  {
    id: "robotType",
    label: "Robot type",
    hint: "Embodiment id — the primary compatibility key",
    values: (r) => r.robotTypes,
  },
  {
    id: "robotClass",
    label: "Robot class",
    hint: "Coarse morphology (armNgM scheme)",
    values: (r) => [r.robotClass],
  },
  {
    id: "actionSpace",
    label: "Action space",
    hint: "Coarse action space: JOINT / EE / BASE",
    values: (r) => r.actionSpaces,
  },
  {
    id: "actionStateType",
    label: "Action type",
    hint: "Full action state_type keys",
    values: (r) => r.actionStateTypes,
  },
  {
    id: "numObsImages",
    label: "Obs. images",
    hint: "Number of (non-padding) camera streams",
    numeric: true,
    values: (r) => [String(r.numObsImages)],
  },
  {
    id: "controlRate",
    label: "Control rate",
    hint: "Hz the contract operates at",
    numeric: true,
    values: (r) => [String(r.controlRate)],
    format: (v) => `${v} Hz`,
  },
  {
    id: "obsStateType",
    label: "Obs. state type",
    hint: "Proprioceptive state_type keys",
    values: (r) => r.obsStateTypes,
  },
];

export const FACET_BY_ID: Record<string, FacetDef> = Object.fromEntries(
  FACETS.map((f) => [f.id, f])
);

export interface FacetState {
  selected: string[];
  scope: Scope;
}

export type FilterState = Record<string, FacetState>;

export function initialFilterState(): FilterState {
  return Object.fromEntries(
    FACETS.map((f) => [f.id, { selected: [], scope: "both" as Scope }])
  );
}

// Compute the union of option values across both tables, so an option only
// present on one side still shows up (useful when scoped to that side).
export function facetOptions(
  facet: FacetDef,
  envs: EnvSummary[],
  models: ModelSummary[]
): string[] {
  const set = new Set<string>();
  for (const r of [...envs, ...models]) facet.values(r).forEach((v) => set.add(v));
  const arr = Array.from(set);
  if (facet.numeric) arr.sort((a, b) => Number(a) - Number(b));
  else arr.sort();
  return arr;
}

function rowMatchesText(row: CommonSummary, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const hay: string[] = [
    row.id,
    row.robotClass,
    ...row.robotTypes,
    ...row.actionStateTypes,
    ...row.obsStateTypes,
    ...row.cameraSlots,
    row.comment ?? "",
  ];
  if (row.kind === "model") {
    const m = row as ModelSummary;
    hay.push(m.policyClass, m.checkpoint ?? "", ...m.normalizations);
  }
  return hay.join(" \u0000 ").toLowerCase().includes(needle);
}

// A facet applies to a given table kind if its scope is "both" or that kind.
function scopeApplies(scope: Scope, kind: "env" | "model"): boolean {
  return scope === "both" || scope === kind;
}

export function filterRows<T extends CommonSummary>(
  rows: T[],
  kind: "env" | "model",
  filters: FilterState,
  text: string
): T[] {
  return rows.filter((row) => {
    if (!rowMatchesText(row, text)) return false;
    for (const facet of FACETS) {
      const state = filters[facet.id];
      if (!state || state.selected.length === 0) continue;
      if (!scopeApplies(state.scope, kind)) continue;
      const values = facet.values(row);
      const hit = values.some((v) => state.selected.includes(v));
      if (!hit) return false;
    }
    return true;
  });
}

export function activeFilterCount(filters: FilterState): number {
  return FACETS.reduce(
    (n, f) => n + (filters[f.id]?.selected.length ? 1 : 0),
    0
  );
}
