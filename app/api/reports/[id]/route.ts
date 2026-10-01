import { NextRequest, NextResponse } from "next/server";
import { getReport, isValidId } from "@/lib/analysis-jobs";
import { getSessionUser } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ error: "잘못된 리포트입니다." }, { status: 400 });
  }
  try {
    // Reports are stored under the owner's ID, so another user's report id resolves to nothing.
    const report = await getReport(user.id, id);
    if (!report) {
      return NextResponse.json({ error: "리포트를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ report }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[/api/reports/:id]", err);
    return NextResponse.json({ error: "리포트를 불러오지 못했습니다." }, { status: 503 });
  }
}
