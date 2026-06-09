import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Place, RouteSegment } from '@/types/extraction';
import { categoryIcon, colors, radius, spacing } from '@/theme';
import { Rating } from './Rating';

interface Props {
  place: Place;
  /** Route segment that departs from this place, if any. */
  outboundRoute?: RouteSegment;
  onPress?: () => void;
}

const MODE_ICON: Record<string, string> = {
  walk: '🚶',
  transit: '🚇',
  taxi: '🚕',
  drive: '🚗',
};

export function PlaceCard({ place, outboundRoute, onPress }: Props) {
  const ts = place.videoRefs[0]?.timestampLabel;
  const unresolved = place.location.geocodeStatus === 'unresolved';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.thumb}>
        <Text style={styles.thumbIcon}>{categoryIcon[place.category] ?? '📍'}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.order}>{place.order}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {place.name}
          </Text>
          <Rating score={place.details.rating} count={place.details.userRatingsTotal} />
        </View>
        <Text style={styles.meta}>
          {categoryIcon[place.category]} {place.subType ?? place.category}
          {ts ? ` · ${ts}` : ''}
        </Text>
        {unresolved && <Text style={styles.warn}>⚠ 위치 미확인</Text>}
        {outboundRoute && (
          <Text style={styles.route}>
            다음까지 {MODE_ICON[outboundRoute.recommended.mode]}{' '}
            {Math.round(outboundRoute.recommended.durationSec / 60)}분 ·{' '}
            {(outboundRoute.distanceMeters / 1000).toFixed(1)}km
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  thumbIcon: { fontSize: 24 },
  body: { flex: 1, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  order: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  title: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text, marginRight: spacing.sm },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  warn: { fontSize: 12, color: colors.danger, marginTop: 4 },
  route: { fontSize: 12, color: colors.primary, marginTop: 6 },
});
