import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { DEFAULT_SITE_CONTENT, getSiteContent, saveSiteContent, type SiteContent } from "@/lib/site-content";

export const runtime = "nodejs";

async function isAuthed(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function GET(request: NextRequest) {
  if (!(await isAuthed(request))) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  const content = await getSiteContent();
  return NextResponse.json(content);
}

function isValidContent(value: unknown): value is SiteContent {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.nav) || !Array.isArray(v.plans)) return false;
  const navOk = v.nav.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof (item as Record<string, unknown>).label === "string" &&
      typeof (item as Record<string, unknown>).href === "string",
  );
  const plansOk = v.plans.every((plan) => {
    if (!plan || typeof plan !== "object") return false;
    const p = plan as Record<string, unknown>;
    return (
      typeof p.key === "string" &&
      typeof p.name === "string" &&
      typeof p.price === "string" &&
      typeof p.period === "string" &&
      typeof p.credits === "string" &&
      Array.isArray(p.features) &&
      p.features.every((f) => typeof f === "string") &&
      typeof p.cta === "string" &&
      typeof p.href === "string" &&
      typeof p.highlight === "boolean"
    );
  });
  return navOk && plansOk;
}

export async function POST(request: NextRequest) {
  if (!(await isAuthed(request))) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!isValidContent(body)) {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  await saveSiteContent(body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthed(request))) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  await saveSiteContent(DEFAULT_SITE_CONTENT);
  return NextResponse.json({ ok: true });
}
