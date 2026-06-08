"use client";

import type { FacetDef, FacetState, Scope } from "@/lib/filters";

const SCOPES: { id: Scope; label: string }[] = [
  { id: "both", label: "Both" },
  { id: "env", label: "Env" },
  { id: "model", label: "Model" },
];

export default function FacetControl({
  facet,
  options,
  state,
  onChange,
}: {
  facet: FacetDef;
  options: string[];
  state: FacetState;
  onChange: (next: FacetState) => void;
}) {
  const toggleValue = (v: string) => {
    const selected = state.selected.includes(v)
      ? state.selected.filter((x) => x !== v)
      : [...state.selected, v];
    onChange({ ...state, selected });
  };

  const setScope = (scope: Scope) => onChange({ ...state, scope });
  const clear = () => onChange({ ...state, selected: [] });

  return (
    <div className="rounded-md border border-black bg-surface shadow-brutal p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-xs font-semibold tracking-tight">
            {facet.label}
            {state.selected.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold h-4 min-w-4 px-1">
                {state.selected.length}
              </span>
            )}
          </div>
          {facet.hint && (
            <div className="text-[10px] text-muted mt-0.5 leading-tight">
              {facet.hint}
            </div>
          )}
        </div>

        {/* Scope: filter both tables, or just one */}
        <div className="flex rounded-sm border border-black overflow-hidden shrink-0">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              onClick={() => setScope(s.id)}
              className={`px-1.5 py-0.5 text-[10px] font-medium ${
                state.scope === s.id
                  ? "bg-foreground text-white"
                  : "bg-white text-muted hover:bg-gray-100"
              } ${s.id !== "both" ? "border-l border-black" : ""}`}
              title={
                s.id === "both"
                  ? "Apply to both tables"
                  : `Apply to ${s.label} table only`
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto thin-scroll">
        {options.map((opt) => {
          const active = state.selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggleValue(opt)}
              className={`rounded-sm border px-1.5 py-0.5 text-[11px] font-mono whitespace-nowrap ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-gray-300 bg-white text-foreground hover:border-black"
              }`}
            >
              {facet.format ? facet.format(opt) : opt}
            </button>
          );
        })}
      </div>

      {state.selected.length > 0 && (
        <button
          onClick={clear}
          className="mt-2 text-[10px] text-muted hover:text-accent-hover"
        >
          clear
        </button>
      )}
    </div>
  );
}
