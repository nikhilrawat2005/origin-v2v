import { NextResponse } from "next/server";
import { runIngestion } from "@/lib/ingestion/run";

// Default Vercel function timeout is 300s (all plans, as of 2026) — plenty
// for this pipeline given the low per-feed item caps in sources.ts.
export const maxDuration = 300;

// Don't cache this route — every invocation should actually run.
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  // Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` when it
  // triggers this route on schedule.
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  // Fallback for manual testing: /api/ingest?secret=...
  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runIngestion();
    return NextResponse.json({ success: true, summary });
  } catch (err: any) {
    console.error("[Ingestion] Fatal error:", err);
    return NextResponse.json({ error: err.message || "Ingestion failed" }, { status: 500 });
  }
}
