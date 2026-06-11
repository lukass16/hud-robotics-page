// Shared types for the HUD contract specs (envs + models) and their parsed,
// table-ready summaries. See data/SPEC.md for the full authoring schema.

export interface Limits {
  min: number[];
  max: number[];
}

export interface Feature {
  role?: "observation" | "action";
  type?: string;
  dtype?: string;
  state_type?: string;
  state_representation?: string;
  frame?: string;
  units?: string;
  shape?: number[];
  order?: string;
  names?: string[];
  normalization?: string | Record<string, string>;
  padding?: boolean;
  kp?: number | number[];
  kd?: number | number[];
  limits?: Limits;
  stats?: Record<string, unknown>;
  comment?: string;
}

export interface RawEnv {
  robot_type: string;
  robot_class: string;
  control_rate: number;
  control_mode?: string;
  features: Record<string, Feature>;
  comment?: string;
}

export interface RawModel {
  model: string;
  policy_class: string;
  checkpoint?: string;
  robot_type: string | string[];
  robot_class: string;
  chunk_size?: number;
  control_rate: number;
  features?: Record<string, Feature>;
  comment?: string;
}

// A single feature flattened with its key, for rendering detail tables.
export interface FlatFeature extends Feature {
  key: string;
}

// Common derived fields shared by both kinds (used for cross-table filtering).
export interface CommonSummary {
  id: string; // filename without extension
  kind: "env" | "model";
  robotTypes: string[];
  robotClass: string;
  controlRate: number;
  numObsImages: number;
  cameraSlots: string[];
  hasText: boolean;
  obsStateTypes: string[];
  actionStateTypes: string[];
  actionSpaces: string[]; // coarse SPACE token: JOINT / EE / BASE
  imageDtypes: string[];
  frames: string[];
  stateDim: number;
  actionDim: number;
  comment?: string;
  obsFeatures: FlatFeature[];
  actionFeatures: FlatFeature[];
}

export interface EnvSummary extends CommonSummary {
  kind: "env";
  controlMode?: string;
  raw: RawEnv;
}

export interface ModelSummary extends CommonSummary {
  kind: "model";
  policyClass: string;
  checkpoint?: string;
  chunkSize?: number;
  normalizations: string[];
  multiEmbodiment: boolean;
  raw: RawModel;
}

export interface Dataset {
  envs: EnvSummary[];
  models: ModelSummary[];
}
