import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { ExtractionOutput } from './schema.js';
import type { VideoData } from './youtube.js';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const SYSTEM = `당신은 여행 유튜브 영상의 자막을 분석해 구조화된 여행 일정을 추출하는 전문가입니다.
- 자막에 실제로 등장하는 장소(식당/카페/숙소/명소/쇼핑/교통)만 추출하세요. 추측으로 없는 장소를 만들지 마세요.
- 각 장소의 등장 순서(order)와 가능한 경우 타임스탬프, 근거 자막 한 문장(quote)을 포함하세요.
- 좌표(lat/lng)와 주소는 확실히 아는 유명 장소만 채우고, 모르면 반드시 null로 두세요. 지어내지 마세요.
- 일자(day)는 자막에서 "첫째 날/Day 1" 같은 단서가 있을 때만 채우고, 없으면 null.
- routes는 연속한 장소 사이 이동만, 합리적으로 추정 가능한 값만 채우고 나머지는 null.
- 통화는 여행지 기준(예: 일본=JPY). 택시 요금은 현지 통화로 대략 추정.`;

/** Full result shape consumed by the mobile app (mirrors docs/MVP_DESIGN.md §3). */
export interface ExtractionResult {
  schemaVersion: string;
  source: {
    videoId: string;
    url: string;
    title: string;
    channel: string;
    publishedAt: string;
    language: string;
    durationSec: number;
    captionType: string;
  };
  trip: ExtractionOutput['trip'];
  places: any[];
  routes: any[];
  extraction: { model: string; confidenceOverall: number; warnings: string[] };
}

const MODEL = 'claude-opus-4-8';
// Transcripts can be long; cap input to stay well within limits and control cost.
const MAX_TRANSCRIPT_CHARS = 24000;

export async function extractItinerary(
  url: string,
  video: VideoData,
): Promise<ExtractionResult> {
  const transcript = video.transcript.slice(0, MAX_TRANSCRIPT_CHARS);

  const message = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    output_config: { format: zodOutputFormat(ExtractionOutput) },
    messages: [
      {
        role: 'user',
        content: `다음은 유튜브 여행 영상 "${video.title}" (채널: ${video.channel})의 자막입니다.\n여행 일정을 추출해 주세요.\n\n---\n${transcript}`,
      },
    ],
  });

  const parsed = message.parsed_output;
  if (!parsed) {
    throw new Error('AI가 일정을 추출하지 못했어요. 다시 시도해 주세요.');
  }

  return assembleResult(url, video, parsed);
}

/** Maps the model's flat output into the app's full ExtractionResult shape. */
function assembleResult(
  url: string,
  video: VideoData,
  out: ExtractionOutput,
): ExtractionResult {
  const places = out.places
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((p) => {
      const hasCoords = p.lat != null && p.lng != null;
      return {
        id: `p_${String(p.order).padStart(3, '0')}`,
        order: p.order,
        day: p.day,
        name: p.name,
        nameLocal: p.nameLocal ?? undefined,
        category: p.category,
        subType: p.subType ?? undefined,
        description: p.description,
        location: {
          lat: p.lat ?? 0,
          lng: p.lng ?? 0,
          address: p.address ?? '',
          geocodeStatus: hasCoords ? 'approximate' : 'unresolved',
          placeId: null,
          confidence: hasCoords ? 0.6 : 0.0,
        },
        videoRefs: p.timestampLabel
          ? [
              {
                startSec: p.startSec ?? 0,
                endSec: (p.startSec ?? 0) + 30,
                timestampLabel: p.timestampLabel,
                quote: p.quote ?? '',
              },
            ]
          : [],
        details: {
          rating: null,
          userRatingsTotal: null,
          priceLevel: p.priceLevel ?? null,
          openingHours: null,
          phone: null,
          photoRefs: [],
          tags: p.tags ?? [],
        },
        reservation: {
          reservable: p.reservable,
          partner: p.reservationPartner ?? null,
          deepLink: null,
          externalUrl: null,
        },
        source: { extractedFrom: 'caption' as const, confidence: 0.8 },
      };
    });

  const orderToId = new Map(places.map((p) => [p.order, p.id]));

  const routes = out.routes
    .filter((r) => orderToId.has(r.fromOrder) && orderToId.has(r.toOrder))
    .map((r, i) => ({
      id: `r_${String(i + 1).padStart(3, '0')}`,
      fromPlaceId: orderToId.get(r.fromOrder)!,
      toPlaceId: orderToId.get(r.toOrder)!,
      order: i + 1,
      distanceMeters: r.distanceMeters ?? 0,
      recommended: {
        mode: r.mode,
        durationSec: r.durationSec ?? 0,
        ...(r.transitLine
          ? {
              transit: {
                line: r.transitLine,
                departStop: '',
                arriveStop: '',
                transfers: 0,
              },
            }
          : {}),
      },
      taxi: {
        estimatedFare: {
          min: r.taxiMin ?? 0,
          max: r.taxiMax ?? 0,
          currency: out.trip.currency,
        },
        durationSec: r.durationSec ?? 0,
        basis: 'llm estimate',
      },
    }));

  const warnings: string[] = [];
  if (places.some((p) => p.location.geocodeStatus === 'unresolved')) {
    warnings.push('일부 장소 좌표 미확정 (지도 연동 단계에서 보정 예정)');
  }

  return {
    schemaVersion: '1.0',
    source: {
      videoId: video.videoId,
      url,
      title: video.title,
      channel: video.channel,
      publishedAt: '',
      language: video.language,
      durationSec: 0,
      captionType: video.captionType,
    },
    trip: out.trip,
    places,
    routes,
    extraction: { model: MODEL, confidenceOverall: 0.8, warnings },
  };
}
