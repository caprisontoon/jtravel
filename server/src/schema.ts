import { z } from 'zod/v4';

/**
 * The shape the LLM must return. Kept intentionally flat and simple so the
 * model focuses on what it can know from a transcript (names, categories,
 * timestamps, rough locations) — factual enrichment (exact coords, ratings,
 * reservation deep links) is layered on in later phases via Google APIs.
 *
 * Structured Outputs requires every property to be present, so optional
 * fields are modeled as `.nullable()` rather than `.optional()`.
 */
export const PlaceCategory = z.enum([
  'restaurant',
  'cafe',
  'lodging',
  'attraction',
  'shopping',
  'transport',
]);

export const TravelMode = z.enum(['walk', 'transit', 'taxi', 'drive']);

export const ExtractedPlace = z.object({
  order: z.number().int().describe('영상 내 등장/방문 순서 (1부터)'),
  day: z.number().int().nullable().describe('추정 일자 (모르면 null)'),
  name: z.string().describe('장소명 (한국어 또는 사용자 언어)'),
  nameLocal: z.string().nullable().describe('현지어 표기 (모르면 null)'),
  category: PlaceCategory,
  subType: z.string().nullable().describe('세부 유형 예: ramen, hotel, observatory'),
  description: z.string().describe('한 줄 설명'),
  lat: z.number().nullable().describe('위도 추정값. 확실치 않으면 null'),
  lng: z.number().nullable().describe('경도 추정값. 확실치 않으면 null'),
  address: z.string().nullable().describe('주소 또는 지역 (모르면 null)'),
  timestampLabel: z.string().nullable().describe('영상 등장 시각 예: 05:12'),
  startSec: z.number().int().nullable().describe('영상 등장 시작 초'),
  quote: z.string().nullable().describe('추출 근거가 된 자막 한 문장'),
  priceLevel: z.string().nullable().describe('가격대 예: $, $$, $$$'),
  tags: z.array(z.string()).describe('특징 태그 (없으면 빈 배열)'),
  reservable: z.boolean().describe('예약 연결이 의미 있는 곳인지'),
  reservationPartner: z
    .string()
    .nullable()
    .describe('추천 예약 제휴처 예: booking, agoda, opentable, tablecheck (모르면 null)'),
});

export const ExtractedRoute = z.object({
  fromOrder: z.number().int().describe('출발 장소의 order'),
  toOrder: z.number().int().describe('도착 장소의 order'),
  mode: TravelMode.describe('추천 이동수단'),
  durationSec: z.number().int().nullable().describe('예상 소요 초 (모르면 null)'),
  distanceMeters: z.number().int().nullable().describe('예상 거리 m (모르면 null)'),
  transitLine: z.string().nullable().describe('대중교통 노선명 (해당 시)'),
  taxiMin: z.number().int().nullable().describe('택시 예상 최소요금 (현지 통화)'),
  taxiMax: z.number().int().nullable().describe('택시 예상 최대요금 (현지 통화)'),
});

export const ExtractionOutput = z.object({
  trip: z.object({
    destinationCity: z.string(),
    country: z.string().describe('ISO 국가코드 예: JP, KR'),
    currency: z.string().describe('ISO 통화코드 예: JPY, KRW'),
    estimatedDays: z.number().int(),
    summary: z.string(),
  }),
  places: z.array(ExtractedPlace),
  routes: z.array(ExtractedRoute),
});

export type ExtractionOutput = z.infer<typeof ExtractionOutput>;
