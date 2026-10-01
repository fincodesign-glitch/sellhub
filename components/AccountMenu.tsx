"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";

type Theme = "dark" | "light";

const THEMES = {
  dark: {
    login: "border border-white/20 bg-white/[0.04] text-white hover:border-white/40 hover:bg-white/[0.08]",
    trigger: "border border-white/15 bg-white/[0.05] text-white hover:border-white/30 hover:bg-white/[0.09]",
    avatar: "bg-gradient-to-b from-[#5b9cff] to-[#2f6fe0] text-white",
    master: "bg-[#5b9cff]/20 text-[#8fbcff]",
    free: "bg-white/10 text-[#b4b4b4]",
    chevron: "text-[#9a9a9a]",
    panel: "border border-white/12 bg-[#111]/95 shadow-[0_18px_50px_rgba(0,0,0,0.6)]",
    panelId: "text-white",
    panelSub: "text-[#8a8a8a]",
    divider: "bg-white/10",
    item: "text-[#e6e6e6] hover:bg-white/[0.07]",
    logout: "text-[#9a9a9a] hover:bg-white/[0.07] hover:text-white",
    mobileBox: "border border-white/10 bg-white/[0.04]",
  },
  light: {
    login: "border border-line bg-white text-foreground hover:border-brand hover:text-brand-dark",
    trigger: "border border-line bg-white text-foreground hover:border-brand-line hover:bg-brand-bg/50",
    avatar: "bg-brand text-white",
    master: "bg-brand-bg text-brand-dark",
    free: "bg-surface2 text-ink2",
    chevron: "text-muted",
    panel: "border border-line bg-white shadow-[0_18px_50px_rgba(21,15,46,0.14)]",
    panelId: "text-foreground",
    panelSub: "text-muted",
    divider: "bg-line",
    item: "text-foreground hover:bg-surface2",
    logout: "text-muted hover:bg-surface2 hover:text-foreground",
    mobileBox: "border border-line bg-surface2",
  },
} as const;

interface AccountMenuProps {
  theme: Theme;
  /** Show the 마이페이지 entry (SellHub only — saved reports live there). */
  myPage?: boolean;
  /** Plain <a> is used: on Searching Hub /login redirects to SellHub's sign-in. */
  loginHref?: string;
  /** Inline account block for the mobile slide-down menu instead of the dropdown. */
  mobile?: boolean;
}

/**
 * One compact account control for the site headers: a "로그인" button when signed
 * out, and a pill (avatar · ID · plan) that opens a small menu when signed in.
 */
export default function AccountMenu({ theme, myPage = false, loginHref = "/login", mobile = false }: AccountMenuProps) {
  const { user, account, isPaidPlan, signOutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const t = THEMES[theme];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signedIn = Boolean(account || user);
  const name = account?.id ?? user?.displayName ?? user?.email ?? "";
  const planLabel = isPaidPlan ? "Master" : "Free";

  if (!signedIn) {
    return (
      <a
        href={loginHref}
        className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-[13.5px] font-semibold transition-colors ${t.login} ${mobile ? "mt-2 w-full" : ""}`}
      >
        로그인
      </a>
    );
  }

  const avatar = user?.photoURL ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.photoURL} alt="" className="h-7 w-7 shrink-0 rounded-full" />
  ) : (
    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12.5px] font-bold uppercase ${t.avatar}`}>
      {name.charAt(0)}
    </span>
  );
  const planTag = (
    <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold tracking-wide ${isPaidPlan ? t.master : t.free}`}>
      {planLabel}
    </span>
  );

  if (mobile) {
    return (
      <div className={`mt-2 rounded-[12px] p-3 ${t.mobileBox}`}>
        <div className="mb-2 flex items-center gap-2.5 px-1">
          {avatar}
          <span className={`truncate text-[14.5px] font-bold ${t.panelId}`}>{name}</span>
          {planTag}
        </div>
        {myPage && account && (
          <Link href="/mypage" className={`block rounded-[8px] px-2 py-2.5 text-[15px] font-semibold ${t.item}`}>
            마이페이지
          </Link>
        )}
        <button
          type="button"
          onClick={() => signOutUser()}
          className={`block w-full rounded-[8px] px-2 py-2.5 text-left text-[15px] font-semibold ${t.logout}`}
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors ${t.trigger}`}
      >
        {avatar}
        <span className="hidden max-w-[110px] truncate text-[13.5px] font-semibold sm:inline">{name}</span>
        {planTag}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""} ${t.chevron}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div role="menu" className={`absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-[14px] p-1.5 backdrop-blur-xl ${t.panel}`}>
          <div className="px-3 pb-2.5 pt-2">
            <div className={`truncate text-[14px] font-bold ${t.panelId}`}>{name}</div>
            <div className={`mt-0.5 text-[12px] font-medium ${t.panelSub}`}>{isPaidPlan ? "Master 계정" : "Free 플랜"}</div>
          </div>
          <div className={`mx-1.5 mb-1 h-px ${t.divider}`} />
          {myPage && account && (
            <Link
              href="/mypage"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`block rounded-[9px] px-3 py-2 text-[13.5px] font-semibold ${t.item}`}
            >
              마이페이지
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOutUser();
            }}
            className={`block w-full rounded-[9px] px-3 py-2 text-left text-[13.5px] font-semibold ${t.logout}`}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
