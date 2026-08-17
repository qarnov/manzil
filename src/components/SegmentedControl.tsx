import { Pressable } from 'react-native';
import { Box, Text } from '../theme/components';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Soft segmented switch. The selected segment is a raised surface inside a
 * tinted track — no outlines, matching the rest of the design.
 */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <Box
      flexDirection="row"
      backgroundColor="surfaceHighlight"
      borderRadius="full"
      padding="xxs"
      marginHorizontal="m"
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            style={{ flex: 1 }}
          >
            <Box
              alignItems="center"
              justifyContent="center"
              minHeight={40}
              borderRadius="full"
              backgroundColor={selected ? 'surface' : 'transparent'}
            >
              <Text variant={selected ? 'labelMedium' : 'label'} fontSize={14} color={selected ? 'textPrimary' : 'textSecondary'}>
                {o.label}
              </Text>
            </Box>
          </Pressable>
        );
      })}
    </Box>
  );
}
