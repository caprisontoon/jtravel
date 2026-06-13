import type { ExtractionResult } from './extract.js';

/**
 * Free geocoding via OpenStreetMap Nominatim — no API key required.
 *
 * Nominatim's usage policy requires a descriptive User-Agent and at most
 * ~1 request/second. Itineraries are small (a handful of places), so we
 * geocode sequentially with a polite delay. This fills real coordinates
 * the LLM can't reliably know, making "directions", distances, and the
 * in-app mini-map accurate.
 */
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'JTravel/0.1 (travel itinerary MVP)';
const RATE_LIMIT_MS = 1100;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface GeoHit {
  lat: number;
  lng: number;
  display: string;
}

async function geocodeOne(query: string): Promise<GeoHit | null> {
  const url = `${NOMINATIM}?q=${encodeURIComponent(query)}&format=json&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' },
    });
    if (!res.ok) return null;
    const arr = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const top = arr[0];
    return { lat: parseFloat(top.lat), lng: parseFloat(top.lon), display: top.display_name };
  } catch {
    return null;
  }
}

function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Fills real coordinates in-place and recomputes route distances. */
export async function geocodePlaces(result: ExtractionResult): Promise<void> {
  const { destinationCity, country } = result.trip;

  for (const p of result.places) {
    const namePart = p.nameLocal || p.name;
    const queries = [
      [namePart, p.location.address, destinationCity, country].filter(Boolean).join(', '),
      [namePart, destinationCity, country].filter(Boolean).join(', '),
    ];

    let hit: GeoHit | null = null;
    for (const q of queries) {
      hit = await geocodeOne(q);
      await delay(RATE_LIMIT_MS); // respect Nominatim's ~1 req/sec policy
      if (hit) break;
    }

    if (hit) {
      p.location.lat = hit.lat;
      p.location.lng = hit.lng;
      p.location.geocodeStatus = 'confirmed';
      p.location.confidence = 0.75;
      if (!p.location.address) p.location.address = hit.display;
    }
  }

  // Recompute distances for routes whose endpoints are now both confirmed.
  const byId = new Map(result.places.map((p) => [p.id, p]));
  for (const r of result.routes) {
    const a = byId.get(r.fromPlaceId);
    const b = byId.get(r.toPlaceId);
    if (a?.location.geocodeStatus === 'confirmed' && b?.location.geocodeStatus === 'confirmed') {
      r.distanceMeters = Math.round(
        haversineMeters(a.location.lat, a.location.lng, b.location.lat, b.location.lng),
      );
    }
  }

  const anyUnresolved = result.places.some((p) => p.location.geocodeStatus === 'unresolved');
  result.extraction.warnings = anyUnresolved ? ['일부 장소 좌표 미확정'] : [];
}
