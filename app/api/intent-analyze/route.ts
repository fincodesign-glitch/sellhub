import type { NextRequest } from "next/server";
import { handleAnalyzeRequest, type AnalysisToolConfig } from "@/lib/analysis-engine";

export const runtime = "nodejs";
// 동남아시아처럼 여러 나라를 아우르는 시장은 조사에 시간이 더 걸려, 서버리스
// 함수의 최대 실행 시간을 명시적으로 늘려둔다 (플랜 상한을 넘으면 자동으로 clamp됨).
export const maxDuration = 300;

const REPORT_SCHEMA = {
  type: "object",
  properties: {
    executiveSummary: {
      type: "string",
      description: "리포트 전체를 요약하는 2~3문장 총평. PDF 리포트 맨 앞에 들어감.",
    },
    productSummary: {
      anyOf: [{ type: "string" }, { type: "null" }],
      description:
        "제품 URL이나 이미지에서 파악한 브랜드·성분·효능·가격·인증 요약. 텍스트 입력만 있었다면 null.",
    },
    marketInsight: {
      type: "array",
      items: { type: "string" },
      description: "목표 시장의 최근 동향·소비자 수요·경쟁 현황 불릿 3~5개",
    },
    trends: {
      type: "array",
      items: {
        type: "object",
        properties: {
          keyword: { type: "string" },
          relevance: { type: "string", enum: ["높음", "중간", "낮음"] },
          evidence: { type: "string" },
        },
        required: ["keyword", "relevance", "evidence"],
        additionalProperties: false,
      },
      description: "검색·SNS·뉴스에서 포착되는 구매 의도 키워드 트렌드",
    },
    buyers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nameLocal: { type: "string", description: "현지어 정식 회사명" },
          nameEn: { anyOf: [{ type: "string" }, { type: "null" }], description: "영문/로마자 표기" },
          country: { type: "string" },
          buyerType: { type: "string", description: "예: 리테일러, 수입사, 유통사, 온라인몰" },
          reasons: {
            type: "array",
            items: { type: "string" },
            description: "이 바이어를 추천하는 근거 1~2개, 실제 검색 결과에 기반",
          },
          detailedProfile: {
            type: "string",
            description:
              "이 바이어에 대한 2~3문장 상세 프로필 (사업 영역, 취급 카테고리, 규모, 유통 채널 등). PDF에만 노출.",
          },
          suggestedApproach: {
            type: "string",
            description: "이 바이어에게 어떻게 접근·제안하면 좋을지 1~2문장 구체적 제안. PDF에만 노출.",
          },
          website: { anyOf: [{ type: "string" }, { type: "null" }] },
          contactKnown: { type: "boolean", description: "이메일/연락처 정보를 실제로 확인했는지 여부" },
          sourceNote: { anyOf: [{ type: "string" }, { type: "null" }], description: "참고한 출처 요약" },
        },
        required: [
          "nameLocal",
          "nameEn",
          "country",
          "buyerType",
          "reasons",
          "detailedProfile",
          "suggestedApproach",
          "website",
          "contactKnown",
          "sourceNote",
        ],
        additionalProperties: false,
      },
      description: "관심을 가질 만한 현지 바이어 후보 최대 5곳",
    },
    recommendedActions: {
      type: "array",
      items: { type: "string" },
      description: "수출 담당자가 다음에 해야 할 실행 항목 4~6개, 우선순위 순으로. PDF에만 노출.",
    },
    risks: {
      type: "array",
      items: { type: "string" },
      description: "진출 시 주의해야 할 리스크·규제·문화적 고려사항 3~4개. PDF에만 노출.",
    },
  },
  required: [
    "executiveSummary",
    "productSummary",
    "marketInsight",
    "trends",
    "buyers",
    "recommendedActions",
    "risks",
  ],
  additionalProperties: false,
};

const SEARCHING_HUB: AnalysisToolConfig = {
  tool: "intent",
  logTag: "/api/intent-analyze",
  schema: REPORT_SCHEMA,
  systemPrompt: ({ market, searchLimit }) => `당신은 한국 기업의 ${market} 수출 마케팅을 지원하는 AI 마케팅 리서치 에이전트입니다. 담당자가 직접 발로 뛰며 찾아야 할 시장 조사를 대신 검색하고, "이 제품을 이 시장에서 어떻게 마케팅하면 좋을지" 전략을 제안하는 것이 당신의 핵심 역할입니다. 바이어 후보를 찾아주는 것도 중요하지만, 그보다 먼저 마케팅 방향(포지셔닝, 소구 포인트, 채널, 트렌드 활용법)을 명확히 제시하세요.
필요하면 web_search와 web_fetch 도구로 최신 정보를 조사한 뒤, 주어진 JSON 스키마 형식으로만 응답하세요.
이 데이터는 화면 요약과 PDF 상세 리포트 두 곳에 모두 쓰이므로, 짧은 필드(reasons 등)와 상세 필드(detailedProfile, recommendedActions 등)를 모두 충실히 채우세요.

- executiveSummary: 이 시장에서 어떤 마케팅 전략이 통할지에 초점을 맞춘 총평 2~3문장
- marketInsight: 목표 시장의 최근 동향·소비자 수요·경쟁 현황과 그것이 마케팅에 시사하는 바 (3~5개 불릿)
- trends: 검색·SNS·뉴스에서 포착되는 구매 의도 키워드 트렌드 — 마케팅 소재·카피에 활용할 수 있는 트렌드 위주로
- buyers: 관심을 가질 만한 ${market} 현지 수입사·유통사·온라인몰 후보 최대 5곳. 반드시 실제 검색 결과에 근거해서 작성하고, reasons에는 왜 이 회사를 추천하는지 근거를, detailedProfile에는 사업 영역·취급 카테고리·규모·유통 채널 등을 2~3문장으로, suggestedApproach에는 이 바이어에게 어떻게 접근하면 좋을지 구체적으로 작성하세요. 확인되지 않은 연락처를 지어내지 말고 contactKnown은 실제로 확인된 경우에만 true로 설정하세요.
- productSummary: URL이나 이미지 입력이 있을 때만 채우고, 텍스트만 입력된 경우 null로 두세요.
- recommendedActions: 마케팅 담당자가 다음에 해야 할 실행 항목 4~6개 (포지셔닝, 콘텐츠·채널 전략, 캠페인 아이디어 등 마케팅 액션 위주), 우선순위 순으로.
- risks: 이 시장에서 마케팅·진출 시 주의해야 할 리스크·규제·문화적 고려사항 3~4개.

조사는 효율적으로 진행하세요. 이 작업은 실행 시간 제한이 있으므로, 검색과 페이지 조회 횟수를 아껴야 합니다.
- 검색은 최대 ${searchLimit}회, 페이지 조회(web_fetch)는 최대 1회로 제한하고, 이미 조회했거나 검색에서 충분한 정보를 얻은 페이지는 다시 조회하지 마세요.
- 목표 시장이 여러 국가를 포함하는 지역(예: 동남아시아)인 경우, 모든 국가를 개별적으로 조사하지 마세요. 지역 전체를 다루는 검색 1~2회와, 그 중 가장 유망한 국가 1~2곳에 집중한 검색으로 조사를 마치세요.
- 핵심 정보(시장 동향, 트렌드 키워드, 바이어 후보)를 파악하는 데 필요한 만큼만 검색하고, 충분한 근거를 모았다면 즉시 검색을 멈추고 바로 최종 JSON을 작성하세요. marketInsight와 buyers는 절대 빈 배열로 두지 말고, 검색으로 찾은 실제 정보를 최대한 채워 넣으세요.

모든 텍스트는 한국어로 작성하세요. 고유명사(회사명·플랫폼명 등)는 한글 표기나 영문(로마자) 표기를 사용하고, 태국어·베트남어·인도네시아어 등 현지 문자를 원문 그대로 인용하지 마세요 (예: "Thairath" ○, "ไทยรัฐ" ×). 일본어 한자·가나는 예외적으로 그대로 인용해도 됩니다.`,
  task: (market) => `${market} 시장을 대신 검색해서 조사 리포트를 작성해줘.`,
  productSummaryDescription: "제품 URL이나 이미지에서 파악한 브랜드·성분·효능·용량·가격·인증 요약 3~4문장. 반드시 채울 것.",
};

export function POST(request: NextRequest) {
  return handleAnalyzeRequest(request, SEARCHING_HUB);
}
