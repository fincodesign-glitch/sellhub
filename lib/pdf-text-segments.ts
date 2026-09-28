export type ScriptFont = "kr" | "jp";

const HANGUL = /[가-힣ᄀ-ᇿ㄰-㆏]/;
const JAPANESE_ONLY = /[぀-ヿㇰ-ㇿｦ-ﾟ]/; // hiragana/katakana
const CJK_IDEOGRAPH = /[一-鿿㐀-䶿]/; // kanji/hanja (ambiguous, treated as JP)

function classify(ch: string): ScriptFont | null {
  if (HANGUL.test(ch)) return "kr";
  if (JAPANESE_ONLY.test(ch) || CJK_IDEOGRAPH.test(ch)) return "jp";
  return null; // latin/digits/punctuation — carries the previous run's font
}

/**
 * Splits text into runs so each can be rendered with a font that actually has
 * the needed glyphs. Noto Sans KR has no hiragana/katakana, and (per testing)
 * doesn't reliably cover CJK ideographs either — Japanese search-derived
 * terms mixed into otherwise-Korean AI prose need Noto Sans JP instead.
 */
export function segmentByScript(text: string): { text: string; font: ScriptFont }[] {
  if (!text) return [];
  const segments: { text: string; font: ScriptFont }[] = [];
  let currentFont: ScriptFont = "kr";
  let buffer = "";

  for (const ch of text) {
    const detected = classify(ch);
    const font: ScriptFont = detected ?? currentFont;
    if (buffer && font !== currentFont) {
      segments.push({ text: buffer, font: currentFont });
      buffer = "";
    }
    currentFont = font;
    buffer += ch;
  }
  if (buffer) segments.push({ text: buffer, font: currentFont });
  return segments;
}
