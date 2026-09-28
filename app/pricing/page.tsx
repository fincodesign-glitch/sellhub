import Link from "next/link";
import { getSiteContent } from "@/lib/site-content";
import DarkSiteHeader from "@/components/DarkSiteHeader";
import DarkSiteFooter from "@/components/DarkSiteFooter";
import { IconCheck } from "@/components/Icons";
import styles from "@/components/DarkSite.module.css";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const content = await getSiteContent();
  const plans = content.plans;
  return (
    <div className={styles.wrap}>
      <DarkSiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Pricing</div>
          <h1 className={styles.h1}>
            성장에 맞춰 <em>커지는</em> 요금제
          </h1>
          <p className={styles.lede}>
            모든 요금제는 일본·미국·동남아시아 바이어 발굴과 맞춤 제안 메일 생성을 포함합니다. 언제든 변경할 수 있어요.
          </p>
        </div>
      </section>

      <section className={styles.section} style={{ borderBottom: "none" }}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {plans.map((plan) => (
            <div
              key={plan.key}
              id={`plan-${plan.key}`}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                borderRadius: 16,
                padding: 28,
                border: plan.highlight ? "1px solid rgba(91,156,255,0.6)" : "1px solid rgba(255,255,255,0.12)",
                background: plan.highlight
                  ? "linear-gradient(160deg, rgba(91,156,255,0.14), rgba(91,156,255,0.02) 60%)"
                  : "linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0) 60%)",
              }}
            >
              {plan.highlight && (
                <span
                  style={{
                    position: "absolute",
                    top: -12,
                    left: 28,
                    borderRadius: 999,
                    background: "linear-gradient(180deg,#5b9cff,#2f6fe0)",
                    padding: "5px 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  인기
                </span>
              )}
              <h3 style={{ marginBottom: 6, fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>{plan.name}</h3>
              <div style={{ marginBottom: 4, display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: plan.price.length > 6 ? 24 : 32, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#9a9a9a" }}>{plan.period}</span>
              </div>
              <p style={{ marginBottom: 24, fontSize: 13, fontWeight: 700, color: "#d8d8d8" }}>{plan.credits}</p>
              <ul style={{ marginBottom: 28, display: "flex", flex: 1, flexDirection: "column", gap: 10, fontSize: 13.5, fontWeight: 600, color: "#c4c4c4" }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#5b9cff]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                style={{
                  borderRadius: 999,
                  padding: "12px 16px",
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  background: plan.highlight ? "linear-gradient(180deg,#5b9cff,#2f6fe0)" : "transparent",
                  border: plan.highlight ? "1px solid #5b9cff" : "1px solid rgba(255,255,255,0.3)",
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 48, textAlign: "center", fontSize: 12.5, fontWeight: 600, color: "#8a8a8a" }}>
          유료 요금제 결제는 현재 준비 중입니다. 문의: support@sellhub.kr
        </p>
      </section>

      <DarkSiteFooter />
    </div>
  );
}
