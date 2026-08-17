import { useLocalSearchParams } from 'expo-router';
import { Heart, Pause, Play, SkipForward } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBar } from '../../src/components/AppBar';
import { IconButton } from '../../src/components/IconButton';
import { Screen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { ErrorState, Loading } from '../../src/components/States';
import { useRecitation } from '../../src/hooks/useRecitation';
import {
  isFavorite,
  setLastRead,
  stripHtml,
  toggleFavorite,
  useFavorites,
  useSurah,
  useTafsir,
} from '../../src/lib/quran';
import { Box, Card, Text, useTheme } from '../../src/theme/components';

type Tab = 'read' | 'tafsir';

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

export default function SurahScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ surahNumber: string }>();
  const surahNumber = Number(params.surahNumber);

  const [tab, setTab] = useState<Tab>('read');

  const surah = useSurah(surahNumber);
  const tafsir = useTafsir(surahNumber, tab === 'tafsir');
  const favorites = useFavorites();

  const detail = surah.data;
  const ayahs = detail?.ayahs ?? [];
  const recitation = useRecitation(ayahs);

  const title = detail?.englishName ?? `Surah ${params.surahNumber}`;

  const onAyahPress = (i: number) => {
    const ayah = ayahs[i];
    if (!ayah) return;
    recitation.playIndex(i);
    setLastRead({ surah: surahNumber, ayah: ayah.numberInSurah, surahName: title });
  };

  // Al-Fatiha and At-Tawbah do not carry a separate opening basmala.
  const showBismillah = surahNumber !== 1 && surahNumber !== 9;

  return (
    <>
      <Screen contentContainerStyle={{ paddingBottom: recitation.active ? 140 : 32 }}>
        <AppBar
          title={title}
          subtitle={detail ? `${detail.numberOfAyahs} verses` : undefined}
          back
        />

        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'read', label: 'Read' },
            { value: 'tafsir', label: 'Tafsir' },
          ]}
        />

        {tab === 'read' ? (
          <Box marginTop="m">
            {surah.isPending ? <Loading label="Loading surah…" /> : null}
            {surah.isError ? (
              <ErrorState
                message="Couldn’t load this surah. Check your connection."
                onRetry={() => surah.refetch()}
              />
            ) : null}

            {detail ? (
              <>
                {showBismillah ? (
                  <Text variant="arabic" fontSize={24} marginBottom="m" marginHorizontal="m">
                    {BISMILLAH}
                  </Text>
                ) : null}

                {ayahs.map((ayah, i) => {
                  const fav = isFavorite(favorites, surahNumber, ayah.numberInSurah);
                  const isCurrent = recitation.active && recitation.index === i;
                  const translation = detail.translations[ayah.numberInSurah];
                  return (
                    /* The favourite button is a sibling of the play area, not a
                       child of it — nesting two pressables makes the hit target
                       ambiguous and is invalid markup on web. */
                    <Box
                      key={ayah.number}
                      marginHorizontal="xs"
                      marginBottom="xs"
                      padding="s"
                      borderRadius="m"
                      backgroundColor={isCurrent ? 'surfaceHighlight' : 'transparent'}
                    >
                      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                        <Box
                          width={28}
                          height={28}
                          borderRadius="full"
                          alignItems="center"
                          justifyContent="center"
                          backgroundColor="accentCircle"
                        >
                          <Text variant="label" fontSize={12} color="accentSoftText">
                            {ayah.numberInSurah}
                          </Text>
                        </Box>

                        <IconButton
                          accessibilityLabel={fav ? 'Remove from favourites' : 'Add to favourites'}
                          onPress={() =>
                            toggleFavorite({
                              surah: surahNumber,
                              ayah: ayah.numberInSurah,
                              arabic: ayah.text,
                              translation: translation ?? '',
                              surahName: title,
                            })
                          }
                        >
                          <Heart
                            size={18}
                            color={fav ? theme.colors.accent : theme.colors.textSecondary}
                            fill={fav ? theme.colors.accent : 'transparent'}
                            strokeWidth={1.75}
                          />
                        </IconButton>
                      </Box>

                      <Pressable
                        onPress={() => onAyahPress(i)}
                        accessibilityRole="button"
                        accessibilityLabel={`Play ayah ${ayah.numberInSurah}`}
                        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                      >
                        <Text variant="arabicSmall" textAlign="right" marginTop="xs">
                          {ayah.text}
                        </Text>

                        {translation ? (
                          <Text variant="quote" fontSize={15} marginTop="s">
                            {translation}
                          </Text>
                        ) : null}
                      </Pressable>
                    </Box>
                  );
                })}
              </>
            ) : null}
          </Box>
        ) : (
          <Box marginTop="m">
            {tafsir.isPending ? <Loading label="Loading tafsir…" /> : null}
            {tafsir.isError ? (
              <ErrorState message="Couldn’t load the tafsir." onRetry={() => tafsir.refetch()} />
            ) : null}

            {tafsir.data ? (
              <>
                <Text variant="overline" marginHorizontal="m" marginBottom="xs">
                  Tafsir Ibn Kathir · English
                </Text>
                {tafsir.data.entries.map((entry, i) => {
                  const arabic = tafsir.data.ayahs[i];
                  return (
                    <Card key={entry.verse_key} marginHorizontal="m" marginBottom="m" padding="l">
                      <Text variant="overline">{entry.verse_key}</Text>
                      {arabic ? (
                        <Text variant="arabicSmall" textAlign="right" marginTop="xs">
                          {arabic.text}
                        </Text>
                      ) : null}
                      <Box height={1} backgroundColor="hairline" marginVertical="s" />
                      <Text variant="body" fontSize={14}>
                        {stripHtml(entry.text)}
                      </Text>
                    </Card>
                  );
                })}
              </>
            ) : null}
          </Box>
        )}
      </Screen>

      {/* Player — only present once a recitation has started */}
      {tab === 'read' && recitation.active ? (
        <Box
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          backgroundColor="surface"
          paddingHorizontal="m"
          paddingTop="s"
          style={{
            paddingBottom: insets.bottom + 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 12,
          }}
        >
          <Box flexDirection="row" alignItems="center">
            <IconButton
              circle
              accessibilityLabel={recitation.playing ? 'Pause recitation' : 'Play recitation'}
              onPress={recitation.toggle}
            >
              {recitation.playing ? (
                <Pause size={18} color={theme.colors.accent} strokeWidth={1.75} />
              ) : (
                <Play size={18} color={theme.colors.accent} strokeWidth={1.75} />
              )}
            </IconButton>

            <Box flex={1} marginHorizontal="s">
              <Text variant="label" fontSize={14} numberOfLines={1}>
                Mishary al-Afasy
              </Text>
              <Text variant="bodySecondary" fontSize={12}>
                Ayah {recitation.index + 1} of {ayahs.length}
                {recitation.isBuffering ? ' · buffering' : ''}
              </Text>
            </Box>

            <IconButton accessibilityLabel="Next ayah" onPress={recitation.next}>
              <SkipForward size={18} color={theme.colors.textSecondary} strokeWidth={1.75} />
            </IconButton>
          </Box>

          <Box height={3} borderRadius="full" backgroundColor="surfaceHighlight" marginTop="xs">
            <View
              style={{
                width: `${Math.min(100, Math.max(0, recitation.progress * 100))}%`,
                height: '100%',
                borderRadius: 999,
                backgroundColor: theme.colors.accent,
              }}
            />
          </Box>
        </Box>
      ) : null}
    </>
  );
}
