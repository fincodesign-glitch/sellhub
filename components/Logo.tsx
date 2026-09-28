import Link from "next/link";
import { SignalMark, SparkleMark } from "@/components/Icons";
import type { ComponentType } from "react";

/**
 * 모든 페이지에서 같은 골격(배지 + 마크)으로 쓰는 로고.
 * SellHub는 시그널 마크, IntentMate는 스파클 마크로 서로 다른 아이콘을 쓴다.
 */
export default function Logo({
  className = "",
  brand = "SellHub",
  href = "/",
  icon: Icon = SignalMark,
}: {
  className?: string;
  brand?: string;
  href?: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 text-[18px] font-extrabold tracking-tight ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-navy text-brand">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      {brand}
    </Link>
  );
}

export { SparkleMark };
