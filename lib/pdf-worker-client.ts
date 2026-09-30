import type { AnalysisResult, IntentAnalysisResult, ReportMeta } from "@/lib/analysis-types";

// Parsing the ~1.7MB of CJK font data and laying out the PDF blocks whatever
// thread runs it for 30+ seconds. On the main thread that froze the page and
// made Chrome show its "page unresponsive" dialog, so it runs in a worker.

export type PdfJob =
  | { kind: "report"; result: AnalysisResult; meta: ReportMeta }
  | { kind: "intent"; result: IntentAnalysisResult; meta: ReportMeta }
  | { kind: "warmup" };

export type PdfWorkerRequest = PdfJob & { id: number };
export type PdfWorkerResponse = { id: number; ok: true; blob: Blob } | { id: number; ok: false; error: string };

let worker: Worker | null = null;
let workerFailed = false;
let nextId = 0;
const pending = new Map<number, { resolve: (blob: Blob) => void; reject: (err: Error) => void }>();

function failWorker(reason: string) {
  workerFailed = true;
  worker?.terminate();
  worker = null;
  for (const job of pending.values()) job.reject(new Error(reason));
  pending.clear();
}

function getWorker(): Worker | null {
  if (workerFailed || typeof Worker === "undefined") return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL("../components/pdf.worker.tsx", import.meta.url));
  } catch (err) {
    console.error("[pdf-worker] could not start", err);
    workerFailed = true;
    return null;
  }
  worker.onmessage = (event: MessageEvent<PdfWorkerResponse>) => {
    const res = event.data;
    const job = pending.get(res.id);
    if (!job) return;
    pending.delete(res.id);
    if (res.ok) job.resolve(res.blob);
    else job.reject(new Error(res.error));
  };
  worker.onerror = (event) => {
    console.error("[pdf-worker] crashed", event.message);
    failWorker(event.message || "pdf worker crashed");
  };
  return worker;
}

function runInWorker(job: PdfJob): Promise<Blob> {
  const w = getWorker();
  if (!w) return Promise.reject(new Error("pdf worker unavailable"));
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({ ...job, id } satisfies PdfWorkerRequest);
  });
}

async function renderOnMainThread(job: Exclude<PdfJob, { kind: "warmup" }>): Promise<Blob> {
  const { pdf } = await import("@react-pdf/renderer");
  if (job.kind === "intent") {
    const { default: IntentReportPdf } = await import("@/components/IntentReportPdf");
    return pdf(IntentReportPdf({ result: job.result, meta: job.meta })).toBlob();
  }
  const { default: ReportPdf } = await import("@/components/ReportPdf");
  return pdf(ReportPdf({ result: job.result, meta: job.meta })).toBlob();
}

/** Builds the PDF off the main thread; falls back to the main thread only if the worker can't be used. */
export async function renderPdf(job: Exclude<PdfJob, { kind: "warmup" }>): Promise<Blob> {
  try {
    return await runInWorker(job);
  } catch (err) {
    console.error("[pdf-worker] falling back to main thread", err);
    workerFailed = true;
    return renderOnMainThread(job);
  }
}

let warmed = false;

/**
 * Parses the CJK fonts in the worker while the user waits for the analysis,
 * so the later download click doesn't pay that cost. Never falls back to the
 * main thread — that would reintroduce the page freeze this exists to avoid.
 */
export function warmPdfFonts() {
  if (warmed) return;
  warmed = true;
  runInWorker({ kind: "warmup" }).catch(() => {});
}
