import fs from "node:fs";
import path from "node:path";
import type {
  Dataset,
  EnvSummary,
  Feature,
  FlatFeature,
  ModelSummary,
  RawEnv,
  RawModel,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function readJsonDir<T>(dir: string): { id: string; raw: T }[] {
  const full = path.join(DATA_DIR, dir);
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => ({
      id: f.replace(/\.json$/, ""),
      raw: JSON.parse(fs.readFileSync(path.join(full, f), "utf8")) as T,
    }));
}

function uniqueSorted(values: (string | undefined)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v))).sort();
}

function product(shape?: number[]): number {
  if (!shape || shape.length === 0) return 0;
  return shape.reduce((a, b) => a * b, 1);
}

function flatten(features: Record<string, Feature> | undefined): FlatFeature[] {
  if (!features) return [];
  return Object.entries(features).map(([key, f]) => ({ key, ...f }));
}

// Pull the action features for a model, handling single-mode (action.*) and the
// experimental action_modes wrapper (prefer the native/preferred mode).
function modelActionFeatures(raw: RawModel): FlatFeature[] {
  const direct = flatten(raw.features).filter((f) => f.key.startsWith("action."));
  if (direct.length > 0) return direct;
  if (raw.action_modes) {
    const modes = Object.values(raw.action_modes);
    const chosen = modes[0];
    if (chosen?.features) return flatten(chosen.features);
  }
  return [];
}

// Coarse action-space token (JOINT / EE / BASE) from a SPACE_REF_QUANTITY string.
function coarseSpace(stateType?: string): string | undefined {
  if (!stateType) return undefined;
  return stateType.split("_")[0];
}

function normalizationValues(features: FlatFeature[]): string[] {
  const out: string[] = [];
  for (const f of features) {
    if (typeof f.normalization === "string") out.push(f.normalization);
    else if (f.normalization && typeof f.normalization === "object")
      out.push(...Object.values(f.normalization));
  }
  return uniqueSorted(out);
}

function buildEnv(id: string, raw: RawEnv): EnvSummary {
  const all = flatten(raw.features);
  const obs = all.filter((f) => f.key.startsWith("observation."));
  const obsState = all.filter((f) => f.key.startsWith("observation.state."));
  const images = all.filter(
    (f) => f.key.startsWith("observation.images.") && !f.padding
  );
  const actions = all.filter((f) => f.key.startsWith("action."));
  const hasText = all.some(
    (f) => f.key === "observation.text" || f.type === "language"
  );

  return {
    id,
    kind: "env",
    robotTypes: [raw.robot_type],
    robotClass: raw.robot_class,
    controlRate: raw.control_rate,
    controlMode: raw.control_mode,
    numObsImages: images.length,
    cameraSlots: images.map((f) => f.key.replace("observation.images.", "")),
    hasText,
    obsStateTypes: uniqueSorted(obsState.map((f) => f.state_type)),
    actionStateTypes: uniqueSorted(actions.map((f) => f.state_type)),
    actionSpaces: uniqueSorted(actions.map((f) => coarseSpace(f.state_type))),
    imageDtypes: uniqueSorted(images.map((f) => f.dtype)),
    frames: uniqueSorted(all.map((f) => f.frame)),
    stateDim: obsState.reduce((s, f) => s + product(f.shape), 0),
    actionDim: actions.reduce((s, f) => s + product(f.shape), 0),
    comment: raw.comment,
    obsFeatures: obs,
    actionFeatures: actions,
    raw,
  };
}

function buildModel(id: string, raw: RawModel): ModelSummary {
  const all = flatten(raw.features);
  const obs = all.filter((f) => f.key.startsWith("observation."));
  const obsState = all.filter((f) => f.key.startsWith("observation.state."));
  const images = all.filter(
    (f) => f.key.startsWith("observation.images.") && !f.padding
  );
  const actions = modelActionFeatures(raw);
  const hasText = all.some(
    (f) => f.key === "observation.text" || f.type === "language"
  );
  const robotTypes = Array.isArray(raw.robot_type)
    ? raw.robot_type
    : [raw.robot_type];

  return {
    id,
    kind: "model",
    policyClass: raw.policy_class,
    checkpoint: raw.checkpoint,
    chunkSize: raw.chunk_size,
    robotTypes,
    robotClass: raw.robot_class,
    controlRate: raw.control_rate,
    numObsImages: images.length,
    cameraSlots: images.map((f) => f.key.replace("observation.images.", "")),
    hasText,
    obsStateTypes: uniqueSorted(obsState.map((f) => f.state_type)),
    actionStateTypes: uniqueSorted(actions.map((f) => f.state_type)),
    actionSpaces: uniqueSorted(actions.map((f) => coarseSpace(f.state_type))),
    imageDtypes: uniqueSorted(images.map((f) => f.dtype)),
    frames: uniqueSorted(all.map((f) => f.frame)),
    stateDim: obsState.reduce((s, f) => s + product(f.shape), 0),
    actionDim: actions.reduce((s, f) => s + product(f.shape), 0),
    normalizations: normalizationValues(all),
    decisionVariables: Object.keys(raw.decision_variables ?? {}),
    multiEmbodiment: robotTypes.length > 1,
    comment: raw.comment,
    obsFeatures: obs,
    actionFeatures: actions,
    raw,
  };
}

let cache: Dataset | null = null;

export function loadDataset(): Dataset {
  if (cache) return cache;
  const envs = readJsonDir<RawEnv>("envs").map(({ id, raw }) =>
    buildEnv(id, raw)
  );
  const models = readJsonDir<RawModel>("models").map(({ id, raw }) =>
    buildModel(id, raw)
  );
  cache = { envs, models };
  return cache;
}
