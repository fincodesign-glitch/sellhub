import Link from "next/link";
import NavLink, { splitNavItems, TOOL_LINKS, type NavItemLike } from "@/components/NavLink";

const DEFAULT_TAGLINE = "© 2026 SellHub · AI 수출 영업 비서 · K-제품 셀러를 위한 바이어 발굴 & 맞춤 메일 도구";

export default function SiteFooter({
  nav,
  tagline = DEFAULT_TAGLINE,
}: {
  nav: NavItemLike[];
  tagline?: string;
}) {
  const { before: navBeforeLogin, after: navAfterLogin } = splitNavItems(nav);
  return (
    <footer className="border-t border-line px-6 py-7 text-center text-[13px] text-muted">
      <div className="mb-2.5 flex flex-wrap justify-center gap-5">
        {TOOL_LINKS.map((item) => (
          <NavLink key={item.label} href={item.href} className="font-semibold text-muted hover:text-foreground">
            {item.label}
          </NavLink>
        ))}
        {navBeforeLogin.map((item) => (
          <NavLink key={item.label} href={item.href} className="font-semibold text-muted hover:text-foreground">
            {item.label}
          </NavLink>
        ))}
        <Link href="/login" className="font-semibold text-muted hover:text-foreground">
          로그인
        </Link>
        {navAfterLogin.map((item) => (
          <NavLink key={item.label} href={item.href} className="font-semibold text-muted hover:text-foreground">
            {item.label}
          </NavLink>
        ))}
      </div>
      {tagline}
    </footer>
  );
}
