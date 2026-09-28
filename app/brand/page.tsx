import Link from "next/link";
import { getSiteContent } from "@/lib/site-content";
import DarkSiteHeader from "@/components/DarkSiteHeader";
import DarkSiteFooter from "@/components/DarkSiteFooter";
import { IconLayers, IconGlobe, IconTrend } from "@/components/Icons";
import styles from "@/components/DarkSite.module.css";

export const dynamic = "force-dynamic";

const coreStrategies = [
  {
    Icon: IconLayers,
    title: "Brand 전략",
    tag: "브랜딩",
    points: ["제품 이미지 컨셉 전략", "브랜드 기획 / 브랜딩 전략", "브랜드 관리 및 이미지 제고"],
  },
  {
    Icon: IconGlobe,
    title: "Marketing 전략",
    tag: "채널 · 가격",
    points: ["최적의 마케팅 채널 선택 전략", "마케팅 채널 리밸런싱", "가격·제휴상품 전략 수립"],
  },
  {
    Icon: IconTrend,
    title: "Trend 전략",
    tag: "AI 트렌드 분석",
    points: ["AI 에이전트를 활용한 시장 트렌드 파악", "유사·경쟁 제품 분석", "시장 수요 예측"],
  },
];

const roadmapSteps = [
  { step: "01", title: "브랜드 정의", en: "Define", desc: "기업의 비전과 메시지를 브랜드에 연결되도록 정리·정의합니다." },
  { step: "02", title: "브랜드 스토리", en: "Story", desc: "기업이 추구하는 방향과 과정을 브랜드 스토리에 녹여 소비자에게 전달합니다." },
  { step: "03", title: "브랜드 가치", en: "Value", desc: "구성원과 소비자에게 브랜드의 정의·스토리를 인지시켜 공감을 통해 가치를 인식시킵니다." },
  { step: "04", title: "브랜드 커뮤니케이션", en: "Communication", desc: "브랜드의 가치를 여러 마케팅 실행을 통해 노출시켜 소비자와의 접점을 만들고 소통시킵니다." },
];

const workflow = [
  "고객 분석 / 마케팅 방향 설정",
  "시장 분석 / 트렌드 분석",
  "브랜드 마케팅 방향 설정",
  "성과 분석 / 모니터링 후 수정",
];

const caseStudies = [
  {
    tag: "브랜드 컨설팅",
    title: "디퓨저 브랜드 리포지셔닝",
    result: "런칭 3개월 매출 400% 성장",
    desc: "온라인 마켓플레이스 판매 위주였던 디퓨저 제품을, 집들이 선물용·실내 인테리어용으로 리포지셔닝하고 가격·사은품 구성을 조정해 새로운 수요를 만들었습니다.",
  },
  {
    tag: "마케팅 컨설팅",
    title: "제휴 라인업 확장",
    result: "제휴 제품군 매출 지속 상승",
    desc: "단품 위주로 팔리던 뷰티 제품에 메이크업 아티스트 협업 제품(마스카라·아이라이너 등)을 추가해, 사용 편의성과 브랜드 이미지를 함께 끌어올렸습니다.",
  },
  {
    tag: "트렌드 컨설팅",
    title: "디자인 트렌드 리브랜딩",
    result: "브랜드 인지도·매출 동반 확대",
    desc: "색상 중심 마케팅의 한계를 벗어나 IP 콜라보와 스토리를 강화한 디자인으로 전환해, 제품 매력도와 소비자 관심도를 크게 높였습니다.",
  },
];

const companyFacts = [
  { label: "설립", value: "2025년 7월" },
  { label: "주요 사업", value: "스타트업 마케팅 플랫폼 · 브랜드 컨설팅" },
  { label: "인증", value: "벤처기업 확인" },
  { label: "핵심 서비스", value: "AI 기반 구매 인텐트 분석 · 수출 마케팅" },
];

export default async function BrandPage() {
  await getSiteContent();
  return (
    <div className={styles.wrap}>
      <DarkSiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Mixed Marketing &amp; Branding</div>
          <h1 className={styles.h1}>
            스타트업 마케팅의 <em>본질</em>을 고민합니다
          </h1>
          <p className={styles.lede}>
            SellHub는 브랜드·마케팅·트렌드를 하나로 묶는 융합마케팅으로, 스타트업과 초기 기업의 마케팅
            한계를 극복하고 시장을 선도해 나갑니다.
          </p>
        </div>
      </section>

      {/* About */}
      <section className={styles.section}>
        <div className={styles.sectionEyebrow}>Who We Are</div>
        <h2 className={styles.sectionTitle}>
          획일화된 마케팅 대행이 아니라, <em>융합적인</em> 마케팅 전략을 만듭니다
        </h2>
        <div
          style={{
            marginTop: 56,
            display: "grid",
            gap: "40px 32px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 40,
          }}
        >
          {coreStrategies.map((s) => (
            <div key={s.title}>
              <div
                style={{
                  marginBottom: 18,
                  display: "grid",
                  placeItems: "center",
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  background: "linear-gradient(180deg,#5b9cff,#2f6fe0)",
                  color: "#fff",
                }}
              >
                <s.Icon className="h-5 w-5" />
              </div>
              <div style={{ marginBottom: 4, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9a9a9a" }}>
                {s.tag}
              </div>
              <h3 style={{ marginBottom: 14, fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>{s.title}</h3>
              <ul style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600, lineHeight: 1.6, color: "#b4b4b4" }}>
                {s.points.map((p) => (
                  <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ marginTop: 7, width: 4, height: 4, borderRadius: 999, background: "#fff", flexShrink: 0 }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className={styles.section}>
        <div className={styles.sectionEyebrow}>Brand Roadmap</div>
        <h2 className={styles.sectionTitle}>브랜드 마케팅 로드맵</h2>
        <div
          style={{
            marginTop: 56,
            display: "grid",
            gap: "48px 32px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 40,
          }}
        >
          {roadmapSteps.map((s) => (
            <div key={s.step} style={{ position: "relative" }}>
              <div style={{ marginBottom: 14, fontFamily: "var(--font-plex-mono, monospace)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9a9a9a" }}>
                Step {s.step}
              </div>
              <h3 style={{ marginBottom: 2, fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>{s.title}</h3>
              <div style={{ marginBottom: 12, fontSize: 12.5, fontWeight: 600, color: "#8a8a8a" }}>{s.en}</div>
              <p style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.6, color: "#b4b4b4" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How we work */}
      <section className={styles.section} style={{ textAlign: "center" }}>
        <div className={styles.sectionEyebrow}>How We Work</div>
        <h2 className={styles.sectionTitle} style={{ margin: "0 auto" }}>
          제휴사·데이터를 SellHub의 융합 마케팅으로 연결합니다
        </h2>
        <div style={{ marginTop: 48, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12 }}>
          {workflow.map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.06)",
                  padding: "14px 22px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {step}
              </div>
              {i < workflow.length - 1 && <span style={{ color: "#6a6a6a" }}>&rarr;</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Case studies */}
      <section className={styles.section}>
        <div className={styles.sectionEyebrow}>What We Done</div>
        <h2 className={styles.sectionTitle}>데이터가 증명하는 마케팅 성과</h2>
        <div style={{ marginTop: 56, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {caseStudies.map((c, i) => (
            <div
              key={c.title}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.12)",
                padding: 28,
                background: "linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0) 60%)",
              }}
            >
              <span style={{ marginBottom: 18, fontFamily: "var(--font-plex-mono, monospace)", fontSize: 12.5, color: "#7a7a7a" }}>0{i + 1}</span>
              <span
                style={{
                  marginBottom: 14,
                  width: "fit-content",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  padding: "5px 12px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#e0e0e0",
                }}
              >
                {c.tag}
              </span>
              <h3 style={{ marginBottom: 6, fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>{c.title}</h3>
              <p style={{ marginBottom: 12, fontSize: 14, fontWeight: 700, color: "#fff" }}>{c.result}</p>
              <p style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.65, color: "#b4b4b4" }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Company facts */}
      <section className={styles.section}>
        <div className={styles.sectionEyebrow}>Company</div>
        <div style={{ display: "grid", gap: 28, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 32 }}>
          {companyFacts.map((f) => (
            <div key={f.label}>
              <div style={{ marginBottom: 8, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#8a8a8a" }}>
                {f.label}
              </div>
              <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>{f.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.section} style={{ textAlign: "center", borderBottom: "none" }}>
        <h2 className={styles.sectionTitle} style={{ margin: "0 auto 32px", fontSize: "clamp(26px,4vw,40px)" }}>
          SellHub의 인텐트 마케팅을 지금 <em>무료로</em> 경험해보세요
        </h2>
        <Link
          href="/profile"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            background: "linear-gradient(180deg,#5b9cff,#2f6fe0)",
            padding: "16px 36px",
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          무료로 시작하기
          <span aria-hidden>&rarr;</span>
        </Link>
      </section>

      <DarkSiteFooter />
    </div>
  );
}
