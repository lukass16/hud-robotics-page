"use client";

import { useMemo, useState } from "react";
import type { Dataset } from "@/lib/types";
import {
  FACETS,
  activeFilterCount,
  facetOptions,
  filterRows,
  initialFilterState,
  type FacetState,
  type FilterState,
} from "@/lib/filters";
import FacetControl from "./FacetControl";
import ContractTable from "./ContractTable";

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <svg
        className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
        />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full sm:w-52 rounded-sm border border-black bg-white pl-7 pr-2 py-1 text-xs font-mono outline-none focus:shadow-brutal"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted hover:text-accent-hover text-xs"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default function Explorer({ data }: { data: Dataset }) {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [envQuery, setEnvQuery] = useState("");
  const [modelQuery, setModelQuery] = useState("");

  const options = useMemo(
    () =>
      Object.fromEntries(
        FACETS.map((f) => [f.id, facetOptions(f, data.envs, data.models)])
      ),
    [data]
  );

  const envRows = useMemo(
    () => filterRows(data.envs, "env", filters, envQuery),
    [data.envs, filters, envQuery]
  );
  const modelRows = useMemo(
    () => filterRows(data.models, "model", filters, modelQuery),
    [data.models, filters, modelQuery]
  );

  const setFacet = (id: string, next: FacetState) =>
    setFilters((prev) => ({ ...prev, [id]: next }));

  const reset = () => {
    setFilters(initialFilterState());
    setEnvQuery("");
    setModelQuery("");
  };

  const active = activeFilterCount(filters);

  return (
    <div className="space-y-5">
      {/* Filter panel */}
      <section className="rounded-md border border-black bg-white shadow-brutal p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight">Filters</h2>
            <span className="text-[11px] text-muted">
              Scope each filter to{" "}
              <span className="font-semibold text-foreground">Both</span> tables,
              or to <span className="text-env font-semibold">Env</span> /{" "}
              <span className="text-model font-semibold">Model</span> only.
            </span>
          </div>
          <button
            onClick={reset}
            disabled={active === 0 && !envQuery && !modelQuery}
            className="text-xs rounded-sm border border-black bg-white px-2.5 py-1 shadow-brutal hover:-translate-x-px hover:-translate-y-px disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            Reset all
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FACETS.map((f) => (
            <FacetControl
              key={f.id}
              facet={f}
              options={options[f.id]}
              state={filters[f.id]}
              onChange={(next) => setFacet(f.id, next)}
            />
          ))}
        </div>
      </section>

      {/* Side-by-side tables */}
      <div className="grid gap-5 lg:grid-cols-2 items-start">
        <section className="rounded-md border border-black bg-white shadow-brutal overflow-hidden">
          <header className="flex items-center justify-between gap-2 border-b-2 border-black bg-env-light px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-env" />
              <h2 className="text-sm font-bold text-env tracking-tight">
                Environments
              </h2>
              <span className="font-mono text-[11px] text-muted">
                {envRows.length}/{data.envs.length}
              </span>
            </div>
            <SearchInput
              value={envQuery}
              onChange={setEnvQuery}
              placeholder="search envs…"
            />
          </header>
          <ContractTable kind="env" rows={envRows} />
        </section>

        <section className="rounded-md border border-black bg-white shadow-brutal overflow-hidden">
          <header className="flex items-center justify-between gap-2 border-b-2 border-black bg-model-light px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-model" />
              <h2 className="text-sm font-bold text-model tracking-tight">
                Models
              </h2>
              <span className="font-mono text-[11px] text-muted">
                {modelRows.length}/{data.models.length}
              </span>
            </div>
            <SearchInput
              value={modelQuery}
              onChange={setModelQuery}
              placeholder="search models…"
            />
          </header>
          <ContractTable kind="model" rows={modelRows} />
        </section>
      </div>
    </div>
  );
}
