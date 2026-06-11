"use client";

import { useEffect, useMemo, useState } from "react";

/** Shape of GET /api/catalog (the orchestrator's /catalog, proxied). */
type Catalog = {
  models: { name: string; servable: boolean }[];
  envs: { name: string; servable: boolean }[];
  verdicts: Record<string, Record<string, string>>; // model -> env -> match|mismatch|unknown
  specs: { name: string; spec: NamedSpec }[];
};

type NamedSpec = {
  model?: string;
  env?: { name?: string; params?: Record<string, unknown> };
  run?: { lanes?: number; max_steps?: number };
};

const VERDICT_STYLE: Record<string, string> = {
  match: "bg-green-100 text-green-800 border-green-700",
  mismatch: "bg-amber-100 text-amber-800 border-amber-700",
  unknown: "bg-gray-100 text-gray-600 border-gray-400",
};

function PickButton({
  label,
  selected,
  disabled,
  badge,
  onClick,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "not servable / contract mismatch" : undefined}
      className={`px-3 py-1.5 rounded-sm border font-mono text-xs flex items-center gap-2 transition-transform ${
        disabled
          ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
          : selected
            ? "border-black bg-black text-white shadow-brutal"
            : "border-black bg-white shadow-brutal hover:-translate-x-px hover:-translate-y-px"
      }`}
    >
      {label}
      {badge && (
        <span
          className={`text-[10px] px-1 py-px rounded-sm border ${VERDICT_STYLE[badge] ?? VERDICT_STYLE.unknown}`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-semibold">{label}</span>
      {children}
    </label>
  );
}

const INPUT =
  "border border-black rounded-sm px-2 py-1.5 font-mono text-xs bg-white shadow-brutal focus:outline-none";

export default function LaunchPanel() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const [model, setModel] = useState("");
  const [env, setEnv] = useState("");
  // Task grid + run knobs (the libero family — the currently servable envs).
  const [suite, setSuite] = useState("libero_spatial");
  const [taskIds, setTaskIds] = useState("0-3");
  const [lanes, setLanes] = useState(4);
  const [maxSteps, setMaxSteps] = useState<string>("");
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    fetch("/api/catalog")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? `HTTP ${r.status}`);
        return r.json() as Promise<Catalog>;
      })
      .then((cat) => {
        setCatalog(cat);
        // Default to the first cleanly-matching servable pair.
        const m = cat.models.find((m) => m.servable);
        if (m) {
          setModel(m.name);
          const e = cat.envs.find(
            (e) => e.servable && cat.verdicts[m.name]?.[e.name] === "match",
          );
          if (e) setEnv(e.name);
        }
      })
      .catch((err) => setError(String(err)));
  }, []);

  /** A preset fills the whole form; the pickers stay editable afterwards. */
  function applyPreset(named: NamedSpec) {
    if (named.model) setModel(named.model);
    if (named.env?.name) setEnv(named.env.name);
    const p = named.env?.params ?? {};
    if (Array.isArray(p.suites) && p.suites.length) setSuite(String(p.suites[0]));
    if (p.task_ids !== undefined) setTaskIds(String(p.task_ids));
    if (named.run?.lanes) setLanes(named.run.lanes);
    setMaxSteps(named.run?.max_steps ? String(named.run.max_steps) : "");
  }

  const envVerdict = (e: string) => catalog?.verdicts[model]?.[e] ?? "unknown";
  const ready = useMemo(
    () => !!model && !!env && envVerdict(env) !== "mismatch" && !launching,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, env, launching, catalog],
  );

  async function run() {
    setLaunching(true);
    setError(null);
    setRunId(null);
    const spec = {
      model,
      env: {
        name: env,
        params: { suites: [suite], task_ids: taskIds, init_ids: [0] },
      },
      run: {
        lanes,
        group: 1,
        ...(maxSteps ? { max_steps: Number(maxSteps) } : {}),
      },
    };
    try {
      const resp = await fetch("/api/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec }),
      });
      const body = await resp.json();
      if (!resp.ok) throw new Error(body.error ?? `HTTP ${resp.status}`);
      setRunId(body.run_id ?? null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLaunching(false);
    }
  }

  if (!catalog && !error) {
    return <div className="text-sm text-muted">Loading catalog…</div>;
  }
  if (!catalog) {
    return (
      <div className="text-sm border border-black rounded-sm shadow-brutal bg-amber-50 px-4 py-3">
        Catalog unavailable: {error}
        <div className="mt-1 text-xs text-muted">
          Is the orchestrator deployed and BENCH_API_URL set in .env.local?
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <section>
        <h2 className="text-sm font-semibold mb-2">Presets</h2>
        <div className="flex flex-wrap gap-2">
          {catalog.specs.map(({ name, spec }) => (
            <PickButton
              key={name}
              label={name}
              selected={false}
              onClick={() => applyPreset(spec)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-2">Model</h2>
        <div className="flex flex-wrap gap-2">
          {catalog.models.map((m) => (
            <PickButton
              key={m.name}
              label={m.name}
              selected={model === m.name}
              disabled={!m.servable}
              onClick={() => setModel(m.name)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-2">
          Environment{" "}
          <span className="font-normal text-muted">
            (wiring verdict vs <span className="font-mono">{model}</span>)
          </span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {catalog.envs.map((e) => (
            <PickButton
              key={e.name}
              label={e.name}
              selected={env === e.name}
              disabled={!e.servable || envVerdict(e.name) === "mismatch"}
              badge={e.servable ? envVerdict(e.name) : undefined}
              onClick={() => setEnv(e.name)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-2">Tasks & run</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="suite">
            <input className={INPUT} value={suite} onChange={(e) => setSuite(e.target.value)} />
          </Field>
          <Field label="task ids">
            <input
              className={INPUT}
              value={taskIds}
              onChange={(e) => setTaskIds(e.target.value)}
              placeholder='e.g. "0-3" or "0,2"'
            />
          </Field>
          <Field label="lanes">
            <input
              className={INPUT}
              type="number"
              min={1}
              max={8}
              value={lanes}
              onChange={(e) => setLanes(Number(e.target.value) || 1)}
            />
          </Field>
          <Field label="max steps (opt.)">
            <input
              className={INPUT}
              type="number"
              value={maxSteps}
              onChange={(e) => setMaxSteps(e.target.value)}
              placeholder="episode cap"
            />
          </Field>
        </div>
      </section>

      <section className="flex items-center gap-4">
        <button
          type="button"
          onClick={run}
          disabled={!ready}
          className={`px-6 py-2.5 rounded-sm border font-semibold text-sm ${
            ready
              ? "border-black bg-black text-white shadow-brutal hover:-translate-x-px hover:-translate-y-px"
              : "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
          }`}
        >
          {launching ? "Launching…" : "Run"}
        </button>
        <span className="text-xs text-muted">
          {model} × {env || "—"} · {suite} [{taskIds}] · {lanes} lane{lanes === 1 ? "" : "s"}
        </span>
      </section>

      {runId && (
        <div className="text-sm border border-black rounded-sm shadow-brutal bg-green-50 px-4 py-3">
          Run launched — <span className="font-mono">{runId}</span>
        </div>
      )}

      {error && (
        <div className="text-sm border border-black rounded-sm shadow-brutal bg-amber-50 px-4 py-3">
          {error}
        </div>
      )}
    </div>
  );
}
