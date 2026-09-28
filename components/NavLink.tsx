import Link from "next/link";

export interface NavItemLike {
  label: string;
  href: string;
}

/**
 * 두 개의 독립된 사이트 진입점. SellHub와 Searching Hub(구 IntentMate)는 이제
 * 서로 다른 도메인의 별도 사이트라, 절대 URL로 고정해 관리자 콘텐츠와 무관하게 유지한다.
 */
export const TOOL_LINKS: NavItemLike[] = [
  { label: "SellHub", href: "https://sellhub.co.kr" },
  { label: "Searching Hub", href: "https://searchinghub.vercel.app" },
];

// "브랜드"/"소개서"는 로그인 링크 오른쪽에 나오도록, 나머지 메뉴는 로그인 왼쪽에 나오도록 나눈다.
export function splitNavItems<T extends NavItemLike>(nav: T[]): { before: T[]; after: T[] } {
  const after = nav.filter((item) => item.href === "/brand" || item.href.endsWith(".pdf"));
  const before = nav.filter((item) => !(item.href === "/brand" || item.href.endsWith(".pdf")));
  return { before, after };
}

export default function NavLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  if (href.endsWith(".pdf")) {
    return (
      <a href={href} download className={className}>
        {children}
      </a>
    );
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
