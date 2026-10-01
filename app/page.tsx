"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

/**
 * SellHub 홈페이지 — 단일 뷰포트 시네마틱 히어로.
 *
 * 사용자가 제공한 "Vesper.ai" 정밀 스펙을 그대로 구현하되, 내용은 SellHub 실제 사실로 치환했다.
 * 두 가지는 스펙 그대로 따르지 않았다 (이유를 남긴다):
 *  1. `lang="en"` — 루트 레이아웃의 `lang`은 이 프로젝트의 모든 페이지(요금제/로그인/Searching Hub 등)가
 *     공유하므로, 여기서 영어로 바꾸면 사이트 전체가 잘못된 언어로 표시된다. 콘텐츠 자체가 한국어라
 *     `lang="ko"`를 유지했다.
 *  2. 통계 3개 수치("4.2M+ workflows automated" 등) — Vesper.ai가 지어낸 성과 지표라 SellHub에
 *     그대로 쓰면 없는 사실을 있는 것처럼 말하게 된다. 대신 실제로 참인 제품 사실(목표 시장 수,
 *     입력 소요 시간, 1:1 맞춤 방식)로 바꿨다.
 *  3. 히어로 영상 — 사용자가 준 CloudFront 원본은 HEVC(H.265)로 인코딩되어 있어 Chrome 계열
 *     브라우저의 <video>가 재생하지 못한다(MEDIA_ERR_SRC_NOT_SUPPORTED). 같은 영상을 그대로
 *     H.264로 재인코딩해 /public/videos/hero.mp4로 자체 호스팅했다 — 새 영상을 지어낸 게 아니라
 *     동일 소스의 포맷만 바꾼 것이다.
 */

const NAV_ITEMS = [
  { label: "브랜드", href: "/brand", cls: styles.appearScale, d: "0.16s" },
  { label: "요금제", href: "/pricing", cls: styles.appearSoft, d: "0.28s" },
  { label: "로그인", href: "/login", cls: styles.appearScale, d: "0.40s" },
  // Goes through the handoff route so a signed-in user arrives logged in.
  { label: "Searching Hub", href: "/api/auth/handoff?next=%2Fintentmate", cls: styles.appearSoft, d: "0.52s" },
];

const STATS = [
  { label: "목표 시장 3곳 동시 분석" },
  { label: "제품 정보 입력, 단 3분" },
  { label: "바이어 한 곳을 위한 맞춤 메일" },
];

const HERO_VIDEO = "/videos/hero.mp4";

const STEPS = [
  {
    n: "01",
    title: "제품 정보 입력",
    desc: "판매하려는 제품 정보를 입력하면, AI가 이를 분석해 수출에 적합한 형태로 정리합니다.",
  },
  {
    n: "02",
    title: "바이어 자동 탐색",
    desc: "일본·미국·동남아시아 등 목표 시장에서 제품과 맞는 실제 바이어 후보를 AI가 찾아냅니다.",
  },
  {
    n: "03",
    title: "맞춤 제안 메일 발송",
    desc: "찾은 바이어 한 곳만을 위한 맞춤 영어 제안 메일을 작성해, 바로 보낼 수 있도록 준비합니다.",
  },
];

const FEATURES = [
  {
    size: "large",
    title: "AI 바이어 매칭",
    desc: "제품 카테고리, 가격대, 목표 시장을 기준으로 실제 구매 가능성이 있는 바이어를 골라냅니다. 감으로 찾는 영업이 아니라 데이터 기반 매칭입니다.",
  },
  {
    size: "small",
    title: "1:1 맞춤 메일",
    desc: "동일한 템플릿을 복사해 보내지 않습니다. 바이어 한 곳의 특성에 맞춘 영어 제안 메일을 매번 새로 작성합니다.",
  },
  {
    size: "small",
    title: "3분 온보딩",
    desc: "복잡한 설정 없이, 제품 정보 입력만으로 바로 첫 바이어 탐색을 시작할 수 있습니다.",
  },
  {
    size: "large",
    title: "다국가 동시 분석",
    desc: "하나의 시장이 아니라 여러 목표 시장을 동시에 분석해, 어디에서 우리 제품의 기회가 가장 큰지 비교할 수 있습니다.",
  },
];

function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <g transform="rotate(-30 12 12)">
        <circle cx="7.3" cy="3.2" r="1.45" />
        <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
        <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
        <circle cx="16.7" cy="20.8" r="1.45" />
      </g>
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
    </svg>
  );
}

function StatIconMarkets() {
  return (
    <svg className={styles.statIcon} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="mkA" x1="3" y1="2" x2="14" y2="22">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#3a3a3a" stopOpacity="0.62" />
        </linearGradient>
        <linearGradient id="mkB" x1="3" y1="2" x2="14" y2="22">
          <stop offset="0" stopColor="#3a3a3a" stopOpacity="0.38" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.62" />
        </linearGradient>
      </defs>
      <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#mkA)" />
      <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#mkB)" />
      <rect x="9.2" y="10.9" width="5.6" height="2.2" rx="1.1" fill="#4a4a4a" />
    </svg>
  );
}

function StatIconClock() {
  return (
    <svg className={styles.statIcon} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff" />
      <path
        d="M12 7.1v7.4M8.15 12.35L12 16.2l3.85-3.85"
        fill="none"
        stroke="#111"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatIconMatch() {
  return (
    <svg className={styles.statIconWide} viewBox="0 0 40 22" aria-hidden="true">
      <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
      <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
      <circle cx="8.6" cy="11.4" r="0.7" fill="#1a1a1a" />
      <circle cx="11.8" cy="11.4" r="0.7" fill="#1a1a1a" />
      <circle cx="20.2" cy="11" r="9.2" fill="#ffffff" />
      <circle cx="18.4" cy="10.6" r="1.7" fill="#111" />
      <circle cx="22" cy="10.6" r="1.7" fill="#111" />
      <ellipse cx="20.2" cy="13.4" rx="1" ry="0.7" fill="#c9c9c9" />
      <path d="M17.6 15.3c1 1 3.8 1 5.2 0" fill="none" stroke="#111" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="30.2" cy="11" r="9.2" fill="#f26b1d" />
      <text x="30.2" y="15.1" fontSize="12.5" fontWeight="700" textAnchor="middle" fill="#fff" fontFamily="Inter, sans-serif">
        e
      </text>
    </svg>
  );
}

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoIn, setVideoIn] = useState(false);

  // appear -> animationend -> is-in, plus a rAF fallback so nothing stays hidden if animations never run.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const appearEls = Array.from(root.querySelectorAll<HTMLElement>(`.${styles.appear}`));
    const handlers: Array<() => void> = [];
    appearEls.forEach((el) => {
      const onEnd = () => el.classList.add(styles.isIn);
      el.addEventListener("animationend", onEnd, { once: true });
      handlers.push(() => el.removeEventListener("animationend", onEnd));
    });

    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        const anyRunning = appearEls.some((el) => {
          if (!el.getAnimations) return true;
          return el.getAnimations().some((a) => a.playState === "running" || a.playState === "finished");
        });
        if (!anyRunning) {
          appearEls.forEach((el) => el.classList.add(styles.isIn));
        }
      });
      return () => cancelAnimationFrame(raf2);
    });

    return () => {
      cancelAnimationFrame(raf1);
      handlers.forEach((off) => off());
    };
  }, []);

  // Escape and resize-to-desktop close the mobile menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const mq = window.matchMedia("(min-width: 901px)");
    const onMq = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  // Fade sections in as they scroll into view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(`.${styles.reveal}`));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add(styles.isIn));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.isIn);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${menuOpen ? styles.menuOpen : ""}`}
      style={{ background: "#000", color: "#fff" }}
    >
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.page}>
        <div className={`${styles.heroPhoto} ${videoIn ? styles.isIn : ""}`}>
          <video
            autoPlay
            muted
            loop
            playsInline
            onCanPlay={() => setVideoIn(true)}
            ref={(el) => {
              if (el && el.readyState >= 3) setVideoIn(true);
            }}
            src={HERO_VIDEO}
          />
        </div>

        <div className={styles.menuBackdrop} aria-hidden="true" />

        <header className={styles.header}>
          <a href="#top" aria-label="SellHub" className={`${styles.logo} ${styles.appear} ${styles.appearScale}`} style={{ ["--d" as string]: "0.08s" }}>
            <LogoMark className={styles.logoMark} />
            <span>
              SellHub<span className={styles.logoSuffix}>.ai</span>
            </span>
          </a>

          <nav id="site-nav" aria-label="Primary" className={styles.nav}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") || item.href.startsWith("/api/") ? "_blank" : undefined}
                rel={item.href.startsWith("http") || item.href.startsWith("/api/") ? "noopener noreferrer" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`${styles.pill} ${styles.appear} ${item.cls}`}
                style={{ ["--d" as string]: item.d }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div style={{ justifySelf: "end", display: "flex", alignItems: "center", gap: 10 }}>
            <a
              href="/profile"
              className={`${styles.btn} ${styles.btnSolid} ${styles.appear} ${styles.appearScale}`}
              style={{ ["--d" as string]: "0.34s" }}
            >
              무료로 시작
            </a>
            <button
              type="button"
              aria-controls="site-nav"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
              className={`${styles.burger} ${styles.appear} ${styles.appearScale}`}
              style={{ ["--d" as string]: "0.34s" }}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </header>

        <main className={styles.hero} id="top">
          <div className={styles.heroCopy}>
            <span className={`${styles.badge} ${styles.appear} ${styles.appearPop}`} style={{ ["--d" as string]: "0.22s" }}>
              <StarIcon className={styles.badgeStar} />
              AI 수출 영업 비서
            </span>

            <h1 className={styles.h1}>
              <span className={`${styles.headlineLine} ${styles.appear} ${styles.appearMask}`} style={{ ["--d" as string]: "0.42s" }}>
                바이어 찾기부터 제안 메일까지,
              </span>
              <span className={`${styles.headlineLine} ${styles.appear} ${styles.appearMask}`} style={{ ["--d" as string]: "0.62s" }}>
                <em>SellHub</em>가 대신합니다.
              </span>
            </h1>

            <p
              className={`${styles.lede} ${styles.appear} ${styles.appearSoft}`}
              style={{ ["--d" as string]: "0.82s", animationDuration: "1.25s" }}
            >
              AI가 해외 바이어를 찾아주고, 그 바이어 한 곳만을 위한 맞춤 영어 제안 메일을 만들어드립니다.
            </p>

            <div className={styles.heroActions}>
              <a
                href="/profile"
                className={`${styles.btn} ${styles.btnSolid} ${styles.heroBtn} ${styles.heroBtnSolid} ${styles.appear} ${styles.appearBtn}`}
                style={{ ["--d" as string]: "0.96s" }}
              >
                무료로 시작하기
              </a>
              <a
                href="/docs/sellhub-intro.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.btn} ${styles.btnGhost} ${styles.heroBtn} ${styles.heroBtnGhost} ${styles.appear} ${styles.appearSide}`}
                style={{ ["--d" as string]: "1.10s" }}
              >
                회사소개서 보기
              </a>
            </div>
          </div>
        </main>

        <footer className={styles.stats}>
          <span className={`${styles.stat} ${styles.appear} ${styles.appearStat}`} style={{ ["--d" as string]: "1.12s" }}>
            <StatIconMarkets />
            {STATS[0].label}
          </span>
          <span className={`${styles.stat} ${styles.appear} ${styles.appearStat}`} style={{ ["--d" as string]: "1.28s" }}>
            <StatIconClock />
            {STATS[1].label}
          </span>
          <span className={`${styles.stat} ${styles.appear} ${styles.appearStat}`} style={{ ["--d" as string]: "1.44s" }}>
            <StatIconMatch />
            {STATS[2].label}
          </span>
        </footer>
      </div>

      <div className={styles.sections}>
        <section className={styles.section}>
          <div className={styles.eyebrow}>How it works</div>
          <h2 className={styles.sectionTitle}>
            세 단계면, <em>바이어에게</em> 메일이 도착합니다.
          </h2>
          <p className={styles.sectionLede}>
            제품 정보를 입력하는 순간부터 맞춤 제안 메일이 완성되기까지, SellHub가 전 과정을 대신합니다.
          </p>
          <div className={styles.steps}>
            {STEPS.map((s) => (
              <div key={s.n} className={`${styles.step} ${styles.reveal}`}>
                <div className={styles.stepNum}>{s.n}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.eyebrow}>Why SellHub</div>
          <h2 className={styles.sectionTitle}>
            영업 감이 아니라, <em>데이터</em>로 만드는 수출.
          </h2>
          <div className={styles.bento}>
            {FEATURES.map((f) => (
              <div key={f.title} className={`${styles.bentoCard} ${f.size === "large" ? styles.large : styles.small} ${styles.reveal}`}>
                <div className={styles.bentoIcon}>
                  <StarIcon className={styles.badgeStar} />
                </div>
                <div className={styles.bentoTitle}>{f.title}</div>
                <p className={styles.bentoDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>
            지금, <em>SellHub</em>를 무료로 시작하세요.
          </h2>
          <div className={styles.ctaActions}>
            <Link href="/profile" className={`${styles.btn} ${styles.btnSolid} ${styles.heroBtn} ${styles.heroBtnSolid}`}>
              무료로 시작하기
            </Link>
            <Link href="/brand" className={`${styles.btn} ${styles.btnGhost} ${styles.heroBtn} ${styles.heroBtnGhost}`}>
              브랜드 스토리 보기
            </Link>
          </div>
        </section>

        <footer className={styles.footerBar}>
          <span>&copy; {new Date().getFullYear()} SellHub. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/brand">브랜드</Link>
            <Link href="/pricing">요금제</Link>
            <Link href="/login">로그인</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
