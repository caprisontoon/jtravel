import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { colors, radius, spacing, typography } from '@/theme';
import { Button } from '@/components/Button';
import { ANALYSIS_STEPS, AnalysisStep, analyzeVideo } from '@/services/extractionService';

type Props = NativeStackScreenProps<RootStackParamList, 'AnalysisLoading'>;

export function AnalysisLoadingScreen({ navigation, route }: Props) {
  const { url } = route.params;
  const [current, setCurrent] = useState<AnalysisStep | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const result = await analyzeVideo(url, (step) => {
          if (!cancelled) setCurrent(step);
        });
        if (!cancelled) navigation.replace('Itinerary', { result });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '분석에 실패했어요.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, navigation]);

  const currentIndex = ANALYSIS_STEPS.findIndex((s) => s.key === current);

  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        <Text style={{ fontSize: 28 }}>🎬</Text>
        <Text style={styles.previewTitle} numberOfLines={1}>
          {url}
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>⚠ {error}</Text>
          <Text style={styles.errorHint}>음성 분석으로 다시 시도하거나 수동 입력할 수 있어요.</Text>
          <Button title="다시 시도" onPress={() => setError(null)} style={{ marginTop: spacing.md }} />
          <Button
            title="홈으로"
            variant="ghost"
            onPress={() => navigation.popToTop()}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      ) : (
        <>
          <Text style={styles.heading}>영상을 분석하고 있어요…</Text>
          <View style={styles.steps}>
            {ANALYSIS_STEPS.map((step, i) => {
              const done = currentIndex > i;
              const active = currentIndex === i;
              return (
                <View key={step.key} style={styles.stepRow}>
                  <Text style={styles.stepIcon}>{done ? '✓' : active ? '◉' : '○'}</Text>
                  <Text style={[styles.stepLabel, (done || active) && styles.stepLabelActive]}>
                    {step.label}
                    {active ? ' 중…' : done ? ' 완료' : ''}
                  </Text>
                </View>
              );
            })}
          </View>
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
          <Button
            title="취소"
            variant="ghost"
            onPress={() => navigation.popToTop()}
            style={{ marginTop: spacing.xl }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.bg },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  previewTitle: { ...typography.body, color: colors.text, marginLeft: spacing.md, flex: 1 },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  steps: { marginTop: spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  stepIcon: { width: 24, fontSize: 16, color: colors.primary },
  stepLabel: { ...typography.body, color: colors.textMuted },
  stepLabelActive: { color: colors.text, fontWeight: '600' },
  errorBox: { marginTop: spacing.xl },
  errorTitle: { ...typography.title, color: colors.danger },
  errorHint: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
});
