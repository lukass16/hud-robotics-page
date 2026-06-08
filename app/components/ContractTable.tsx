"use client";

import { Fragment, useState } from "react";
import type { EnvSummary, FlatFeature, ModelSummary } from "@/lib/types";
import Tag from "./Tag";

function shapeStr(shape?: number[]): string {
  return shape && shape.length ? `[${shape.join(",")}]` : "—";
}

function normStr(n: FlatFeature["normalization"]): string | undefined {
  if (!n) return undefined;
  if (typeof n === "string") return n;
  return Object.values(n).join("/");
}

function FeatureLine({ f, tone }: { f: FlatFeature; tone: "env" | "model" }) {
  return (
    <div className="py-1.5 border-b border-gray-100 last:border-0">
      <div className="font-mono text-[11px] text-foreground">{f.key}</div>
      <div className="mt-1 flex flex-wrap gap-1">
        {f.type && <Tag tone="muted">{f.type}</Tag>}
        {f.state_type && (
          <Tag tone={tone} mono>
            {f.state_type}
          </Tag>
        )}
        {f.state_representation && (
          <Tag tone="muted" mono>
            {f.state_representation}
          </Tag>
        )}
        {f.frame && <Tag tone="muted">frame:{f.frame}</Tag>}
        {f.dtype && <Tag tone="muted">{f.dtype}</Tag>}
        {f.units && f.units !== "none" && <Tag tone="muted">{f.units}</Tag>}
        <Tag tone="muted" mono>
          {shapeStr(f.shape)}
        </Tag>
        {normStr(f.normalization) && (
          <Tag tone="accent">norm:{normStr(f.normalization)}</Tag>
        )}
        {f.padding && <Tag tone="muted">pad</Tag>}
      </div>
    </div>
  );
}

function Detail({
  row,
  tone,
}: {
  row: EnvSummary | ModelSummary;
  tone: "env" | "model";
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 px-4 py-3 bg-gray-50/70 border-t border-gray-200 text-[12px]">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1">
          Observations
        </div>
        {row.obsFeatures.map((f) => (
          <FeatureLine key={f.key} f={f} tone={tone} />
        ))}
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1">
          Actions
        </div>
        {row.actionFeatures.length ? (
          row.actionFeatures.map((f) => (
            <FeatureLine key={f.key} f={f} tone={tone} />
          ))
        ) : (
          <div className="text-muted text-[11px]">No action features.</div>
        )}
        {row.kind === "model" && (row as ModelSummary).decisionVariables.length > 0 && (
          <div className="mt-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1">
              Decision variables
            </div>
            <div className="flex flex-wrap gap-1">
              {(row as ModelSummary).decisionVariables.map((d) => (
                <Tag key={d} mono>
                  {d}
                </Tag>
              ))}
            </div>
          </div>
        )}
        {row.comment && (
          <div className="mt-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1">
              Notes
            </div>
            <p className="text-[11px] text-muted leading-relaxed">{row.comment}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-90" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function ContractTable({
  kind,
  rows,
}: {
  kind: "env" | "model";
  rows: (EnvSummary | ModelSummary)[];
}) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const tone = kind === "env" ? "env" : "model";
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const headCell =
    "px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted whitespace-nowrap";
  const cell = "px-3 py-2 align-top text-[12px]";

  return (
    <div className="overflow-x-auto thin-scroll">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th className={`${headCell} w-6`}></th>
            <th className={headCell}>{kind === "env" ? "Environment" : "Model"}</th>
            {kind === "model" && <th className={headCell}>Policy</th>}
            <th className={headCell}>Robot type</th>
            <th className={headCell}>Class</th>
            {kind === "model" && <th className={headCell}>Chunk</th>}
            <th className={headCell}>Hz</th>
            <th className={headCell}>Imgs</th>
            <th className={headCell}>Action</th>
            {kind === "model" ? (
              <th className={headCell}>Norm.</th>
            ) : (
              <th className={headCell}>Dims (s/a)</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isOpen = open.has(row.id);
            const colspan = kind === "model" ? 10 : 8;
            const model = row.kind === "model" ? (row as ModelSummary) : null;
            return (
              <Fragment key={row.id}>
                <tr
                  onClick={() => toggle(row.id)}
                  className="border-b border-gray-200 hover:bg-accent-light/50 cursor-pointer"
                >
                  <td className={`${cell} w-6 text-muted`}>
                    <Chevron open={isOpen} />
                  </td>
                  <td className={`${cell} font-mono font-semibold`}>{row.id}</td>
                  {kind === "model" && (
                    <td className={`${cell} text-muted`}>{model!.policyClass}</td>
                  )}
                  <td className={cell}>
                    <div className="flex flex-wrap gap-1">
                      {row.robotTypes.map((rt) => (
                        <Tag key={rt} tone={tone} mono>
                          {rt}
                        </Tag>
                      ))}
                    </div>
                  </td>
                  <td className={cell}>
                    <Tag mono>{row.robotClass}</Tag>
                  </td>
                  {kind === "model" && (
                    <td className={`${cell} font-mono`}>{model!.chunkSize ?? "—"}</td>
                  )}
                  <td className={`${cell} font-mono`}>{row.controlRate}</td>
                  <td className={`${cell} font-mono`}>{row.numObsImages}</td>
                  <td className={cell}>
                    <div className="flex flex-wrap gap-1">
                      {row.actionStateTypes.length ? (
                        row.actionStateTypes.map((a) => (
                          <Tag key={a} tone="accent" mono>
                            {a}
                          </Tag>
                        ))
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </div>
                  </td>
                  {kind === "model" ? (
                    <td className={cell}>
                      <div className="flex flex-wrap gap-1">
                        {model!.normalizations.length ? (
                          model!.normalizations.map((n) => (
                            <Tag key={n} mono>
                              {n}
                            </Tag>
                          ))
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </div>
                    </td>
                  ) : (
                    <td className={`${cell} font-mono text-muted`}>
                      {row.stateDim}/{row.actionDim}
                    </td>
                  )}
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={colspan} className="p-0">
                      <Detail row={row} tone={tone} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={kind === "model" ? 10 : 8}
                className="px-3 py-10 text-center text-muted text-sm"
              >
                No matching {kind === "env" ? "environments" : "models"}.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
