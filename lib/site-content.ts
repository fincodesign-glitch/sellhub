import { put, get } from "@vercel/blob";

export interface NavItem {
  label: string;
  href: string;
}

export interface PricingPlan {
  key: string;
  name: string;
  price: string;
  period: string;
  credits: string;
  features: string[];
  cta: string;
  href: string;
  highlight: boolean;
}

export interface SiteContent {
  nav: NavItem[];
  plans: PricingPlan[];
}

const BLOB_PATHNAME = "site-content.json";

export const DEFAULT_SITE_CONTENT: SiteContent = {
  nav: [
    { label: "브랜드", href: "/brand" },
    { label: "요금제", href: "/pricing" },
  ],
  plans: [
    {
      key: "free",
      name: "Free",
      price: "무료",
      period: "",
      credits: "월 3회 분석",
      features: ["구매 Searching 분석", "Searching 분석 리포트", "해외 바이어 추천 최대 3곳"],
      cta: "무료로 시작하기",
      href: "/profile",
      highlight: false,
    },
    {
      key: "starter",
      name: "Starter",
      price: "39,000원",
      period: "/월",
      credits: "월 20회 분석",
      features: ["구매 Searching 분석", "Searching 분석 리포트", "해외 바이어 추천 최대 8곳", "키워드 트렌드 리포트"],
      cta: "Starter 문의하기",
      href: "mailto:support@sellhub.kr?subject=Starter 요금제 문의",
      highlight: false,
    },
    {
      key: "pro",
      name: "Pro",
      price: "79,000원",
      period: "/월",
      credits: "월 60회 분석",
      features: [
        "구매 Searching 분석",
        "Searching 분석 리포트",
        "해외 바이어 추천 최대 8곳",
        "키워드 트렌드 리포트",
        "분석 결과 저장 및 히스토리",
      ],
      cta: "Pro 문의하기",
      href: "mailto:support@sellhub.kr?subject=Pro 요금제 문의",
      highlight: true,
    },
    {
      key: "business",
      name: "Business",
      price: "가격 별도 문의",
      period: "",
      credits: "실행계획 분석",
      features: [
        "리포트 제공 (상세)",
        "실행계획 선택",
        "실행계획 별도 제안",
        "실행계획 최종 선택",
        "실행계획 실행 및 피드백",
      ],
      cta: "Business 문의하기",
      href: "mailto:support@sellhub.kr?subject=Business 요금제 문의",
      highlight: false,
    },
  ],
};

let cached: { content: SiteContent; fetchedAt: number } | null = null;
const CACHE_MS = 30_000;

// 관리자 페이지에 이미 저장된 예전 문구("인텐트 분석")나 카테고리("소개서")도
// 새 상태로 보이도록 불러올 때 보정한다.
function applyWording(content: SiteContent): SiteContent {
  return {
    ...content,
    nav: content.nav.filter((item) => item.label !== "소개서" && !item.href.endsWith(".pdf")),
    plans: content.plans.map((plan) => ({
      ...plan,
      features: plan.features.map((f) => f.replace(/인텐트 분석/g, "Searching 분석")),
    })),
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) {
    return cached.content;
  }
  try {
    const result = await get(BLOB_PATHNAME, { access: "private", useCache: false });
    if (!result || !result.stream) throw new Error("blob not found");
    const text = await new Response(result.stream).text();
    const content = applyWording(JSON.parse(text) as SiteContent);
    cached = { content, fetchedAt: Date.now() };
    return content;
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(content, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  cached = { content, fetchedAt: Date.now() };
}
