"use client";

import Link from "next/link";
import NavLink, { splitNavItems, TOOL_LINKS } from "@/components/NavLink";
import Logo from "@/components/Logo";
import { SparkleMark, IconImage, IconRadar, IconTrend, IconMatch, IconDocument, type IconProps } from "@/components/Icons";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { IntentAnalysisResult, IntentBuyer, Relevance, ReportMeta } from "@/lib/analysis-types";
import { warmPdfFonts } from "@/lib/pdf-worker-client";

// Kept local (not imported from lib/site-content) because that module also
// exports server-only @vercel/blob calls that must not end up in the client bundle.
interface NavItem {
  label: string;
  href: string;
}
const DEFAULT_NAV: NavItem[] = [
  { label: "브랜드", href: "/brand" },
  { label: "요금제", href: "/pricing" },
  { label: "소개서", href: "/docs/sellhub-intro.pdf" },
];

const IntentPdfDownloadButton = dynamic(() => import("@/components/IntentPdfDownloadButton"), {
  ssr: false,
  loading: () => (
    <span className="inline-flex items-center gap-2 rounded-[10px] bg-brand px-5 py-2.5 text-[13.5px] font-bold text-white opacity-60">
      PDF 준비 중...
    </span>
  ),
});

const MARKETS = ["일본", "미국", "동남아시아"];
type Mode = "text" | "url" | "image";

const MODE_TABS: { key: Mode; label: string; emoji: string }[] = [
  { key: "text", label: "텍스트로 검색", emoji: "⌨️" },
  { key: "url", label: "URL로 분석", emoji: "🔗" },
  { key: "image", label: "이미지로 분석", emoji: "🖼️" },
];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [, data] = result.split(",");
      resolve({ data, mediaType: file.type });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function IntentPage() {
  const { user, signOutUser } = useAuth();

  const [mode, setMode] = useState<Mode>("text");
  const [productName, setProductName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [market, setMarket] = useState(MARKETS[0]);

  const [result, setResult] = useState<IntentAnalysisResult | null>(null);
  const [resultMeta, setResultMeta] = useState<ReportMeta | null>(null);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "streaming" | "done" | "error">(
    "idle",
  );
  const [savedBuyers, setSavedBuyers] = useState<Set<string>>(new Set());
  const [selectedActions, setSelectedActions] = useState<Set<number>>(new Set());
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAV);
  // Searching Hub는 SellHub와 분리된 별도 사이트라, SellHub 회사소개 카테고리(브랜드/소개서)는 내보내지 않는다.
  const { before: navBeforeLogin } = splitNavItems(navItems);

  useEffect(() => {
    fetch("/api/site-content")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { nav?: NavItem[] } | null) => {
        if (data?.nav) setNavItems(data.nav);
      })
      .catch(() => {});
  }, []);

  // 아직 실제 결제/구독 연동이 없어서 모든 사용자를 Free 플랜으로 취급합니다.
  // 유료 플랜 여부를 실제로 구분하려면 결제 시스템과 사용자별 플랜 저장이 필요합니다.
  const isPaidPlan = false;

  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setImageError(null);
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      setImageError("JPEG/PNG/GIF/WEBP 형식의 이미지만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("이미지 용량은 최대 5MB까지 업로드할 수 있습니다.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function isSubmittable() {
    if (mode === "text") return Boolean(productName.trim() || keywords.trim());
    if (mode === "url") return Boolean(productUrl.trim());
    return Boolean(imageFile);
  }

  function toggleSaved(key: string) {
    setSavedBuyers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleSelectAction(index: number) {
    if (!isPaidPlan) {
      setShowUpgradePrompt(true);
      return;
    }
    setSelectedActions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSubmittable()) return;

    setResult(null);
    setResultMeta(null);
    setProgressLog([]);
    setErrorMessage(null);
    setSavedBuyers(new Set());
    setSelectedActions(new Set());
    setShowUpgradePrompt(false);
    setStatus("loading");
    // Parse the CJK fonts in the PDF worker during the multi-minute analysis,
    // so the download click later doesn't have to.
    warmPdfFonts();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const meta: ReportMeta = { mode, productName, keywords, market, productUrl };

    try {
      const payload: Record<string, string> = { mode, productName, keywords, market };
      if (mode === "url") {
        payload.productUrl = productUrl.trim();
      }
      if (mode === "image" && imageFile) {
        const { data, mediaType } = await fileToBase64(imageFile);
        payload.imageBase64 = data;
        payload.imageMediaType = mediaType;
      }

      const res = await fetch("/api/intent-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setStatus("error");
        const text = await res.text().catch(() => "");
        setErrorMessage(text || "리포트 생성 요청에 실패했습니다.");
        return;
      }

      setStatus("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as
              | { type: "progress"; label: string }
              | { type: "result"; data: IntentAnalysisResult }
              | { type: "error"; message: string };

            if (event.type === "progress") {
              setProgressLog((prev) => [...prev.slice(-4), event.label]);
            } else if (event.type === "result") {
              setResult(event.data);
              setResultMeta(meta);
            } else if (event.type === "error") {
              setErrorMessage(event.message);
            }
          } catch {
            // ignore malformed line (shouldn't happen)
          }
        }
      }

      setStatus((prev) => (prev === "error" ? prev : "done"));
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setStatus("error");
        setErrorMessage("리포트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  }

  const isBusy = status === "loading" || status === "streaming";

  return (
    <div data-brand="intent" className="min-h-screen bg-surface2">
      {/* Warm the browser's HTTP cache for the PDF fonts as soon as this page
          loads, so by the time the user clicks "PDF 다운로드" (after a multi-
          minute analysis), the ~1.7MB of CJK font data doesn't have to be
          fetched over the network inside the blocking generation call. */}
      <link rel="preload" as="fetch" crossOrigin="anonymous" href="/fonts/NotoSansKR-Regular.woff" />
      <link rel="preload" as="fetch" crossOrigin="anonymous" href="/fonts/NotoSansKR-Bold.woff" />
      <link rel="preload" as="fetch" crossOrigin="anonymous" href="/fonts/NotoSansJP-Regular.woff" />
      <link rel="preload" as="fetch" crossOrigin="anonymous" href="/fonts/NotoSansJP-Bold.woff" />
      <header className="sticky top-0 z-30 border-b border-line/70 bg-white/80 backdrop-blur-xl">
        <input type="checkbox" id="mobile-nav-toggle" className="peer hidden" />
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo brand="Searching Hub" href="/intentmate" icon={SparkleMark} />
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 sm:flex">
              {TOOL_LINKS.map((item) => (
                <NavLink key={item.label} href={item.href} className="text-[14px] font-semibold text-foreground hover:text-brand-dark">
                  {item.label}
                </NavLink>
              ))}
              {navBeforeLogin.map((item) => (
                <NavLink key={item.label} href={item.href} className="text-[14px] font-semibold text-ink2 hover:text-foreground">
                  {item.label}
                </NavLink>
              ))}
            </div>
            <span className="rounded-full bg-brand-bg px-3 py-1 text-[12px] font-bold text-brand-dark">
              Free 플랜
            </span>
            {user ? (
              <>
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-brand-bg" />
                )}
                <button
                  onClick={() => signOutUser()}
                  className="hidden text-[13.5px] font-semibold text-muted hover:text-foreground sm:inline"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link href="/login" className="hidden text-[13.5px] font-semibold text-muted hover:text-foreground sm:inline">
                로그인 (선택)
              </Link>
            )}
            <label
              htmlFor="mobile-nav-toggle"
              aria-label="메뉴 열기"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-[8px] text-ink2 hover:bg-surface2 sm:hidden"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
          </div>
        </div>
        <div className="hidden flex-col gap-1 border-t border-line bg-white px-6 py-4 peer-checked:flex sm:hidden">
          {TOOL_LINKS.map((item) => (
            <NavLink key={item.label} href={item.href} className="rounded-[8px] px-2 py-2.5 text-[15px] font-bold text-foreground hover:bg-surface2">
              {item.label}
            </NavLink>
          ))}
          {navBeforeLogin.map((item) => (
            <NavLink key={item.label} href={item.href} className="rounded-[8px] px-2 py-2.5 text-[15px] font-semibold text-ink2 hover:bg-surface2">
              {item.label}
            </NavLink>
          ))}
          {user ? (
            <button
              onClick={() => signOutUser()}
              className="rounded-[8px] px-2 py-2.5 text-left text-[15px] font-semibold text-muted hover:bg-surface2"
            >
              로그아웃
            </button>
          ) : (
            <Link href="/login" className="rounded-[8px] px-2 py-2.5 text-[15px] font-semibold text-muted hover:bg-surface2">
              로그인 (선택)
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <span className="mb-4 inline-flex -rotate-1 items-center gap-1.5 rounded-full border-2 border-navy bg-accent px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-white shadow-[2px_2px_0_0_var(--navy)]">
          <SparkleMark className="h-3 w-3" />
          Searching Hub Tool
        </span>
        <h1 className="mb-2 text-[26px] font-black tracking-tight">마케팅 전략부터 바이어까지, AI에게 맡기세요</h1>
        <p className="mb-8 max-w-2xl text-[14.5px] leading-[1.65] text-ink2">
          텍스트, 제품 페이지 URL, 상세페이지 이미지 중 원하는 방식으로 제품을 알려주시면 AI가 해외 시장
          데이터를 대신 검색해 마케팅 전략 리포트와 관심 바이어 후보를 찾아드립니다.
        </p>

        <div className="mb-5 -mx-6 overflow-x-auto px-6 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="inline-flex shrink-0 rounded-full border border-line bg-white p-1.5 shadow-sm">
          {MODE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMode(tab.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-semibold transition ${
                mode === tab.key ? "bg-brand text-white shadow-[0_2px_10px_rgba(91,61,245,0.35)]" : "text-ink2 hover:bg-surface2"
              }`}
            >
              <span aria-hidden>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-10 grid gap-5 rounded-[32px] border border-line bg-white p-8 shadow-[0_4px_28px_rgba(91,61,245,0.07)] sm:grid-cols-2"
        >
          {mode === "text" && (
            <>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-ink2">
                제품 / 브랜드명
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="예: 속눈썹 메이커업"
                  className="rounded-[10px] border border-line px-3.5 py-2.5 text-[14.5px] text-foreground outline-none focus:border-brand"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-ink2">
                목표 시장
                <MarketSelect market={market} setMarket={setMarket} />
              </label>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-ink2 sm:col-span-2">
                핵심 키워드 (쉼표로 구분)
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="예: 속눈썹, 미용기기, K-뷰티"
                  className="rounded-[10px] border border-line px-3.5 py-2.5 text-[14.5px] text-foreground outline-none focus:border-brand"
                />
              </label>
            </>
          )}

          {mode === "url" && (
            <>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-ink2 sm:col-span-2">
                제품 페이지 URL
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://example.com/products/..."
                  className="rounded-[10px] border border-line px-3.5 py-2.5 text-[14.5px] text-foreground outline-none focus:border-brand"
                />
                <span className="text-[12px] font-normal text-muted">
                  AI가 이 URL을 직접 방문해 브랜드·성분·효능·가격 정보를 읽어옵니다.
                </span>
              </label>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-ink2">
                제품/브랜드명 (선택)
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="참고용, 비워도 됩니다"
                  className="rounded-[10px] border border-line px-3.5 py-2.5 text-[14.5px] text-foreground outline-none focus:border-brand"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-ink2">
                목표 시장
                <MarketSelect market={market} setMarket={setMarket} />
              </label>
            </>
          )}

          {mode === "image" && (
            <>
              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-[13.5px] font-semibold text-ink2">
                  상세페이지 이미지
                </span>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-line px-6 py-8 text-center hover:border-brand"
                >
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imagePreview}
                      alt="업로드한 상세페이지 미리보기"
                      className="max-h-48 rounded-[8px] object-contain"
                    />
                  ) : (
                    <>
                      <span className="text-[28px]">🖼️</span>
                      <span className="text-[13.5px] font-semibold text-ink2">
                        클릭해서 상세페이지 이미지 업로드
                      </span>
                      <span className="text-[12px] text-muted">JPEG/PNG/GIF/WEBP, 최대 5MB</span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {imageError && <p className="mt-2 text-[12.5px] text-red-500">{imageError}</p>}
              </div>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-ink2">
                제품/브랜드명 (선택)
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="참고용, 비워도 됩니다"
                  className="rounded-[10px] border border-line px-3.5 py-2.5 text-[14.5px] text-foreground outline-none focus:border-brand"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-ink2">
                목표 시장
                <MarketSelect market={market} setMarket={setMarket} />
              </label>
            </>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isBusy || !isSubmittable()}
              className="rounded-full bg-brand px-7 py-3.5 text-[14.5px] font-bold text-white shadow-[0_6px_20px_rgba(91,61,245,0.35)] transition-all hover:scale-[1.01] hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isBusy ? "검색 중..." : "AI 검색 시작"}
            </button>
          </div>
        </form>

        {errorMessage && (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-500">
            {errorMessage}
          </p>
        )}

        {isBusy && (
          <div className="mb-8 rounded-[20px] border border-brand-line bg-brand-bg px-6 py-5">
            <div className="flex items-center gap-2.5 text-[13.5px] font-bold text-brand-dark">
              <Spinner />
              {progressLog.length > 0 ? progressLog[progressLog.length - 1] : "분석을 시작하는 중..."}
              <SparkleMark className="h-3.5 w-3.5 animate-pulse text-brand" />
            </div>
            {progressLog.length > 1 && (
              <ul className="mt-2.5 flex flex-col gap-1 text-[12.5px] text-ink2 opacity-70">
                {progressLog.slice(0, -1).map((label, i) => (
                  <li key={i}>{label}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {result && resultMeta && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-brand-line bg-brand-bg px-6 py-4">
              <p className="text-[13.5px] font-bold text-brand-dark">
                ✅ AI가 찾은 마케팅 전략 리포트가 준비됐습니다
              </p>
              <IntentPdfDownloadButton result={result} meta={resultMeta} />
            </div>

            {result.productSummary && (
              <Section icon={IconImage} title="제품 분석">
                <p className="text-[14px] leading-[1.7] text-ink2">{result.productSummary}</p>
              </Section>
            )}

            {result.marketInsight.length > 0 && (
              <Section icon={IconRadar} title="시장 인사이트 리포트">
                <ul className="flex flex-col gap-2.5">
                  {result.marketInsight.map((point, i) => (
                    <li key={i} className="flex gap-2.5 text-[14px] leading-[1.65] text-ink2">
                      <span className="mt-0.5 shrink-0 text-brand">●</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {result.trends.length > 0 && (
              <Section icon={IconTrend} title="트렌드 & 키워드 리포트">
                <div className="flex flex-col gap-3">
                  {result.trends.map((trend, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-1.5 rounded-[12px] border border-line bg-surface2 px-4 py-3 sm:flex-row sm:items-start sm:gap-4"
                    >
                      <div className="flex shrink-0 items-center gap-2 sm:w-40">
                        <RelevanceBadge relevance={trend.relevance} />
                        <span className="text-[14px] font-bold">{trend.keyword}</span>
                      </div>
                      <p className="text-[13.5px] leading-[1.6] text-ink2">{trend.evidence}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {result.buyers.length > 0 && (
              <Section icon={IconMatch} title={`관심 바이어 후보 ${result.buyers.length}곳`}>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {result.buyers.map((buyer, i) => (
                    <BuyerCard
                      key={`${buyer.nameLocal}-${i}`}
                      buyer={buyer}
                      saved={savedBuyers.has(buyer.nameLocal)}
                      onToggleSave={() => toggleSaved(buyer.nameLocal)}
                    />
                  ))}
                </div>
              </Section>
            )}

            {result.recommendedActions.length > 0 && (
              <Section icon={IconDocument} title="추천 실행 계획">
                <p className="mb-4 text-[13px] leading-[1.6] text-muted">
                  번호를 선택하면 SellHub가 해당 실행 항목을 대신 진행해드립니다. (Business 플랜 전용 기능)
                </p>
                <div className="flex flex-col gap-2.5">
                  {result.recommendedActions.map((action, i) => (
                    <ActionItem
                      key={i}
                      index={i + 1}
                      text={action}
                      selected={selectedActions.has(i)}
                      locked={!isPaidPlan}
                      onSelect={() => handleSelectAction(i)}
                    />
                  ))}
                </div>
                {showUpgradePrompt && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-brand-line bg-brand-bg px-5 py-4">
                    <p className="text-[13.5px] font-bold text-brand-dark">
                      🔒 실행 항목 대행 서비스는 Business 플랜에서 이용할 수 있어요
                    </p>
                    <Link
                      href="/pricing#plan-business"
                      className="rounded-full bg-brand px-4 py-2 text-[13px] font-bold text-white transition-all hover:scale-[1.03] hover:bg-brand-dark"
                    >
                      요금제 보기
                    </Link>
                  </div>
                )}
              </Section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: (props: IconProps) => React.ReactElement;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-line bg-white p-7">
      <h2 className="mb-5 flex items-center gap-2.5 text-[17px] font-extrabold tracking-tight">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-bg text-brand-dark">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function RelevanceBadge({ relevance }: { relevance: Relevance }) {
  const styles: Record<Relevance, string> = {
    높음: "bg-brand text-white",
    중간: "bg-brand-bg text-brand-dark",
    낮음: "bg-surface2 text-muted border border-line",
  };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ${styles[relevance]}`}>
      {relevance}
    </span>
  );
}

function BuyerCard({
  buyer,
  saved,
  onToggleSave,
}: {
  buyer: IntentBuyer;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <div className="flex flex-col rounded-[24px] border border-line bg-white p-5 shadow-[0_4px_16px_rgba(91,61,245,0.06)] transition-shadow hover:shadow-[0_8px_28px_rgba(91,61,245,0.12)]">
      <h3 className="mb-1 text-[16px] font-extrabold leading-snug tracking-tight">
        {buyer.nameLocal}
        {buyer.nameEn && <span className="font-semibold text-ink2"> ({buyer.nameEn})</span>}
      </h3>
      <p className="mb-3 text-[12.5px] font-semibold text-muted">
        {buyer.country} · {buyer.buyerType}
      </p>

      <div className="mb-4 flex flex-1 flex-col gap-2">
        {buyer.reasons.slice(0, 2).map((reason, i) => (
          <p
            key={i}
            className="rounded-[10px] bg-surface2 px-3 py-2.5 text-[12.5px] leading-[1.55] text-ink2"
          >
            {reason}
          </p>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-1.5 text-[12.5px]">
        {buyer.website && (
          <a
            href={buyer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-semibold text-brand hover:underline"
          >
            {buyer.website.replace(/^https?:\/\//, "")} ↗
          </a>
        )}
        <span className={buyer.contactKnown ? "font-semibold text-brand-dark" : "text-muted"}>
          {buyer.contactKnown ? "연락처 확인됨" : "연락처 미확인"}
        </span>
        {buyer.sourceNote && <span className="text-muted">출처: {buyer.sourceNote}</span>}
      </div>

      <button
        type="button"
        onClick={onToggleSave}
        className={`rounded-full px-4 py-2.5 text-[13.5px] font-bold transition ${
          saved
            ? "bg-brand-bg text-brand-dark"
            : "bg-brand text-white hover:bg-brand-dark"
        }`}
      >
        {saved ? "✓ 내 목록에 저장됨" : "내 목록에 추가"}
      </button>
    </div>
  );
}

function ActionItem({
  index,
  text,
  selected,
  locked,
  onSelect,
}: {
  index: number;
  text: string;
  selected: boolean;
  locked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-start gap-3 rounded-[12px] border px-4 py-3 text-left transition ${
        selected
          ? "border-brand bg-brand-bg"
          : "border-line bg-surface2 hover:border-brand-line"
      }`}
    >
      <span
        className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-bold ${
          selected ? "bg-brand text-white" : "bg-white text-ink2 border border-line"
        }`}
      >
        {selected ? "✓" : index}
      </span>
      <span className="flex-1 text-[13.5px] leading-[1.6] text-ink2">{text}</span>
      {locked && <span className="shrink-0 text-[12px] text-muted">🔒 BIZ</span>}
    </button>
  );
}

function MarketSelect({
  market,
  setMarket,
}: {
  market: string;
  setMarket: (m: string) => void;
}) {
  return (
    <select
      value={market}
      onChange={(e) => setMarket(e.target.value)}
      className="rounded-[10px] border border-line px-3.5 py-2.5 text-[14.5px] text-foreground outline-none focus:border-brand"
    >
      {MARKETS.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-line border-t-brand"
    />
  );
}
