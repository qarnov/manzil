import { ChevronRight } from 'lucide-react-native';
import { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { Box, Text, useTheme } from '../theme/components';

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onPress?: () => void;
  /** Right-hand content. Replaces the default chevron. */
  right?: ReactNode;
  showChevron?: boolean;
  selected?: boolean;
};

/**
 * A borderless row. Rows are separated by whitespace and an optional
 * surface-highlight background, never by rules.
 */
export function ListRow({
  title,
  subtitle,
  icon,
  onPress,
  right,
  showChevron = true,
  selected = false,
}: Props) {
  const theme = useTheme();

  const content = (
    <Box
      flexDirection="row"
      alignItems="center"
      paddingHorizontal="s"
      paddingVertical="s"
      minHeight={56}
      borderRadius="m"
      backgroundColor={selected ? 'surfaceHighlight' : 'transparent'}
    >
      {icon ? (
        <Box
          width={40}
          height={40}
          borderRadius="full"
          alignItems="center"
          justifyContent="center"
          backgroundColor="accentCircle"
          marginRight="s"
        >
          {icon}
        </Box>
      ) : null}
      <Box flex={1}>
        <Text variant="label">{title}</Text>
        {subtitle ? (
          <Text variant="bodySecondary" fontSize={13} marginTop="xxs">
            {subtitle}
          </Text>
        ) : null}
      </Box>
      {right ??
        (onPress && showChevron ? (
          <ChevronRight size={20} color={theme.colors.textSecondary} strokeWidth={1.75} />
        ) : null)}
    </Box>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      {content}
    </Pressable>
  );
}
