import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';

import { AppBar } from '../../src/components/AppBar';
import { ListRow } from '../../src/components/ListRow';
import { Screen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { EmptyState, ErrorState, Loading } from '../../src/components/States';
import { useFavorites, useLastRead, useSurahs } from '../../src/lib/quran';
import { Box, Card, Text } from '../../src/theme/components';

type Tab = 'surahs' | 'favourites';

export default function QuranScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('surahs');

  const surahs = useSurahs();
  const favorites = useFavorites();
  const lastRead = useLastRead();

  return (
    <Screen>
      <AppBar title="Quran" subtitle="Read, listen and reflect" />

      <SegmentedControl<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'surahs', label: 'Surahs' },
          { value: 'favourites', label: 'Favourites' },
        ]}
      />

      {tab === 'surahs' && lastRead ? (
        <Card marginHorizontal="m" marginTop="m" padding="l">
          <Text variant="overline">Continue reading</Text>
          <Text variant="labelMedium" marginTop="xxs">
            {lastRead.surahName}
          </Text>
          <Text variant="bodySecondary" fontSize={13} marginTop="xxs">
            Ayah {lastRead.ayah}
          </Text>
          <Pressable
            onPress={() => router.push(`/quran/${lastRead.surah}`)}
            accessibilityRole="link"
            accessibilityLabel={`Continue reading ${lastRead.surahName}`}
            hitSlop={10}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              minHeight: 44,
              justifyContent: 'center',
            })}
          >
            <Text variant="label" color="accent" marginTop="xs">
              Continue
            </Text>
          </Pressable>
        </Card>
      ) : null}

      {tab === 'surahs' ? (
        <Box marginTop="m" marginHorizontal="xs">
          {surahs.isPending ? <Loading label="Loading surahs…" /> : null}
          {surahs.isError ? (
            <ErrorState
              message="Couldn’t load the surah list. Check your connection."
              onRetry={() => surahs.refetch()}
            />
          ) : null}
          {surahs.data?.map((s) => (
            <ListRow
              key={s.number}
              title={`${s.number}. ${s.englishName}`}
              subtitle={`${s.englishNameTranslation} · ${s.numberOfAyahs} verses`}
              onPress={() => router.push(`/quran/${s.number}`)}
              right={
                <Text variant="arabicSmall" fontSize={20} color="textSecondary">
                  {s.name}
                </Text>
              }
            />
          ))}
        </Box>
      ) : (
        <Box marginTop="m">
          {favorites.length === 0 ? (
            <EmptyState message="No favourites yet. Tap the heart on any ayah to save it here." />
          ) : (
            favorites.map((f) => (
              <Card key={`${f.surah}-${f.ayah}`} marginHorizontal="m" marginBottom="m" padding="l">
                <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                  <Text variant="overline">{f.surahName}</Text>
                  <Text variant="overline">Ayah {f.ayah}</Text>
                </Box>
                <Text variant="arabicSmall" textAlign="right" marginTop="s">
                  {f.arabic}
                </Text>
                {f.translation ? (
                  <Text variant="quote" fontSize={15} marginTop="m">
                    {f.translation}
                  </Text>
                ) : null}
                <Pressable
                  onPress={() => router.push(`/quran/${f.surah}`)}
                  accessibilityRole="link"
                  accessibilityLabel={`Open ${f.surahName}`}
                  hitSlop={10}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.6 : 1,
                    minHeight: 44,
                    justifyContent: 'center',
                  })}
                >
                  <Text variant="label" color="accent" marginTop="s">
                    Open surah
                  </Text>
                </Pressable>
              </Card>
            ))
          )}
        </Box>
      )}
    </Screen>
  );
}
