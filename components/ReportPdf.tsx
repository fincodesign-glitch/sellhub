import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { AnalysisResult, ReportMeta } from "@/lib/analysis-types";
import { segmentByScript } from "@/lib/pdf-text-segments";

Font.register({
  family: "Noto Sans KR",
  fonts: [
    { src: "/fonts/NotoSansKR-Regular.woff", fontWeight: "normal" },
    { src: "/fonts/NotoSansKR-Bold.woff", fontWeight: "bold" },
  ],
});

// AI-generated content is Korean prose that frequently quotes Japanese search
// terms (e.g. buyer names, trend keywords) — Noto Sans KR has no
// hiragana/katakana glyphs, so those runs need a Japanese font instead.
// MixedText below splits each string by script and renders each run with the
// font that actually has its glyphs.
Font.register({
  family: "Noto Sans JP",
  fonts: [
    { src: "/fonts/NotoSansJP-Regular.woff", fontWeight: "normal" },
    { src: "/fonts/NotoSansJP-Bold.woff", fontWeight: "bold" },
  ],
});

// react-pdf can't auto-hyphenate/break Korean text well with its default
// word-based algorithm; disable hyphenation so long words wrap on character
// boundaries instead of overflowing.
Font.registerHyphenationCallback((word) => [word]);

function MixedText({ text, style }: { text: string; style?: Style | Style[] }) {
  const segments = segmentByScript(text);
  return (
    <Text style={style}>
      {segments.map((seg, i) => (
        <Text key={i} style={{ fontFamily: seg.font === "jp" ? "Noto Sans JP" : "Noto Sans KR" }}>
          {seg.text}
        </Text>
      ))}
    </Text>
  );
}

const BRAND = "#4fa8dd";
const BRAND_DARK = "#2f7fb3";
const INK = "#1c1b29";
const INK2 = "#5c5a72";
const MUTED = "#8b899e";
const LINE = "#dcecf6";
const SURFACE2 = "#f5f9fc";
const BRAND_BG = "#eef7fd";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Noto Sans KR",
    fontSize: 9.5,
    color: INK,
    padding: "36pt 40pt 56pt",
    lineHeight: 1.55,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 12,
    borderBottom: `1.5pt solid ${BRAND}`,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandMark: {
    width: 20,
    height: 20,
    backgroundColor: BRAND,
    borderRadius: 5,
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 4,
  },
  brandName: { fontSize: 13, fontWeight: "bold", color: INK },
  metaText: { fontSize: 8, color: MUTED, textAlign: "right" },
  title: { fontSize: 19, fontWeight: "bold", color: INK, marginBottom: 12 },
  subtitle: { fontSize: 10.5, color: INK2, marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: INK,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: `0.75pt solid ${LINE}`,
  },
  summaryBox: {
    backgroundColor: BRAND_BG,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  summaryText: { fontSize: 10, color: INK, lineHeight: 1.6 },
  bulletRow: { flexDirection: "row", marginBottom: 5, gap: 6 },
  bulletDot: { fontSize: 9.5, color: BRAND, width: 8 },
  bulletDotShape: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: BRAND,
    marginTop: 4.5,
  },
  riskDotShape: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#c2410c",
    marginTop: 4.5,
  },
  bulletText: { fontSize: 9.5, color: INK2, flex: 1, lineHeight: 1.55 },
  trendRow: {
    flexDirection: "row",
    borderBottom: `0.5pt solid ${LINE}`,
    paddingVertical: 6,
    gap: 8,
  },
  trendBadge: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: BRAND,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    width: 34,
    textAlign: "center",
  },
  trendKeyword: { fontSize: 9.5, fontWeight: "bold", width: 130 },
  trendEvidence: { fontSize: 9, color: INK2, flex: 1, lineHeight: 1.5 },
  buyerCard: {
    borderRadius: 6,
    border: `0.75pt solid ${LINE}`,
    padding: 11,
    marginBottom: 10,
  },
  buyerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  buyerName: { fontSize: 11, fontWeight: "bold", color: INK },
  buyerIndexBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: BRAND_DARK,
    alignItems: "center",
    justifyContent: "center",
  },
  buyerIndexText: { fontSize: 8.5, color: "#ffffff", lineHeight: 1 },
  buyerMeta: { fontSize: 8, color: MUTED, marginBottom: 6 },
  buyerLabel: { fontSize: 8, fontWeight: "bold", color: BRAND_DARK, marginTop: 5, marginBottom: 2 },
  buyerText: { fontSize: 9, color: INK2, lineHeight: 1.55 },
  buyerFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
    paddingTop: 6,
    borderTop: `0.5pt solid ${LINE}`,
  },
  buyerFooterText: { fontSize: 7.5, color: MUTED },
  buyerFooterLink: { fontSize: 7.5, color: BRAND },
  emailBox: {
    backgroundColor: BRAND_BG,
    borderRadius: 6,
    borderLeft: `2pt solid ${BRAND}`,
    padding: 9,
    marginTop: 3,
  },
  emailSubject: { fontSize: 9, fontWeight: "bold", color: INK, marginBottom: 4 },
  emailBody: { fontSize: 8.5, color: INK2, lineHeight: 1.55 },
  // Noto Sans KR/JP have no italic variant registered — react-pdf can't
  // synthesize one, so fontStyle: "italic" here crashes PDF generation for
  // every report that has a buyer (i.e. always). Color/weight already set
  // this text apart from the surrounding email body, so italic isn't needed.
  emailCoaching: { fontSize: 8, color: BRAND_DARK, fontWeight: "bold", marginTop: 5 },
  actionRow: { flexDirection: "row", marginBottom: 6, gap: 7 },
  actionIndexBadge: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIndexText: { fontSize: 7, fontWeight: "bold", color: "#ffffff", lineHeight: 1 },
  actionText: { fontSize: 9.5, color: INK, flex: 1, lineHeight: 1.5 },
  riskBox: {
    backgroundColor: SURFACE2,
    borderRadius: 6,
    padding: 10,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `0.5pt solid ${LINE}`,
    paddingTop: 6,
  },
  footerText: { fontSize: 7.5, color: MUTED },
});

function SectionHeader({ meta, generatedAt }: { meta: ReportMeta; generatedAt: string }) {
  return (
    <View style={styles.headerRow} fixed>
      <View style={styles.brandRow}>
        <Text style={styles.brandMark}>S</Text>
        <Text style={styles.brandName}>SellHub</Text>
      </View>
      <Text style={styles.metaText}>
        {meta.market} 인텐트 분석 리포트{"\n"}
        생성일: {generatedAt}
      </Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>SellHub · AI 수출 영업 비서 · 이 리포트는 AI가 공개 웹 정보를 조사해 자동 생성했습니다</Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

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
      <Page size="A4" style={styles.page} wrap>
        <SectionHeader meta={meta} generatedAt={generatedAt} />

        <Text style={styles.title}>{meta.market} 바이어 & 제안 메일 리포트</Text>
        <MixedText
          style={styles.subtitle}
          text={`${subjectLine} · 목표 시장: ${meta.market}${meta.keywords ? ` · 키워드: ${meta.keywords}` : ""}`}
        />

        <View style={styles.summaryBox}>
          <MixedText style={styles.summaryText} text={result.executiveSummary} />
        </View>

        {result.productSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>제품 분석</Text>
            <MixedText style={styles.buyerText} text={result.productSummary} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>시장 인사이트</Text>
          {result.marketInsight.map((point, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={{ width: 8 }}>
                <View style={styles.bulletDotShape} />
              </View>
              <MixedText style={styles.bulletText} text={point} />
            </View>
          ))}
        </View>

        {result.trends.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>트렌드 & 키워드</Text>
            {result.trends.map((trend, i) => (
              <View key={i} style={styles.trendRow} wrap={false}>
                <Text style={styles.trendBadge}>{trend.relevance}</Text>
                <MixedText style={styles.trendKeyword} text={trend.keyword} />
                <MixedText style={styles.trendEvidence} text={trend.evidence} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>바이어 후보 & 제안 메일 ({result.buyers.length}곳)</Text>
          {result.buyers.map((buyer, i) => (
            <View key={i} style={styles.buyerCard} wrap={false}>
              <View style={styles.buyerHeaderRow}>
                <MixedText
                  style={styles.buyerName}
                  text={`${buyer.nameLocal}${buyer.nameEn ? `  (${buyer.nameEn})` : ""}`}
                />
                <View style={styles.buyerIndexBadge}>
                  <Text style={styles.buyerIndexText}>{String(i + 1)}</Text>
                </View>
              </View>
              <MixedText
                style={styles.buyerMeta}
                text={`${buyer.country} · ${buyer.buyerType}${buyer.contactKnown ? " · 연락처 확인됨" : " · 연락처 미확인"}`}
              />

              <Text style={styles.buyerLabel}>프로필</Text>
              <MixedText style={styles.buyerText} text={buyer.detailedProfile} />

              <Text style={styles.buyerLabel}>추천 근거</Text>
              {buyer.reasons.map((reason, ri) => (
                <View key={ri} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>·</Text>
                  <MixedText style={styles.bulletText} text={reason} />
                </View>
              ))}

              <Text style={styles.buyerLabel}>제안 접근 방법</Text>
              <MixedText style={styles.buyerText} text={buyer.suggestedApproach} />

              <Text style={styles.buyerLabel}>제안 메일 초안 (영문)</Text>
              <View style={styles.emailBox}>
                <Text style={styles.emailSubject}>Subject: {buyer.outreachEmailSubject}</Text>
                <Text style={styles.emailBody}>{buyer.outreachEmailBody}</Text>
                <MixedText style={styles.emailCoaching} text={`TIP  ${buyer.emailCoachingNote}`} />
              </View>

              <View style={styles.buyerFooterRow}>
                <MixedText
                  style={styles.buyerFooterText}
                  text={buyer.sourceNote ? `출처: ${buyer.sourceNote}` : ""}
                />
                {buyer.website && <Text style={styles.buyerFooterLink}>{buyer.website}</Text>}
              </View>
            </View>
          ))}
        </View>

        {result.recommendedActions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>추천 실행 계획</Text>
            {result.recommendedActions.map((action, i) => (
              <View key={i} style={styles.actionRow}>
                <View style={styles.actionIndexBadge}>
                  <Text style={styles.actionIndexText}>{String(i + 1)}</Text>
                </View>
                <MixedText style={styles.actionText} text={action} />
              </View>
            ))}
          </View>
        )}

        {result.risks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>리스크 및 유의사항</Text>
            <View style={styles.riskBox}>
              {result.risks.map((risk, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={{ width: 8 }}>
                    <View style={styles.riskDotShape} />
                  </View>
                  <MixedText style={styles.bulletText} text={risk} />
                </View>
              ))}
            </View>
          </View>
        )}

        <Footer />
      </Page>
    </Document>
  );
}
