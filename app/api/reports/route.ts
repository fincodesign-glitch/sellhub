import { NextRequest, NextResponse } from "next/server";
import { listReports } from "@/lib/analysis-jobs";
import { getSessionUser } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  try {
    return NextResponse.json({ reports: await listReports(user.id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[/api/reports]", err);
    return NextResponse.json({ error: "저장된 리포트를 불러오지 못했습니다." }, { status: 503 });
  }
}
