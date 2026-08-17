import { useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronUp, Share2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Share } from 'react-native';

import { AppBar } from '../../src/components/AppBar';
import { Screen } from '../../src/components/Screen';
import { EmptyState } from '../../src/components/States';
import { IconButton } from '../../src/components/IconButton';
import { getCategory, type Dua } from '../../src/lib/duas';
import { Box, Card, Text, useTheme } from '../../src/theme/components';

export default function DuaCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const cat = getCategory(category);

  if (!cat) {
    return (
      <Screen>
        <AppBar title="Not found" back />
        <EmptyState message="That dua category doesn’t exist." />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppBar
        title={cat.name}
        subtitle={`${cat.duas.length} ${cat.duas.length === 1 ? 'dua' : 'duas'}`}
        back
      />

      {cat.instruction ? (
        <Box
          backgroundColor="surfaceHighlight"
          borderRadius="m"
          marginHorizontal="m"
          marginBottom="m"
          padding="s"
        >
          <Text variant="bodySecondary" fontSize={13}>
            {cat.instruction}
          </Text>
        </Box>
      ) : null}

      {cat.duas.map((dua) => (
        <DuaCard key={dua.id} dua={dua} />
      ))}
    </Screen>
  );
}

function DuaCard({ dua }: { dua: Dua }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const onShare = () => {
    Share.share({
      message: `${dua.arabic}\n\n${dua.translation}\n— ${dua.reference}\n\nShared via Manzil`,
    }).catch(() => {});
  };

  return (
    <Card marginHorizontal="m" marginBottom="m" padding="l">
      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        <Text variant="overline">{dua.reference}</Text>
        {dua.repetitions > 1 ? (
          <Box
            backgroundColor="accentSoftBg"
            paddingHorizontal="xs"
            paddingVertical="xxs"
            borderRadius="full"
          >
            <Text variant="label" fontSize={12} color="accentSoftText">
              {dua.repetitions}×
            </Text>
          </Box>
        ) : null}
      </Box>

      <Text variant="arabicSmall" textAlign="right" marginTop="s">
        {dua.arabic}
      </Text>

      <Text variant="quote" fontSize={15} marginTop="m">
        {dua.translation}
      </Text>

      <Box height={1} backgroundColor="hairline" marginTop="l" marginBottom="s" />

      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        <Pressable
          onPress={() => setOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={open ? 'Hide why this dua' : 'Show why this dua'}
          hitSlop={10}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            minHeight: 44,
            flexDirection: 'row',
            alignItems: 'center',
          })}
        >
          <Text variant="label" color="accent" marginRight="xxs">
            Why this dua
          </Text>
          {open ? (
            <ChevronUp size={16} color={theme.colors.accent} strokeWidth={1.75} />
          ) : (
            <ChevronDown size={16} color={theme.colors.accent} strokeWidth={1.75} />
          )}
        </Pressable>

        <IconButton accessibilityLabel="Share this dua" onPress={onShare}>
          <Share2 size={18} color={theme.colors.textSecondary} strokeWidth={1.75} />
        </IconButton>
      </Box>

      {open ? (
        <Text variant="bodySecondary" fontSize={14} marginTop="xs">
          {dua.benefit}
        </Text>
      ) : null}
    </Card>
  );
}
