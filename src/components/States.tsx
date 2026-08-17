import { Pressable, ActivityIndicator } from 'react-native';
import { Box, Text, useTheme } from '../theme/components';

export function Loading({ label = 'Loading…' }: { label?: string }) {
  const theme = useTheme();
  return (
    <Box alignItems="center" justifyContent="center" paddingVertical="xxl">
      <ActivityIndicator color={theme.colors.accent} />
      <Text variant="bodySecondary" marginTop="s">
        {label}
      </Text>
    </Box>
  );
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Box alignItems="center" paddingVertical="xl" paddingHorizontal="l">
      <Text variant="bodySecondary" textAlign="center">
        {message}
      </Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Try again"
          hitSlop={10}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            minHeight: 44,
            justifyContent: 'center',
          })}
        >
          <Text variant="label" color="accent" marginTop="s">
            Try again
          </Text>
        </Pressable>
      ) : null}
    </Box>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <Box alignItems="center" paddingVertical="xl" paddingHorizontal="l">
      <Text variant="bodySecondary" textAlign="center">
        {message}
      </Text>
    </Box>
  );
}
