import Anthropic from "@anthropic-ai/sdk";
import type { ContentBlockParam } from "@anthropic-ai/sdk/resources/messages";
import { after, type NextRequest } from "next/server";
import { newId, saveJobOutcome, saveReport, type AnyAnalysisResult, type ReportTool } from "@/lib/analysis-jobs";
import type { ReportMeta } from "@/lib/analysis-types";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/user-auth";

// Server-only: the request → AI research → result flow shared by SellHub
// (/api/analyze) and Searching Hub (/api/intent-analyze). Each analysis runs as
// a job that is not tied to the HTTP response: if the browser refreshes or
// leaves, `after()` keeps the function alive until the job finishes and its
// outcome (plus a My Page report for signed-in accounts) is saved.

const client = new Anthropic();

export type InputMode = "text" | "url" | "image";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];
const MAX_IMAGE_BASE64_LENGTH = 7_000_000; // ~5MB decoded

// Searches and page fetches dominate the run time. Image input already spends
// time reading the image, so it gets one fewer search.
const SEARCH_LIMIT: Record<InputMode, number> = { text: 3, url: 3, image: 2 };
// The route's maxDuration is 300s; stop a bit earlier so the user gets an
// explicit timeout message instead of a silently cut connection.
const DEADLINE_MS = 280_000;

export interface AnalysisToolConfig {
  tool: ReportTool;
  logTag: string;
  /** JSON schema of the result; its productSummary is made required for URL/image input. */
  schema: { properties: Record<string, unknown> } & Record<string, unknown>;
  systemPrompt: (ctx: { market: string; searchLimit: number }) => string;
  /** What to do with the product info, e.g. "일본 시장의 바이어를 찾고 ..." */
  task: (market: string) => string;
  productSummaryDescription: string;
}

interface AnalyzeRequestBody {
  mode?: InputMode;
  productName?: string;
  keywords?: string;
  market?: string;
  productUrl?: string;
  imageBase64?: string;
  imageMediaType?: string;
}

type FinalEvent = { type: "result"; data: AnyAnalysisResult } | { type: "error"; message: string };
type StreamEvent =
  | FinalEvent
  | { type: "job"; jobId: string }
  | { type: "progress"; label: string }
  | { type: "saved"; reportId: string };

const plainError = (message: string, status: number) => new Response(message, { status });

export async function handleAnalyzeRequest(request: NextRequest, config: AnalysisToolConfig): Promise<Response> {
  const sessionUser = getSessionUser(request);
  // Master skips the per-IP cap; the overall hourly cap still protects API spend.
  const rateLimit = checkRateLimit(getClientIp(request), { skipPerIp: sessionUser?.plan === "master" });
  if (!rateLimit.allowed) {
    return plainError(`요청이 너무 많습니다. ${rateLimit.retryAfterMinutes}분 후 다시 시도해주세요.`, 429);
  }

  let body: AnalyzeRequestBody;
  try {
    body = await request.json();
  } catch {
    return plainError("Invalid JSON body", 400);
  }

  const mode: InputMode = body.mode === "url" || body.mode === "image" ? body.mode : "text";
  const productName = (body.productName ?? "").trim();
  const keywords = (body.keywords ?? "").trim();
  const market = (body.market ?? "일본").trim() || "일본";
  const productUrl = (body.productUrl ?? "").trim();
  const imageBase64 = body.imageBase64 ?? "";
  const imageMediaType = body.imageMediaType ?? "";
  const searchLimit = SEARCH_LIMIT[mode];

  if (mode === "text" && !productName && !keywords) {
    return plainError("productName 또는 keywords 중 하나는 필수입니다.", 400);
  }
  if (mode === "url") {
    if (!productUrl) return plainError("productUrl이 필요합니다.", 400);
    try {
      const parsed = new URL(productUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return plainError("http/https URL만 지원합니다.", 400);
      }
    } catch {
      return plainError("올바른 URL 형식이 아닙니다.", 400);
    }
  }
  if (mode === "image") {
    if (!imageBase64 || !ALLOWED_IMAGE_TYPES.includes(imageMediaType as AllowedImageType)) {
      return plainError("jpeg/png/gif/webp 형식의 이미지가 필요합니다.", 400);
    }
    if (imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
      return plainError("이미지 용량이 너무 큽니다 (최대 5MB).", 400);
    }
  }

  const reference = `${productName ? `참고 제품/브랜드명: ${productName}\n` : ""}${keywords ? `참고 키워드: ${keywords}\n` : ""}목표 시장: ${market}`;
  const content: ContentBlockParam[] = [];
  let instructionText: string;
  if (mode === "image") {
    content.push({
      type: "image",
      source: { type: "base64", media_type: imageMediaType as AllowedImageType, data: imageBase64 },
    });
    instructionText = `첨부한 제품 상세페이지 이미지를 분석해 브랜드·성분·효능·가격·인증 정보를 먼저 파악해줘.
${reference}

이미지에서 파악한 제품 정보를 바탕으로 ${config.task(market)}`;
  } else if (mode === "url") {
    instructionText = `아래 제품 페이지 URL을 web_fetch 도구로 먼저 확인해 브랜드·성분·효능·가격 등 제품 정보를 파악해줘.
제품 페이지 URL: ${productUrl}
${reference}

파악한 제품 정보를 바탕으로 ${config.task(market)}`;
  } else {
    instructionText = `제품/브랜드명: ${productName || "(미입력)"}
핵심 키워드: ${keywords || "(미입력)"}
목표 시장: ${market}

위 정보를 바탕으로 ${config.task(market)}`;
  }
  content.push({ type: "text", text: instructionText });

  // With a product URL or detail-page image the product summary is the point of
  // the input, so it is required instead of nullable — otherwise the model
  // sometimes left it empty and the "제품 분석" section never appeared.
  const schema =
    mode === "text"
      ? config.schema
      : {
          ...config.schema,
          properties: {
            ...config.schema.properties,
            productSummary: { type: "string", description: config.productSummaryDescription },
          },
        };

  const meta: ReportMeta = { mode, productName, keywords, market, productUrl };
  const jobId = newId();
  const encoder = new TextEncoder();

  let streamController: ReadableStreamDefaultController<Uint8Array> | null = null;
  const emit = (event: StreamEvent) => {
    if (!streamController) return;
    try {
      streamController.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
    } catch {
      streamController = null;
    }
  };

  async function runAnalysis(): Promise<FinalEvent> {
    let timedOut = false;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    try {
      const claudeStream = client.messages.stream({
        model: "claude-sonnet-5",
        max_tokens: 20000,
        system: config.systemPrompt({ market, searchLimit }),
        output_config: { effort: "low", format: { type: "json_schema", schema } },
        tools: [
          { type: "web_search_20260209", name: "web_search", max_uses: searchLimit },
          { type: "web_fetch_20260209", name: "web_fetch", max_uses: 1 },
        ],
        messages: [{ role: "user", content }],
      });
      deadline = setTimeout(() => {
        timedOut = true;
        claudeStream.abort();
      }, DEADLINE_MS);

      const seenQueries = new Set<string>();
      claudeStream.on("contentBlock", (block) => {
        if (block.type !== "server_tool_use") return;
        if (block.name === "web_search") {
          const query = String((block.input as { query?: string })?.query ?? "").slice(0, 80);
          if (query && !seenQueries.has(query)) {
            seenQueries.add(query);
            emit({ type: "progress", label: `🔎 웹 검색 중: "${query}"` });
          }
        } else if (block.name === "web_fetch") {
          const url = String((block.input as { url?: string })?.url ?? "").slice(0, 100);
          if (url) emit({ type: "progress", label: `📄 페이지 확인 중: ${url}` });
        }
      });

      const finalMessage = await claudeStream.finalMessage();

      if (finalMessage.stop_reason === "refusal") {
        return { type: "error", message: "안전 정책으로 인해 리포트 생성이 거부되었습니다. 다른 입력으로 다시 시도해주세요." };
      }
      if (finalMessage.stop_reason === "max_tokens") {
        console.error(`[${config.logTag}] truncated at max_tokens`, finalMessage.usage);
        return { type: "error", message: "리포트가 완성되기 전에 응답 길이 제한에 도달했습니다. 다시 시도해주세요." };
      }

      emit({ type: "progress", label: "📝 리포트 정리 중..." });

      const textBlock = finalMessage.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        return { type: "error", message: "리포트 생성에 실패했습니다. 다시 시도해주세요." };
      }
      const data = JSON.parse(textBlock.text) as AnyAnalysisResult;
      if ((data.marketInsight?.length ?? 0) === 0 && (data.buyers?.length ?? 0) === 0) {
        console.error(`[${config.logTag}] empty result`, finalMessage.stop_reason, finalMessage.usage);
        return {
          type: "error",
          message: "이번 조사에서 충분한 정보를 찾지 못했습니다. 키워드를 조금 더 구체적으로 입력해 다시 시도해주세요.",
        };
      }
      return { type: "result", data };
    } catch (err) {
      console.error(`[${config.logTag}]`, timedOut ? "timed out" : "", err);
      return {
        type: "error",
        message: timedOut
          ? "리포트 생성 시간이 너무 오래 걸려 중단됐습니다. 키워드를 조금 더 간단히 해서 다시 시도해주세요."
          : "리포트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      };
    } finally {
      clearTimeout(deadline);
    }
  }

  const job = (async () => {
    const final = await runAnalysis();
    emit(final);
    const completedAt = new Date().toISOString();
    try {
      // Save the report first so the job outcome can point to it — a browser that
      // reconnects after a refresh learns about the saved report from the outcome.
      let reportId: string | undefined;
      if (final.type === "result" && sessionUser) {
        reportId = newId();
        await saveReport(sessionUser.id, { id: reportId, tool: config.tool, createdAt: completedAt, meta, result: final.data });
        emit({ type: "saved", reportId });
      }
      await saveJobOutcome(
        jobId,
        final.type === "result"
          ? { status: "done", completedAt, result: final.data, reportId }
          : { status: "error", completedAt, message: final.message },
      );
    } catch (err) {
      console.error(`[${config.logTag}] could not persist job outcome`, err);
    }
  })();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      streamController = controller;
      emit({ type: "job", jobId });
      job.finally(() => {
        try {
          streamController?.close();
        } catch {}
        streamController = null;
      });
    },
    cancel() {
      streamController = null;
    },
  });

  after(() => job);

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
