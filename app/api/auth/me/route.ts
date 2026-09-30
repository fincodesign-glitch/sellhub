import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.json({ user: getSessionUser(request) }, { headers: { "Cache-Control": "no-store" } });
}
