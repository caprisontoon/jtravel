import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Place } from '@/types/extraction';
import { categoryIcon, colors, radius, spacing, typography } from '@/theme';
import { Rating } from './Rating';

interface Props {
  places: Place[];
  onSelectPlace: (place: Place) => void;
}

/**
 * Lightweight stand-in for the Google Maps view (§3' wireframe).
 *
 * Real implementation: replace with `react-native-maps` <MapView> +
 * numbered <Marker>s and a <Polyline> for the route. Kept as a
 * dependency-free placeholder so the prototype runs in Expo Go without
 * native map configuration. The marker<->carousel sync behavior is
 * modeled here via `selected`.
 */
interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

function hasCoords(p: Place): boolean {
  return p.location.lat !== 0 || p.location.lng !== 0;
}

/** Maps a place's real lat/lng to a percentage position within the canvas. */
function positionFor(p: Place, bounds: Bounds | null): { left: string; top: string } {
  if (!bounds || !hasCoords(p)) return { left: '47%', top: '45%' };
  const latSpan = bounds.maxLat - bounds.minLat || 1;
  const lngSpan = bounds.maxLng - bounds.minLng || 1;
  const x = (p.location.lng - bounds.minLng) / lngSpan; // 0..1 west→east
  const y = (bounds.maxLat - p.location.lat) / latSpan; // 0..1 north→south
  return { left: `${10 + x * 78}%`, top: `${14 + y * 66}%` };
}

export function MapPlaceholder({ places, onSelectPlace }: Props) {
  const [selected, setSelected] = useState<string | null>(places[0]?.id ?? null);

  const bounds = useMemo<Bounds | null>(() => {
    const pts = places.filter(hasCoords);
    if (pts.length === 0) return null;
    return {
      minLat: Math.min(...pts.map((p) => p.location.lat)),
      maxLat: Math.max(...pts.map((p) => p.location.lat)),
      minLng: Math.min(...pts.map((p) => p.location.lng)),
      maxLng: Math.max(...pts.map((p) => p.location.lng)),
    };
  }, [places]);

  return (
    <View style={styles.container}>
      <View style={styles.canvas}>
        <Text style={styles.canvasHint}>🗺️ 실제 좌표 기반 위치 (정식 지도는 다음 단계)</Text>
        {places.map((p) => {
          const active = p.id === selected;
          const { left, top } = positionFor(p, bounds);
          return (
            <Pressable
              key={p.id}
              style={[styles.marker, { left, top }, active && styles.markerActive]}
              onPress={() => setSelected(p.id)}
            >
              <Text style={[styles.markerLabel, active && styles.markerLabelActive]}>
                {p.order}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* BottomSheet peek: carousel synced with marker selection */}
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {places.map((p) => (
            <Pressable
              key={p.id}
              style={[styles.card, p.id === selected && styles.cardActive]}
              onPress={() => {
                setSelected(p.id);
                onSelectPlace(p);
              }}
            >
              <Text style={styles.cardIcon}>{categoryIcon[p.category] ?? '📍'}</Text>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {p.order}. {p.name}
              </Text>
              <Rating score={p.details.rating} count={p.details.userRatingsTotal} />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  canvas: {
    flex: 1,
    backgroundColor: '#DfeaEc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasHint: { ...typography.body, color: colors.textMuted, position: 'absolute', top: spacing.lg },
  marker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerActive: { backgroundColor: colors.primary, transform: [{ scale: 1.2 }] },
  markerLabel: { color: colors.primary, fontWeight: '700' },
  markerLabelActive: { color: '#fff' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingLeft: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  card: {
    width: 160,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.md,
  },
  cardActive: { borderColor: colors.primary, borderWidth: 2 },
  cardIcon: { fontSize: 22, marginBottom: spacing.sm },
  cardTitle: { ...typography.body, fontWeight: '600', color: colors.text, marginBottom: 4 },
});
