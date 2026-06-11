import { NextResponse } from "next/server";

/**
 * POST /api/launch — start a benchmark run on the deployed serving apps.
 *
 * Body: { spec: "<named spec>" | RunSpec, model?: "<override>" } — forwarded
 * verbatim to the orchestrator's POST /launch; responds { run_id }.
 */

const BENCH_API_URL = process.env.BENCH_API_URL ?? "";
const BENCH_API_TOKEN = process.env.BENCH_API_TOKEN ?? "";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!BENCH_API_URL) {
    return NextResponse.json(
      { error: "BENCH_API_URL not configured (.env.local)" },
      { status: 500 },
    );
  }
  try {
    const resp = await fetch(`${BENCH_API_URL}/launch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(BENCH_API_TOKEN ? { Authorization: `Bearer ${BENCH_API_TOKEN}` } : {}),
      },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    });
    const body = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json(
        { error: body?.detail ?? `orchestrator responded ${resp.status}` },
        { status: resp.status === 422 ? 422 : 502 },
      );
    }
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json(
      { error: `orchestrator unreachable: ${String(err)}` },
      { status: 502 },
    );
  }
}
