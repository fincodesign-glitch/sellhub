import { NextRequest, NextResponse } from "next/server";
import { newRequestId, saveDelegation } from "@/lib/delegations";
import { getSessionUser } from "@/lib/user-auth";

export const runtime = "nodejs";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || user.plan !== "master") {
    return NextResponse.json({ error: "실행 항목 대행은 Business 플랜에서 이용할 수 있어요." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    actions?: unknown;
    meta?: { market?: unknown; productName?: unknown; keywords?: unknown; productUrl?: unknown };
  } | null;

  const actions = Array.isArray(body?.actions)
    ? body.actions
        .map((a) => a as { number?: unknown; text?: unknown })
        .filter((a) => Number.isInteger(a.number) && typeof a.text === "string" && a.text.trim())
        .slice(0, 20)
        .map((a) => ({ number: a.number as number, text: str(a.text, 500) }))
    : [];
  if (actions.length === 0) {
    return NextResponse.json({ error: "맡길 실행 항목을 하나 이상 선택해주세요." }, { status: 400 });
  }

  const requestId = newRequestId();
  try {
    await saveDelegation({
      requestId,
      createdAt: new Date().toISOString(),
      requester: user.id,
      market: str(body?.meta?.market, 50),
      productName: str(body?.meta?.productName, 200),
      keywords: str(body?.meta?.keywords, 300),
      productUrl: str(body?.meta?.productUrl, 500),
      actions,
    });
  } catch (err) {
    console.error("[/api/delegations] could not store request", err);
    return NextResponse.json(
      { error: "요청을 저장하지 못했습니다. 잠시 후 다시 시도해주세요." },
      { status: 503 },
    );
  }

  return NextResponse.json({ requestId, actions });
}
