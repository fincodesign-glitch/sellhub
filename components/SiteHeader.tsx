import Link from "next/link";
import NavLink, { splitNavItems, TOOL_LINKS, type NavItemLike } from "@/components/NavLink";
import HeaderAccountLink from "@/components/HeaderAccountLink";
import Logo from "@/components/Logo";
import type { ComponentType } from "react";

interface SiteHeaderProps {
  nav: NavItemLike[];
  /** 홈페이지의 #how, #features 같은 페이지 내 앵커 링크 */
  extraLinks?: { label: string; href: string }[];
  /** 이 헤더가 속한 제품의 이름/홈 링크/마크. 기본은 SellHub, IntentMate 페이지에서 오버라이드한다. */
  logoBrand?: string;
  logoHref?: string;
  logoIcon?: ComponentType<{ className?: string }>;
  /** "무료로 시작" 버튼이 어느 도구로 연결될지. 기본은 SellHub의 /profile. */
  ctaHref?: string;
}

export default function SiteHeader({
  nav,
  extraLinks = [],
  logoBrand = "SellHub",
  logoHref = "/",
  logoIcon,
  ctaHref = "/profile",
}: SiteHeaderProps) {
  const { before: navBeforeLogin, after: navAfterLogin } = splitNavItems(nav);
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white/80 backdrop-blur-xl">
      <input type="checkbox" id="mobile-nav-toggle" className="peer hidden" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo brand={logoBrand} href={logoHref} icon={logoIcon} />
        <nav className="hidden items-center gap-6 sm:flex">
          {TOOL_LINKS.map((item) => (
            <NavLink
              key={item.label}
              href={item.href}
              className="text-[14px] font-semibold text-foreground transition-colors hover:text-brand-dark"
            >
              {item.label}
            </NavLink>
          ))}
          {navBeforeLogin.map((item) => (
            <NavLink
              key={item.label}
              href={item.href}
              className="text-[14px] font-medium text-ink2 transition-colors hover:text-foreground"
            >
              {item.label}
            </NavLink>
          ))}
          {extraLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[14px] font-medium text-ink2 transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          <HeaderAccountLink className="text-[14px] font-medium text-ink2 transition-colors hover:text-foreground" />
          {navAfterLogin.map((item) => (
            <NavLink
              key={item.label}
              href={item.href}
              className="text-[14px] font-medium text-ink2 transition-colors hover:text-foreground"
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            href={ctaHref}
            className="rounded-full bg-brand px-5 py-2.5 text-[13.5px] font-bold text-white shadow-[0_4px_14px_rgba(79,168,221,0.3)] transition-all hover:scale-[1.03] hover:bg-brand-dark"
          >
            무료로 시작
          </Link>
        </nav>
        <label
          htmlFor="mobile-nav-toggle"
          aria-label="메뉴 열기"
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-[8px] text-ink2 hover:bg-surface2 sm:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
      </div>
      <nav className="hidden flex-col gap-1 border-t border-line bg-white px-6 py-4 peer-checked:flex sm:hidden">
        {TOOL_LINKS.map((item) => (
          <NavLink key={item.label} href={item.href} className="rounded-[8px] px-2 py-2.5 text-[15px] font-bold text-foreground hover:bg-surface2">
            {item.label}
          </NavLink>
        ))}
        {navBeforeLogin.map((item) => (
          <NavLink key={item.label} href={item.href} className="rounded-[8px] px-2 py-2.5 text-[15px] font-semibold text-ink2 hover:bg-surface2">
            {item.label}
          </NavLink>
        ))}
        {extraLinks.map((item) => (
          <a key={item.label} href={item.href} className="rounded-[8px] px-2 py-2.5 text-[15px] font-semibold text-ink2 hover:bg-surface2">
            {item.label}
          </a>
        ))}
        <HeaderAccountLink mobile className="rounded-[8px] px-2 py-2.5 text-[15px] font-semibold text-ink2 hover:bg-surface2" />
        {navAfterLogin.map((item) => (
          <NavLink key={item.label} href={item.href} className="rounded-[8px] px-2 py-2.5 text-[15px] font-semibold text-ink2 hover:bg-surface2">
            {item.label}
          </NavLink>
        ))}
        <Link
          href={ctaHref}
          className="mt-2 rounded-full bg-brand px-4 py-2.5 text-center text-[14.5px] font-bold text-white hover:bg-brand-dark"
        >
          무료로 시작
        </Link>
      </nav>
    </header>
  );
}
