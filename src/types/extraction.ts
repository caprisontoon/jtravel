/**
 * Type definitions mirroring the AI Extraction JSON Schema
 * documented in docs/MVP_DESIGN.md §3.
 *
 * The LLM produces text/timestamps/estimates; factual fields
 * (placeId, rating, reservation deep links) are filled in during
 * the post-processing enrichment step.
 */

export type PlaceCategory =
  | 'restaurant'
  | 'cafe'
  | 'lodging'
  | 'attraction'
  | 'shopping'
  | 'transport';

export type GeocodeStatus = 'confirmed' | 'approximate' | 'unresolved';
export type TravelMode = 'walk' | 'transit' | 'taxi' | 'drive';

export interface VideoSource {
  videoId: string;
  url: string;
  title: string;
  channel: string;
  publishedAt: string;
  language: string;
  durationSec: number;
  captionType: 'auto' | 'manual' | 'stt-fallback';
}

export interface TripMeta {
  destinationCity: string;
  country: string;
  currency: string;
  estimatedDays: number;
  summary: string;
}

export interface VideoRef {
  startSec: number;
  endSec: number;
  timestampLabel: string;
  quote: string;
}

export interface PlaceLocation {
  lat: number;
  lng: number;
  address: string;
  geocodeStatus: GeocodeStatus;
  placeId: string | null;
  confidence: number;
}

export interface PlaceDetails {
  rating: number | null;
  userRatingsTotal: number | null;
  priceLevel: string | null;
  openingHours: string | null;
  phone: string | null;
  photoRefs: string[];
  tags: string[];
}

export interface Reservation {
  reservable: boolean;
  partner: string | null;
  deepLink: string | null;
  externalUrl: string | null;
}

export interface Place {
  id: string;
  order: number;
  day: number | null;
  name: string;
  nameLocal?: string;
  category: PlaceCategory;
  subType?: string;
  description: string;
  location: PlaceLocation;
  videoRefs: VideoRef[];
  details: PlaceDetails;
  reservation: Reservation;
  source: {
    extractedFrom: 'caption' | 'description' | 'comment';
    confidence: number;
  };
}

export interface RouteSegment {
  id: string;
  fromPlaceId: string;
  toPlaceId: string;
  order: number;
  distanceMeters: number;
  recommended: {
    mode: TravelMode;
    durationSec: number;
    transit?: {
      line: string;
      departStop: string;
      arriveStop: string;
      transfers: number;
    };
  };
  taxi: {
    estimatedFare: { min: number; max: number; currency: string };
    durationSec: number;
    basis: string;
  };
}

export interface ExtractionResult {
  schemaVersion: string;
  source: VideoSource;
  trip: TripMeta;
  places: Place[];
  routes: RouteSegment[];
  extraction: {
    model: string;
    confidenceOverall: number;
    warnings: string[];
  };
}
