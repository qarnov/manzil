import { ReactNode } from 'react';
import { ScrollView, ScrollViewProps, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/components';

type Props = {
  children: ReactNode;
  /** Set false for screens that manage their own scrolling (lists, compass). */
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
};

/**
 * Themed page container. Applies the top safe-area inset and leaves room at
 * the bottom so content clears the tab bar.
 */
export function Screen({ children, scroll = true, contentContainerStyle }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const base = { flex: 1, backgroundColor: theme.colors.bg };

  if (!scroll) {
    return <View style={[base, { paddingTop: insets.top }]}>{children}</View>;
  }

  return (
    <ScrollView
      style={base}
      contentContainerStyle={[
        { paddingTop: insets.top, paddingBottom: theme.spacing.xl },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
