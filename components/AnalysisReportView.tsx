"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { IconDocument, IconImage, IconMatch, IconRadar, IconTrend, type IconProps } from "@/components/Icons";
import type { AnalysisResult, Buyer, Relevance, ReportMeta } from "@/lib/analysis-types";

// The SellHub analysis result, shared by /profile (fresh results, with the
// interactive action plan) and /mypage (saved reports, read-only action plan).

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

export default function AnalysisReportView({
  result,
  meta,
  headline,
  note,
  actionPlan,
}: {
  result: AnalysisResult;
  meta: ReportMeta;
  headline: string;
  /** Extra line under the headline, e.g. where the result is saved. */
  note?: React.ReactNode;
  /** Replaces the default read-only action plan list. */
  actionPlan?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/12 px-6 py-4"
        style={{ background: "rgba(91,156,255,0.08)" }}
      >
        <div>
          <p className="text-[13.5px] font-bold text-[#5b9cff]">{headline}</p>
          {note && <p className="mt-1 text-[12.5px] font-semibold text-[#9a9a9a]">{note}</p>}
        </div>
        <PdfDownloadButton result={result} meta={meta} />
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
              <BuyerCard key={`${buyer.nameLocal}-${i}`} buyer={buyer} />
            ))}
          </div>
        </Section>
      )}

      {result.recommendedActions.length > 0 &&
        (actionPlan ?? (
          <Section icon={IconDocument} title="추천 실행 계획">
            <ol className="flex flex-col gap-2.5">
              {result.recommendedActions.map((action, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-[12px] border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <span className="mt-0.5 w-6 shrink-0 text-[13px] font-bold text-[#5b9cff]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-[13.5px] leading-[1.6] text-[#b4b4b4]">{action}</span>
                </li>
              ))}
            </ol>
          </Section>
        ))}
    </div>
  );
}

export function Section({
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

function BuyerCard({ buyer }: { buyer: Buyer }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

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
          <p key={i} className="rounded-[10px] bg-white/[0.04] px-3 py-2.5 text-[12.5px] leading-[1.55] text-[#b4b4b4]">
            {reason}
          </p>
        ))}
      </div>

      <div className="mb-4 flex-1 rounded-[16px] border border-white/12 p-4" style={{ background: "rgba(91,156,255,0.06)" }}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5b9cff]">제안 메일 초안 (영문)</span>
          <button
            type="button"
            onClick={copyEmail}
            className="shrink-0 rounded-full bg-white/[0.08] px-3 py-1 text-[11.5px] font-bold text-[#5b9cff] hover:bg-white/[0.14]"
          >
            {copied ? "복사됨!" : "복사"}
          </button>
        </div>
        <p className="mb-2 text-[13px] font-bold text-white">{buyer.outreachEmailSubject}</p>
        <p className="whitespace-pre-line text-[12.5px] leading-[1.65] text-[#b4b4b4]">{buyer.outreachEmailBody}</p>
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
        onClick={() => setSaved((v) => !v)}
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
