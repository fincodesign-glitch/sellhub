"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, isFirebaseConfigured } from "./firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  loginError: string | null;
  clearLoginError: () => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  loginError: null,
  clearLoginError: () => {},
  signInWithGoogle: async () => {},
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  async function signInWithGoogle() {
    setLoginError(null);
    if (!auth) {
      setLoginError(
        "로그인이 아직 설정되지 않았습니다. Free 플랜은 로그인 없이 바로 이용하실 수 있어요.",
      );
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      const code = (error as { code?: string }).code ?? "";
      if (code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
      } else if (
        code !== "auth/popup-closed-by-user" &&
        code !== "auth/cancelled-popup-request"
      ) {
        setLoginError(describeAuthError(code));
      }
    }
  }

  async function signOutUser() {
    if (!auth) return;
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginError,
        clearLoginError: () => setLoginError(null),
        signInWithGoogle,
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
