import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/components';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  /** Draws the icon inside a soft accent-tinted circle. */
  circle?: boolean;
  size?: number;
};

/**
 * A 44pt tap target with an optional soft circle behind it. The circle is
 * visually smaller than the touch area so the design stays airy without
 * shrinking the target.
 */
export function IconButton({
  children,
  onPress,
  accessibilityLabel,
  circle = false,
  size = 40,
}: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        {
          width: Math.max(size, 44),
          height: Math.max(size, 44),
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      {circle ? (
        <View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: theme.colors.accentCircle,
            },
          ]}
        >
          {children}
        </View>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  circle: { alignItems: 'center', justifyContent: 'center' },
});
