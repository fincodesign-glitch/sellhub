/**
 * 이모지 대신 쓰는 한 벌짜리 라인 아이콘 세트. 모두 24x24, stroke=currentColor,
 * strokeWidth 1.6로 통일해 굵기가 섞이지 않게 한다.
 */
export type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconLayers({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5 20.5 8 12 12.5 3.5 8Z" />
      <path d="M3.5 12.5 12 17l8.5-4.5" />
      <path d="M3.5 16.5 12 21l8.5-4.5" />
    </svg>
  );
}

export function IconRadar({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <line x1="12" y1="12" x2="12" y2="2.7" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconDocument({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6.5 3h7l4 4v13a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M13.5 3v4h4" />
      <line x1="8.5" y1="12.5" x2="15.5" y2="12.5" />
      <line x1="8.5" y1="16" x2="13" y2="16" />
    </svg>
  );
}

export function IconMatch({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="6" cy="12" r="3.2" />
      <circle cx="18" cy="12" r="3.2" />
      <line x1="9.2" y1="12" x2="14.8" y2="12" />
    </svg>
  );
}

export function IconGlobe({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <ellipse cx="12" cy="12" rx="3.8" ry="8.5" />
      <line x1="3.5" y1="12" x2="20.5" y2="12" />
    </svg>
  );
}

export function IconTrend({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <polyline points="3,17 8.5,11 12.5,14.2 20,5.5" />
      <polyline points="14.7,5.5 20,5.5 20,10.6" />
    </svg>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 6h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <path d="m4 7 8 6.2L20 7" />
    </svg>
  );
}

export function IconImage({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.6" fill="currentColor" stroke="none" />
      <path d="m20 15.5-5.2-5.2a1 1 0 0 0-1.4 0L6 18" />
    </svg>
  );
}

export function IconSpark({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9.5 18h5" />
      <path d="M10.3 20.5h3.4" />
      <path d="M12 3a6 6 0 0 0-3 11.2c.7.4 1.1 1.1 1.1 1.9v.4h3.8v-.4c0-.8.4-1.5 1.1-1.9A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={2.4} className={className}>
      <path d="M20 6.5 9.5 17 4 11.7" />
    </svg>
  );
}

export function IconCross({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/** 로고 배지용 소형 마크: 흔들리던 선이 하나의 신호(점)로 수렴하는 히어로 모티프의 축소판 (SellHub 전용) */
export function SignalMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <polyline
        points="2,14 5.5,11.5 8.5,15 12.5,6 16.5,8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16.5" cy="8" r="1.8" fill="currentColor" />
    </svg>
  );
}

/** 로고 배지용 소형 마크: 보이지 않던 것을 알아채는 순간을 나타내는 스파클(IntentMate 전용) */
export function SparkleMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 1.5c.8 4.5 1 5.7 8.5 8.5-7.5 2.8-7.7 4-8.5 8.5-.8-4.5-1-5.7-8.5-8.5C9 7.2 9.2 6 10 1.5Z" />
    </svg>
  );
}
