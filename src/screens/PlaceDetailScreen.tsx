import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { categoryIcon, colors, radius, spacing, typography } from '@/theme';
import { Button } from '@/components/Button';
import { Rating } from '@/components/Rating';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceDetail'>;

export function PlaceDetailScreen({ navigation, route }: Props) {
  const { place, result } = route.params;
  const outbound = result.routes.find((r) => r.fromPlaceId === place.id);
  const ref = place.videoRefs[0];

  const openMaps = () => {
    const { lat, lng } = place.location;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
  };

  const openVideoAtTimestamp = () => {
    const start = ref?.startSec ?? 0;
    Linking.openURL(`${result.source.url}&t=${start}s`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={{ fontSize: 48 }}>{categoryIcon[place.category] ?? '📍'}</Text>
      </View>

      <Text style={styles.title}>{place.name}</Text>
      {place.nameLocal && <Text style={styles.subtitle}>{place.nameLocal}</Text>}
      <View style={styles.metaRow}>
        <Text style={styles.category}>
          {categoryIcon[place.category]} {place.subType ?? place.category}
        </Text>
        <Rating score={place.details.rating} count={place.details.userRatingsTotal} />
      </View>

      <View style={styles.actions}>
        <Button title="길찾기" variant="secondary" onPress={openMaps} style={styles.action} />
        <Button
          title={ref ? `영상 ${ref.timestampLabel}` : '영상 보기'}
          variant="secondary"
          onPress={openVideoAtTimestamp}
          style={styles.action}
        />
        <Button
          title="예약하기"
          onPress={() => navigation.navigate('Reservation', { place })}
          style={styles.action}
        />
      </View>

      <Section title="정보">
        <InfoRow label="주소" value={place.location.address} />
        <InfoRow label="영업시간" value={place.details.openingHours} />
        <InfoRow label="전화" value={place.details.phone} />
        <InfoRow label="가격대" value={place.details.priceLevel} />
        {place.details.tags.length > 0 && <InfoRow label="태그" value={place.details.tags.join(', ')} />}
      </Section>

      {ref && (
        <Section title="영상에서">
          <Text style={styles.quote}>“{ref.quote}”</Text>
          <Text style={styles.quoteMeta}>{ref.timestampLabel} 구간</Text>
        </Section>
      )}

      {outbound && (
        <Section title="다음 장소 가는 길">
          {outbound.recommended.transit ? (
            <Text style={styles.transit}>
              🚇 {outbound.recommended.transit.line} ·{' '}
              {Math.round(outbound.recommended.durationSec / 60)}분 · 환승{' '}
              {outbound.recommended.transit.transfers}
            </Text>
          ) : (
            <Text style={styles.transit}>
              🚶 {Math.round(outbound.recommended.durationSec / 60)}분 ·{' '}
              {(outbound.distanceMeters / 1000).toFixed(1)}km
            </Text>
          )}
          <Text style={styles.taxi}>
            🚕 택시 예상 {outbound.taxi.estimatedFare.currency}{' '}
            {outbound.taxi.estimatedFare.min.toLocaleString()}~
            {outbound.taxi.estimatedFare.max.toLocaleString()}
          </Text>
        </Section>
      )}
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: {
    height: 160,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  category: { ...typography.body, color: colors.textMuted },
  actions: { flexDirection: 'row', marginTop: spacing.lg },
  action: { flex: 1, marginHorizontal: spacing.xs, paddingHorizontal: spacing.sm },
  section: { marginTop: spacing.xl },
  sectionTitle: { ...typography.title, color: colors.text, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', marginBottom: spacing.sm },
  infoLabel: { width: 72, ...typography.body, color: colors.textMuted },
  infoValue: { flex: 1, ...typography.body, color: colors.text },
  quote: { ...typography.body, color: colors.text, fontStyle: 'italic' },
  quoteMeta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  transit: { ...typography.body, color: colors.text, marginBottom: spacing.sm },
  taxi: { ...typography.body, color: colors.accent },
});
