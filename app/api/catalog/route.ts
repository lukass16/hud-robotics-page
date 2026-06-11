import { NextResponse } from "next/server";

/**
 * GET /api/catalog — what can be launched (models × envs, wiring verdicts,
 * prebuilt specs), proxied from the deployed bench orchestrator
 * (`hud-bench-api` on Modal). The bearer token stays server-side; the browser
 * only talks to this route.
 *
 * .env.local:
 *   BENCH_API_URL=https://<workspace>--hud-bench-api-api.modal.run
 *   BENCH_API_TOKEN=...            (must match the hud-bench-serving secret)
 */

const BENCH_API_URL = process.env.BENCH_API_URL ?? "";
const BENCH_API_TOKEN = process.env.BENCH_API_TOKEN ?? "";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!BENCH_API_URL) {
    return NextResponse.json(
      { error: "BENCH_API_URL not configured (.env.local)" },
      { status: 500 },
    );
  }
  try {
    const resp = await fetch(`${BENCH_API_URL}/catalog`, {
      headers: BENCH_API_TOKEN ? { Authorization: `Bearer ${BENCH_API_TOKEN}` } : {},
      cache: "no-store",
    });
    if (!resp.ok) {
      return NextResponse.json(
        { error: `orchestrator responded ${resp.status}` },
        { status: 502 },
      );
    }
    return NextResponse.json(await resp.json());
  } catch (err) {
    return NextResponse.json(
      { error: `orchestrator unreachable: ${String(err)}` },
      { status: 502 },
    );
  }
}
