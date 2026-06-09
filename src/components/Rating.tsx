import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

interface Props {
  score: number | null;
  count?: number | null;
}

export function Rating({ score, count }: Props) {
  if (score == null) {
    return <Text style={styles.muted}>평점 없음</Text>;
  }
  return (
    <View style={styles.row}>
      <Text style={styles.star}>★</Text>
      <Text style={styles.score}>{score.toFixed(1)}</Text>
      {count != null && <Text style={styles.count}>({count.toLocaleString()})</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  star: { color: colors.star, fontSize: 13, marginRight: 2 },
  score: { color: colors.text, fontSize: 13, fontWeight: '600' },
  count: { color: colors.textMuted, fontSize: 12, marginLeft: 4 },
  muted: { color: colors.textMuted, fontSize: 12 },
});
