import { YoutubeTranscript } from 'youtube-transcript';

export interface VideoData {
  videoId: string;
  title: string;
  channel: string;
  /** Plain transcript with [mm:ss] markers, ready to feed the model. */
  transcript: string;
  captionType: 'manual' | 'auto' | 'stt-fallback';
  language: string;
}

const YT_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/;

export function parseVideoId(url: string): string | null {
  const m = url.match(YT_RE);
  return m ? m[1] : null;
}

function toLabel(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/**
 * Fetches title/channel via oEmbed (no API key) and the transcript via the
 * youtube-transcript package (no API key). Throws a friendly error if the
 * video has no captions.
 */
export async function fetchVideoData(url: string): Promise<VideoData> {
  const videoId = parseVideoId(url);
  if (!videoId) throw new Error('유효한 유튜브 링크가 아니에요.');

  // Title + channel (best-effort; failure here is non-fatal).
  let title = '제목 미상';
  let channel = '';
  try {
    const oembed = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    );
    if (oembed.ok) {
      const j = (await oembed.json()) as { title?: string; author_name?: string };
      title = j.title ?? title;
      channel = j.author_name ?? '';
    }
  } catch {
    // ignore — metadata is optional
  }

  // Transcript (required).
  let segments: { text: string; offset: number }[];
  try {
    const raw = await YoutubeTranscript.fetchTranscript(videoId);
    segments = raw.map((r) => ({ text: r.text, offset: r.offset }));
  } catch {
    throw new Error(
      '이 영상에서 자막을 찾지 못했어요. 자막이 있는 다른 여행 영상으로 시도해 주세요.',
    );
  }

  if (segments.length === 0) {
    throw new Error('자막이 비어 있어요. 다른 영상으로 시도해 주세요.');
  }

  // The package reports offset in ms on most versions; normalize to seconds.
  const transcript = segments
    .map((s) => {
      const secs = s.offset > 10000 ? s.offset / 1000 : s.offset;
      return `[${toLabel(secs)}] ${s.text}`;
    })
    .join('\n');

  return { videoId, title, channel, transcript, captionType: 'auto', language: 'auto' };
}
