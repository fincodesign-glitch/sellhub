import Link from "next/link";
import styles from "./DarkSite.module.css";

const NAV_ITEMS = [
  { label: "브랜드", href: "/brand" },
  { label: "요금제", href: "/pricing" },
  { label: "로그인", href: "/login" },
  { label: "Searching Hub", href: "https://searchinghub.vercel.app" },
];

export default function DarkSiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" aria-label="SellHub" className={styles.logo}>
        SellHub<span className={styles.logoSuffix}>.ai</span>
      </Link>
      <nav className={styles.nav} aria-label="Primary">
        {NAV_ITEMS.map((item) =>
          item.href.startsWith("http") ? (
            <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={styles.pill}>
              {item.label}
            </a>
          ) : (
            <Link key={item.label} href={item.href} className={styles.pill}>
              {item.label}
            </Link>
          ),
        )}
      </nav>
      <Link href="/profile" className={styles.btn}>
        무료로 시작
      </Link>
    </header>
  );
}
