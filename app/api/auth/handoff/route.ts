import { NextRequest, NextResponse } from "next/server";
import { createHandoffToken, getSessionUser, isLoginConfigured, readHandoffToken, setSessionCookie } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Single sign-on between SellHub (sellhub.co.kr, where accounts live) and
// Searching Hub (searchinghub.vercel.app). Both deployments run this code:
//  - SellHub side, no `token`: if signed in, redirect to Searching Hub with a
//    60-second signed token; with `login=1` and not signed in, send the user
//    through SellHub's login first; otherwise just go to Searching Hub.
//  - Searching Hub side, with `token`: verify it, set Searching Hub's own
//    session cookie, and continue to `next`.
const SEARCHING_HUB_ORIGIN = "https://searchinghub.vercel.app";

function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/intentmate";
}

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = safeNext(params.get("next"));
  const token = params.get("token");

  if (token) {
    const response = NextResponse.redirect(new URL(next, request.url));
    const user = readHandoffToken(token);
    if (user && isLoginConfigured()) setSessionCookie(response, user);
    return response;
  }

  const user = getSessionUser(request);
  const handoff = user ? createHandoffToken(user) : null;
  if (handoff) {
    const target = new URL("/api/auth/handoff", SEARCHING_HUB_ORIGIN);
    target.searchParams.set("token", handoff);
    target.searchParams.set("next", next);
    return NextResponse.redirect(target);
  }
  if (!user && params.get("login") === "1") {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `/api/auth/handoff?next=${encodeURIComponent(next)}`);
    return NextResponse.redirect(login);
  }
  return NextResponse.redirect(new URL(next, SEARCHING_HUB_ORIGIN));
}
