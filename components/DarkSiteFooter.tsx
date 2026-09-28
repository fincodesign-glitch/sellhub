import Link from "next/link";
import styles from "./DarkSite.module.css";

export default function DarkSiteFooter() {
  return (
    <footer className={styles.footer}>
      <span>&copy; {new Date().getFullYear()} SellHub. All rights reserved.</span>
      <div className={styles.footerLinks}>
        <Link href="/brand">브랜드</Link>
        <Link href="/pricing">요금제</Link>
        <Link href="/login">로그인</Link>
      </div>
    </footer>
  );
}
