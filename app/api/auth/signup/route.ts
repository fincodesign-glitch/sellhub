import { NextRequest, NextResponse } from "next/server";
import { checkAuthRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  createAccount,
  isLoginConfigured,
  normalizeId,
  setSessionCookie,
  validateNewAccount,
} from "@/lib/user-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isLoginConfigured()) {
    return NextResponse.json({ error: "회원가입 기능이 아직 설정되지 않았습니다." }, { status: 503 });
  }
  const limit = checkAuthRateLimit(getClientIp(request));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${limit.retryAfterMinutes}분 후 다시 시도해주세요.` },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as { id?: unknown; password?: unknown } | null;
  const id = normalizeId(body?.id);
  const password = typeof body?.password === "string" ? body.password : "";
  const invalid = validateNewAccount(id, password);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  let outcome: "created" | "taken";
  try {
    outcome = await createAccount(id, password);
  } catch (err) {
    console.error("[/api/auth/signup] account storage unavailable", err);
    return NextResponse.json(
      { error: "회원가입 저장소가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요." },
      { status: 503 },
    );
  }
  if (outcome === "taken") {
    return NextResponse.json({ error: "이미 사용 중인 아이디입니다." }, { status: 409 });
  }

  const user = { id, plan: "free" as const };
  const response = NextResponse.json({ user });
  setSessionCookie(response, user);
  return response;
}
