import { useState } from 'react';
import { TextInput } from 'react-native';

import { AppBar } from '../src/components/AppBar';
import { Screen } from '../src/components/Screen';
import { Box, Card, Text, useTheme } from '../src/theme/components';

// Nisab: 87.48g of gold. The rate is a seed value — a muazzin/admin-editable
// figure once the backend lands.
const GOLD_GRAMS = 87.48;
const GOLD_RATE = 6500;
const NISAB = Math.round(GOLD_GRAMS * GOLD_RATE);

const ASSETS = [
  { key: 'gold', label: 'Gold and silver' },
  { key: 'cashHome', label: 'Cash at home' },
  { key: 'cashBank', label: 'Cash at bank' },
  { key: 'investments', label: 'Investments and shares' },
  { key: 'business', label: 'Business goods and property' },
];

const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function ZakatScreen() {
  const [values, setValues] = useState<Record<string, string>>({});

  const num = (k: string) => {
    const parsed = parseFloat(values[k] ?? '');
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  };

  const assets = ASSETS.reduce((sum, f) => sum + num(f.key), 0);
  const liabilities = num('loans');
  const net = assets - liabilities;
  const aboveNisab = net >= NISAB;
  const zakat = aboveNisab ? net * 0.025 : 0;

  return (
    <Screen>
      <AppBar title="Zakat" subtitle="2.5% of net wealth above nisab" back />

      <Box marginHorizontal="m" marginBottom="m">
        <Text variant="bodySecondary" fontSize={13}>
          Enter the assets you have held for one lunar year.
        </Text>
      </Box>

      <Text variant="heading" marginHorizontal="m" marginBottom="xs">
        Assets
      </Text>
      <Card marginHorizontal="m" padding="s">
        {ASSETS.map((f, i) => (
          <AmountField
            key={f.key}
            label={f.label}
            value={values[f.key] ?? ''}
            onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
            last={i === ASSETS.length - 1}
          />
        ))}
      </Card>

      <Text variant="heading" marginHorizontal="m" marginTop="xl" marginBottom="xs">
        Liabilities
      </Text>
      <Card marginHorizontal="m" padding="s">
        <AmountField
          label="Loans and debts"
          value={values.loans ?? ''}
          onChange={(v) => setValues((s) => ({ ...s, loans: v }))}
          last
        />
      </Card>

      <Card marginHorizontal="m" marginTop="xl" padding="l">
        <Text variant="overline">Net wealth</Text>
        <Text variant="labelMedium" fontSize={18} marginTop="xxs">
          {inr(net)}
        </Text>

        <Box height={1} backgroundColor="hairline" marginVertical="m" />

        <Text variant="overline">{aboveNisab ? 'Zakat due' : 'No zakat due'}</Text>
        {aboveNisab ? (
          <Text variant="displayTime" marginTop="xxs">
            {inr(zakat)}
          </Text>
        ) : (
          <Text variant="bodySecondary" marginTop="xxs">
            Your net wealth is below the nisab threshold.
          </Text>
        )}

        <Text variant="bodySecondary" fontSize={12} marginTop="m">
          Nisab {inr(NISAB)} · {GOLD_GRAMS}g gold at {inr(GOLD_RATE)}/g
        </Text>
      </Card>
    </Screen>
  );
}

function AmountField({
  label,
  value,
  onChange,
  last,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <Box paddingHorizontal="xs" paddingVertical="xs">
      <Text variant="bodySecondary" fontSize={13}>
        {label}
      </Text>
      <Box flexDirection="row" alignItems="center" minHeight={44}>
        <Text variant="label" color="textSecondary" marginRight="xxs">
          ₹
        </Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={theme.colors.textSecondary}
          accessibilityLabel={label}
          style={{
            flex: 1,
            fontFamily: 'Inter_400Regular',
            fontSize: 17,
            color: theme.colors.textPrimary,
            minHeight: 44,
          }}
        />
      </Box>
      {!last ? <Box height={1} backgroundColor="hairline" /> : null}
    </Box>
  );
}
