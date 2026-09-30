"use client";

import { useEffect, useState } from "react";
import type { DelegationRequest } from "@/lib/delegations";
import type { NavItem, PricingPlan, SiteContent } from "@/lib/site-content";

type LoadState = "checking" | "needs-login" | "ready";

export default function AdminPage() {
  const [loadState, setLoadState] = useState<LoadState>("checking");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [content, setContent] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [requests, setRequests] = useState<DelegationRequest[] | null>(null);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  useEffect(() => {
    if (loadState !== "ready") return;
    fetch("/api/admin/delegations", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { requests?: DelegationRequest[]; error?: string }) => {
        setRequests(data.requests ?? []);
        setRequestsError(data.error ?? null);
      })
      .catch(() => setRequestsError("대행 요청 목록을 불러오지 못했습니다."));
  }, [loadState]);

  async function loadContent() {
    const res = await fetch("/api/admin/content");
    if (res.status === 401) {
      setLoadState("needs-login");
      return;
    }
    const data = (await res.json()) as SiteContent;
    setContent(data);
    setLoadState("ready");
  }

  useEffect(() => {
    fetch("/api/admin/content")
      .then((res) => (res.status === 401 ? null : res.json()))
      .then((data: SiteContent | null) => {
        if (data === null) {
          setLoadState("needs-login");
          return;
        }
        setContent(data);
        setLoadState("ready");
      })
      .catch(() => setLoadState("needs-login"));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoginError(data.error || "로그인에 실패했습니다.");
        return;
      }
      setPassword("");
      await loadContent();
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setContent(null);
    setLoadState("needs-login");
  }

  async function handleSave() {
    if (!content) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveMessage(data.error || "저장에 실패했습니다.");
        return;
      }
      setSaveMessage("저장했습니다. 홈페이지에 반영까지 최대 30초 정도 걸릴 수 있어요.");
    } finally {
      setSaving(false);
    }
  }

  function updateNav(next: NavItem[]) {
    if (!content) return;
    setContent({ ...content, nav: next });
  }

  function updatePlan(index: number, patch: Partial<PricingPlan>) {
    if (!content) return;
    const plans = content.plans.map((p, i) => (i === index ? { ...p, ...patch } : p));
    setContent({ ...content, plans });
  }

  if (loadState === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface2">
        <p className="text-[14px] text-muted">불러오는 중...</p>
      </div>
    );
  }

  if (loadState === "needs-login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface2 px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-[16px] border border-line bg-white p-8"
        >
          <h1 className="mb-1 text-[18px] font-extrabold tracking-tight">관리자 로그인</h1>
          <p className="mb-6 text-[13px] text-muted">SellHub 홈페이지 콘텐츠 관리</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoFocus
            className="mb-3 w-full rounded-[10px] border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-brand"
          />
          {loginError && <p className="mb-3 text-[12.5px] text-red-500">{loginError}</p>}
          <button
            type="submit"
            disabled={loggingIn || !password}
            className="w-full rounded-[10px] bg-brand px-4 py-2.5 text-[14px] font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingIn ? "확인 중..." : "로그인"}
          </button>
        </form>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="min-h-screen bg-surface2 pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-6 py-4">
        <h1 className="text-[17px] font-extrabold tracking-tight">홈페이지 콘텐츠 관리</h1>
        <div className="flex items-center gap-3">
          {saveMessage && <span className="text-[12.5px] text-muted">{saveMessage}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-[9px] bg-brand px-5 py-2 text-[13.5px] font-bold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
          <button
            onClick={handleLogout}
            className="text-[13px] font-semibold text-muted hover:text-foreground"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
        <section className="rounded-[14px] border border-line bg-white p-6">
          <h2 className="mb-1 text-[15px] font-extrabold">
            실행 항목 대행 요청 {requests ? `(${requests.length})` : ""}
          </h2>
          <p className="mb-4 text-[12.5px] text-muted">고객이 &ldquo;SellHub에 맡기기&rdquo;로 접수한 요청입니다. 최신순.</p>
          {requestsError && <p className="mb-3 text-[12.5px] text-red-500">{requestsError}</p>}
          {requests === null ? (
            <p className="text-[13px] text-muted">불러오는 중...</p>
          ) : requests.length === 0 ? (
            <p className="text-[13px] text-muted">아직 접수된 요청이 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {requests.map((r) => (
                <div key={r.requestId} className="rounded-[12px] border border-line p-4">
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-mono text-[13px] font-bold">{r.requestId}</span>
                    <span className="text-[12px] text-muted">
                      {new Date(r.createdAt).toLocaleString("ko-KR")} · 요청자 {r.requester}
                    </span>
                  </div>
                  <p className="mb-2 text-[12.5px] text-ink2">
                    {r.productName || r.keywords || r.productUrl || "(제품 정보 없음)"} · 목표 시장 {r.market}
                    {r.keywords && r.productName ? ` · 키워드 ${r.keywords}` : ""}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {r.actions.map((a) => (
                      <li key={a.number} className="text-[13px] text-foreground">
                        <span className="mr-2 font-bold text-brand-dark">{String(a.number).padStart(2, "0")}</span>
                        {a.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[14px] border border-line bg-white p-6">
          <h2 className="mb-4 text-[15px] font-extrabold">상단 메뉴 (카테고리)</h2>
          <div className="flex flex-col gap-3">
            {content.nav.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={item.label}
                  onChange={(e) => {
                    const next = [...content.nav];
                    next[i] = { ...next[i], label: e.target.value };
                    updateNav(next);
                  }}
                  placeholder="메뉴 이름"
                  className="w-40 rounded-[8px] border border-line px-3 py-2 text-[13.5px] outline-none focus:border-brand"
                />
                <input
                  value={item.href}
                  onChange={(e) => {
                    const next = [...content.nav];
                    next[i] = { ...next[i], href: e.target.value };
                    updateNav(next);
                  }}
                  placeholder="/pricing 또는 https://..."
                  className="flex-1 rounded-[8px] border border-line px-3 py-2 text-[13.5px] outline-none focus:border-brand"
                />
                <button
                  onClick={() => updateNav(content.nav.filter((_, idx) => idx !== i))}
                  className="rounded-[8px] px-3 py-2 text-[12.5px] font-semibold text-red-500 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              onClick={() => updateNav([...content.nav, { label: "새 메뉴", href: "/" }])}
              className="self-start rounded-[8px] border border-dashed border-line px-3 py-2 text-[12.5px] font-semibold text-ink2 hover:border-brand hover:text-brand"
            >
              + 메뉴 추가
            </button>
          </div>
        </section>

        <section className="rounded-[14px] border border-line bg-white p-6">
          <h2 className="mb-4 text-[15px] font-extrabold">요금제</h2>
          <div className="flex flex-col gap-6">
            {content.plans.map((plan, i) => (
              <div key={plan.key} className="rounded-[12px] border border-line p-5">
                <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="이름" value={plan.name} onChange={(v) => updatePlan(i, { name: v })} />
                  <Field label="가격" value={plan.price} onChange={(v) => updatePlan(i, { price: v })} />
                  <Field label="단위 (/월 등)" value={plan.period} onChange={(v) => updatePlan(i, { period: v })} />
                  <Field label="한도 문구" value={plan.credits} onChange={(v) => updatePlan(i, { credits: v })} />
                </div>
                <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="버튼 문구" value={plan.cta} onChange={(v) => updatePlan(i, { cta: v })} />
                  <Field label="버튼 링크" value={plan.href} onChange={(v) => updatePlan(i, { href: v })} />
                </div>
                <label className="mb-3 block text-[12.5px] font-semibold text-ink2">
                  기능 목록 (한 줄에 하나씩)
                  <textarea
                    value={plan.features.join("\n")}
                    onChange={(e) =>
                      updatePlan(i, { features: e.target.value.split("\n") })
                    }
                    rows={4}
                    className="mt-1.5 w-full rounded-[8px] border border-line px-3 py-2 text-[13.5px] outline-none focus:border-brand"
                  />
                </label>
                <label className="flex items-center gap-2 text-[13px] font-semibold text-ink2">
                  <input
                    type="checkbox"
                    checked={plan.highlight}
                    onChange={(e) => updatePlan(i, { highlight: e.target.checked })}
                  />
                  인기 요금제로 강조
                </label>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-[12.5px] font-semibold text-ink2">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-[8px] border border-line px-3 py-2 text-[13.5px] outline-none focus:border-brand"
      />
    </label>
  );
}
