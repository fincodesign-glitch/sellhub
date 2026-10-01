"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AccountMenu from "./AccountMenu";
import { SEARCHING_HUB_LINK } from "./NavLink";
import styles from "./DarkSite.module.css";

const LINKS = [
  { label: "바이어 찾기", href: "/profile" },
  { label: "브랜드", href: "/brand" },
  { label: "요금제", href: "/pricing" },
];

export function ExternalArrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" />
    </svg>
  );
}

export default function DarkSiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className={styles.header}>
      <Link href="/" aria-label="SellHub" className={styles.logo}>
        SellHub<span className={styles.logoSuffix}>.ai</span>
      </Link>
      <nav className={styles.nav} aria-label="Primary">
        {LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={`${styles.pill} ${pathname === item.href ? styles.pillActive : ""}`}
          >
            {item.label}
          </Link>
        ))}
        <a href={SEARCHING_HUB_LINK} target="_blank" rel="noopener noreferrer" className={styles.pill}>
          Searching Hub
          <ExternalArrow className={styles.pillArrow} />
        </a>
      </nav>
      <div className={styles.headerRight}>
        <AccountMenu theme="dark" myPage />
        {pathname !== "/profile" && (
          <Link href="/profile" className={`${styles.btn} ${styles.headerCta}`}>
            무료로 시작
          </Link>
        )}
        <button
          type="button"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className={styles.burger}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <nav className={styles.mobileMenu} aria-label="Mobile">
          {LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`${styles.mobileLink} ${pathname === item.href ? styles.mobileLinkActive : ""}`}
            >
              {item.label}
            </Link>
          ))}
          <a href={SEARCHING_HUB_LINK} target="_blank" rel="noopener noreferrer" className={styles.mobileLink}>
            Searching Hub
            <ExternalArrow className={styles.pillArrow} />
          </a>
          <Link href="/profile" onClick={() => setMenuOpen(false)} className={`${styles.btn} ${styles.mobileCta}`}>
            무료로 시작
          </Link>
        </nav>
      )}
    </header>
  );
}
