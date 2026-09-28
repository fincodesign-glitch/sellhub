import type { Metadata } from "next";
import Link from "next/link";
import { getSiteContent } from "@/lib/site-content";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SparkleMark } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Searching Hub · AI 마케팅 리서치 에이전트",
  description:
    "이 시장에서 어떻게 마케팅하면 좋을지 AI가 대신 검색해 전략을 찾아드립니다. 일본·미국·동남아시아 마케팅 전략 & 바이어 추천.",
};

const painPoints = [
  "이 시장에서 어떤 마케팅이 통할지 감이 안 잡힌다",
  "구매 의도가 높은 바이어를 찾기까지 시간과 비용이 너무 많이 든다",
  "언어·문화·상관행 차이로 바이어와의 신뢰 구축이 어렵다",
  "잘못된 타깃팅으로 계약 성사율이 낮고 수출 성과로 이어지지 않는다",
];

const takes = [
  "이 시장에서 통할 마케팅 전략과 포지셔닝을 AI가 먼저 찾아드립니다",
  "검색·뉴스·SNS·B2B 데이터를 AI가 대신 뒤져 시장 트렌드를 분석합니다",
  "관심 가질 만한 해외 바이어 후보도 함께 발굴해드립니다",
  "데이터 기반 마케팅 타깃팅으로 해외 진출 성공률을 높입니다",
];

const approach = [
  { no: "01", verb: "모읍니다", desc: "검색, 뉴스, SNS, B2B 플랫폼 등 다양한 소스에서 목표 시장 데이터를 수집합니다.", bg: "bg-brand" },
  { no: "02", verb: "읽습니다", desc: "키워드 트렌드와 경쟁 동향을 분석해, 이 시장에서 통할 마케팅 방향을 찾습니다.", bg: "bg-accent" },
  { no: "03", verb: "전달합니다", desc: "마케팅 전략 리포트와 관심 해외 바이어 리스트를 정리해 전달합니다.", bg: "bg-navy" },
];

const capabilities = [
  { title: "다중 소스 데이터 수집", desc: "검색·뉴스·SNS·B2B 플랫폼 데이터를 다각도로 수집·분석합니다.", tile: "big" },
  { title: "AI 마케팅 전략 분석", desc: "키워드 트렌드와 경쟁 동향을 분석해 이 시장에 맞는 마케팅 방향을 제안합니다.", tile: "dark" },
  { title: "마케팅 전략 리포트", desc: "시장 인사이트와 마케팅 제안을 자동으로 정리해드립니다.", tile: "plain" },
  { title: "해외 바이어 추천", desc: "관심 있는 해외 수입사·유통사·온라인몰 후보를 제공합니다.", tile: "coral" },
  { title: "실시간 웹 리서치", desc: "AI가 웹을 직접 검색해 최신 정보에 근거한 리포트를 작성합니다.", tile: "plain" },
  { title: "키워드 트렌드 모니터링", desc: "관심 카테고리의 검색·SNS 트렌드 변화를 지속적으로 추적합니다.", tile: "wide" },
];

const TILE_STYLE: Record<string, string> = {
  big: "sm:col-span-2 sm:row-span-2 bg-brand-bg border border-brand-line",
  dark: "bg-navy text-white",
  plain: "border border-line bg-white",
  coral: "bg-accent text-white",
  wide: "sm:col-span-2 border border-line bg-white",
};

const tickerItems = [
  "고객이 말하지 않은 것까지",
  "일본 · 미국 · 동남아시아",
  "마케팅 전략까지 한 번에",
  "AI가 대신 검색합니다",
];
const rotations = ["-rotate-2", "rotate-1", "rotate-2", "-rotate-1"];

export default async function IntentMatePage() {
  const content = await getSiteContent();
  // Searching Hub는 SellHub와 분리된 별도 사이트라, SellHub 회사소개 카테고리(브랜드/소개서)는 내보내지 않는다.
  const nav = content.nav.filter((item) => item.href !== "/brand" && !item.href.endsWith(".pdf"));
  return (
    <div data-brand="intent" className="min-h-screen overflow-x-hidden bg-white">
      <SiteHeader
        nav={nav}
        logoBrand="Searching Hub"
        logoHref="/intentmate"
        logoIcon={SparkleMark}
        ctaHref="/intent"
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-[6%] top-[6%] select-none text-[26vw] font-black leading-none tracking-tighter text-transparent [-webkit-text-stroke:1.5px_var(--brand-line)] sm:top-[10%] sm:text-[20vw]"
        >
          SEARCH
        </span>
        <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-24 sm:pt-32">
          <span className="mb-8 inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-navy bg-accent px-4 py-1.5 font-mono text-[11.5px] font-bold uppercase tracking-[0.1em] text-white shadow-[3px_3px_0_0_var(--navy)]">
            <SparkleMark className="h-3.5 w-3.5" />
            AI Marketing Search Agent
          </span>
          <h1 className="mb-7 text-balance text-[clamp(30px,5.6vw,58px)] font-black leading-[1.22] tracking-[-0.02em]">
            발로 뛰는 마케팅 조사, <span className="text-brand">Searching Hub</span>가 대신합니다
          </h1>
          <p className="mb-10 max-w-lg text-[16.5px] leading-[1.8] text-ink2">
            검색·SNS·뉴스·B2B 데이터까지, 사람이 일일이 찾아보던 조사를 AI가
            대신 뒤져서 마케팅 전략과 관심 바이어 후보를 정리해드립니다.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/intent"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-9 py-3.5 text-[15.5px] font-bold text-white shadow-[0_10px_30px_rgba(91,61,245,0.3)] transition-all hover:scale-[1.02] hover:bg-brand-dark"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* Ticker: 화면 전체 폭 배너 */}
      <section className="overflow-hidden border-y-2 border-navy bg-navy py-4">
        <div className="flex w-max animate-marquee items-center whitespace-nowrap">
          {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="flex items-center gap-4 px-6 text-[18px] font-black tracking-tight text-white sm:text-[22px]">
              {t}
              <SparkleMark className="h-4 w-4 shrink-0 text-brand" aria-hidden />
            </span>
          ))}
        </div>
      </section>

      {/* Take: scattered sticky-note collage */}
      <section className="px-6 py-24 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 max-w-xl">
            <div className="mb-3 font-mono text-[12px] uppercase tracking-[0.14em] text-muted">Field Notes</div>
            <h2 className="text-balance text-[clamp(24px,3.6vw,34px)] font-black tracking-tight">
              현장에서 자주 듣는 이야기, 그리고 저희 생각
            </h2>
          </div>
          <div className="flex flex-wrap gap-5">
            {painPoints.map((p, i) => (
              <div
                key={p}
                className={`w-full max-w-[280px] rounded-[22px] border border-line bg-surface2 p-5 shadow-[0_6px_0_0_var(--line)] ${rotations[i % rotations.length]}`}
              >
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted">Overheard</span>
                <p className="text-[14px] leading-[1.6] text-ink2">{p}</p>
              </div>
            ))}
            {takes.map((t, i) => (
              <div
                key={t}
                className={`w-full max-w-[280px] rounded-[22px] bg-brand p-5 text-white shadow-[0_6px_0_0_var(--brand-dark)] ${rotations[(i + 2) % rotations.length]}`}
              >
                <span className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/70">
                  <SparkleMark className="h-3 w-3" />
                  Searching Hub
                </span>
                <p className="text-[14px] leading-[1.6]">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach: three colorful blob cards */}
      <section className="bg-surface2 px-6 py-24 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 max-w-xl">
            <div className="mb-3 font-mono text-[12px] uppercase tracking-[0.14em] text-brand-dark">Our Approach</div>
            <h2 className="text-balance text-[clamp(24px,3.6vw,34px)] font-black tracking-tight">
              세 단계로 움직입니다
            </h2>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row">
            {approach.map((a, i) => (
              <div
                key={a.no}
                className={`flex-1 rounded-[2.5rem] p-8 text-white transition-transform hover:rotate-0 ${a.bg} ${
                  i === 0 ? "rotate-1" : i === 1 ? "-rotate-1" : "rotate-1"
                }`}
              >
                <span className="font-mono text-[13px] text-white/60">{a.no}</span>
                <h3 className="mb-3 mt-2 text-[26px] font-black tracking-tight">우리는 {a.verb}</h3>
                <p className="text-[14px] leading-[1.7] text-white/80">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities: bento grid */}
      <section className="px-6 py-24 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 max-w-xl">
            <div className="mb-3 font-mono text-[12px] uppercase tracking-[0.14em] text-brand-dark">Capabilities</div>
            <h2 className="text-balance text-[clamp(24px,3.6vw,34px)] font-black tracking-tight">
              데이터로 증명하는 마케팅 전략
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:auto-rows-[150px]">
            {capabilities.map((c) => (
              <div
                key={c.title}
                className={`flex flex-col justify-center rounded-[24px] p-6 ${TILE_STYLE[c.tile]}`}
              >
                <h3 className={`mb-2 font-black tracking-tight ${c.tile === "big" ? "text-[22px]" : "text-[16px]"}`}>
                  {c.title}
                </h3>
                <p
                  className={`leading-[1.6] ${c.tile === "big" ? "text-[14.5px]" : "text-[13px]"} ${
                    c.tile === "dark" || c.tile === "coral" ? "text-white/80" : "text-ink2"
                  }`}
                >
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-navy px-6 py-24 text-center text-white sm:py-28">
        <span aria-hidden className="pointer-events-none absolute left-[8%] top-[18%] block h-8 w-8 rotate-12 text-brand/40">
          <SparkleMark className="h-8 w-8" />
        </span>
        <span aria-hidden className="pointer-events-none absolute bottom-[15%] right-[10%] block h-12 w-12 -rotate-12 text-accent/40">
          <SparkleMark className="h-12 w-12" />
        </span>
        <div className="relative mx-auto max-w-xl">
          <h2 className="mb-4 text-balance text-[clamp(22px,4.2vw,40px)] font-black tracking-tight">
            이 시장, 어떻게 마케팅할지 물어보세요
          </h2>
          <p className="mb-9 text-[16px] leading-[1.65] text-white/60">
            제품 정보 입력 3분. AI가 마케팅 전략을 분석하고 관심 바이어까지 찾아드립니다.
          </p>
          <Link
            href="/intent"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-10 py-4 text-[16.5px] font-bold text-white shadow-[0_10px_35px_rgba(255,122,69,0.35)] transition-all hover:scale-[1.03] hover:brightness-95"
          >
            무료로 시작하기
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </section>

      <SiteFooter
        nav={nav}
        tagline="© 2026 Searching Hub · AI 마케팅 리서치 에이전트 · 검색·SNS·뉴스 데이터를 대신 뒤져 만드는 마케팅 전략 & 바이어 추천 도구"
      />
    </div>
  );
}
