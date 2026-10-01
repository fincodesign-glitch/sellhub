import type { Metadata } from "next";
import SellHubLogin from "./SellHubLogin";
import SearchingHubLogin from "./SearchingHubLogin";

/**
 * Accounts live on SellHub, so Searching Hub sends people here to sign in
 * (via /api/auth/handoff). Those visits carry `next=/api/auth/handoff...` and
 * get the Searching Hub-branded screen instead of SellHub's.
 */
function isFromSearchingHub(next: string | string[] | undefined) {
  return typeof next === "string" && next.startsWith("/api/auth/handoff");
}

export async function generateMetadata({ searchParams }: PageProps<"/login">): Promise<Metadata> {
  const { next } = await searchParams;
  return { title: isFromSearchingHub(next) ? "Searching Hub 로그인" : "SellHub 로그인" };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return isFromSearchingHub(next) ? <SearchingHubLogin next={next as string} /> : <SellHubLogin />;
}
