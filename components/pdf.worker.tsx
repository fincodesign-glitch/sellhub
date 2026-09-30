import { pdf } from "@react-pdf/renderer";
import ReportPdf from "@/components/ReportPdf";
import IntentReportPdf from "@/components/IntentReportPdf";
import type { PdfWorkerRequest, PdfWorkerResponse } from "@/lib/pdf-worker-client";

// Both report components register the same Noto Sans KR/JP files, so warming
// with one parses the fonts for both. The Japanese text makes it load the JP font too.
const WARMUP_DOC = (
  <ReportPdf
    result={{
      executiveSummary: "예열 warmup 免疫サポート",
      productSummary: null,
      marketInsight: [],
      trends: [],
      buyers: [],
      recommendedActions: [],
      risks: [],
    }}
    meta={{ mode: "text", productName: "", keywords: "", market: "일본" }}
  />
);

function reply(res: PdfWorkerResponse) {
  self.postMessage(res);
}

self.onmessage = async (event: MessageEvent<PdfWorkerRequest>) => {
  const req = event.data;
  try {
    const doc =
      req.kind === "warmup" ? (
        WARMUP_DOC
      ) : req.kind === "intent" ? (
        <IntentReportPdf result={req.result} meta={req.meta} />
      ) : (
        <ReportPdf result={req.result} meta={req.meta} />
      );
    const blob = await pdf(doc).toBlob();
    reply({ id: req.id, ok: true, blob });
  } catch (err) {
    reply({ id: req.id, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
