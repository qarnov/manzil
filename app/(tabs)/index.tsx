import { useRouter } from 'expo-router';
import { ChevronRight, Settings, Share2 } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, Share, View } from 'react-native';

import { Screen } from '../../src/components/Screen';
import { IconButton } from '../../src/components/IconButton';
import { ayahOfTheDay } from '../../src/data/ayat';
import { useNow } from '../../src/hooks/useNow';
import { useTranslation } from '../../src/lib/i18n';
import { useActivePrayers } from '../../src/lib/masjids';
import { nextPrayer } from '../../src/lib/prayerTimes';
import { Box, Card, Text, useTheme } from '../../src/theme/components';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const now = useNow();
  const { t } = useTranslation();

  const { prayers, masjid } = useActivePrayers();
  const next = useMemo(() => nextPrayer(prayers, now), [prayers, now]);
  const ayah = useMemo(() => ayahOfTheDay(now), [now]);

  const onShare = () => {
    Share.share({
      message: `${ayah.arabic}\n\n"${ayah.english}"\n— ${ayah.reference}\n\nShared via Manzil`,
    }).catch(() => {});
  };

  return (
    <Screen>
      {/* Header */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="m"
        paddingTop="m"
        paddingBottom="s"
      >
        <Box>
          <Text variant="title">Manzil</Text>
          <Text variant="bodySecondary" marginTop="xxs">
            {t('home.greeting')}
          </Text>
        </Box>
        <IconButton circle accessibilityLabel="Settings" onPress={() => router.push('/more')}>
          <Settings size={20} color={theme.colors.accent} strokeWidth={1.75} />
        </IconButton>
      </Box>

      {/* Masjid selector */}
      <Pressable
        onPress={() => router.push('/select-masjid')}
        accessibilityRole="button"
        accessibilityLabel={masjid ? `Selected masjid ${masjid.name}. Change masjid` : 'Choose your masjid'}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          marginHorizontal="m"
          marginBottom="m"
          paddingVertical="xs"
          minHeight={44}
        >
          <Box flex={1}>
            <Text variant="labelMedium" numberOfLines={1}>
              {masjid ? masjid.name : t('home.chooseMasjid')}
            </Text>
            <Text variant="bodySecondary" fontSize={13} numberOfLines={1}>
              {masjid ? `${masjid.area}, ${masjid.state}` : t('home.chooseMasjidHint')}
            </Text>
          </Box>
          <ChevronRight size={20} color={theme.colors.textSecondary} strokeWidth={1.75} />
        </Box>
      </Pressable>

      {/* Ayah of the day */}
      <Card marginHorizontal="m" padding="l">
        <Text variant="overline">{t('home.ayahOfTheDay')}</Text>

        <Text variant="arabic" marginTop="m">
          {ayah.arabic}
        </Text>

        <Text variant="quote" textAlign="center" marginTop="m">
          {ayah.english}
        </Text>

        <Text variant="bodySecondary" fontSize={13} textAlign="center" marginTop="s">
          {ayah.reference}
        </Text>

        {/* Divider is a soft surface tint, not a hard rule */}
        <Box height={1} backgroundColor="hairline" marginTop="l" marginBottom="s" />

        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Pressable
            onPress={() => router.push(`/quran/${ayah.surah}`)}
            accessibilityRole="link"
            accessibilityLabel="Read tafsir"
            hitSlop={10}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, minHeight: 44, justifyContent: 'center' })}
          >
            <Text variant="label" color="accent">
              {t('home.readTafsir')}
            </Text>
          </Pressable>

          <IconButton accessibilityLabel="Share this ayah" onPress={onShare}>
            <Share2 size={18} color={theme.colors.textSecondary} strokeWidth={1.75} />
          </IconButton>
        </Box>
      </Card>

      {/* Next prayer */}
      {next && (
        <Card marginHorizontal="m" marginTop="m" padding="l">
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Text variant="overline">{t('home.next')} · {next.name}</Text>
              <Text variant="displayTime" marginTop="xxs">
                {next.azaan}
              </Text>
            </Box>
            <Box
              backgroundColor="accentSoftBg"
              paddingHorizontal="s"
              paddingVertical="xs"
              borderRadius="full"
            >
              <Text variant="label" fontSize={13} color="accentSoftText">
                {next.inLabel}
              </Text>
            </Box>
          </Box>
        </Card>
      )}

      {/* Today's prayers */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        marginHorizontal="m"
        marginTop="xl"
        marginBottom="xs"
      >
        <Text variant="heading">{t('home.todaysPrayers')}</Text>
        <Pressable
          onPress={() => router.push('/prayer-settings')}
          accessibilityRole="link"
          accessibilityLabel="Edit iqamah times"
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, minHeight: 44, justifyContent: 'center' })}
        >
          <Text variant="label" fontSize={14} color="accent">
            {t('home.edit')}
          </Text>
        </Pressable>
      </Box>

      <Box marginHorizontal="xs">
        {prayers.map((p) => {
          const isNext = p.name === next?.name;
          return (
            <Box
              key={p.name}
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              paddingHorizontal="s"
              paddingVertical="s"
              minHeight={48}
              borderRadius="m"
              backgroundColor={isNext ? 'surfaceHighlight' : 'transparent'}
            >
              <Text variant={isNext ? 'labelMedium' : 'label'}>{p.name}</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text variant="label" color="textSecondary">
                  {p.azaan}
                </Text>
                <Text variant="label" color="textSecondary">
                  {'  ·  '}
                </Text>
                <Text variant="label" color="accent">
                  {p.iqamah}
                </Text>
              </View>
            </Box>
          );
        })}
      </Box>
    </Screen>
  );
}
