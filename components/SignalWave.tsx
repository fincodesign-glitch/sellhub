/**
 * SellHub의 시그니처 비주얼: 여러 후보(왼쪽, 불규칙한 선)가 하나의 진짜 바이어(오른쪽, 뚜렷한
 * 신호)로 수렴하는 파형. AI가 수많은 후보 속에서 꼭 맞는 바이어 한 곳을 찾아낸다는 제품의 본질을
 * 그대로 그린다. 순수 CSS(stroke-dasharray) 애니메이션이라 별도 클라이언트 컴포넌트 없이 서버에서
 * 렌더링된다.
 */
const NOISE_PATH =
  "M0,176.2 L16,171.4 L32,180.6 L48,167.8 L64,154.1 L80,164.3 L96,156.2 L112,121.6 L128,162.8 L144,167.5 L160,163.0 L176,139.1 L192,164.6 L208,176.8 L224,179.3 L240,173.1 L256,131.6 L272,129.0 L288,158.8 L304,168.7 L320,131.3 L336,146.8 L352,139.8 L368,149.7 L384,159.1 L400,125.9 L416,152.4 L432,163.2 L448,146.6 L464,161.7 L480,131.3 L496,169.8 L512,148.8 L528,134.6 L544,167.7 L560,135.5 L576,142.7 L592,161.8 L608,140.4 L624,129.4 L640,170.7 L656,136.6 L672,156.8 L688,168.3";

const SIGNAL_PATH =
  "C748,192 796,52 900,50 C978,48.5 976,150 1060,150 L1200,150";

export default function SignalWave({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 260"
      fill="none"
      className={className}
      role="img"
      aria-label="수많은 후보 속에서 진짜 바이어 한 곳을 찾아내는 그래프"
    >
      <defs>
        <linearGradient id="signal-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1200" y2="0">
          <stop offset="0%" stopColor="var(--noise)" />
          <stop offset="52%" stopColor="var(--noise)" />
          <stop offset="66%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="var(--brand)" />
        </linearGradient>
        <filter id="signal-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={NOISE_PATH + " " + SIGNAL_PATH}
        stroke="url(#signal-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="signal-path"
        style={{ ["--signal-length" as string]: 2200 }}
      />
      <circle cx="900" cy="50" r="5" fill="var(--brand)" filter="url(#signal-glow)" className="signal-dot" />
    </svg>
  );
}
