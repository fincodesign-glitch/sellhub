import type { Metadata } from "next";

// app/intent/page.tsx는 클라이언트 컴포넌트라 metadata를 직접 export할 수 없어,
// 같은 라우트의 서버 컴포넌트 레이아웃에서 대신 정의한다.
export const metadata: Metadata = {
  title: "Searching Hub · 마케팅 전략부터 바이어까지",
  description:
    "제품 정보만 알려주시면 AI가 목표 시장을 대신 검색해 마케팅 전략 리포트와 관심 바이어 후보를 찾아드립니다.",
};

export default function IntentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
