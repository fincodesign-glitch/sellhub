import { randomBytes } from "crypto";
import { get, list, put } from "@vercel/blob";
import type { AnalysisResult, ReportMeta } from "@/lib/analysis-types";

// Server-only: analysis job outcomes (so a browser that refreshed or navigated
// away mid-analysis can pick the result up) and saved reports for signed-in
// accounts (My Page). Both are private JSON files in Vercel Blob.

export type JobOutcome =
  | { status: "done"; completedAt: string; result: AnalysisResult }
  | { status: "error"; completedAt: string; message: string };

export interface SavedReport {
  id: string;
  createdAt: string;
  meta: ReportMeta;
  result: AnalysisResult;
}

export interface SavedReportSummary {
  id: string;
  createdAt: string;
  meta: ReportMeta;
  buyerCount: number;
}

const ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
export const isValidId = (id: string) => ID_PATTERN.test(id);

export const newId = () => randomBytes(12).toString("base64url");

async function readJson<T>(pathname: string): Promise<T | null> {
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return JSON.parse(await new Response(result.stream).text()) as T;
}

async function writeJson(pathname: string, value: unknown) {
  await put(pathname, JSON.stringify(value), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

const jobPath = (jobId: string) => `jobs/${jobId}.json`;
const reportPrefix = (userId: string) => `reports/${userId}/`;

export async function saveJobOutcome(jobId: string, outcome: JobOutcome) {
  await writeJson(jobPath(jobId), outcome);
}

export async function getJobOutcome(jobId: string): Promise<JobOutcome | null> {
  return readJson<JobOutcome>(jobPath(jobId));
}

export async function saveReport(userId: string, report: SavedReport) {
  await writeJson(`${reportPrefix(userId)}${report.id}.json`, report);
}

export async function getReport(userId: string, reportId: string): Promise<SavedReport | null> {
  return readJson<SavedReport>(`${reportPrefix(userId)}${reportId}.json`);
}

export async function listReports(userId: string, limit = 30): Promise<SavedReportSummary[]> {
  const { blobs } = await list({ prefix: reportPrefix(userId), limit: 1000 });
  const newest = blobs
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, limit);
  const reports = await Promise.all(newest.map((b) => readJson<SavedReport>(b.pathname).catch(() => null)));
  return reports
    .filter((r): r is SavedReport => r !== null)
    .map((r) => ({ id: r.id, createdAt: r.createdAt, meta: r.meta, buyerCount: r.result.buyers.length }));
}
