import { useRouter, type Href } from 'expo-router';
import {
  CalendarDays,
  Coins,
  Compass,
  Heart,
  Landmark,
  Languages,
  ListChecks,
  Clock,
} from 'lucide-react-native';
import { useState } from 'react';

import { AppBar } from '../../src/components/AppBar';
import { ListRow } from '../../src/components/ListRow';
import { Screen } from '../../src/components/Screen';
import { LANGUAGES, useLanguage } from '../../src/lib/i18n';
import { useSelectedMasjid } from '../../src/lib/masjids';
import { Box, Card, Text, useTheme } from '../../src/theme/components';

export default function MoreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { masjid } = useSelectedMasjid();
  const { language, setLanguage } = useLanguage();
  const [pickingLanguage, setPickingLanguage] = useState(false);

  const icon = (Icon: typeof Compass) => (
    <Icon size={20} color={theme.colors.accent} strokeWidth={1.75} />
  );

  const tools: { title: string; subtitle: string; href: Href; icon: React.ReactNode }[] = [
    {
      title: 'Iqamah times',
      subtitle: 'Set the delay after azaan',
      href: '/prayer-settings',
      icon: icon(Clock),
    },
    { title: 'Tasbih', subtitle: 'Count your dhikr', href: '/tasbih', icon: icon(ListChecks) },
    { title: 'Qibla', subtitle: 'Direction to the Kaaba', href: '/qibla', icon: icon(Compass) },
    { title: 'Zakat', subtitle: 'Work out what is due', href: '/zakat', icon: icon(Coins) },
    {
      title: 'Hijri calendar',
      subtitle: 'Islamic dates and observances',
      href: '/hijri',
      icon: icon(CalendarDays),
    },
  ];

  const community: { title: string; subtitle: string; href: Href; icon: React.ReactNode }[] = [
    {
      title: 'Masjids',
      subtitle: 'Browse and register',
      href: '/masjids',
      icon: icon(Landmark),
    },
    { title: 'Donate', subtitle: 'Sadaqah jariyah', href: '/donate', icon: icon(Heart) },
  ];

  return (
    <Screen>
      <AppBar title="More" />

      <Card marginHorizontal="m" padding="l">
        <Text variant="overline">Your masjid</Text>
        <Text variant="labelMedium" marginTop="xxs">
          {masjid ? masjid.name : 'No masjid selected'}
        </Text>
        <Text variant="bodySecondary" fontSize={13} marginTop="xxs">
          {masjid ? `${masjid.area}, ${masjid.state}` : 'Prayer times use the default schedule'}
        </Text>
        <Text
          variant="label"
          color="accent"
          marginTop="s"
          onPress={() => router.push('/select-masjid')}
          accessibilityRole="link"
        >
          {masjid ? 'Change masjid' : 'Choose a masjid'}
        </Text>
      </Card>

      <Text variant="heading" marginHorizontal="m" marginTop="xl" marginBottom="xs">
        Tools
      </Text>
      <Box marginHorizontal="xs">
        {tools.map((t) => (
          <ListRow
            key={t.title}
            title={t.title}
            subtitle={t.subtitle}
            icon={t.icon}
            onPress={() => router.push(t.href)}
          />
        ))}
      </Box>

      <Text variant="heading" marginHorizontal="m" marginTop="xl" marginBottom="xs">
        Community
      </Text>
      <Box marginHorizontal="xs">
        {community.map((t) => (
          <ListRow
            key={t.title}
            title={t.title}
            subtitle={t.subtitle}
            icon={t.icon}
            onPress={() => router.push(t.href)}
          />
        ))}
        <ListRow
          title="Muazzin mode"
          subtitle="Update azaan and iqamah"
          icon={icon(Landmark)}
          onPress={() => router.push('/muazzin')}
        />
      </Box>

      <Text variant="heading" marginHorizontal="m" marginTop="xl" marginBottom="xs">
        App
      </Text>
      <Box marginHorizontal="xs">
        <ListRow
          title="Language"
          subtitle={LANGUAGES.find((l) => l.code === language)?.label ?? 'English'}
          icon={icon(Languages)}
          onPress={() => setPickingLanguage((p) => !p)}
          showChevron={!pickingLanguage}
        />
        {pickingLanguage
          ? LANGUAGES.map((l) => (
              <ListRow
                key={l.code}
                title={l.label}
                subtitle={l.english}
                selected={l.code === language}
                showChevron={false}
                onPress={() => {
                  setLanguage(l.code);
                  setPickingLanguage(false);
                }}
              />
            ))
          : null}
      </Box>

      <Box marginHorizontal="m" marginTop="xl">
        <Text variant="bodySecondary" fontSize={13}>
          Manzil v1.0 — built for the Beary community of Mangaluru.
        </Text>
      </Box>
    </Screen>
  );
}
