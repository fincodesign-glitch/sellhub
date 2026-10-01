"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { AnalysisResult, IntentAnalysisResult, ReportMeta } from "@/lib/analysis-types";
import { warmPdfFonts } from "@/lib/pdf-worker-client";

// Holds the SellHub and Searching Hub analyses above the pages (in the root
// layout), so an analysis keeps running and its result stays put while the user
// moves between pages. A copy is kept in localStorage so a refresh or a full
// page load can reconnect to the server-side job, and a finished result is shown
// again for RESULT_TTL_MS after it completed. Each tool has its own store.

export type AnalysisTool = "sellhub" | "intent";
export type AnalysisStatus = "idle" | "running" | "done" | "error";
type AnyResult = AnalysisResult | IntentAnalysisResult;

const TOOLS: Record<AnalysisTool, { endpoint: string; storageKey: string }> = {
  sellhub: { endpoint: "/api/analyze", storageKey: "sellhub.analysis.v1" },
  intent: { endpoint: "/api/intent-analyze", storageKey: "searchinghub.analysis.v1" },
};

export interface AnalysisPayload {
  mode: ReportMeta["mode"];
  productName: string;
  keywords: string;
  market: string;
  productUrl?: string;
  imageBase64?: string;
  imageMediaType?: string;
}

interface AnalysisState<R> {
  status: AnalysisStatus;
  progressLog: string[];
  result: R | null;
  meta: ReportMeta | null;
  error: string | null;
  /** Set when a signed-in account's result was saved to My Page. */
  savedReportId: string | null;
  completedAt: number | null;
}

interface Persisted {
  jobId: string | null;
  status: "running" | "done" | "error";
  startedAt: number;
  completedAt?: number;
  meta: ReportMeta;
  progressLog: string[];
  result?: AnyResult;
  savedReportId?: string | null;
}

type StreamEvent =
  | { type: "job"; jobId: string }
  | { type: "progress"; label: string }
  | { type: "result"; data: AnyResult }
  | { type: "error"; message: string }
  | { type: "saved"; reportId: string };

export const RESULT_TTL_MS = 3 * 60 * 1000;
// The server stops a job at 280s (route maxDuration 300s); past this a job that
// never reported back is treated as lost.
const MAX_RUN_MS = 6 * 60 * 1000;
const POLL_MS = 4000;

const IDLE: AnalysisState<AnyResult> = {
  status: "idle",
  progressLog: [],
  result: null,
  meta: null,
  error: null,
  savedReportId: null,
  completedAt: null,
};

function readStored(key: string): Persisted | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch {
    return null;
  }
}

function writeStored(key: string, value: Persisted | null) {
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch {
    // Storage unavailable (private mode etc.) — in-app navigation still works.
  }
}

type AnalysisContextValue<R> = AnalysisState<R> & {
  startAnalysis: (payload: AnalysisPayload, meta: ReportMeta) => void;
  reset: () => void;
  /** Clears a finished result once it is older than RESULT_TTL_MS. */
  expireStaleResult: () => void;
};

const contexts = {
  sellhub: createContext<AnalysisContextValue<AnyResult> | null>(null),
  intent: createContext<AnalysisContextValue<AnyResult> | null>(null),
};

export function AnalysisProvider({ tool, children }: { tool: AnalysisTool; children: React.ReactNode }) {
  const { endpoint, storageKey } = TOOLS[tool];
  const Context = contexts[tool];
  const [state, setState] = useState<AnalysisState<AnyResult>>(IDLE);
  const runIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const finish = useCallback(
    (runId: number, outcome: { result: AnyResult; savedReportId?: string } | { error: string }) => {
      if (runIdRef.current !== runId) return;
      const completedAt = Date.now();
      const stored = readStored(storageKey);
      if ("result" in outcome) {
        const savedReportId = outcome.savedReportId;
        setState((s) => ({
          ...s,
          status: "done",
          result: outcome.result,
          error: null,
          completedAt,
          savedReportId: savedReportId ?? s.savedReportId,
        }));
        if (stored) {
          writeStored(storageKey, {
            ...stored,
            status: "done",
            completedAt,
            result: outcome.result,
            savedReportId: savedReportId ?? stored.savedReportId,
          });
        }
      } else {
        setState((s) => ({ ...s, status: "error", error: outcome.error, completedAt }));
        writeStored(storageKey, null);
      }
    },
    [storageKey],
  );

  const pollJob = useCallback(
    async (runId: number, jobId: string, startedAt: number) => {
      while (runIdRef.current === runId) {
        if (Date.now() - startedAt > MAX_RUN_MS) {
          finish(runId, { error: "분석이 중간에 중단되었습니다. 다시 시도해주세요." });
          return;
        }
        try {
          const res = await fetch(`/api/analyze/jobs/${jobId}`, { cache: "no-store" });
          const data = (await res.json()) as
            | { status: "pending" }
            | { status: "done"; result: AnyResult; reportId?: string }
            | { status: "error"; message: string };
          if (data.status === "done") return finish(runId, { result: data.result, savedReportId: data.reportId });
          if (data.status === "error") return finish(runId, { error: data.message });
        } catch {
          // Network hiccup — keep polling until MAX_RUN_MS.
        }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    },
    [finish],
  );

  // Restore after a refresh or a full page load.
  useEffect(() => {
    const stored = readStored(storageKey);
    if (!stored) return;
    const now = Date.now();
    if (stored.status === "done" && stored.result && stored.completedAt && now - stored.completedAt < RESULT_TTL_MS) {
      setState({
        status: "done",
        progressLog: stored.progressLog,
        result: stored.result,
        meta: stored.meta,
        error: null,
        savedReportId: stored.savedReportId ?? null,
        completedAt: stored.completedAt,
      });
      return;
    }
    if (stored.status === "running" && stored.jobId && now - stored.startedAt < MAX_RUN_MS) {
      const runId = ++runIdRef.current;
      setState({
        ...IDLE,
        status: "running",
        meta: stored.meta,
        progressLog: [...stored.progressLog.slice(-4), "🔄 진행 중인 분석에 다시 연결했습니다..."],
      });
      void pollJob(runId, stored.jobId, stored.startedAt);
      return;
    }
    writeStored(storageKey, null);
  }, [pollJob, storageKey]);

  const startAnalysis = useCallback(
    (payload: AnalysisPayload, meta: ReportMeta) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const runId = ++runIdRef.current;
      const startedAt = Date.now();
      let persisted: Persisted = { jobId: null, status: "running", startedAt, meta, progressLog: [] };
      writeStored(storageKey, persisted);
      setState({ ...IDLE, status: "running", meta });
      // Parse the CJK fonts in the PDF worker during the analysis, so the
      // download click later doesn't have to.
      warmPdfFonts();

      void (async () => {
        let sawFinal = false;
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          if (!res.ok || !res.body) {
            const text = await res.text().catch(() => "");
            return finish(runId, { error: text || "리포트 생성 요청에 실패했습니다." });
          }
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
              if (!line.trim() || runIdRef.current !== runId) continue;
              let event: StreamEvent;
              try {
                event = JSON.parse(line) as StreamEvent;
              } catch {
                continue;
              }
              if (event.type === "job") {
                persisted = { ...persisted, jobId: event.jobId };
                writeStored(storageKey, persisted);
              } else if (event.type === "progress") {
                persisted = { ...persisted, progressLog: [...persisted.progressLog.slice(-4), event.label] };
                writeStored(storageKey, persisted);
                setState((s) => ({ ...s, progressLog: persisted.progressLog }));
              } else if (event.type === "result") {
                sawFinal = true;
                finish(runId, { result: event.data });
              } else if (event.type === "error") {
                sawFinal = true;
                finish(runId, { error: event.message });
              } else if (event.type === "saved") {
                setState((s) => ({ ...s, savedReportId: event.reportId }));
                const stored = readStored(storageKey);
                if (stored) writeStored(storageKey, { ...stored, savedReportId: event.reportId });
              }
            }
          }
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
        }
        // The connection dropped before the job reported back — the server job
        // keeps running, so wait for its outcome instead of failing.
        if (!sawFinal && runIdRef.current === runId) {
          if (persisted.jobId) await pollJob(runId, persisted.jobId, startedAt);
          else finish(runId, { error: "리포트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
        }
      })();
    },
    [endpoint, finish, pollJob, storageKey],
  );

  const reset = useCallback(() => {
    runIdRef.current++;
    abortRef.current?.abort();
    writeStored(storageKey, null);
    setState(IDLE);
  }, [storageKey]);

  const expireStaleResult = useCallback(() => {
    setState((s) => {
      if (s.status === "done" && s.completedAt && Date.now() - s.completedAt >= RESULT_TTL_MS) {
        writeStored(storageKey, null);
        return IDLE;
      }
      return s;
    });
  }, [storageKey]);

  return <Context.Provider value={{ ...state, startAnalysis, reset, expireStaleResult }}>{children}</Context.Provider>;
}

function useToolAnalysis<R extends AnyResult>(tool: AnalysisTool) {
  const ctx = useContext(contexts[tool]);
  if (!ctx) throw new Error(`analysis store "${tool}" is missing — wrap the app in <AnalysisProvider tool="${tool}">`);
  return ctx as AnalysisContextValue<R>;
}

/** SellHub buyer analysis (/profile). */
export const useAnalysis = () => useToolAnalysis<AnalysisResult>("sellhub");
/** Searching Hub market research (/intent). */
export const useIntentAnalysis = () => useToolAnalysis<IntentAnalysisResult>("intent");
