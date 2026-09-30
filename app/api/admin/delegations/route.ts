import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { listDelegations } from "@/lib/delegations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!verifyAdminSessionToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ requests: await listDelegations() });
  } catch (err) {
    console.error("[/api/admin/delegations]", err);
    return NextResponse.json({ requests: [], error: "대행 요청 목록을 불러오지 못했습니다." }, { status: 200 });
  }
}
