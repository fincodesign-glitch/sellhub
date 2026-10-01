"use client";

import { useAuth } from "@/lib/auth-context";

/**
 * Login state for the light Searching Hub header: "로그인" when signed out, the
 * account ID (+ Master badge) and 로그아웃 when signed in. A plain <a> is used for
 * /login because on Searching Hub it redirects to SellHub's sign-in.
 */
export default function HeaderAccountLink({ className, mobile = false }: { className: string; mobile?: boolean }) {
  const { account, signOutUser } = useAuth();
  if (!account) {
    return (
      <a href="/login" className={className}>
        로그인
      </a>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2 ${mobile ? "px-2 py-2.5" : ""}`}>
      <span className="text-[14px] font-semibold text-foreground">{account.id}</span>
      {account.plan === "master" && (
        <span className="rounded-full bg-brand px-2.5 py-0.5 text-[11.5px] font-bold text-white">Master</span>
      )}
      <button type="button" onClick={() => signOutUser()} className="text-[13.5px] font-medium text-muted hover:text-foreground">
        로그아웃
      </button>
    </span>
  );
}
