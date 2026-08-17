import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, TextInput } from 'react-native';

import { AppBar } from '../../src/components/AppBar';
import { ListRow } from '../../src/components/ListRow';
import { Screen } from '../../src/components/Screen';
import { EmptyState } from '../../src/components/States';
import { duaCategoryIcon } from '../../src/lib/duaIcons';
import { DUA_CATEGORIES, searchDuas } from '../../src/lib/duas';
import { Box, Card, Text, useTheme } from '../../src/theme/components';

export default function DuasScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchDuas(query), [query]);
  const searching = query.trim().length > 0;

  return (
    <Screen>
      <AppBar title="Duas" subtitle="Supplications for every moment" />

      <Box
        flexDirection="row"
        alignItems="center"
        backgroundColor="surface"
        borderRadius="m"
        marginHorizontal="m"
        paddingHorizontal="s"
        minHeight={48}
      >
        <Search size={18} color={theme.colors.textSecondary} strokeWidth={1.75} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search duas"
          placeholderTextColor={theme.colors.textSecondary}
          accessibilityLabel="Search duas"
          style={{
            flex: 1,
            marginLeft: theme.spacing.xs,
            fontFamily: 'Inter_400Regular',
            fontSize: 15,
            color: theme.colors.textPrimary,
            minHeight: 48,
          }}
        />
      </Box>

      {searching ? (
        <Box marginTop="m" marginHorizontal="xs">
          {results.length === 0 ? (
            <EmptyState message={`No duas match “${query.trim()}”.`} />
          ) : (
            results.map(({ category, dua }) => (
              <ListRow
                key={`${category.id}-${dua.id}`}
                title={dua.translation}
                subtitle={`${category.name} · ${dua.reference}`}
                onPress={() => router.push(`/duas/${category.id}`)}
              />
            ))
          )}
        </Box>
      ) : (
        <>
          <Text variant="heading" marginHorizontal="m" marginTop="xl" marginBottom="xs">
            Categories
          </Text>
          <Box marginHorizontal="xs">
            {DUA_CATEGORIES.map((c) => {
              const Icon = duaCategoryIcon(c.id);
              return (
                <ListRow
                  key={c.id}
                  title={c.name}
                  subtitle={`${c.duas.length} ${c.duas.length === 1 ? 'dua' : 'duas'}`}
                  icon={<Icon size={20} color={theme.colors.accent} strokeWidth={1.75} />}
                  onPress={() => router.push(`/duas/${c.id}`)}
                />
              );
            })}
          </Box>

          {/* Tasbih entry point — a quiet card, one action */}
          <Card marginHorizontal="m" marginTop="l" padding="l">
            <Text variant="overline">Dhikr</Text>
            <Text variant="labelMedium" marginTop="xxs">
              Tasbih counter
            </Text>
            <Text variant="bodySecondary" fontSize={13} marginTop="xxs">
              Keep count on a 99-bead ring
            </Text>
            <Pressable
              onPress={() => router.push('/tasbih')}
              accessibilityRole="link"
              accessibilityLabel="Open tasbih counter"
              hitSlop={10}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
                minHeight: 44,
                justifyContent: 'center',
              })}
            >
              <Text variant="label" color="accent" marginTop="xs">
                Open counter
              </Text>
            </Pressable>
          </Card>
        </>
      )}
    </Screen>
  );
}
