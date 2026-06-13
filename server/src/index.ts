import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fetchVideoData } from './youtube.js';
import { extractItinerary } from './extract.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT ?? 8787);

// Simple health check so the app (and you) can confirm the server is up.
app.get('/health', (_req, res) => {
  res.json({ ok: true, hasKey: Boolean(process.env.ANTHROPIC_API_KEY) });
});

/**
 * POST /analyze  { url: "https://youtu.be/..." }
 * Fetches captions, runs the Claude extraction, returns the full itinerary JSON.
 */
app.post('/analyze', async (req, res) => {
  const url: unknown = req.body?.url;
  if (typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: '유튜브 링크(url)가 필요해요.' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: '서버에 ANTHROPIC_API_KEY가 설정되지 않았어요. .env 파일을 확인하세요.' });
  }

  try {
    console.log(`[analyze] ${url}`);
    const video = await fetchVideoData(url);
    const result = await extractItinerary(url, video);
    console.log(`[analyze] done: ${result.places.length} places`);
    res.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '분석 중 오류가 발생했어요.';
    console.error('[analyze] error:', msg);
    res.status(502).json({ error: msg });
  }
});

app.listen(PORT, () => {
  console.log(`JTravel 분석 서버 실행 중 → http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠ ANTHROPIC_API_KEY가 없습니다. server/.env 파일에 열쇠를 넣어주세요.');
  }
});
