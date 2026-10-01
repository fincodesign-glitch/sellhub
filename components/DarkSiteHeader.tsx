import Link from "next/link";
import AccountNavLink from "./AccountNavLink";
import { SEARCHING_HUB_LINK } from "./NavLink";
import styles from "./DarkSite.module.css";

export default function DarkSiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" aria-label="SellHub" className={styles.logo}>
        SellHub<span className={styles.logoSuffix}>.ai</span>
      </Link>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/brand" className={styles.pill}>
          브랜드
        </Link>
        <Link href="/pricing" className={styles.pill}>
          요금제
        </Link>
        <AccountNavLink className={styles.pill} />
        <a href={SEARCHING_HUB_LINK} target="_blank" rel="noopener noreferrer" className={styles.pill}>
          Searching Hub
        </a>
      </nav>
      <Link href="/profile" className={styles.btn}>
        무료로 시작
      </Link>
    </header>
  );
}
