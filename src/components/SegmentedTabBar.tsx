import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';

interface Props {
  options: string[];
  value: number;
  onChange: (index: number) => void;
}

export function SegmentedTabBar({ options, value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {options.map((opt, i) => {
        const active = i === value;
        return (
          <Pressable
            key={opt}
            style={[styles.segment, active && styles.active]}
            onPress={() => onChange(i)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  active: { backgroundColor: colors.bg, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  labelActive: { color: colors.primary },
});
