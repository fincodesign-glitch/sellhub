import Link from "next/link";

export interface NavItemLike {
  label: string;
  href: string;
}

/**
 * 두 서비스 진입점. Searching Hub(구 IntentMate)도 sellhub.co.kr 안의 페이지
 * (/intentmate)로 서비스하므로, 다른 도메인으로 넘어가지 않는 내부 경로를 쓴다.
 */
export const TOOL_LINKS: NavItemLike[] = [
  { label: "SellHub", href: "/" },
  { label: "Searching Hub", href: "/intentmate" },
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
