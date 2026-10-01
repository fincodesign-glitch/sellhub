import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono, Inter, Instrument_Serif } from "next/font/google";
import { AnalysisProvider } from "@/lib/analysis-context";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// SellHub 홈페이지(시네마틱 히어로)에서만 쓰는 서체. 로컬 woff2 파일이 없어도
// next/font/google이 빌드 시점에 자체 호스팅해주므로 "누락 시 구글 폰트로 대체"
// 요구사항을 안정적으로 만족한다.
const vesperInter = Inter({
  variable: "--font-vesper-inter",
  subsets: ["latin"],
});

const vesperSerif = Instrument_Serif({
  variable: "--font-vesper-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export const metadata: Metadata = {
  title: "SellHub · AI 수출 영업 비서",
  description:
    "일본·미국·동남아시아 시장의 바이어를 AI가 찾아주고, 그 바이어 한 곳만을 위한 맞춤 영어 제안 메일을 만들어드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${plexMono.variable} ${vesperInter.variable} ${vesperSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <AuthProvider>
          <AnalysisProvider tool="sellhub">
            <AnalysisProvider tool="intent">{children}</AnalysisProvider>
          </AnalysisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
