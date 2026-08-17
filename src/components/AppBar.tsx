import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ReactNode } from 'react';
import { IconButton } from './IconButton';
import { Box, Text, useTheme } from '../theme/components';

type Props = {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
};

/** Screen header. Sentence case, no rule beneath it — spacing does the work. */
export function AppBar({ title, subtitle, back, right }: Props) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      paddingHorizontal="m"
      paddingTop="m"
      paddingBottom="s"
      minHeight={56}
    >
      {back && (
        <Box marginRight="xxs">
          <IconButton
            accessibilityLabel="Go back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          >
            <ChevronLeft size={24} color={theme.colors.textPrimary} strokeWidth={1.75} />
          </IconButton>
        </Box>
      )}
      <Box flex={1}>
        <Text variant="title" fontSize={22} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySecondary" fontSize={13} marginTop="xxs">
            {subtitle}
          </Text>
        ) : null}
      </Box>
      {right}
    </Box>
  );
}
