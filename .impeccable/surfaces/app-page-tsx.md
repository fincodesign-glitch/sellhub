---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

# Surface: SellHub Home (app/page.tsx)

Mode: Persuade. Visitor: 해외 진출을 노리는 K-제품 셀러. Job: SellHub가 무엇을 대신해주는지 몇 초 안에 이해하고 무료로 시작한다. Proof/content: 실제 요금제 구조, 실제 목표 시장 3곳(일본/미국/동남아), 실제 회사소개서 PDF. 없는 것: 고객 후기, 사용자 수, 전환율 등 지어낼 수 없는 수치. Must remain untouched: 기존 브랜드명, 요금제 링크, 회사소개서 링크, `/profile` CTA 목적지, SiteHeader/SiteFooter 공용 컴포넌트.

## Direction contract

THESIS: 이 홈페이지는 "히어로 → 기능 그리드 → CTA" 마케팅 스크롤이 아니라, 완성되어 승인 도장이 찍힌 수출신고서 한 장이다. 지금까지 시도한 모든 방향(에디토리얼, 에이전시, 애플식 챕터, 포트폴리오 콜라주)이 공유하던 그 뼈대를 정면으로 거부한다.

OWN-WORLD: 종이/서식 색(오프화이트 바탕, 검정 격자 잉크), 번호 매겨진 격자 필드(01, 02, 03 박스), 점선 재단선으로 구간을 나누고, 회전된 빨간 원형 "승인" 도장 모티프, 바코드 스트립 장식, 참조번호는 모노스페이스, 라벨은 각지고 트래킹이 좁은 고딕. SellHub 기존 브랜드 블루(#4fa8dd)는 "승인" 상태 색으로, 코럴(#ff7a45)은 도장/강조 색으로 격상해서 쓴다.

STORY: 방문자는 자기 제품 정보가 신고서 필드에 "기재"되는 것을 보고, AI가 그것을 처리해 매칭된 바이어 + 메일로 만들어내는 과정을 지켜본 뒤, 화면에 도장이 찍히는 "승인" 순간을 받는다 — 공식 서류가 통과되는 익숙한 신뢰 의식을 그대로 빌려온다.

FIRST VIEWPORT: 상단에 실제 신고서 헤더처럼 "품목/신청인" 격자 필드 안에 SellHub의 실제 헤드라인 문구가 들어가고, 오른쪽 상단에 회전된 빨간 원형 도장 워터마크, CTA 버튼은 서식의 "제출" 박스 형태. 아래로 서류의 각 조항처럼 번호 매겨진 섹션이 이어진다.

FORM: 자체 그라운디드 후보 목록의 7번째(assigned index 7, seed key d8f2347f) — 한국 수출신고필증(관세청 서류) 양식 언어. RAISE(VU-meter bridge 챌린저에서): 바이어 후보 목록은 카드가 아니라 동일한 격자 행이 반복되는 한 줄로 렌더링하고, 매칭된 한 곳만 다른 색으로 튄다. RAISE(provenance ribbon 챌린저에서): 실제 확정 사실(요금제, 시장 3곳)은 진한 잉크로, 예시/샘플성 내용은 옅은 처리로 구분해 실제 고객 기록처럼 보이지 않게 한다.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Approved comp

`.impeccable/mocks/comp-b.png` (sidecar `.impeccable/mocks/comp-b.json`, approved: true) — 후보 15칸 중 1칸만 파란색으로 하이라이트되는 "매칭 줄항목" 구조가 선택된 시안. comp-a.png, comp-c.png는 미채택 대안으로 보관.
