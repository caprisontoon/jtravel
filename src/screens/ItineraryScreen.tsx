import React, { useMemo, useState } from 'react';
import { ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Place, PlaceCategory } from '@/types/extraction';
import { colors, spacing, typography } from '@/theme';
import { SegmentedTabBar } from '@/components/SegmentedTabBar';
import { Chip } from '@/components/Chip';
import { PlaceCard } from '@/components/PlaceCard';
import { MapPlaceholder } from '@/components/MapPlaceholder';

type Props = NativeStackScreenProps<RootStackParamList, 'Itinerary'>;

const CATEGORY_FILTERS: { label: string; value: PlaceCategory | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '🍜 맛집', value: 'restaurant' },
  { label: '🏨 숙소', value: 'lodging' },
  { label: '📍 명소', value: 'attraction' },
];

export function ItineraryScreen({ navigation, route }: Props) {
  const { result } = route.params;
  const [tab, setTab] = useState(0); // 0: List, 1: Map
  const [day, setDay] = useState<number | 'all'>('all');
  const [category, setCategory] = useState<PlaceCategory | 'all'>('all');

  const routeByFrom = useMemo(
    () => new Map(result.routes.map((r) => [r.fromPlaceId, r])),
    [result.routes],
  );

  const days = useMemo(() => {
    const set = new Set<number>();
    result.places.forEach((p) => p.day != null && set.add(p.day));
    return Array.from(set).sort((a, b) => a - b);
  }, [result.places]);

  const filtered = useMemo(
    () =>
      result.places.filter(
        (p) =>
          (day === 'all' || p.day === day) &&
          (category === 'all' || p.category === category),
      ),
    [result.places, day, category],
  );

  const sections = useMemo(() => {
    const byDay = new Map<number, Place[]>();
    filtered.forEach((p) => {
      const d = p.day ?? 0;
      if (!byDay.has(d)) byDay.set(d, []);
      byDay.get(d)!.push(p);
    });
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a - b)
      .map(([d, data]) => ({ title: d === 0 ? '일자 미정' : `Day ${d}`, data }));
  }, [filtered]);

  const openDetail = (place: Place) =>
    navigation.navigate('PlaceDetail', { place, result });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.videoTitle} numberOfLines={1}>
          {result.source.title}
        </Text>
        <SegmentedTabBar options={['리스트', '지도']} value={tab} onChange={setTab} />
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <Chip label="전체" selected={day === 'all'} onPress={() => setDay('all')} />
          {days.map((d) => (
            <Chip key={d} label={`Day${d}`} selected={day === d} onPress={() => setDay(d)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {CATEGORY_FILTERS.map((c) => (
            <Chip
              key={c.value}
              label={c.label}
              selected={category === c.value}
              onPress={() => setCategory(c.value)}
            />
          ))}
        </ScrollView>
      </View>

      {tab === 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>── {section.title} ──</Text>
          )}
          renderItem={({ item }) => (
            <PlaceCard
              place={item}
              outboundRoute={routeByFrom.get(item.id)}
              onPress={() => openDetail(item)}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>조건에 맞는 장소가 없어요.</Text>}
        />
      ) : (
        <MapPlaceholder places={filtered} onSelectPlace={openDetail} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  videoTitle: { ...typography.title, color: colors.text, marginBottom: spacing.md },
  filters: { paddingVertical: spacing.md },
  filterRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm, flexGrow: 0 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  sectionHeader: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xxl },
});
