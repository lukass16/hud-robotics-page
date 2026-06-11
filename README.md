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

## Beyond the matrix: Launch

**`/launch`** — pick a model and a contract-compatible env (verdicts come from
the deployed bench orchestrator's `/catalog`; mismatches are greyed out), choose
the task grid + lanes (or apply a prebuilt spec), and click **Run**. The run
starts on the deployed Modal apps.

Server-side proxy routes keep all keys out of the browser. `.env.local`:

```
BENCH_API_URL=...      # deployed bench orchestrator, e.g.
                       #   https://<workspace>--hud-bench-api-api.modal.run
BENCH_API_TOKEN=...    # must match the hud-bench-serving Modal secret
```

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

In the monorepo, `lib/contracts.ts` reads live from `../demos/contracts`. For
standalone deploys, refresh the bundled copies first:

```bash
npm run sync-contracts   # demos/contracts -> data/
```

## GitHub Pages

The matrix can be published as a static site. Launch and API routes are
excluded (they need a Node server).

1. **Enable Pages** in the repo settings: *Build and deployment → Source →
   GitHub Actions*.
2. **Sync contracts** and commit the updated `data/` folder:

   ```bash
   npm run sync-contracts
   git add data/
   git commit -m "sync contracts"
   ```

3. **Push to `main`** — the workflow in `.github/workflows/pages.yml` builds
   and deploys to `https://<user>.github.io/hud-robotics-page/`.

Local dry-run:

```bash
npm run build:pages    # writes static files to out/
```

Optional: set a repo variable `CONTRACTS_SOURCE` (path to a contracts checkout)
in GitHub Actions if you want CI to sync automatically.

## Verify

```bash
npm run build              # type-check + production build (incl. /launch)
npm run selftest           # deterministic filtering-logic checks
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4. Styled to
match the [hud.ai](https://hud.ai) aesthetic.
