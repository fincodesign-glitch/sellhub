"use client";

import Link from "next/link";
import NavLink, { splitNavItems, TOOL_LINKS } from "@/components/NavLink";
import SignalWave from "@/components/SignalWave";
import DarkSiteFooter from "@/components/DarkSiteFooter";
import { IconImage, IconRadar, IconTrend, IconMatch, IconDocument, type IconProps } from "@/components/Icons";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { AnalysisResult, Buyer, Relevance, ReportMeta } from "@/lib/analysis-types";
import { warmPdfFonts } from "@/lib/pdf-warmup";
import styles from "@/components/DarkSite.module.css";

// Kept local (not imported from lib/site-content) because that module also
// exports server-only @vercel/blob calls that must not end up in the client bundle.
interface NavItem {
  label: string;
  href: string;
}
const DEFAULT_NAV: NavItem[] = [
  { label: "브랜드", href: "/brand" },
  { label: "요금제", href: "/pricing" },
];

const PdfDownloadButton = dynamic(() => import("@/components/PdfDownloadButton"), {
  ssr: false,
  loading: () => (
    <span
      className="inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[13.5px] font-bold text-white opacity-60"
      style={{ background: "linear-gradient(180deg,#5b9cff,#2f6fe0)" }}
    >
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

export default function ProfilePage() {
  const { user, signOutUser } = useAuth();

  const [mode, setMode] = useState<Mode>("text");
  const [productName, setProductName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [market, setMarket] = useState(MARKETS[0]);

  const [result, setResult] = useState<AnalysisResult | null>(null);
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
  const { before: navBeforeLogin, after: navAfterLogin } = splitNavItems(navItems);

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
    // Pay the one-time CJK font-parsing cost now, while the user is watching
    // the analysis progress log (not trying to click anything else) — not
    // right when the page loads, which froze the page under their cursor.
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

      const res = await fetch("/api/analyze", {
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
              | { type: "result"; data: AnalysisResult }
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
    <div className={styles.wrap}>
      {/* Warm the browser's HTTP cache for the PDF fonts as soon as this page
          loads, so by the time the user clicks "PDF 다운로드" (after a multi-
          minute analysis), the ~1.7MB of CJK font data doesn't have to be
          fetched over the network inside the blocking generation call. */}
      <link rel="preload" as="fetch" crossOrigin="anonymous" href="/fonts/NotoSansKR-Regular.woff" />
      <link rel="preload" as="fetch" crossOrigin="anonymous" href="/fonts/NotoSansKR-Bold.woff" />
      <link rel="preload" as="fetch" crossOrigin="anonymous" href="/fonts/NotoSansJP-Regular.woff" />
      <link rel="preload" as="fetch" crossOrigin="anonymous" href="/fonts/NotoSansJP-Bold.woff" />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <input type="checkbox" id="mobile-nav-toggle" className="peer hidden" />
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" aria-label="SellHub" className="inline-flex items-center gap-2.5 text-[16px] font-extrabold tracking-tight text-white">
            SellHub<span className="font-semibold">.ai</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 sm:flex">
              {TOOL_LINKS.map((item) => (
                <NavLink key={item.label} href={item.href} className="text-[14px] font-semibold text-white hover:text-[#5b9cff]">
                  {item.label}
                </NavLink>
              ))}
              {navBeforeLogin.map((item) => (
                <NavLink key={item.label} href={item.href} className="text-[14px] font-semibold text-[#b4b4b4] hover:text-white">
                  {item.label}
                </NavLink>
              ))}
            </div>
            <span className="rounded-full bg-[#5b9cff]/15 px-3 py-1 text-[12px] font-bold text-[#5b9cff]">
              Free 플랜
            </span>
            {user ? (
              <>
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[#5b9cff]/15" />
                )}
                <button
                  onClick={() => signOutUser()}
                  className="hidden text-[13.5px] font-semibold text-[#9a9a9a] hover:text-white sm:inline"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link href="/login" className="hidden text-[13.5px] font-semibold text-[#9a9a9a] hover:text-white sm:inline">
                로그인 (선택)
              </Link>
            )}
            <div className="hidden items-center gap-4 sm:flex">
              {navAfterLogin.map((item) => (
                <NavLink key={item.label} href={item.href} className="text-[14px] font-semibold text-[#b4b4b4] hover:text-white">
                  {item.label}
                </NavLink>
              ))}
            </div>
            <label
              htmlFor="mobile-nav-toggle"
              aria-label="메뉴 열기"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-[8px] text-[#b4b4b4] hover:bg-white/[0.08] sm:hidden"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
          </div>
        </div>
        <div className="hidden flex-col gap-1 border-t border-white/10 bg-black px-6 py-4 peer-checked:flex sm:hidden">
          {TOOL_LINKS.map((item) => (
            <NavLink key={item.label} href={item.href} className="rounded-[8px] px-2 py-2.5 text-[15px] font-bold text-white hover:bg-white/[0.08]">
              {item.label}
            </NavLink>
          ))}
          {navBeforeLogin.map((item) => (
            <NavLink key={item.label} href={item.href} className="rounded-[8px] px-2 py-2.5 text-[15px] font-semibold text-[#b4b4b4] hover:bg-white/[0.08]">
              {item.label}
            </NavLink>
          ))}
          {navAfterLogin.map((item) => (
            <NavLink key={item.label} href={item.href} className="rounded-[8px] px-2 py-2.5 text-[15px] font-semibold text-[#b4b4b4] hover:bg-white/[0.08]">
              {item.label}
            </NavLink>
          ))}
          {user ? (
            <button
              onClick={() => signOutUser()}
              className="rounded-[8px] px-2 py-2.5 text-left text-[15px] font-semibold text-[#9a9a9a] hover:bg-white/[0.08]"
            >
              로그아웃
            </button>
          ) : (
            <Link href="/login" className="rounded-[8px] px-2 py-2.5 text-[15px] font-semibold text-[#9a9a9a] hover:bg-white/[0.08]">
              로그인 (선택)
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#5b9cff]">
          SellHub Tool
        </span>
        <h1 className="mb-3 text-balance text-[clamp(26px,3.6vw,38px)] font-black leading-[1.15] tracking-[-0.01em] text-white">바이어 찾기 & 제안 메일 만들기</h1>
        <p className="mb-8 max-w-2xl text-[15px] leading-[1.7] text-[#b4b4b4]">
          텍스트, 제품 페이지 URL, 상세페이지 이미지 중 원하는 방식으로 제품을 알려주시면 AI가 해외 시장에서
          관심 가질 만한 바이어를 찾고, 그 바이어 회사 한 곳만을 위한 영어 제안 메일까지 만들어드립니다.
        </p>

        <div className="mb-5 -mx-6 overflow-x-auto px-6 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="inline-flex shrink-0 rounded-full border border-white/10 bg-white/[0.04] p-1.5">
          {MODE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMode(tab.key)}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-semibold transition text-[#b4b4b4] hover:bg-white/[0.08]"
              style={
                mode === tab.key
                  ? { background: "linear-gradient(180deg,#5b9cff,#2f6fe0)", color: "#fff", boxShadow: "0 2px 10px rgba(91,156,255,0.35)" }
                  : undefined
              }
            >
              <span aria-hidden>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-10 grid gap-5 rounded-[28px] border border-white/10 p-8 sm:grid-cols-2"
          style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0) 60%)" }}
        >
          {mode === "text" && (
            <>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-[#b4b4b4]">
                제품 / 브랜드명
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="예: 속눈썹 메이커업"
                  className="rounded-[10px] border border-white/12 bg-white/[0.03] px-3.5 py-2.5 text-[14.5px] text-white outline-none focus:border-[#5b9cff] placeholder:text-[#6b6b6b]"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-[#b4b4b4]">
                목표 시장
                <MarketSelect market={market} setMarket={setMarket} />
              </label>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-[#b4b4b4] sm:col-span-2">
                핵심 키워드 (쉼표로 구분)
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="예: 속눈썹, 미용기기, K-뷰티"
                  className="rounded-[10px] border border-white/12 bg-white/[0.03] px-3.5 py-2.5 text-[14.5px] text-white outline-none focus:border-[#5b9cff] placeholder:text-[#6b6b6b]"
                />
              </label>
            </>
          )}

          {mode === "url" && (
            <>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-[#b4b4b4] sm:col-span-2">
                제품 페이지 URL
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://example.com/products/..."
                  className="rounded-[10px] border border-white/12 bg-white/[0.03] px-3.5 py-2.5 text-[14.5px] text-white outline-none focus:border-[#5b9cff] placeholder:text-[#6b6b6b]"
                />
                <span className="text-[12px] font-normal text-[#9a9a9a]">
                  AI가 이 URL을 직접 방문해 브랜드·성분·효능·가격 정보를 읽어옵니다.
                </span>
              </label>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-[#b4b4b4]">
                제품/브랜드명 (선택)
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="참고용, 비워도 됩니다"
                  className="rounded-[10px] border border-white/12 bg-white/[0.03] px-3.5 py-2.5 text-[14.5px] text-white outline-none focus:border-[#5b9cff] placeholder:text-[#6b6b6b]"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-[#b4b4b4]">
                목표 시장
                <MarketSelect market={market} setMarket={setMarket} />
              </label>
            </>
          )}

          {mode === "image" && (
            <>
              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-[13.5px] font-semibold text-[#b4b4b4]">
                  상세페이지 이미지
                </span>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-white/15 px-6 py-8 text-center hover:border-[#5b9cff]"
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
                      <span className="text-[13.5px] font-semibold text-[#b4b4b4]">
                        클릭해서 상세페이지 이미지 업로드
                      </span>
                      <span className="text-[12px] text-[#9a9a9a]">JPEG/PNG/GIF/WEBP, 최대 5MB</span>
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
                {imageError && <p className="mt-2 text-[12.5px] text-red-300">{imageError}</p>}
              </div>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-[#b4b4b4]">
                제품/브랜드명 (선택)
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="참고용, 비워도 됩니다"
                  className="rounded-[10px] border border-white/12 bg-white/[0.03] px-3.5 py-2.5 text-[14.5px] text-white outline-none focus:border-[#5b9cff] placeholder:text-[#6b6b6b]"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[13.5px] font-semibold text-[#b4b4b4]">
                목표 시장
                <MarketSelect market={market} setMarket={setMarket} />
              </label>
            </>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isBusy || !isSubmittable()}
              className="rounded-full px-7 py-3.5 text-[14.5px] font-bold text-white transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: "linear-gradient(180deg,#5b9cff,#2f6fe0)", boxShadow: "0 6px 20px rgba(91,156,255,0.35)" }}
            >
              {isBusy ? "찾는 중..." : "바이어 & 제안 메일 만들기"}
            </button>
          </div>
        </form>

        {errorMessage && (
          <p className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-[13.5px] text-red-300">
            {errorMessage}
          </p>
        )}

        {isBusy && (
          <div
            className="mb-8 overflow-hidden rounded-[20px] border border-white/12 px-6 py-5"
            style={{ background: "rgba(91,156,255,0.08)" }}
          >
            <div className="flex items-center gap-2.5 text-[13.5px] font-bold text-[#5b9cff]">
              <Spinner />
              {progressLog.length > 0 ? progressLog[progressLog.length - 1] : "분석을 시작하는 중..."}
            </div>
            {progressLog.length > 1 && (
              <ul className="mt-2.5 flex flex-col gap-1 text-[12.5px] text-[#b4b4b4] opacity-70">
                {progressLog.slice(0, -1).map((label, i) => (
                  <li key={i}>{label}</li>
                ))}
              </ul>
            )}
            <SignalWave className="mt-3 h-6 w-full opacity-50" />
          </div>
        )}

        {result && resultMeta && (
          <div className="flex flex-col gap-6">
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/12 px-6 py-4"
              style={{ background: "rgba(91,156,255,0.08)" }}
            >
              <p className="text-[13.5px] font-bold text-[#5b9cff]">
                ✅ 바이어 후보와 제안 메일이 준비됐습니다
              </p>
              <PdfDownloadButton result={result} meta={resultMeta} />
            </div>

            {result.productSummary && (
              <Section icon={IconImage} title="제품 분석">
                <p className="text-[14px] leading-[1.7] text-[#b4b4b4]">{result.productSummary}</p>
              </Section>
            )}

            {result.marketInsight.length > 0 && (
              <Section icon={IconRadar} title="시장 인사이트 리포트">
                <ul className="flex flex-col gap-2.5">
                  {result.marketInsight.map((point, i) => (
                    <li key={i} className="flex gap-2.5 text-[14px] leading-[1.65] text-[#b4b4b4]">
                      <span className="mt-0.5 shrink-0 text-[#5b9cff]">●</span>
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
                      className="flex flex-col gap-1.5 rounded-[12px] border border-white/10 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-start sm:gap-4"
                    >
                      <div className="flex shrink-0 items-center gap-2 sm:w-40">
                        <RelevanceBadge relevance={trend.relevance} />
                        <span className="text-[14px] font-bold text-white">{trend.keyword}</span>
                      </div>
                      <p className="text-[13.5px] leading-[1.6] text-[#b4b4b4]">{trend.evidence}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {result.buyers.length > 0 && (
              <Section icon={IconMatch} title={`바이어 후보 & 제안 메일 ${result.buyers.length}곳`}>
                <div className="grid gap-5 lg:grid-cols-2">
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
                <p className="mb-4 text-[13px] leading-[1.6] text-[#9a9a9a]">
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
                  <div
                    className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-white/12 px-5 py-4"
                    style={{ background: "rgba(91,156,255,0.08)" }}
                  >
                    <p className="text-[13.5px] font-bold text-[#5b9cff]">
                      🔒 실행 항목 대행 서비스는 Business 플랜에서 이용할 수 있어요
                    </p>
                    <Link
                      href="/pricing#plan-business"
                      className="rounded-full px-4 py-2 text-[13px] font-bold text-white transition-all hover:scale-[1.03]"
                      style={{ background: "linear-gradient(180deg,#5b9cff,#2f6fe0)" }}
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

      <DarkSiteFooter />
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
    <section
      className="rounded-[20px] border border-white/10 p-7"
      style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.03), rgba(255,255,255,0) 60%)" }}
    >
      <h2 className="mb-5 flex items-center gap-2.5 text-[17px] font-extrabold tracking-tight text-white">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#5b9cff]/15 text-[#5b9cff]">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function RelevanceBadge({ relevance }: { relevance: Relevance }) {
  const relevanceStyles: Record<Relevance, string> = {
    높음: "text-white",
    중간: "text-[#5b9cff]",
    낮음: "text-[#9a9a9a] border border-white/15",
  };
  const relevanceBg: Record<Relevance, React.CSSProperties | undefined> = {
    높음: { background: "linear-gradient(180deg,#5b9cff,#2f6fe0)" },
    중간: { background: "rgba(91,156,255,0.15)" },
    낮음: { background: "rgba(255,255,255,0.04)" },
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ${relevanceStyles[relevance]}`}
      style={relevanceBg[relevance]}
    >
      {relevance}
    </span>
  );
}

function BuyerCard({
  buyer,
  saved,
  onToggleSave,
}: {
  buyer: Buyer;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    const text = `Subject: ${buyer.outreachEmailSubject}\n\n${buyer.outreachEmailBody}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 권한이 없는 브라우저 등 — 조용히 무시, 사용자는 직접 드래그해서 복사할 수 있음
    }
  }

  return (
    <div
      className="flex flex-col rounded-[20px] border border-white/10 p-5 transition-colors hover:border-white/20"
      style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0) 60%)" }}
    >
      <h3 className="mb-1 text-[16px] font-extrabold leading-snug tracking-tight text-white">
        {buyer.nameLocal}
        {buyer.nameEn && <span className="font-semibold text-[#b4b4b4]"> ({buyer.nameEn})</span>}
      </h3>
      <p className="mb-3 text-[12.5px] font-semibold text-[#9a9a9a]">
        {buyer.country} · {buyer.buyerType}
      </p>

      <div className="mb-4 flex flex-col gap-2">
        {buyer.reasons.slice(0, 2).map((reason, i) => (
          <p
            key={i}
            className="rounded-[10px] bg-white/[0.04] px-3 py-2.5 text-[12.5px] leading-[1.55] text-[#b4b4b4]"
          >
            {reason}
          </p>
        ))}
      </div>

      <div
        className="mb-4 flex-1 rounded-[16px] border border-white/12 p-4"
        style={{ background: "rgba(91,156,255,0.06)" }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5b9cff]">
            제안 메일 초안 (영문)
          </span>
          <button
            type="button"
            onClick={copyEmail}
            className="shrink-0 rounded-full bg-white/[0.08] px-3 py-1 text-[11.5px] font-bold text-[#5b9cff] hover:bg-white/[0.14]"
          >
            {copied ? "복사됨!" : "복사"}
          </button>
        </div>
        <p className="mb-2 text-[13px] font-bold text-white">{buyer.outreachEmailSubject}</p>
        <p className="whitespace-pre-line text-[12.5px] leading-[1.65] text-[#b4b4b4]">
          {buyer.outreachEmailBody}
        </p>
        <p className="mt-3 border-t border-white/12 pt-2.5 text-[12px] leading-[1.5] text-[#5b9cff]">
          💡 {buyer.emailCoachingNote}
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-1.5 text-[12.5px]">
        {buyer.website && (
          <a
            href={buyer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-semibold text-[#5b9cff] hover:underline"
          >
            {buyer.website.replace(/^https?:\/\//, "")} ↗
          </a>
        )}
        <span className={buyer.contactKnown ? "font-semibold text-[#5b9cff]" : "text-[#9a9a9a]"}>
          {buyer.contactKnown ? "연락처 확인됨" : "연락처 미확인"}
        </span>
        {buyer.sourceNote && <span className="text-[#9a9a9a]">출처: {buyer.sourceNote}</span>}
      </div>

      <button
        type="button"
        onClick={onToggleSave}
        className="rounded-full px-4 py-2.5 text-[13.5px] font-bold transition"
        style={
          saved
            ? { background: "rgba(91,156,255,0.15)", color: "#5b9cff" }
            : { background: "linear-gradient(180deg,#5b9cff,#2f6fe0)", color: "#fff" }
        }
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
      className="flex items-start gap-3 rounded-[12px] border px-4 py-3 text-left transition"
      style={
        selected
          ? { borderColor: "#5b9cff", background: "rgba(91,156,255,0.1)" }
          : { borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }
      }
    >
      <span
        className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-bold"
        style={
          selected
            ? { background: "linear-gradient(180deg,#5b9cff,#2f6fe0)", color: "#fff" }
            : { background: "rgba(255,255,255,0.06)", color: "#b4b4b4", border: "1px solid rgba(255,255,255,0.12)" }
        }
      >
        {selected ? "✓" : index}
      </span>
      <span className="flex-1 text-[13.5px] leading-[1.6] text-[#b4b4b4]">{text}</span>
      {locked && <span className="shrink-0 text-[12px] text-[#9a9a9a]">🔒 BIZ</span>}
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
      className="rounded-[10px] border border-white/12 bg-white/[0.03] px-3.5 py-2.5 text-[14.5px] text-white outline-none focus:border-[#5b9cff]"
    >
      {MARKETS.map((m) => (
        <option key={m} value={m} className="bg-black text-white">
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
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#5b9cff]/30 border-t-[#5b9cff]"
    />
  );
}
