import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { colors, radius, spacing, typography } from '@/theme';
import { Button } from '@/components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Reservation'>;

/**
 * Reservation hands off to a partner page (affiliate model) rather than
 * processing payments in-app. A real build embeds a WebView for the
 * partner URL; here we surface the partner and deep-link out.
 */
export function ReservationScreen({ route }: Props) {
  const { place } = route.params;
  const { reservable, partner, externalUrl } = place.reservation;
  const url = place.reservation.deepLink ?? externalUrl;

  const openReservation = () => url && Linking.openURL(url);
  const openMaps = () =>
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`,
    );

  return (
    <View style={styles.container}>
      {reservable && url ? (
        <>
          <View style={styles.partnerCard}>
            <Text style={styles.partnerLabel}>🤝 {partner ?? '제휴'} 예약</Text>
            <Text style={styles.partnerHint}>안전하게 파트너 예약 페이지로 연결됩니다.</Text>
          </View>
          <View style={styles.webviewStub}>
            <Text style={styles.stubText}>(In-App Browser / WebView 영역)</Text>
            <Text style={styles.stubUrl} numberOfLines={1}>
              {url}
            </Text>
          </View>
          <Button title={`${place.name} 예약하기`} onPress={openReservation} />
        </>
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackTitle}>⚠ 예약을 지원하지 않는 곳이에요</Text>
          <Text style={styles.fallbackHint}>대신 길찾기나 전화로 이용해 주세요.</Text>
          <Button
            title="구글맵에서 길찾기"
            variant="secondary"
            onPress={openMaps}
            style={{ marginTop: spacing.lg }}
          />
          {place.details.phone && (
            <Button
              title="전화 걸기"
              variant="ghost"
              onPress={() => Linking.openURL(`tel:${place.details.phone}`)}
              style={{ marginTop: spacing.sm }}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  partnerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  partnerLabel: { ...typography.title, color: colors.text },
  partnerHint: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  webviewStub: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  stubText: { ...typography.body, color: colors.textMuted },
  stubUrl: { ...typography.caption, color: colors.primary, marginTop: spacing.sm, paddingHorizontal: spacing.lg },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fallbackTitle: { ...typography.title, color: colors.danger },
  fallbackHint: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
});
