"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { auth, isFirebaseConfigured } from "./firebase";

/** A site ID/password account (server session), as opposed to a Google (Firebase) user. */
export type Account = { id: string; plan: "free" | "master" };

type AuthContextValue = {
  user: User | null;
  account: Account | null;
  loading: boolean;
  /** True when the signed-in account unlocks paid features (currently only the master account). */
  isPaidPlan: boolean;
  loginError: string | null;
  clearLoginError: () => void;
  signInWithGoogle: () => Promise<void>;
  /** Resolves to an error message, or null on success. */
  signInWithId: (id: string, password: string) => Promise<string | null>;
  /** Resolves to an error message, or null on success. */
  signUpWithId: (id: string, password: string) => Promise<string | null>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  account: null,
  loading: true,
  isPaidPlan: false,
  loginError: null,
  clearLoginError: () => {},
  signInWithGoogle: async () => {},
  signInWithId: async () => null,
  signUpWithId: async () => null,
  signOutUser: async () => {},
});

function describeAuthError(code: string): string {
  switch (code) {
    case "auth/popup-closed-by-user":
      return "로그인 창이 닫혔습니다. 다시 시도해주세요.";
    case "auth/account-exists-with-different-credential":
      return "이미 다른 방법으로 가입된 이메일입니다.";
    case "auth/network-request-failed":
      return "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.";
    case "auth/unauthorized-domain":
      return "현재 도메인에서 로그인이 허용되지 않습니다. 관리자에게 문의해주세요.";
    default:
      return "로그인 중 오류가 발생했습니다. 다시 시도해주세요.";
  }
}

async function postCredentials(path: string, id: string, password: string): Promise<{ account: Account | null; error: string | null }> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    const data = (await res.json().catch(() => ({}))) as { user?: Account; error?: string };
    if (!res.ok || !data.user) return { account: null, error: data.error ?? "요청에 실패했습니다. 다시 시도해주세요." };
    return { account: data.user, error: null };
  } catch {
    return { account: null, error: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요." };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(isFirebaseConfigured);
  const [account, setAccount] = useState<Account | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setFirebaseLoading(false);
    });
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { user?: Account | null } | null) => setAccount(data?.user ?? null))
      .catch(() => {})
      .finally(() => setAccountLoading(false));
  }, []);

  async function signInWithGoogle() {
    setLoginError(null);
    if (!auth) {
      setLoginError("구글 로그인이 아직 설정되지 않았습니다. 아이디로 로그인하거나 회원가입해주세요.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      const code = (error as { code?: string }).code ?? "";
      if (code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
      } else if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setLoginError(describeAuthError(code));
      }
    }
  }

  const signInWithId = useCallback(async (id: string, password: string) => {
    const { account: next, error } = await postCredentials("/api/auth/login", id, password);
    if (next) setAccount(next);
    return error;
  }, []);

  const signUpWithId = useCallback(async (id: string, password: string) => {
    const { account: next, error } = await postCredentials("/api/auth/signup", id, password);
    if (next) setAccount(next);
    return error;
  }, []);

  async function signOutUser() {
    if (account) {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      setAccount(null);
    }
    if (auth && user) await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        account,
        loading: firebaseLoading || accountLoading,
        isPaidPlan: account?.plan === "master",
        loginError,
        clearLoginError: () => setLoginError(null),
        signInWithGoogle,
        signInWithId,
        signUpWithId,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
