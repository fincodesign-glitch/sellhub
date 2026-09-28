"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import styles from "@/components/DarkSite.module.css";

export default function LoginPage() {
  const { user, loading, loginError, clearLoginError, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/profile");
    }
  }, [loading, user, router]);

  async function handleClick() {
    setSubmitting(true);
    clearLoginError();
    try {
      await signInWithGoogle();
    } finally {
      setSubmitting(false);
    }
  }

  const busy = loading || submitting;

  return (
    <div
      className={styles.wrap}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}
    >
      <div style={{ position: "relative", width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div
          aria-hidden
          style={{
            pointerEvents: "none",
            position: "absolute",
            top: -180,
            left: "50%",
            transform: "translateX(-50%)",
            width: 640,
            height: 380,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(255,255,255,0.12), rgba(255,255,255,0) 70%)",
            filter: "blur(10px)",
          }}
        />
        <Link
          href="/"
          style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 36, fontSize: 17, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff" }}
        >
          SellHub<span style={{ fontWeight: 700, color: "#9a9a9a" }}>.ai</span>
        </Link>
        <h1 style={{ marginBottom: 12, fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.2, color: "#fff" }}>
          바이어 찾기, 지금 시작하세요
        </h1>
        <p style={{ marginBottom: 36, fontSize: 14.5, fontWeight: 600, lineHeight: 1.6, color: "#b4b4b4" }}>
          로그인 없이도 무료로 이용할 수 있어요. 계정을 만들면 진행 상황을 저장해드립니다.
        </p>
        <div
          style={{
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01) 60%)",
            padding: 32,
          }}
        >
          <button
            onClick={handleClick}
            disabled={busy}
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderRadius: 999,
              border: "1.5px solid #fff",
              background: "linear-gradient(180deg,#fff,#e7e7e7)",
              padding: "14px 20px",
              fontSize: 14.5,
              fontWeight: 700,
              color: "#111",
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1,
            }}
          >
            <GoogleIcon />
            {busy ? "로그인 중..." : "Google로 로그인"}
          </button>
          {loginError && (
            <p
              style={{
                marginTop: 14,
                borderRadius: 8,
                border: "1px solid rgba(255,120,120,0.4)",
                background: "rgba(255,80,80,0.1)",
                padding: "10px 14px",
                textAlign: "left",
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.55,
                color: "#ff9a9a",
              }}
            >
              {loginError}
            </p>
          )}
          <p style={{ marginTop: 24, fontSize: 12, fontWeight: 600, color: "#8a8a8a" }}>
            가입 후 바로 무료 요금제로 이용을 시작할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}
