# HUD Benchmark Compatibility Matrix

A single-page [Next.js](https://nextjs.org) site that displays the HUD robot
**contract specs** — environments (embodiments) and models (policies) — as two
side-by-side, filterable tables so compatible env/model pairs can be matched
quickly.

Both kinds of contract share one feature schema (see `data/SPEC.md`), so the two
can be compared field-for-field. The data is generated directly from the JSON
contracts in `data/envs/*.json` and `data/models/*.json`.

## Features

- **Two tables, side by side** — Environments and Models, each with expandable
  rows that reveal the full observation/action feature breakdown, decision
  variables, and notes.
- **Shared *and* separate filtering** — every filter has a scope toggle:
  - **Both** — filter the env and model tables at once on a shared field
    (e.g. pick a `robot type` and instantly see compatible envs + models).
  - **Env** / **Model** — scope the filter to a single table.
- **Filterable fields**: robot type (the primary compatibility key), robot
  class, action space (coarse `JOINT`/`EE`/`BASE`), full action `state_type`,
  number of observation images, control rate (Hz), and observation state type.
- **Per-table free-text search** over ids, robot types, state types, camera
  slots, checkpoints, normalization, and notes.

## Data

Filterable/derived fields are computed in `lib/contracts.ts` from the raw
contracts at build time:

```
data/
  envs/*.json     # environment (embodiment) contracts
  models/*.json   # model (policy) contracts
  SPEC.md         # the contract authoring guide
```

To update the matrix, edit/replace the JSON files and rebuild.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Verify

```bash
npm run build              # type-check + production build
npx tsx scripts/selftest.ts  # deterministic filtering-logic checks
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4. Styled to
match the [hud.ai](https://hud.ai) aesthetic.
