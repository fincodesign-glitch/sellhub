"use client";

import { useState } from "react";
import { renderPdf } from "@/lib/pdf-worker-client";
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
      const blob = await renderPdf({ kind: "report", result, meta });
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
        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-bold text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        style={{ background: "linear-gradient(180deg,#5b9cff,#2f6fe0)", boxShadow: "0 4px 14px rgba(91,156,255,0.3)" }}
      >
        {generating ? "PDF 생성 중..." : "📄 PDF로 다운로드"}
      </button>
      {generating && (
        <p className="max-w-[220px] text-right text-[11px] leading-snug text-[#9a9a9a]">
          한글·일본어 폰트를 처리하느라 30초 정도 걸려요. 이 창은 닫지 말아주세요.
        </p>
      )}
    </div>
  );
}
