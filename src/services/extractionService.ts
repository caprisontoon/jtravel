import { ExtractionResult } from '@/types/extraction';
import { mockItinerary } from '@/data/mockItinerary';

export type AnalysisStep = 'captions' | 'extract' | 'geocode' | 'route';

export const ANALYSIS_STEPS: { key: AnalysisStep; label: string }[] = [
  { key: 'captions', label: '자막 수집' },
  { key: 'extract', label: '장소 추출' },
  { key: 'geocode', label: '좌표 매핑' },
  { key: 'route', label: '동선 생성' },
];

const YOUTUBE_RE = /(youtube\.com\/watch\?v=|youtu\.be\/)/i;

export function isValidYoutubeUrl(url: string): boolean {
  return YOUTUBE_RE.test(url.trim());
}

/**
 * Prototype stand-in for the real backend pipeline
 * (YouTube Data API -> captions/STT -> Claude API -> enrichment).
 *
 * Simulates the staged progress shown on the loading screen, then
 * resolves with the mock ExtractionResult. Swap the body with a real
 * `fetch('/analyze')` call when the backend is ready.
 */
export async function analyzeVideo(
  url: string,
  onStep?: (step: AnalysisStep) => void,
): Promise<ExtractionResult> {
  if (!isValidYoutubeUrl(url)) {
    throw new Error('유효한 유튜브 링크가 아니에요.');
  }
  for (const { key } of ANALYSIS_STEPS) {
    onStep?.(key);
    await delay(700);
  }
  return { ...mockItinerary, source: { ...mockItinerary.source, url } };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
