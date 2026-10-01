import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Searching Hub(구 IntentMate)는 sellhub.co.kr 안의 페이지(/intentmate, /intent)로
 * 서비스한다. 예전에 쓰던 별도 주소(searchinghub.vercel.app 등)로 들어오면 같은
 * 페이지의 sellhub.co.kr 주소로 보낸다.
 */
const LEGACY_SEARCHING_HUB_HOSTS = new Set([
  "searchinghub.vercel.app",
  "searchinghub-deenine0523-9903s-projects.vercel.app",
  "intentmate.vercel.app",
  "intentmate-deenine0523-9903s-projects.vercel.app",
]);

const SELLHUB_ORIGIN = "https://www.sellhub.co.kr";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (!LEGACY_SEARCHING_HUB_HOSTS.has(host)) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const target = pathname === "/" || pathname === "/brand" ? "/intentmate" : pathname;
  return NextResponse.redirect(`${SELLHUB_ORIGIN}${target}`, 308);
}

export const config = {
  matcher: ["/", "/brand", "/intentmate", "/intent"],
};
