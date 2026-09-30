import { Font, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { segmentByScript } from "@/lib/pdf-text-segments";

// Shared layout for the SellHub and Searching Hub PDF reports. Both reports
// use the same structure and only differ in brand color and a few sections.

Font.register({
  family: "Noto Sans KR",
  fonts: [
    { src: "/fonts/NotoSansKR-Regular.woff", fontWeight: "normal" },
    { src: "/fonts/NotoSansKR-Bold.woff", fontWeight: "bold" },
  ],
});

// AI-generated content is Korean prose that often quotes Japanese terms, and
// Noto Sans KR has no kana glyphs — MixedText renders each run with the font
// that has its glyphs.
Font.register({
  family: "Noto Sans JP",
  fonts: [
    { src: "/fonts/NotoSansJP-Regular.woff", fontWeight: "normal" },
    { src: "/fonts/NotoSansJP-Bold.woff", fontWeight: "bold" },
  ],
});

// react-pdf's word-based hyphenation mangles Korean; wrap on characters instead.
Font.registerHyphenationCallback((word) => [word]);

export interface PdfPalette {
  brand: string;
  brandDark: string;
  brandBg: string;
  line: string;
  surface: string;
}

export const SELLHUB_PALETTE: PdfPalette = {
  brand: "#4fa8dd",
  brandDark: "#2f7fb3",
  brandBg: "#eef7fd",
  line: "#dcecf6",
  surface: "#f5f9fc",
};

export const SEARCHING_HUB_PALETTE: PdfPalette = {
  brand: "#5b3df5",
  brandDark: "#4023d6",
  brandBg: "#f2effe",
  line: "#e4dcfb",
  surface: "#f8f6ff",
};

const INK = "#1c1b29";
const INK2 = "#5c5a72";
const MUTED = "#8b899e";
const RISK = "#c2410c";

// One body size and line height for every list, so bullets and numbers line
// up with the first line of their text the same way everywhere.
const BODY_SIZE = 9.5;
const BODY_LINE = 1.55;

// Every text style sets its own lineHeight: react-pdf inherits the page's
// lineHeight as an absolute value (9.5pt × 1.55), which squeezes larger text
// into a too-short line box and made the title overlap the subtitle.
export function createReportStyles(p: PdfPalette) {
  return StyleSheet.create({
    page: {
      fontFamily: "Noto Sans KR",
      fontSize: BODY_SIZE,
      color: INK,
      paddingTop: 36,
      paddingHorizontal: 40,
      paddingBottom: 60,
      lineHeight: BODY_LINE,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
      paddingBottom: 12,
      borderBottom: `1.5pt solid ${p.brand}`,
    },
    brandRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    brandMark: {
      width: 20,
      height: 20,
      backgroundColor: p.brand,
      borderRadius: 5,
      color: "#ffffff",
      fontSize: 11,
      lineHeight: 1.34,
      fontWeight: "bold",
      textAlign: "center",
      // Measured on a render: Noto Sans KR puts the glyph low in its line box,
      // so 1.2pt (not the geometric ~2.6pt) is what visually centers the letter.
      paddingTop: 1.2,
    },
    brandName: { fontSize: 13, lineHeight: 1.3, fontWeight: "bold", color: INK },
    metaText: { fontSize: 8, lineHeight: 1.5, color: MUTED, textAlign: "right" },
    title: { fontSize: 19, lineHeight: 1.3, fontWeight: "bold", color: INK, marginBottom: 4 },
    subtitle: { fontSize: 10.5, lineHeight: 1.5, color: INK2, marginBottom: 18 },
    summaryBox: {
      backgroundColor: p.brandBg,
      borderRadius: 6,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 20,
    },
    summaryText: { fontSize: 10, color: INK, lineHeight: 1.65 },
    section: { marginBottom: 20 },
    sectionTitle: {
      fontSize: 12.5,
      lineHeight: 1.4,
      fontWeight: "bold",
      color: INK,
      marginBottom: 10,
      paddingBottom: 5,
      borderBottom: `0.75pt solid ${p.line}`,
    },
    bodyText: { fontSize: BODY_SIZE, color: INK2, lineHeight: BODY_LINE },
    listRow: { flexDirection: "row", marginBottom: 5 },
    dotColumn: { width: 14, paddingTop: 4.75 },
    dot: { width: 5, height: 5, borderRadius: 2.5 },
    listText: { flex: 1, fontSize: BODY_SIZE, color: INK2, lineHeight: BODY_LINE },
    numberText: {
      width: 22,
      fontSize: BODY_SIZE,
      lineHeight: BODY_LINE,
      fontWeight: "bold",
      color: p.brandDark,
    },
    numberedText: { flex: 1, fontSize: BODY_SIZE, color: INK, lineHeight: BODY_LINE },
    trendRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      borderBottom: `0.5pt solid ${p.line}`,
      paddingVertical: 7,
    },
    trendBadge: {
      width: 34,
      marginRight: 10,
      marginTop: 1,
      borderRadius: 7,
      paddingVertical: 1.5,
      fontSize: 7.5,
      lineHeight: 1.4,
      fontWeight: "bold",
      textAlign: "center",
    },
    trendKeyword: { width: 130, marginRight: 10, fontSize: BODY_SIZE, lineHeight: BODY_LINE, fontWeight: "bold" },
    trendEvidence: { flex: 1, fontSize: 9, color: INK2, lineHeight: BODY_LINE },
    buyerCard: {
      borderRadius: 6,
      border: `0.75pt solid ${p.line}`,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 12,
    },
    buyerEyebrow: {
      fontSize: 7.5,
      lineHeight: 1.4,
      fontWeight: "bold",
      letterSpacing: 1,
      color: p.brand,
      marginBottom: 2,
    },
    buyerName: { fontSize: 11.5, fontWeight: "bold", color: INK, lineHeight: 1.4 },
    buyerMeta: { fontSize: 8, lineHeight: 1.5, color: MUTED, marginTop: 2, marginBottom: 4 },
    buyerLabel: { fontSize: 8, lineHeight: 1.5, fontWeight: "bold", color: p.brandDark, marginTop: 8, marginBottom: 3 },
    emailBox: {
      backgroundColor: p.brandBg,
      borderRadius: 6,
      borderLeft: `2pt solid ${p.brand}`,
      paddingVertical: 9,
      paddingHorizontal: 11,
    },
    emailSubject: { fontSize: 9, lineHeight: 1.5, fontWeight: "bold", color: INK, marginBottom: 4 },
    emailBody: { fontSize: 8.5, color: INK2, lineHeight: BODY_LINE },
    // Noto Sans KR/JP have no italic variant — fontStyle: "italic" here would
    // crash react-pdf, so this is set apart by color and weight instead.
    emailCoaching: { fontSize: 8, lineHeight: 1.5, color: p.brandDark, fontWeight: "bold", marginTop: 6 },
    buyerFooterRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      marginTop: 10,
      paddingTop: 6,
      borderTop: `0.5pt solid ${p.line}`,
    },
    buyerFooterText: { flex: 1, fontSize: 7.5, lineHeight: 1.5, color: MUTED },
    buyerFooterLink: { fontSize: 7.5, lineHeight: 1.5, color: p.brandDark },
    riskBox: {
      backgroundColor: p.surface,
      borderRadius: 6,
      paddingTop: 10,
      paddingBottom: 5,
      paddingHorizontal: 12,
    },
    footer: {
      position: "absolute",
      bottom: 24,
      left: 40,
      right: 40,
      flexDirection: "row",
      justifyContent: "space-between",
      borderTop: `0.5pt solid ${p.line}`,
      paddingTop: 6,
    },
    footerText: { fontSize: 7.5, lineHeight: 1.5, color: MUTED },
  });
}

export type ReportStyles = ReturnType<typeof createReportStyles>;

export function MixedText({ text, style }: { text: string; style?: Style | Style[] }) {
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

export function ReportHeader({
  s,
  brand,
  label,
  generatedAt,
}: {
  s: ReportStyles;
  brand: string;
  label: string;
  generatedAt: string;
}) {
  return (
    <View style={s.headerRow} fixed>
      <View style={s.brandRow}>
        <Text style={s.brandMark}>{brand.charAt(0)}</Text>
        <Text style={s.brandName}>{brand}</Text>
      </View>
      <Text style={s.metaText}>
        {label}
        {"\n"}생성일: {generatedAt}
      </Text>
    </View>
  );
}

// No page numbers: in @react-pdf 4.6 a `render`-prop Text never draws, and a
// fixed View containing one is dropped entirely — which is why the footer was
// missing from every page before.
export function ReportFooter({ s, text }: { s: ReportStyles; text: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>{text}</Text>
    </View>
  );
}

// minPresenceAhead keeps a title from being left alone at the bottom of a page.
export function SectionTitle({ s, children }: { s: ReportStyles; children: string }) {
  return (
    <Text style={s.sectionTitle} minPresenceAhead={48}>
      {children}
    </Text>
  );
}

export function BulletList({ s, items, color }: { s: ReportStyles; items: string[]; color: string }) {
  return (
    <>
      {items.map((item, i) => (
        <View key={i} style={s.listRow} wrap={false}>
          <View style={s.dotColumn}>
            <View style={[s.dot, { backgroundColor: color }]} />
          </View>
          <MixedText style={s.listText} text={item} />
        </View>
      ))}
    </>
  );
}

// Plain text numbers at the same size and line height as the item text, so
// they sit on the item's baseline — circle badges put digits off-center.
export function NumberedList({ s, items }: { s: ReportStyles; items: string[] }) {
  return (
    <>
      {items.map((item, i) => (
        <View key={i} style={s.listRow} wrap={false}>
          <Text style={s.numberText}>{String(i + 1).padStart(2, "0")}</Text>
          <MixedText style={s.numberedText} text={item} />
        </View>
      ))}
    </>
  );
}

const RELEVANCE_COLORS = (p: PdfPalette): Record<string, { backgroundColor: string; color: string }> => ({
  높음: { backgroundColor: p.brand, color: "#ffffff" },
  중간: { backgroundColor: p.brandBg, color: p.brandDark },
  낮음: { backgroundColor: "#f1f1f4", color: MUTED },
});

export function TrendRows({
  s,
  palette,
  trends,
}: {
  s: ReportStyles;
  palette: PdfPalette;
  trends: { keyword: string; relevance: string; evidence: string }[];
}) {
  const colors = RELEVANCE_COLORS(palette);
  return (
    <>
      {trends.map((trend, i) => (
        <View key={i} style={s.trendRow} wrap={false}>
          <Text style={[s.trendBadge, colors[trend.relevance] ?? colors["중간"]]}>{trend.relevance}</Text>
          <MixedText style={s.trendKeyword} text={trend.keyword} />
          <MixedText style={s.trendEvidence} text={trend.evidence} />
        </View>
      ))}
    </>
  );
}

export function BuyerHeading({
  s,
  index,
  name,
  meta,
}: {
  s: ReportStyles;
  index: number;
  name: string;
  meta: string;
}) {
  return (
    <View wrap={false} minPresenceAhead={60}>
      <Text style={s.buyerEyebrow}>BUYER {String(index + 1).padStart(2, "0")}</Text>
      <MixedText style={s.buyerName} text={name} />
      <MixedText style={s.buyerMeta} text={meta} />
    </View>
  );
}

export function LabeledText({ s, label, text }: { s: ReportStyles; label: string; text: string }) {
  return (
    <View wrap={false}>
      <Text style={s.buyerLabel}>{label}</Text>
      <MixedText style={s.bodyText} text={text} />
    </View>
  );
}

export function BuyerFooter({ s, sourceNote, website }: { s: ReportStyles; sourceNote: string | null; website: string | null }) {
  if (!sourceNote && !website) return null;
  return (
    <View style={s.buyerFooterRow} wrap={false}>
      <MixedText style={s.buyerFooterText} text={sourceNote ? `출처: ${sourceNote}` : ""} />
      {website && <Text style={s.buyerFooterLink}>{website}</Text>}
    </View>
  );
}

export const RISK_COLOR = RISK;
