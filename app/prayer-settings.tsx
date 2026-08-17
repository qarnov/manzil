import { Pressable, TextInput } from 'react-native';

import { AppBar } from '../src/components/AppBar';
import { Screen } from '../src/components/Screen';
import { useSelectedMasjid } from '../src/lib/masjids';
import { OFFSET_OPTIONS, setOffset, usePrayerTimes } from '../src/lib/prayerTimes';
import { Box, Card, Text, useTheme } from '../src/theme/components';

export default function PrayerSettingsScreen() {
  const theme = useTheme();
  const { prayers } = usePrayerTimes();
  const { masjid } = useSelectedMasjid();

  return (
    <Screen>
      <AppBar title="Iqamah times" subtitle="Minutes after azaan" back />

      {masjid ? (
        <Box
          backgroundColor="surfaceHighlight"
          borderRadius="m"
          marginHorizontal="m"
          marginBottom="m"
          padding="s"
        >
          <Text variant="bodySecondary" fontSize={13}>
            {masjid.name} publishes its own iqamah times, so these offsets only apply when no
            masjid is selected.
          </Text>
        </Box>
      ) : null}

      {prayers.map((p) => {
        const isCustom = !(OFFSET_OPTIONS as readonly number[]).includes(p.offset);
        return (
          <Card key={p.name} marginHorizontal="m" marginBottom="m" padding="l">
            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Text variant="labelMedium">{p.name}</Text>
                <Text variant="bodySecondary" fontSize={13} marginTop="xxs">
                  Azaan {p.azaan}
                </Text>
              </Box>
              <Box
                backgroundColor="accentSoftBg"
                paddingHorizontal="s"
                paddingVertical="xs"
                borderRadius="full"
              >
                <Text variant="label" fontSize={13} color="accentSoftText">
                  {p.iqamah}
                </Text>
              </Box>
            </Box>

            <Box flexDirection="row" flexWrap="wrap" marginTop="s">
              {OFFSET_OPTIONS.map((m) => (
                <OffsetChip
                  key={m}
                  label={`+${m}`}
                  selected={p.offset === m}
                  onPress={() => setOffset(p.name, m)}
                />
              ))}
              <OffsetChip
                label="Custom"
                selected={isCustom}
                onPress={() => setOffset(p.name, isCustom ? p.offset : 25)}
              />
            </Box>

            {isCustom ? (
              <Box flexDirection="row" alignItems="center" marginTop="xs">
                <TextInput
                  value={String(p.offset)}
                  onChangeText={(t) => {
                    const v = parseInt(t.replace(/[^0-9]/g, ''), 10);
                    setOffset(p.name, Number.isFinite(v) ? Math.max(1, Math.min(60, v)) : 1);
                  }}
                  keyboardType="number-pad"
                  accessibilityLabel={`${p.name} custom offset in minutes`}
                  style={{
                    minWidth: 64,
                    minHeight: 44,
                    paddingHorizontal: theme.spacing.xs,
                    backgroundColor: theme.colors.surfaceHighlight,
                    borderRadius: 12,
                    fontFamily: 'Inter_400Regular',
                    fontSize: 15,
                    color: theme.colors.textPrimary,
                  }}
                />
                <Text variant="bodySecondary" fontSize={13} marginLeft="xs">
                  minutes (max 60)
                </Text>
              </Box>
            ) : null}
          </Card>
        );
      })}

      <Text variant="bodySecondary" fontSize={13} marginHorizontal="m">
        Changes save automatically.
      </Text>
    </Screen>
  );
}

function OffsetChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label} minutes`}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginRight: 8, marginTop: 8 })}
    >
      <Box
        paddingHorizontal="s"
        minHeight={44}
        minWidth={56}
        alignItems="center"
        justifyContent="center"
        borderRadius="full"
        backgroundColor={selected ? 'accentSoftBg' : 'surfaceHighlight'}
      >
        <Text
          variant={selected ? 'labelMedium' : 'label'}
          fontSize={14}
          color={selected ? 'accentSoftText' : 'textSecondary'}
        >
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}
