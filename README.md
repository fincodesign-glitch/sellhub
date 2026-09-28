# IntentMate

일본 시장의 구매 인텐트를 분석하고, 관심 있는 일본 바이어를 추천하는 AI 인텐트 마케팅 서비스.

## 시작하기

1. 환경 변수 설정

   ```bash
   cp .env.local.example .env.local
   ```

   - `ANTHROPIC_API_KEY`: [Anthropic Console](https://console.anthropic.com/settings/keys)에서 발급
   - `NEXT_PUBLIC_FIREBASE_*`: Firebase Console에서 프로젝트 생성 후
     1. **Authentication > Sign-in method**에서 Google 로그인 활성화
     2. **Project settings > General > Your apps**에서 웹 앱 추가 후 나오는 설정값을 복사

2. 의존성 설치 및 개발 서버 실행

   ```bash
   npm install
   npm run dev
   ```

   [http://localhost:3000](http://localhost:3000)에서 확인합니다.

## 구조

- `app/page.tsx` — 랜딩 페이지
- `app/login/page.tsx` — Firebase Google 로그인 (선택 사항)
- `app/profile/page.tsx` — 인텐트 분석 대시보드 (Free 플랜, 로그인 없이 바로 이용 가능)
- `app/pricing/page.tsx` — 요금제 안내
- `app/api/analyze/route.ts` — Claude API(`claude-sonnet-5` + `web_search` 툴)로 실시간 웹 리서치 후
  인텐트 분석 리포트를 스트리밍으로 생성하는 서버 라우트
- `lib/firebase.ts`, `lib/auth-context.tsx` — Firebase 인증 클라이언트 설정

## 참고

- 요금제 페이지의 유료 플랜은 아직 실제 결제 연동이 되어 있지 않습니다.
- `/api/analyze`는 매 요청마다 웹 검색을 수행하므로 Anthropic API 사용량에 따라 비용이 발생합니다.
