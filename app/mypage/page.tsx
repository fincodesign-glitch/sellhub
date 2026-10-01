"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AnalysisReportView from "@/components/AnalysisReportView";
import DarkSiteFooter from "@/components/DarkSiteFooter";
import DarkSiteHeader from "@/components/DarkSiteHeader";
import styles from "@/components/DarkSite.module.css";
import { useAuth } from "@/lib/auth-context";
import type { AnalysisResult, ReportMeta } from "@/lib/analysis-types";

interface ReportSummary {
  id: string;
  createdAt: string;
  meta: ReportMeta;
  buyerCount: number;
}

interface FullReport extends ReportSummary {
  result: AnalysisResult;
}

const MODE_LABEL: Record<ReportMeta["mode"], string> = { text: "텍스트", url: "URL", image: "이미지" };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

function reportTitle(meta: ReportMeta) {
  return meta.productName || meta.keywords || meta.productUrl || (meta.mode === "image" ? "상세페이지 이미지 분석" : "분석");
}

export default function MyPage() {
  const { account, loading, signOutUser } = useAuth();
  const [reports, setReports] = useState<ReportSummary[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [open, setOpen] = useState<FullReport | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  useEffect(() => {
    if (!account) return;
    fetch("/api/reports", { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as { reports?: ReportSummary[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "저장된 리포트를 불러오지 못했습니다.");
        setReports(data.reports ?? []);
      })
      .catch((err: Error) => setListError(err.message));
  }, [account]);

  async function openReport(id: string) {
    setOpening(id);
    setOpenError(null);
    try {
      const res = await fetch(`/api/reports/${id}`, { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as { report?: FullReport; error?: string };
      if (!res.ok || !data.report) throw new Error(data.error ?? "리포트를 불러오지 못했습니다.");
      setOpen(data.report);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setOpenError((err as Error).message);
    } finally {
      setOpening(null);
    }
  }

  return (
    <div className={styles.wrap}>
      <DarkSiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#5b9cff]">
          My Page
        </span>

        {loading ? (
          <p className="text-[14px] text-[#9a9a9a]">불러오는 중...</p>
        ) : !account ? (
          <div className="max-w-xl">
            <h1 className="mb-3 text-[clamp(26px,3.6vw,38px)] font-black leading-[1.15] text-white">마이페이지</h1>
            <p className="mb-6 text-[15px] leading-[1.7] text-[#b4b4b4]">
              로그인하면 분석 결과가 마이페이지에 자동으로 저장돼요.
            </p>
            <Link
              href="/login"
              className="inline-flex rounded-full px-6 py-3 text-[14px] font-bold text-white"
              style={{ background: "linear-gradient(180deg,#5b9cff,#2f6fe0)" }}
            >
              로그인 / 회원가입
            </Link>
          </div>
        ) : open ? (
          <div>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="mb-5 text-[13.5px] font-semibold text-[#9a9a9a] hover:text-white"
            >
              ← 저장된 리포트 목록
            </button>
            <h1 className="mb-1 text-[clamp(22px,3vw,30px)] font-black leading-[1.2] text-white">{reportTitle(open.meta)}</h1>
            <p className="mb-8 text-[13.5px] text-[#9a9a9a]">
              {formatDate(open.createdAt)} · {open.meta.market} · {MODE_LABEL[open.meta.mode]} 분석
            </p>
            <AnalysisReportView result={open.result} meta={open.meta} headline="저장된 분석 결과" />
          </div>
        ) : (
          <div>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="mb-2 text-[clamp(26px,3.6vw,38px)] font-black leading-[1.15] text-white">
                  {account.id}님의 분석 기록
                </h1>
                <p className="text-[14.5px] text-[#b4b4b4]">로그인한 상태로 분석한 결과가 최신순으로 저장돼요.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="rounded-full px-5 py-2.5 text-[13.5px] font-bold text-white"
                  style={{ background: "linear-gradient(180deg,#5b9cff,#2f6fe0)" }}
                >
                  새 분석 시작
                </Link>
                <button
                  type="button"
                  onClick={() => signOutUser()}
                  className="text-[13.5px] font-semibold text-[#9a9a9a] hover:text-white"
                >
                  로그아웃
                </button>
              </div>
            </div>

            {listError && <p className="mb-4 text-[13.5px] text-red-300">{listError}</p>}
            {openError && <p className="mb-4 text-[13.5px] text-red-300">{openError}</p>}

            {reports === null && !listError ? (
              <p className="text-[14px] text-[#9a9a9a]">불러오는 중...</p>
            ) : reports && reports.length === 0 ? (
              <div className="rounded-[20px] border border-white/10 px-6 py-10 text-center">
                <p className="mb-4 text-[14.5px] text-[#b4b4b4]">아직 저장된 분석이 없어요.</p>
                <Link href="/profile" className="text-[14px] font-bold text-[#5b9cff] hover:underline">
                  첫 분석 시작하기 →
                </Link>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {reports?.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => openReport(r.id)}
                      disabled={opening !== null}
                      className="flex w-full flex-wrap items-center justify-between gap-3 rounded-[16px] border border-white/10 px-5 py-4 text-left transition hover:border-white/25 disabled:opacity-60"
                      style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0) 60%)" }}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[15.5px] font-bold text-white">{reportTitle(r.meta)}</p>
                        <p className="mt-1 text-[12.5px] text-[#9a9a9a]">
                          {formatDate(r.createdAt)} · {r.meta.market} · {MODE_LABEL[r.meta.mode]} 분석 · 바이어 {r.buyerCount}곳
                        </p>
                      </div>
                      <span className="shrink-0 text-[13px] font-bold text-[#5b9cff]">
                        {opening === r.id ? "여는 중..." : "결과 보기 →"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
      <DarkSiteFooter />
    </div>
  );
}
