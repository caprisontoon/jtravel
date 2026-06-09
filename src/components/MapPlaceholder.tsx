import React, { useState } from 'react';
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
export function MapPlaceholder({ places, onSelectPlace }: Props) {
  const [selected, setSelected] = useState<string | null>(places[0]?.id ?? null);

  return (
    <View style={styles.container}>
      <View style={styles.canvas}>
        <Text style={styles.canvasHint}>🗺️ 지도 영역 (react-native-maps 연동 예정)</Text>
        <View style={styles.markers}>
          {places.map((p) => {
            const active = p.id === selected;
            return (
              <Pressable
                key={p.id}
                style={[styles.marker, active && styles.markerActive]}
                onPress={() => setSelected(p.id)}
              >
                <Text style={[styles.markerLabel, active && styles.markerLabelActive]}>
                  {p.order}
                </Text>
              </Pressable>
            );
          })}
        </View>
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
  markers: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.lg,
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
