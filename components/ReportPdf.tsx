import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { AnalysisResult, ReportMeta } from "@/lib/analysis-types";
import {
  BulletList,
  BuyerFooter,
  BuyerHeading,
  LabeledText,
  MixedText,
  NumberedList,
  ReportFooter,
  ReportHeader,
  RISK_COLOR,
  SELLHUB_PALETTE,
  SectionTitle,
  TrendRows,
  createReportStyles,
} from "@/components/ReportPdfKit";

const palette = SELLHUB_PALETTE;
const s = createReportStyles(palette);

export default function ReportPdf({
  result,
  meta,
}: {
  result: AnalysisResult;
  meta: ReportMeta;
}) {
  const generatedAt = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subjectLine =
    meta.mode === "url"
      ? meta.productUrl || meta.productName || "제공된 URL"
      : meta.productName || meta.keywords || "입력된 제품 정보";

  return (
    <Document
      title={`SellHub - ${meta.market} 바이어 & 제안 메일 리포트`}
      author="SellHub"
      subject={subjectLine}
    >
      <Page size="A4" style={s.page} wrap>
        <ReportHeader s={s} brand="SellHub" label={`${meta.market} 바이어 & 제안 메일 리포트`} generatedAt={generatedAt} />
        <ReportFooter s={s} text="SellHub · AI 수출 영업 비서 · 이 리포트는 AI가 공개 웹 정보를 조사해 자동 생성했습니다" />

        <Text style={s.title}>{meta.market} 바이어 & 제안 메일 리포트</Text>
        <MixedText
          style={s.subtitle}
          text={`${subjectLine} · 목표 시장: ${meta.market}${meta.keywords ? ` · 키워드: ${meta.keywords}` : ""}`}
        />

        <View style={s.summaryBox} wrap={false}>
          <MixedText style={s.summaryText} text={result.executiveSummary} />
        </View>

        {result.productSummary && (
          <View style={s.section}>
            <SectionTitle s={s}>제품 분석</SectionTitle>
            <MixedText style={s.bodyText} text={result.productSummary} />
          </View>
        )}

        {result.marketInsight.length > 0 && (
          <View style={s.section}>
            <SectionTitle s={s}>시장 인사이트</SectionTitle>
            <BulletList s={s} items={result.marketInsight} color={palette.brand} />
          </View>
        )}

        {result.trends.length > 0 && (
          <View style={s.section}>
            <SectionTitle s={s}>트렌드 & 키워드</SectionTitle>
            <TrendRows s={s} palette={palette} trends={result.trends} />
          </View>
        )}

        {result.buyers.length > 0 && (
          <View style={s.section}>
            <SectionTitle s={s}>{`바이어 후보 & 제안 메일 (${result.buyers.length}곳)`}</SectionTitle>
            {result.buyers.map((buyer, i) => (
              <View key={i} style={s.buyerCard}>
                <BuyerHeading
                  s={s}
                  index={i}
                  name={`${buyer.nameLocal}${buyer.nameEn ? `  (${buyer.nameEn})` : ""}`}
                  meta={`${buyer.country} · ${buyer.buyerType} · ${buyer.contactKnown ? "연락처 확인됨" : "연락처 미확인"}`}
                />

                <LabeledText s={s} label="프로필" text={buyer.detailedProfile} />

                <Text style={s.buyerLabel} minPresenceAhead={20}>
                  추천 근거
                </Text>
                <BulletList s={s} items={buyer.reasons} color={palette.brand} />

                <LabeledText s={s} label="제안 접근 방법" text={buyer.suggestedApproach} />

                <View wrap={false}>
                  <Text style={s.buyerLabel}>제안 메일 초안 (영문)</Text>
                  <View style={s.emailBox}>
                    <Text style={s.emailSubject}>Subject: {buyer.outreachEmailSubject}</Text>
                    <Text style={s.emailBody}>{buyer.outreachEmailBody}</Text>
                    <MixedText style={s.emailCoaching} text={`TIP  ${buyer.emailCoachingNote}`} />
                  </View>
                </View>

                <BuyerFooter s={s} sourceNote={buyer.sourceNote} website={buyer.website} />
              </View>
            ))}
          </View>
        )}

        {result.recommendedActions.length > 0 && (
          <View style={s.section}>
            <SectionTitle s={s}>추천 실행 계획</SectionTitle>
            <NumberedList s={s} items={result.recommendedActions} />
          </View>
        )}

        {result.risks.length > 0 && (
          <View style={s.section}>
            <SectionTitle s={s}>리스크 및 유의사항</SectionTitle>
            <View style={s.riskBox}>
              <BulletList s={s} items={result.risks} color={RISK_COLOR} />
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
