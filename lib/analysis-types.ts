export type Relevance = "높음" | "중간" | "낮음";

export interface Trend {
  keyword: string;
  relevance: Relevance;
  evidence: string;
}

export interface Buyer {
  nameLocal: string;
  nameEn: string | null;
  country: string;
  buyerType: string;
  reasons: string[];
  detailedProfile: string;
  suggestedApproach: string;
  outreachEmailSubject: string;
  outreachEmailBody: string;
  emailCoachingNote: string;
  website: string | null;
  contactKnown: boolean;
  sourceNote: string | null;
}

export interface AnalysisResult {
  executiveSummary: string;
  productSummary: string | null;
  marketInsight: string[];
  trends: Trend[];
  buyers: Buyer[];
  recommendedActions: string[];
  risks: string[];
}

export interface ReportMeta {
  productName: string;
  keywords: string;
  market: string;
  mode: "text" | "url" | "image";
  productUrl?: string;
}

/** "인텐트 마케팅" 도구 전용 타입. 제안 메일 없이 시장 인사이트·트렌드·바이어 추천에 집중한다. */
export interface IntentBuyer {
  nameLocal: string;
  nameEn: string | null;
  country: string;
  buyerType: string;
  reasons: string[];
  detailedProfile: string;
  suggestedApproach: string;
  website: string | null;
  contactKnown: boolean;
  sourceNote: string | null;
}

export interface IntentAnalysisResult {
  executiveSummary: string;
  productSummary: string | null;
  marketInsight: string[];
  trends: Trend[];
  buyers: IntentBuyer[];
  recommendedActions: string[];
  risks: string[];
}
