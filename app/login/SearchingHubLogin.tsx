"use client";

import { useEffect, useState } from "react";
import Logo, { SparkleMark } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";

type Tab = "login" | "signup";

const SEARCHING_HUB_ORIGIN = "https://searchinghub.vercel.app";

const inputClass =
  "w-full rounded-[12px] border border-line bg-white px-4 py-3 text-[14.5px] font-semibold text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand";

/**
 * Sign-in screen shown when someone clicks 로그인 on Searching Hub. It runs on
 * SellHub's domain (accounts are shared) but looks like Searching Hub; once
 * signed in it continues to `next`, which hands the session back.
 */
export default function SearchingHubLogin({ next }: { next: string }) {
  const { account, loading, signInWithId, signUpWithId } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && account) window.location.replace(next);
  }, [loading, account, next]);

  function switchTab(t: Tab) {
    setTab(t);
    setFormError(null);
    setPasswordConfirm("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (tab === "signup" && password !== passwordConfirm) {
      setFormError("비밀번호가 서로 다릅니다.");
      return;
    }
    setSubmitting(true);
    const error = tab === "login" ? await signInWithId(id, password) : await signUpWithId(id, password);
    setSubmitting(false);
    if (error) setFormError(error);
  }

  const canSubmit = id.trim() && password && (tab === "login" || passwordConfirm) && !submitting;

  return (
    <div data-brand="intent" className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-[8%] top-[8%] select-none text-[26vw] font-black leading-none tracking-tighter text-transparent [-webkit-text-stroke:1.5px_var(--brand-line)] sm:text-[18vw]"
      >
        SEARCH
      </span>

      <header className="relative border-b border-line/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Logo brand="Searching Hub" href={SEARCHING_HUB_ORIGIN} icon={SparkleMark} />
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 text-center">
            <span className="mb-6 inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-navy bg-accent px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-white shadow-[3px_3px_0_0_var(--navy)]">
              <SparkleMark className="h-3.5 w-3.5" />
              AI Marketing Search Agent
            </span>
            <h1 className="mb-3 text-[clamp(26px,6vw,32px)] font-black leading-[1.25] tracking-[-0.02em] text-foreground">
              {tab === "login" ? (
                <>
                  <span className="text-brand">Searching Hub</span> 로그인
                </>
              ) : (
                <>
                  <span className="text-brand">Searching Hub</span> 회원가입
                </>
              )}
            </h1>
            <p className="text-[14.5px] leading-[1.7] text-ink2">
              로그인하면 실행 계획 등 전체 분석 결과를 볼 수 있어요.
              <br className="hidden sm:block" /> SellHub 계정으로도 바로 로그인됩니다.
            </p>
          </div>

          <div className="rounded-[22px] border-2 border-navy bg-white p-6 shadow-[6px_6px_0_0_var(--navy)] sm:p-7">
            <div role="tablist" className="mb-5 flex gap-1 rounded-full bg-brand-bg p-1">
              {(["login", "signup"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 rounded-full py-2.5 text-[13.5px] font-bold transition-colors ${
                    tab === t ? "bg-brand text-white shadow-[0_4px_14px_rgba(91,61,245,0.3)]" : "text-ink2 hover:text-foreground"
                  }`}
                >
                  {t === "login" ? "로그인" : "회원가입"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                className={inputClass}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                className={inputClass}
              />
              {tab === "signup" && (
                <>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="비밀번호 확인"
                    autoComplete="new-password"
                    className={inputClass}
                  />
                  <p className="text-[12px] font-semibold leading-[1.5] text-muted">
                    아이디는 영문 소문자·숫자·밑줄(_) 4~20자, 비밀번호는 6자 이상이에요.
                  </p>
                </>
              )}
              {formError && (
                <p
                  role="alert"
                  className="rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] font-semibold leading-[1.55] text-red-600"
                >
                  {formError}
                </p>
              )}
              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-1 rounded-full bg-brand px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_10px_30px_rgba(91,61,245,0.3)] transition-all hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {submitting ? "확인 중..." : tab === "login" ? "로그인" : "가입하고 시작하기"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-[13px] text-muted">
            <a href={`${SEARCHING_HUB_ORIGIN}/intent`} className="font-semibold text-ink2 underline-offset-4 hover:underline">
              로그인 없이 계속하기
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
