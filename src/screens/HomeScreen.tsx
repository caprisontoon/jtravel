import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Button } from '@/components/Button';
import { colors, radius, spacing, typography } from '@/theme';
import { isValidYoutubeUrl } from '@/services/extractionService';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const SAMPLE_URL = 'https://youtu.be/abcd1234';

// Local "recently analyzed" stub. In the app this comes from device storage.
const RECENT = [
  { id: 'abcd1234', title: '도쿄 3박 4일', count: 12 },
  { id: 'efgh5678', title: '오사카 먹방', count: 8 },
  { id: 'ijkl9012', title: '후쿠오카', count: 5 },
];

export function HomeScreen({ navigation }: Props) {
  const [url, setUrl] = useState('');
  const [touched, setTouched] = useState(false);
  const valid = isValidYoutubeUrl(url);
  const showError = touched && url.length > 0 && !valid;

  const submit = (link: string) => navigation.navigate('AnalysisLoading', { url: link });

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.headline}>유튜브 링크로{'\n'}여행 일정 만들기 ✈</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="https://youtu.be/..."
            placeholderTextColor={colors.textMuted}
            value={url}
            onChangeText={setUrl}
            onBlur={() => setTouched(true)}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {showError && <Text style={styles.error}>유효한 유튜브 링크를 입력해 주세요 (예: {SAMPLE_URL})</Text>}

        <Button
          title="일정 만들기"
          onPress={() => submit(url)}
          disabled={!valid}
          style={{ marginTop: spacing.md }}
        />

        <Text style={styles.section}>최근 분석한 영상</Text>
        <FlatList
          horizontal
          data={RECENT}
          keyExtractor={(it) => it.id}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={
            <Pressable style={styles.empty} onPress={() => submit(SAMPLE_URL)}>
              <Text style={styles.emptyText}>샘플 링크로 체험하기</Text>
            </Pressable>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.videoCard}
              onPress={() => navigation.navigate('AnalysisLoading', { url: `https://youtu.be/${item.id}` })}
            >
              <View style={styles.videoThumb}>
                <Text style={{ fontSize: 28 }}>🎬</Text>
              </View>
              <Text style={styles.videoTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.videoMeta}>{item.count}곳</Text>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing.lg },
  headline: { ...typography.h1, color: colors.text, marginVertical: spacing.lg, lineHeight: 34 },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  error: { color: colors.danger, fontSize: 12, marginTop: spacing.sm },
  section: { ...typography.title, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  videoCard: { width: 120, marginRight: spacing.md },
  videoThumb: {
    width: 120,
    height: 80,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTitle: { ...typography.body, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
  videoMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  empty: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  emptyText: { color: colors.primary, fontWeight: '600' },
});
