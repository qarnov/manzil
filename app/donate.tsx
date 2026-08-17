import { AppBar } from '../src/components/AppBar';
import { Screen } from '../src/components/Screen';
import { Box, Card, Text } from '../src/theme/components';

const UPCOMING = [
  { title: 'Give a one-time sadaqah', subtitle: 'Secure and transparent' },
  { title: 'Support a local masjid', subtitle: 'Direct to the community' },
  { title: 'See where it goes', subtitle: 'Full transparency reports' },
];

export default function DonateScreen() {
  return (
    <Screen>
      <AppBar title="Donate" subtitle="Sadaqah jariyah" back />

      <Card marginHorizontal="m" padding="l">
        <Text variant="arabic" fontSize={26}>
          صَدَقَة جَارِيَة
        </Text>
        <Text variant="quote" textAlign="center" marginTop="m">
          When a person dies, their deeds end except for three: ongoing charity, beneficial
          knowledge, or a righteous child who prays for them.
        </Text>
        <Text variant="bodySecondary" fontSize={13} textAlign="center" marginTop="s">
          Sahih Muslim · 1631
        </Text>
      </Card>

      <Card marginHorizontal="m" marginTop="m" padding="l">
        <Text variant="overline">The intention</Text>
        <Text variant="body" marginTop="xs">
          Manzil is built for the sake of the community. Any income this app ever earns is
          intended to go entirely towards charity for the ummah — never to profit.
        </Text>
      </Card>

      <Card marginHorizontal="m" marginTop="m" padding="l">
        <Text variant="overline">Current status</Text>
        <Text variant="body" marginTop="xs">
          The donation system is still being built. Manzil runs with no income today.
        </Text>
      </Card>

      <Text variant="heading" marginHorizontal="m" marginTop="xl" marginBottom="xs">
        Coming soon
      </Text>
      <Box marginHorizontal="xs">
        {UPCOMING.map((u) => (
          <Box key={u.title} paddingHorizontal="s" paddingVertical="s" minHeight={56} justifyContent="center">
            <Text variant="label" color="textSecondary">
              {u.title}
            </Text>
            <Text variant="bodySecondary" fontSize={13} marginTop="xxs">
              {u.subtitle}
            </Text>
          </Box>
        ))}
      </Box>
    </Screen>
  );
}
