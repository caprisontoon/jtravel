# JTravel — 유튜브 여행 영상 기반 일정 자동화 앱 (MVP 설계서)

> 유튜브 여행 영상을 입력하면 영상 속 동선·맛집·숙소를 구조화하여
> 지도 기반 일정·교통/택시 요금·예약 연결까지 제공하는 모바일 앱.
>
> **MVP 범위 제외**: 회원가입 / 로그인 / 유저 간 만남·동행 기능 (이번 기획에서 미포함)

---

## 0. 한눈에 보기

| 구분 | 내용 |
|------|------|
| 제품 한 줄 정의 | "여행 유튜브 영상 → 떠먹여 주는 여행 일정" |
| 핵심 가치 | 영상 시청 중 일일이 메모하던 장소를 자동 추출·지도화·예약 연결 |
| 1차 타깃 | 자유여행 준비자 (영상 보고 따라 가려는 사용자) |
| 비범위(Out of Scope) | 인증/소셜/동행 매칭, 결제 자체 처리(예약은 제휴 페이지로 위임) |

---

## 1. User Flow (사용자 동선)

앱 실행부터 예약 완료까지의 핵심 화면 흐름을 Step-by-Step으로 정리합니다.
로그인 단계가 없으므로 **첫 진입 = 바로 사용** 구조입니다.

### 1.1 메인 플로우 (Happy Path)

```
[1] 앱 실행 (Splash)
      │  (로그인 없음 → 바로 진입)
      ▼
[2] Home
      │  · 상단: 유튜브 링크 입력 바 / 붙여넣기 버튼
      │  · 하단: 최근 분석한 영상(로컬 저장) 리스트
      ▼
[3] 링크 입력 & 분석 요청
      │  · URL 유효성 검사 (youtube.com / youtu.be)
      │  · "일정 만들기" CTA 탭
      ▼
[4] AI 분석 로딩 (Progress)
      │  · 자막/메타데이터 수집 → 장소 추출 → 좌표 보정(Geocoding)
      │  · 평균 10~30초, 단계별 진행 상태 표시
      │  · (실패 시) 재시도 / 수동 입력 안내
      ▼
[5] Itinerary (일정 결과) ─ 탭 전환형 화면
      │  ├─ (A) List 탭: Day별 / 카테고리별 장소 카드 리스트
      │  └─ (B) Map 탭: 동선(Route)이 그려진 구글 맵
      ▼
[6] Place Detail (장소 상세) ─ Bottom Sheet 또는 풀스크린
      │  · 사진 / 평점 / 리뷰 요약 / 영업시간
      │  · 영상 내 등장 타임스탬프 → "영상에서 보기"
      │  · 이전 장소로부터의 교통/택시 요금
      ▼
[7] 이동수단 확인 (Transit / Taxi)
      │  · 대중교통 경로 추천 + 예상 소요시간
      │  · 택시 적정 요금(거리·시간 기반) 산출
      ▼
[8] 예약 (Reservation)
      │  · "예약하기" 탭 → 제휴 API 페이지(In-App Browser / Deep Link)
      │  · 식당: 예약 플랫폼 / 숙소: OTA 예약 페이지
      ▼
[9] 완료 & 일정 저장
         · 분석 결과 로컬 저장(재방문 시 [2]의 최근 리스트에 노출)
         · 일정 공유(링크/이미지 내보내기) (선택)
```

### 1.2 분기 / 예외 플로우

| 상황 | 처리 |
|------|------|
| 잘못된 URL | Home 입력 바 하단 인라인 에러 + 예시 표시 |
| 자막 없는 영상 | 음성→텍스트(STT) 폴백 시도, 실패 시 "추출 불가" 안내 |
| 장소 좌표 미확정 | "위치 미확인" 배지 + 사용자가 수동 핀 조정 |
| 예약 미지원 장소 | "예약 링크 없음" → 구글맵 길찾기로 대체 |
| 네트워크 실패 | 로딩 화면에서 재시도 버튼, 로컬 캐시 우선 노출 |

---

## 2. UI Component Structure (화면별 UI 컴포넌트 구조)

재사용 가능한 모바일 컴포넌트 관점에서 계층적으로 설계합니다.
표기: `ScreenName` › `Section` › `Component(props)`

### 2.1 공통 디자인 시스템 (Reusable Atoms / Molecules)

```
DesignSystem
├─ Atoms
│   ├─ Button (variant: primary | secondary | ghost | icon)
│   ├─ Chip / Tag (category, dayBadge, statusBadge)
│   ├─ Rating (score, count)
│   ├─ Avatar / Thumbnail (rounded, ratio)
│   ├─ Icon (set: place/food/hotel/transit/taxi)
│   └─ Skeleton (loading placeholder)
├─ Molecules
│   ├─ SearchBar (linkInput, paste, clear)
│   ├─ PlaceCard (thumb, title, category, rating, distance)
│   ├─ RouteStepItem (order, from→to, mode, duration, fare)
│   ├─ TimestampTag (mm:ss, onTapSeek)
│   └─ PriceLabel (currency, estimated range)
└─ Organisms
    ├─ AppBar (title, back, action)
    ├─ BottomSheet (snapPoints, draggable handle)
    ├─ SegmentedTabBar (List ↔ Map)
    └─ FloatingActionButton (FAB)
```

### 2.2 Home Screen

```
HomeScreen
├─ AppBar
│   └─ Logo · (Settings IconButton)
├─ HeroSection
│   ├─ Headline ("유튜브 링크로 여행 일정 만들기")
│   └─ SearchBar(type=youtubeLink)
│        ├─ TextInput (placeholder, validation)
│        ├─ PasteButton
│        └─ SubmitButton ("일정 만들기", disabled until valid)
├─ RecentSection (로컬 저장 기반)
│   └─ HorizontalList<PlaceVideoCard>
│        └─ VideoCard (thumb, title, channel, placeCount, savedAt)
└─ EmptyState (최근 항목 없을 때: 사용 예시 일러스트 + 샘플 링크)
```

### 2.3 Analysis Loading Screen

```
AnalysisLoadingScreen
├─ VideoPreviewHeader (thumbnail, title)
├─ ProgressStepper (vertical)
│   ├─ Step(자막 수집)      → done | active | pending
│   ├─ Step(장소 추출)
│   ├─ Step(좌표 매핑)
│   └─ Step(동선 생성)
├─ ProgressBar / Lottie (indeterminate)
└─ CancelButton (ghost)
```

### 2.4 Itinerary Screen (List ↔ Map 전환)

```
ItineraryScreen
├─ AppBar (videoTitle, back, ShareAction)
├─ SegmentedTabBar (List | Map)         ← 같은 데이터, 뷰 전환
│
├─ [List Tab]
│   ├─ DayFilterChips (Day1 / Day2 / 전체)   (선택)
│   ├─ CategoryFilterChips (전체/맛집/숙소/명소)
│   └─ SectionList
│        └─ Section(Day N)
│             └─ PlaceCard[]
│                  ├─ Thumbnail · Rating · CategoryChip
│                  ├─ TimestampTag (영상 구간)
│                  └─ TrailingMeta (이전 장소 대비 거리/시간)
│
└─ [Map Tab]
    ├─ GoogleMap (markers, polyline route, clustering)
    │   ├─ NumberedMarker[] (방문 순서)
    │   └─ RoutePolyline (동선)
    ├─ FloatingActionButton (현재위치 / 전체보기 fit-bounds)
    └─ BottomSheet (snap: peek/half/full)
         └─ HorizontalCarousel<PlaceCard>  ← 마커 탭 시 동기화
```

### 2.5 Place Detail (Bottom Sheet → 풀스크린 확장)

```
PlaceDetailSheet
├─ DragHandle
├─ HeaderSection
│   ├─ ImageCarousel (photos)
│   ├─ Title · CategoryChip · Rating(score, count)
│   └─ ActionRow
│        ├─ Button("길찾기")        → Google Maps Deep Link
│        ├─ Button("영상에서 보기")  → TimestampTag seek
│        └─ Button("예약하기", primary)
├─ InfoSection
│   ├─ InfoRow (주소 / 영업시간 / 전화 / 가격대)
│   └─ ReviewSummary (AI 요약 + 대표 리뷰 3건)
├─ TransitSection
│   ├─ RouteStepItem (대중교통 추천)
│   └─ TaxiFareCard (예상 적정 요금 range)
└─ MapPreview (정적 미니맵)
```

### 2.6 Reservation Screen

```
ReservationScreen
├─ AppBar ("예약")
├─ PartnerInfoCard (제휴처 로고, 안내)
├─ InAppBrowser / WebView (제휴 예약 페이지)
└─ FallbackBanner (예약 불가 시 외부 링크/전화 안내)
```

---

## 3. AI Extraction Data Model (JSON 스키마)

유튜브 자막·메타데이터에서 AI가 추출해야 할 결과물의 구조입니다.
LLM 출력 → 후처리(Geocoding/Places 보강) → 앱 렌더링에 사용됩니다.

### 3.1 최상위 스키마

```jsonc
{
  "schemaVersion": "1.0",
  "source": {
    "videoId": "abcd1234",
    "url": "https://youtu.be/abcd1234",
    "title": "도쿄 3박 4일 먹방 여행 코스",
    "channel": "여행유튜버",
    "publishedAt": "2025-11-02",
    "language": "ko",
    "durationSec": 1240,
    "captionType": "auto | manual | stt-fallback"
  },
  "trip": {
    "destinationCity": "Tokyo",
    "country": "JP",
    "currency": "JPY",
    "estimatedDays": 4,
    "summary": "도쿄 핵심 맛집과 시부야/아사쿠사 동선 중심 여행"
  },
  "places": [ /* PlaceObject[] — 3.2 참조 */ ],
  "routes": [ /* RouteSegment[] — 3.3 참조 */ ],
  "extraction": {
    "model": "claude-opus-4-8",
    "confidenceOverall": 0.87,
    "warnings": ["일부 장소 좌표 미확정"]
  }
}
```

### 3.2 PlaceObject (장소 단위)

```jsonc
{
  "id": "p_001",
  "order": 1,                          // 영상 내 등장/방문 순서
  "day": 1,                            // 추정 일자 (없으면 null)
  "name": "이치란 시부야점",
  "nameLocal": "一蘭 渋谷店",
  "category": "restaurant",            // restaurant | cafe | lodging | attraction | shopping | transport
  "subType": "ramen",                  // 자유 텍스트 태그
  "description": "돈코츠 라멘 전문점, 1인석 유명",
  "location": {
    "lat": 35.6595,
    "lng": 139.7005,
    "address": "Tokyo, Shibuya City, ...",
    "geocodeStatus": "confirmed | approximate | unresolved",
    "placeId": "ChIJ...",              // Google Places ID (후처리로 채움)
    "confidence": 0.92
  },
  "videoRefs": [
    {
      "startSec": 312,                 // 타임스탬프(초)
      "endSec": 358,
      "timestampLabel": "05:12",
      "quote": "여기 라멘이 진짜 인생 라멘이에요"  // 추출 근거 자막
    }
  ],
  "details": {
    "rating": null,                    // 후처리(Places API)로 채움
    "userRatingsTotal": null,
    "priceLevel": "$$",
    "openingHours": null,
    "phone": null,
    "photoRefs": [],
    "tags": ["혼밥가능", "현금"]
  },
  "reservation": {
    "reservable": true,
    "partner": "tablecheck | opentable | booking | agoda | null",
    "deepLink": null,
    "externalUrl": null
  },
  "source": {
    "extractedFrom": "caption | description | comment",
    "confidence": 0.88
  }
}
```

### 3.3 RouteSegment (동선/이동 단위)

```jsonc
{
  "id": "r_001",
  "fromPlaceId": "p_001",
  "toPlaceId": "p_002",
  "order": 1,
  "distanceMeters": 1800,
  "recommended": {
    "mode": "transit",                 // walk | transit | taxi | drive
    "durationSec": 720,
    "transit": {
      "line": "JR 야마노테선",
      "departStop": "시부야역",
      "arriveStop": "신주쿠역",
      "transfers": 0
    }
  },
  "taxi": {
    "estimatedFare": { "min": 1200, "max": 1600, "currency": "JPY" },
    "durationSec": 540,
    "basis": "distance+time model"
  }
}
```

> **설계 메모**
> - AI(LLM)는 `places`/`routes`의 **텍스트·타임스탬프·추정값**만 책임지고,
>   `location.placeId`, `details.rating`, `reservation.deepLink` 등 **사실 데이터는
>   후처리 단계에서 외부 API로 보강**합니다 (환각 방지).
> - 모든 객체에 `confidence`를 두어 UI에서 "위치 미확인" 등 신뢰도 표시에 활용합니다.

---

## 4. Tech Stack & API Integration

### 4.1 클라이언트 / 백엔드 스택

| 레이어 | 선택 | 비고 |
|--------|------|------|
| 모바일 | **React Native (Expo)** 또는 Flutter | 단일 코드베이스, 빠른 MVP |
| 상태관리 | React Query + Zustand | 서버 캐시 + 로컬 상태 분리 |
| 백엔드 | **Node.js (NestJS)** 또는 Python(FastAPI) | AI 파이프라인 오케스트레이션 |
| AI 추출 | **Anthropic Claude API (claude-opus-4-8)** | 자막→구조화 JSON, structured output/tool use |
| 자막 수집 | youtube-transcript-api / yt-dlp | 자막·메타데이터 |
| STT 폴백 | OpenAI Whisper / Google STT | 자막 없는 영상 대비 |
| 저장 | (MVP) 디바이스 로컬(MMKV/AsyncStorage) | 로그인 없음 → 서버 계정 저장 불필요 |
| 캐시 | Redis | 동일 영상 재분석 비용 절감 |

### 4.2 외부 API 목록 및 역할

#### (1) 지도 / 장소 — Google Maps Platform

| API | 역할 |
|-----|------|
| **Maps SDK (Android/iOS)** | 지도 렌더링, 마커, 동선 Polyline 표시 |
| **Geocoding API** | 장소명/주소 → 좌표 변환 (AI 추출 좌표 보정) |
| **Places API** | 평점·리뷰·사진·영업시간·전화 등 상세정보 보강 |
| **Directions API** | 출발-도착 경로, 대중교통/도보/차량 경로 및 소요시간 |
| **Distance Matrix API** | 다지점 거리/시간 행렬 → 동선 최적화 & 택시 요금 산출 기초 |
| **Routes API** | (신규 통합 API) Directions+Distance Matrix 대체 가능 |

#### (2) 교통 / 택시 요금

| API | 역할 |
|-----|------|
| **Google Directions (transit mode)** | 대중교통편(노선/환승/소요시간) 추천 |
| **Uber / Bolt / Grab Price Estimates API** | 실 호출 가능 지역의 차량 호출 예상 요금 |
| **자체 택시 요금 모델** | 미지원 지역 대비: `기본요금 + 거리×요율 + 시간×요율`을 Distance Matrix 결과로 산출 (도시별 요율 테이블 관리) |

> 택시 요금은 지역별 정식 API가 제한적이므로, **글로벌 커버리지를 위해
> Distance Matrix 기반 자체 추정 모델을 기본**으로 두고, Uber/Grab 가능 지역에선
> 실 견적 API로 보강하는 하이브리드 방식을 권장합니다.

#### (3) 예약 (식당 / 숙박) — 제휴 / 어필리에이트

| API | 역할 |
|-----|------|
| **Booking.com Affiliate / Demand API** | 숙박 검색·가격·예약 페이지 딥링크 |
| **Agoda Affiliate API** | 아시아권 숙박 강세, 예약 연결 |
| **Expedia Rapid (EPS)** | 글로벌 숙박 인벤토리/예약 |
| **OpenTable / TableCheck API** | 식당 예약 (TableCheck는 일본·아시아 강세) |
| **Google Places "reservation" 링크** | 전용 제휴 없는 식당의 예약/연락 폴백 |

> 예약은 앱이 직접 결제하지 않고 **제휴 페이지로 위임(어필리에이트)** 하여
> MVP 복잡도와 PG/정산 부담을 제거합니다.

#### (4) 콘텐츠 소스 — YouTube

| API | 역할 |
|-----|------|
| **YouTube Data API v3** | 영상 메타데이터(제목/채널/설명) 조회 |
| (자막) youtube-transcript / yt-dlp | 자막 텍스트 추출 (Data API는 자막 본문 제한적) |

### 4.3 데이터 처리 파이프라인 (요약)

```
유튜브 URL
   │
   ▼
[수집] 메타데이터(YouTube Data API) + 자막(transcript) ─(없으면)→ STT(Whisper)
   │
   ▼
[추출] Claude API → 3장 JSON 스키마(places/routes) 구조화
   │
   ▼
[보강] Geocoding(좌표) + Places(평점/사진/예약링크) + Distance Matrix(거리/시간)
   │
   ▼
[산출] 동선 정렬 + 대중교통 추천(Directions) + 택시 요금 추정
   │
   ▼
[캐시] Redis 저장 → 클라이언트 응답 → 디바이스 로컬 저장
```

---

## 5. MVP 우선순위 제언

| 우선 | 기능 | 이유 |
|------|------|------|
| P0 | URL 입력 → AI 추출 → List/Map 일정 | 제품 핵심 가치 |
| P0 | Google Places 상세 보강 + 길찾기 딥링크 | 신뢰성·실사용성 |
| P1 | 대중교통 추천 + 택시 요금 추정 | 차별화 포인트 |
| P1 | 예약 제휴 딥링크 | 수익화 기반(어필리에이트) |
| P2 | 일정 공유/이미지 내보내기, 수동 핀 편집 | 리텐션 향상 |

> 로그인·소셜·동행 기능은 본 MVP에서 의도적으로 제외하여
> "영상 → 일정" 핵심 루프 검증에 집중합니다.
