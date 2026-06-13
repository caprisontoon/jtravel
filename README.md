# JTravel 📍

유튜브 여행 영상을 기반으로 구조화된 여행 일정을 제공하는 모바일 앱 (MVP 프로토타입).

> 영상 링크 입력 → AI 장소 추출 → 지도 동선 시각화 → 교통/택시 요금 → 제휴 예약 연결.
> 회원가입/로그인/동행 기능은 MVP 범위에서 제외.

## 문서

| 문서 | 내용 |
|------|------|
| [docs/MVP_DESIGN.md](docs/MVP_DESIGN.md) | User Flow · UI 컴포넌트 구조 · AI 추출 JSON 스키마 · 기술 스택/API |
| [docs/WIREFRAMES.md](docs/WIREFRAMES.md) | 화면별 ASCII 와이어프레임 + 인터랙션 노트 |

## 실행

```bash
npm install
npm start        # Expo Dev Server (i: iOS, a: Android, w: web)
npm run typecheck
```

> Expo Go 앱으로 QR을 스캔하면 실기기에서 바로 확인할 수 있습니다.

## 구조

```
App.tsx                     앱 진입점 (Navigation 루트)
src/
├─ navigation/              React Navigation 스택 + 파라미터 타입
├─ screens/                 Home · AnalysisLoading · Itinerary · PlaceDetail · Reservation
├─ components/              Button · Chip · Rating · PlaceCard · SegmentedTabBar · MapPlaceholder
├─ services/                extractionService (AI 파이프라인 mock)
├─ data/                    mockItinerary (샘플 추출 결과)
├─ types/                   extraction.ts (MVP_DESIGN §3 스키마의 TS 타입)
└─ theme/                   디자인 토큰 (colors/spacing/typography)
```

## 프로토타입 현황 (Mock 기반)

- ✅ 5개 핵심 화면 네비게이션 흐름 (와이어프레임 반영)
- ✅ Itinerary List ↔ Map 탭 전환, Day/카테고리 필터
- ✅ 장소 상세: 정보 · 영상 타임스탬프 딥링크 · 교통/택시 요금
- ✅ 예약: 제휴 페이지 연결 + 미지원 시 폴백
- ⏳ `extractionService.analyzeVideo` 는 mock — 실제 백엔드(`POST /analyze`)로 교체 예정
- ⏳ `MapPlaceholder` 는 `react-native-maps` <MapView/Marker/Polyline> 로 교체 예정

## 진짜 AI 분석 켜기 (Phase 1 — 완료 ✅)

`server/` 폴더에 분석 서버가 들어 있습니다. Claude API 열쇠만 있으면 아무 여행
유튜브 링크나 진짜로 분석됩니다. 설정 방법은 **[server/README.md](server/README.md)** 참고.
앱 쪽은 `src/config.ts` 의 `API_BASE_URL` 에 서버 주소를 넣으면 mock → 실제로 전환됩니다.

## 다음 단계

1. ~~백엔드 추출 파이프라인 (자막 → Claude API)~~ → `server/` 에 구현됨
2. Google Maps Platform 연동 (Geocoding/Places/Directions/Distance Matrix)
3. 예약 제휴 API (Booking/Agoda/OpenTable/TableCheck) 딥링크
4. 디바이스 로컬 저장 (최근 분석 영상)
