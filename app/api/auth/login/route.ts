import { NextRequest, NextResponse } from "next/server";
import { checkAuthRateLimit, getClientIp } from "@/lib/rate-limit";
import { authenticate, isLoginConfigured, normalizeId, setSessionCookie } from "@/lib/user-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isLoginConfigured()) {
    return NextResponse.json({ error: "로그인 기능이 아직 설정되지 않았습니다." }, { status: 503 });
  }
  const limit = checkAuthRateLimit(getClientIp(request));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `로그인 시도가 너무 많습니다. ${limit.retryAfterMinutes}분 후 다시 시도해주세요.` },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as { id?: unknown; password?: unknown } | null;
  const id = normalizeId(body?.id);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!id || !password) {
    return NextResponse.json({ error: "아이디와 비밀번호를 입력해주세요." }, { status: 400 });
  }

  const user = await authenticate(id, password);
  if (!user) {
    return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const response = NextResponse.json({ user });
  setSessionCookie(response, user);
  return response;
}
