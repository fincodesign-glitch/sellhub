"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

/** "로그인" for visitors, "마이페이지" once signed in with a site account. */
export default function AccountNavLink({ className }: { className?: string }) {
  const { account } = useAuth();
  return (
    <Link href={account ? "/mypage" : "/login"} className={className}>
      {account ? "마이페이지" : "로그인"}
    </Link>
  );
}
