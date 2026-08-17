import { useMemo, useState } from 'react';
import { Pressable, TextInput } from 'react-native';

import { AppBar } from '../src/components/AppBar';
import { Screen } from '../src/components/Screen';
import { ListRow } from '../src/components/ListRow';
import {
  normalizeTimes,
  saveMasjidTimes,
  useMasjids,
  type MasjidTimes,
} from '../src/lib/masjids';
import { PRAYER_NAMES, toMinutes } from '../src/lib/prayerTimes';
import { Box, Card, Text, useTheme } from '../src/theme/components';

// Demo gate. With a backend this becomes a real per-masjid muazzin login.
const DEMO_PIN = '1786';

/** Accepts "5:04 pm", "17:04", "504pm" and normalises to "5:04 PM". */
function normalizeTimeInput(raw: string): string | null {
  const s = raw.trim().toUpperCase().replace(/\s+/g, '');
  const m = s.match(/^(\d{1,2}):?(\d{2})(AM|PM)?$/);
  if (!m) return null;

  let hours = parseInt(m[1], 10);
  const minutes = parseInt(m[2], 10);
  const meridiem = m[3];
  if (minutes > 59) return null;

  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    const h24 = (hours % 12) + (meridiem === 'PM' ? 12 : 0);
    hours = h24;
  } else if (hours > 23) {
    return null;
  }

  const ap = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${String(minutes).padStart(2, '0')} ${ap}`;
}

export default function MuazzinScreen() {
  const masjids = useMasjids();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');

  if (!unlocked) {
    return <PinGate pin={pin} setPin={setPin} onUnlock={() => setUnlocked(true)} />;
  }

  return <Editor masjids={masjids} />;
}

function PinGate({
  pin,
  setPin,
  onUnlock,
}: {
  pin: string;
  setPin: (v: string) => void;
  onUnlock: () => void;
}) {
  const theme = useTheme();
  const wrong = pin.length >= DEMO_PIN.length && pin !== DEMO_PIN;

  return (
    <Screen>
      <AppBar title="Muazzin mode" subtitle="For approved muazzins" back />

      <Card marginHorizontal="m" padding="l">
        <Text variant="bodySecondary" fontSize={14}>
          Enter your access PIN to update the azaan and iqamah times for your masjid.
        </Text>

        <TextInput
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          accessibilityLabel="Access PIN"
          placeholder="••••"
          placeholderTextColor={theme.colors.textSecondary}
          style={{
            marginTop: theme.spacing.m,
            minHeight: 48,
            paddingHorizontal: theme.spacing.s,
            backgroundColor: theme.colors.surfaceHighlight,
            borderRadius: 12,
            fontFamily: 'Inter_400Regular',
            fontSize: 20,
            letterSpacing: 6,
            textAlign: 'center',
            color: theme.colors.textPrimary,
          }}
        />

        {wrong ? (
          <Text variant="bodySecondary" fontSize={13} textAlign="center" marginTop="xs">
            That PIN doesn&apos;t match.
          </Text>
        ) : null}

        <Pressable
          onPress={() => pin === DEMO_PIN && onUnlock()}
          disabled={pin !== DEMO_PIN}
          accessibilityRole="button"
          accessibilityLabel="Unlock muazzin mode"
          style={({ pressed }) => ({
            opacity: pin !== DEMO_PIN ? 0.4 : pressed ? 0.6 : 1,
            minHeight: 44,
            justifyContent: 'center',
          })}
        >
          <Text variant="labelMedium" color="accent" marginTop="m">
            Unlock
          </Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

function Editor({ masjids }: { masjids: ReturnType<typeof useMasjids> }) {
  const [masjidId, setMasjidId] = useState(masjids[0]?.id ?? '');
  const current = masjids.find((m) => m.id === masjidId);
  const [times, setTimes] = useState<MasjidTimes>(() => normalizeTimes(masjids[0]?.times));
  const [saved, setSaved] = useState(false);
  const [picking, setPicking] = useState(false);

  const invalid = useMemo(
    () =>
      PRAYER_NAMES.some((n) => {
        const t = times[n];
        return !t || toMinutes(t.azaan) == null || toMinutes(t.iqamah) == null;
      }),
    [times]
  );

  const pick = (id: string) => {
    const m = masjids.find((x) => x.id === id);
    setMasjidId(id);
    setTimes(normalizeTimes(m?.times));
    setSaved(false);
    setPicking(false);
  };

  const setField = (name: string, field: 'azaan' | 'iqamah', value: string) => {
    setTimes((prev) => ({ ...prev, [name]: { ...prev[name], [field]: value } }));
    setSaved(false);
  };

  const save = () => {
    saveMasjidTimes(masjidId, times);
    setSaved(true);
  };

  return (
    <Screen>
      <AppBar title="Muazzin mode" subtitle="Update your masjid's times" back />

      <Box marginHorizontal="xs" marginBottom="s">
        <ListRow
          title={current?.name ?? 'Select a masjid'}
          subtitle={current ? `${current.area}, ${current.state}` : undefined}
          onPress={() => setPicking((p) => !p)}
        />
        {picking
          ? masjids.map((m) => (
              <ListRow
                key={m.id}
                title={m.name}
                subtitle={m.area}
                selected={m.id === masjidId}
                showChevron={false}
                onPress={() => pick(m.id)}
              />
            ))
          : null}
      </Box>

      {PRAYER_NAMES.map((name) => (
        <Card key={name} marginHorizontal="m" marginBottom="m" padding="l">
          <Text variant="labelMedium">{name}</Text>
          <Box flexDirection="row" marginTop="s">
            <TimeField
              label="Azaan"
              value={times[name]?.azaan ?? ''}
              onChange={(v) => setField(name, 'azaan', v)}
            />
            <Box width={12} />
            <TimeField
              label="Iqamah"
              value={times[name]?.iqamah ?? ''}
              onChange={(v) => setField(name, 'iqamah', v)}
              accent
            />
          </Box>
        </Card>
      ))}

      <Box marginHorizontal="m">
        <Pressable
          onPress={save}
          disabled={invalid}
          accessibilityRole="button"
          accessibilityLabel="Save times"
          style={({ pressed }) => ({
            opacity: invalid ? 0.4 : pressed ? 0.6 : 1,
            minHeight: 44,
            justifyContent: 'center',
          })}
        >
          <Text variant="labelMedium" color="accent">
            {saved ? 'Saved' : 'Save times'}
          </Text>
        </Pressable>

        <Text variant="bodySecondary" fontSize={13} marginTop="xs">
          {invalid
            ? 'Enter every time as h:mm AM/PM before saving.'
            : 'Saved on this device for now. Once the masjid backend is live, updates will sync to everyone.'}
        </Text>
      </Box>
    </Screen>
  );
}

function TimeField({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accent?: boolean;
}) {
  const theme = useTheme();
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);

  const shown = focused ? draft : value;
  const valid = toMinutes(value) != null;

  return (
    <Box flex={1}>
      <Text variant="overline">{label}</Text>
      <TextInput
        value={shown}
        onFocus={() => {
          setDraft(value);
          setFocused(true);
        }}
        onChangeText={setDraft}
        onBlur={() => {
          setFocused(false);
          const normalized = normalizeTimeInput(draft);
          onChange(normalized ?? draft);
        }}
        placeholder="5:04 AM"
        placeholderTextColor={theme.colors.textSecondary}
        accessibilityLabel={`${label} time`}
        style={{
          marginTop: 4,
          minHeight: 44,
          paddingHorizontal: theme.spacing.xs,
          backgroundColor: theme.colors.surfaceHighlight,
          borderRadius: 12,
          fontFamily: 'Inter_400Regular',
          fontSize: 15,
          color: !valid
            ? theme.colors.textSecondary
            : accent
              ? theme.colors.accent
              : theme.colors.textPrimary,
        }}
      />
    </Box>
  );
}
