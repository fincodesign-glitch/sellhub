// Parsing/subsetting the CJK font files (~1.7MB) is the dominant cost in PDF
// generation — it blocks the main thread for 20+ seconds on first use. Once
// @react-pdf/renderer has parsed a font, it keeps the parsed representation
// around for the rest of the page session, so triggering one throwaway render
// as soon as the page loads (while the user is filling out the form / the
// 2-4 minute analysis is running) pays that cost during idle time instead of
// at the moment they click "다운로드".
let warmed: Promise<void> | null = null;

export function warmPdfFonts(): Promise<void> {
  if (warmed) return warmed;
  warmed = (async () => {
    try {
      const [{ pdf }, { default: ReportPdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/ReportPdf"),
      ]);
      await pdf(
        ReportPdf({
          result: {
            executiveSummary: "예열 warmup 免疫サポート",
            productSummary: null,
            marketInsight: [],
            trends: [],
            buyers: [],
            recommendedActions: [],
            risks: [],
          },
          meta: { mode: "text", productName: "", keywords: "", market: "일본" },
        }),
      ).toBlob();
    } catch (err) {
      console.error("[pdf-warmup]", err);
      // Non-fatal — the real generation call will still work, just slower.
    }
  })();
  return warmed;
}
