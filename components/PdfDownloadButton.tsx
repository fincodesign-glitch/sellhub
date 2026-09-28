"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import ReportPdf from "./ReportPdf";
import type { AnalysisResult, ReportMeta } from "@/lib/analysis-types";

export default function PdfDownloadButton({
  result,
  meta,
}: {
  result: AnalysisResult;
  meta: ReportMeta;
}) {
  const [generating, setGenerating] = useState(false);

  async function handleClick() {
    if (generating) return;
    setGenerating(true);
    try {
      const blob = await pdf(<ReportPdf result={result} meta={meta} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SellHub_${meta.market}_바이어제안메일리포트.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err) {
      console.error("[PdfDownloadButton]", err);
      alert("PDF 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={generating}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-[13.5px] font-bold text-white shadow-[0_4px_14px_rgba(79,168,221,0.3)] transition-all hover:scale-[1.02] hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {generating ? "PDF 생성 중..." : "📄 PDF로 다운로드"}
      </button>
      {generating && (
        <p className="max-w-[220px] text-right text-[11px] leading-snug text-muted">
          한글·일본어 폰트를 처리하느라 20~30초 정도 걸려요. 이 창을 닫지 말고 기다려주세요.
        </p>
      )}
    </div>
  );
}
