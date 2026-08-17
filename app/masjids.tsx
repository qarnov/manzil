import { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, TextInput } from 'react-native';

import { AppBar } from '../src/components/AppBar';
import { Screen } from '../src/components/Screen';
import { getStates, useMasjids } from '../src/lib/masjids';
import { Box, Card, Text, useTheme } from '../src/theme/components';

// Where "register your masjid" requests are sent, until there is a backend.
const CONTACT_EMAIL = 'afaaqir@gmail.com';

export default function MasjidsScreen() {
  const masjids = useMasjids();
  const states = useMemo(() => getStates(), []);
  const [filter, setFilter] = useState('all');

  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [contact, setContact] = useState('');

  const canSubmit = name.trim().length > 0 && area.trim().length > 0;
  const visible = filter === 'all' ? masjids : masjids.filter((m) => m.state === filter);

  const submit = async () => {
    if (!canSubmit) return;
    const subject = encodeURIComponent(`Manzil — register masjid: ${name.trim()}`);
    const body = encodeURIComponent(
      `Assalamu alaikum,\n\nPlease add this masjid to Manzil:\n\n` +
        `Masjid name: ${name.trim()}\n` +
        `Area / locality: ${area.trim()}\n` +
        `Muazzin / contact: ${contact.trim() || '(not provided)'}\n\nJazakAllah khair.`
    );
    const url = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error('no mail client');
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'No email app found',
        `Please email the details to ${CONTACT_EMAIL}.`
      );
    }
  };

  return (
    <Screen>
      <AppBar title="Masjids" subtitle={`${masjids.length} registered`} back />

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

      {visible.map((m) => (
        <Card key={m.id} marginHorizontal="m" marginBottom="m" padding="l">
          <Text variant="labelMedium">{m.name}</Text>
          <Text variant="bodySecondary" fontSize={13} marginTop="xxs">
            {m.area}, {m.state}
          </Text>
          {m.updatedAt ? (
            <Text variant="bodySecondary" fontSize={12} marginTop="xs">
              Times updated {m.updatedAt}
            </Text>
          ) : null}
        </Card>
      ))}

      <Text variant="heading" marginHorizontal="m" marginTop="xl" marginBottom="xs">
        Register a masjid
      </Text>
      <Card marginHorizontal="m" padding="l">
        <Text variant="bodySecondary" fontSize={13}>
          Once added, its azaan and iqamah times can be kept up to date in the app.
        </Text>

        <Field label="Masjid name" value={name} onChange={setName} />
        <Field label="Area or locality" value={area} onChange={setArea} />
        <Field label="Muazzin or your contact (optional)" value={contact} onChange={setContact} />

        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel="Send masjid details"
          style={({ pressed }) => ({
            opacity: !canSubmit ? 0.4 : pressed ? 0.6 : 1,
            minHeight: 44,
            justifyContent: 'center',
          })}
        >
          <Text variant="labelMedium" color="accent" marginTop="m">
            Send details
          </Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const theme = useTheme();
  return (
    <Box marginTop="m">
      <Text variant="overline">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        accessibilityLabel={label}
        style={{
          marginTop: 4,
          minHeight: 44,
          paddingHorizontal: theme.spacing.xs,
          backgroundColor: theme.colors.surfaceHighlight,
          borderRadius: 12,
          fontFamily: 'Inter_400Regular',
          fontSize: 15,
          color: theme.colors.textPrimary,
        }}
      />
    </Box>
  );
}
