import { Screen } from './Screen';
import { Box, Text } from '../theme/components';

/**
 * Temporary stand-in for screens not yet ported. Deliberately plain — it
 * should look unfinished, not like a designed empty state.
 */
export function Placeholder({ title }: { title: string }) {
  return (
    <Screen>
      <Box paddingHorizontal="m" paddingTop="m">
        <Text variant="title">{title}</Text>
        <Text variant="bodySecondary" marginTop="xs">
          Not ported yet.
        </Text>
      </Box>
    </Screen>
  );
}
