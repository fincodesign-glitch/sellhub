import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * SellHub(sellhub.co.kr)와 Searching Hub(구 IntentMate)는 같은 코드베이스를 쓰지만
 * 이제 서로 다른 사이트로 분리되었다. Vercel 프로젝트 이름을 searchinghub로 바꿔
 * searchinghub.vercel.app이라는 무료 도메인을 새로 붙였다 (구 intentmate.vercel.app
 * 별칭도 당분간 함께 살려둔다). 새 도메인을 사지 않고 호스트만 보고 어느 사이트로
 * 보여줄지 나눈다.
 */
const SEARCHING_HUB_HOSTS = new Set([
  "searchinghub.vercel.app",
  "searchinghub-deenine0523-9903s-projects.vercel.app",
  "intentmate.vercel.app",
  "intentmate-deenine0523-9903s-projects.vercel.app",
]);

const SEARCHING_HUB_ORIGIN = "https://searchinghub.vercel.app";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  if (SEARCHING_HUB_HOSTS.has(host)) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/intentmate", request.url));
    }
    if (pathname === "/brand") {
      return NextResponse.redirect(new URL("/intentmate", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/intentmate") {
    return NextResponse.redirect(`${SEARCHING_HUB_ORIGIN}/`);
  }
  if (pathname === "/intent") {
    return NextResponse.redirect(`${SEARCHING_HUB_ORIGIN}/intent`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/brand", "/intentmate", "/intent"],
};
