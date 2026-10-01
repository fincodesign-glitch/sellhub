import { NextResponse } from "next/server";
import { getJobOutcome, isValidId } from "@/lib/analysis-jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The job id is an unguessable random token handed only to the browser that
// started the analysis, so it doubles as the access check.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  try {
    const outcome = await getJobOutcome(id);
    return NextResponse.json(outcome ?? { status: "pending" }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[/api/analyze/jobs]", err);
    return NextResponse.json({ status: "pending" }, { headers: { "Cache-Control": "no-store" } });
  }
}
