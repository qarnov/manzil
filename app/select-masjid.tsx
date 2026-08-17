import { useRouter } from 'expo-router';
import { Check, MapPin } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';

import { AppBar } from '../src/components/AppBar';
import { Screen } from '../src/components/Screen';
import { detectState } from '../src/lib/geo';
import { getStates, useMasjids, useSelectedMasjid } from '../src/lib/masjids';
import { Box, Card, Text, useTheme } from '../src/theme/components';

export default function SelectMasjidScreen() {
  const theme = useTheme();
  const router = useRouter();
  const masjids = useMasjids();
  const { masjid: selected, select } = useSelectedMasjid();
  const states = useMemo(() => getStates(), []);

  const [filter, setFilter] = useState<string>('all');
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);

  const runDetect = async () => {
    setDetecting(true);
    const state = await detectState();
    if (state) {
      setDetected(state);
      if (states.some((s) => s.toLowerCase() === state.toLowerCase())) setFilter(state);
    }
    setDetecting(false);
  };

  // Best-effort on open; silent on failure so browsing still works.
  useEffect(() => {
    runDetect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = filter === 'all' ? masjids : masjids.filter((m) => m.state === filter);

  const choose = (id: string) => {
    select(id);
    // Deep links and the onboarding hand-off arrive with an empty stack.
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen>
      <AppBar title="Choose masjid" subtitle="Prayer times follow your masjid" back />

      <Pressable
        onPress={runDetect}
        disabled={detecting}
        accessibilityRole="button"
        accessibilityLabel="Use my location"
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          marginHorizontal="m"
          marginBottom="m"
          minHeight={44}
        >
          <MapPin size={18} color={theme.colors.accent} strokeWidth={1.75} />
          <Text variant="label" color="accent" marginLeft="xs">
            {detecting ? 'Finding you…' : 'Use my location'}
          </Text>
          {detected ? (
            <Text variant="bodySecondary" fontSize={13} marginLeft="xs">
              · {detected}
            </Text>
          ) : null}
        </Box>
      </Pressable>

      {/* State filter */}
      <Box flexDirection="row" flexWrap="wrap" paddingHorizontal="s" marginBottom="s">
        {['all', ...states].map((s) => {
          const active = filter === s;
          return (
            <Pressable
              key={s}
              onPress={() => setFilter(s)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={s === 'all' ? 'All states' : s}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, margin: 4 })}
            >
              <Box
                paddingHorizontal="s"
                minHeight={44}
                justifyContent="center"
                borderRadius="full"
                backgroundColor={active ? 'accentSoftBg' : 'surface'}
              >
                <Text
                  variant={active ? 'labelMedium' : 'label'}
                  fontSize={14}
                  color={active ? 'accentSoftText' : 'textSecondary'}
                >
                  {s === 'all' ? 'All' : s}
                </Text>
              </Box>
            </Pressable>
          );
        })}
      </Box>

      {visible.map((m) => {
        const isSelected = selected?.id === m.id;
        return (
          <Pressable
            key={m.id}
            onPress={() => choose(m.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${m.name}, ${m.area}`}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Card marginHorizontal="m" marginBottom="m" padding="l">
              <Box flexDirection="row" alignItems="flex-start">
                <Box flex={1}>
                  <Text variant="labelMedium">{m.name}</Text>
                  <Text variant="bodySecondary" fontSize={13} marginTop="xxs">
                    {m.area}, {m.state}
                  </Text>
                  <Text variant="bodySecondary" fontSize={13} marginTop="xs">
                    Fajr{' '}
                    <Text variant="label" fontSize={13} color="accent">
                      {m.times.Fajr?.iqamah ?? '—'}
                    </Text>
                    {'   '}Maghrib{' '}
                    <Text variant="label" fontSize={13} color="accent">
                      {m.times.Maghrib?.iqamah ?? '—'}
                    </Text>
                  </Text>
                </Box>
                {isSelected ? (
                  <Box
                    width={28}
                    height={28}
                    borderRadius="full"
                    backgroundColor="accentSoftBg"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Check size={16} color={theme.colors.accentSoftText} strokeWidth={2} />
                  </Box>
                ) : null}
              </Box>
            </Card>
          </Pressable>
        );
      })}

      <Card marginHorizontal="m" marginTop="s" padding="l">
        <Text variant="overline">Missing your masjid?</Text>
        <Text variant="bodySecondary" fontSize={14} marginTop="xxs">
          Send us the details and we&apos;ll add it.
        </Text>
        <Pressable
          onPress={() => router.push('/masjids')}
          accessibilityRole="link"
          accessibilityLabel="Register a masjid"
          hitSlop={10}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            minHeight: 44,
            justifyContent: 'center',
          })}
        >
          <Text variant="label" color="accent" marginTop="xs">
            Register a masjid
          </Text>
        </Pressable>
      </Card>
    </Screen>
  );
}
