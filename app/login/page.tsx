"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import styles from "@/components/DarkSite.module.css";

type Tab = "login" | "signup";

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.04)",
  padding: "12px 14px",
  fontSize: 14.5,
  fontWeight: 600,
  color: "#fff",
  outline: "none",
};

export default function LoginPage() {
  const { user, account, loading, loginError, clearLoginError, signInWithGoogle, signInWithId, signUpWithId } =
    useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    if (!loading && (user || account)) {
      router.replace("/profile");
    }
  }, [loading, user, account, router]);

  function switchTab(next: Tab) {
    setTab(next);
    setFormError(null);
    setPasswordConfirm("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (tab === "signup" && password !== passwordConfirm) {
      setFormError("비밀번호가 서로 다릅니다.");
      return;
    }
    setSubmitting(true);
    const error = tab === "login" ? await signInWithId(id, password) : await signUpWithId(id, password);
    setSubmitting(false);
    if (error) setFormError(error);
  }

  async function handleGoogle() {
    setGoogleBusy(true);
    clearLoginError();
    try {
      await signInWithGoogle();
    } finally {
      setGoogleBusy(false);
    }
  }

  const canSubmit = id.trim() && password && (tab === "login" || passwordConfirm) && !submitting;

  return (
    <div
      className={styles.wrap}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}
    >
      <div style={{ position: "relative", width: "100%", maxWidth: 400, textAlign: "center" }}>
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
          style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 32, fontSize: 17, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff" }}
        >
          SellHub<span style={{ fontWeight: 700, color: "#9a9a9a" }}>.ai</span>
        </Link>
        <h1 style={{ marginBottom: 12, fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.2, color: "#fff" }}>
          {tab === "login" ? "바이어 찾기, 지금 시작하세요" : "SellHub 회원가입"}
        </h1>
        <p style={{ marginBottom: 32, fontSize: 14.5, fontWeight: 600, lineHeight: 1.6, color: "#b4b4b4" }}>
          로그인 없이도 무료로 이용할 수 있어요. 계정을 만들면 진행 상황을 저장해드립니다.
        </p>

        <div
          style={{
            position: "relative",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01) 60%)",
            padding: 28,
            textAlign: "left",
          }}
        >
          <div
            role="tablist"
            style={{ display: "flex", gap: 4, marginBottom: 20, padding: 4, borderRadius: 999, background: "rgba(255,255,255,0.05)" }}
          >
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => switchTab(t)}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  padding: "9px 0",
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: tab === t ? "#fff" : "#9a9a9a",
                  background: tab === t ? "linear-gradient(180deg,#5b9cff,#2f6fe0)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t === "login" ? "로그인" : "회원가입"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="아이디"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              style={inputStyle}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoComplete={tab === "login" ? "current-password" : "new-password"}
              style={inputStyle}
            />
            {tab === "signup" && (
              <>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호 확인"
                  autoComplete="new-password"
                  style={inputStyle}
                />
                <p style={{ fontSize: 12, fontWeight: 600, color: "#8a8a8a", lineHeight: 1.5 }}>
                  아이디는 영문 소문자·숫자·밑줄(_) 4~20자, 비밀번호는 6자 이상이에요.
                </p>
              </>
            )}
            {formError && <ErrorBox message={formError} />}
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                marginTop: 4,
                borderRadius: 999,
                border: "1px solid #5b9cff",
                background: "linear-gradient(180deg,#5b9cff,#2f6fe0)",
                padding: "13px 20px",
                fontSize: 14.5,
                fontWeight: 700,
                color: "#fff",
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: canSubmit ? 1 : 0.5,
              }}
            >
              {submitting ? "확인 중..." : tab === "login" ? "로그인" : "가입하고 시작하기"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 16px", color: "#6b6b6b", fontSize: 12, fontWeight: 600 }}>
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} />
            또는
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleBusy}
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderRadius: 999,
              border: "1.5px solid #fff",
              background: "linear-gradient(180deg,#fff,#e7e7e7)",
              padding: "12px 20px",
              fontSize: 14.5,
              fontWeight: 700,
              color: "#111",
              cursor: googleBusy ? "not-allowed" : "pointer",
              opacity: googleBusy ? 0.6 : 1,
            }}
          >
            <GoogleIcon />
            {googleBusy ? "로그인 중..." : "Google로 로그인"}
          </button>
          {loginError && (
            <div style={{ marginTop: 12 }}>
              <ErrorBox message={loginError} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p
      role="alert"
      style={{
        borderRadius: 8,
        border: "1px solid rgba(255,120,120,0.4)",
        background: "rgba(255,80,80,0.1)",
        padding: "10px 14px",
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.55,
        color: "#ff9a9a",
      }}
    >
      {message}
    </p>
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
