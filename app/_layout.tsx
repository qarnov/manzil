import { ThemeProvider } from '@shopify/restyle';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Amiri_400Regular } from '@expo-google-fonts/amiri';
import { Lora_400Regular } from '@expo-google-fonts/lora';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { darkTheme, theme as lightTheme } from '../src/theme';
import { initI18n } from '../src/lib/i18n';
import { hydrateStorage, KEYS, useStorageValue } from '../src/lib/storage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Quran text and surah metadata never change — cache them hard.
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24 * 7,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Amiri_400Regular,
    Lora_400Regular,
  });

  const [storageReady, setStorageReady] = useState(false);
  useEffect(() => {
    // i18n reads the stored language, so it can only start once storage is up.
    hydrateStorage().then(() => {
      initI18n();
      setStorageReady(true);
    });
  }, []);

  const ready = fontsLoaded && storageReady;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          {/* Hold the themed background while fonts/storage settle so the
              first paint is never a white flash in dark mode. */}
          {ready ? (
            <>
              <OnboardingGate />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: theme.colors.bg },
                }}
              />
            </>
          ) : (
            <View style={{ flex: 1, backgroundColor: theme.colors.bg }} />
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

/**
 * Sends first-time users to onboarding. Rendered inside the navigator so the
 * redirect happens after the router is mounted.
 */
function OnboardingGate() {
  const onboarded = useStorageValue(KEYS.onboarded) === 'true';
  const segments = useSegments();
  const router = useRouter();

  const onOnboarding = segments[0] === 'onboarding';

  useEffect(() => {
    if (!onboarded && !onOnboarding) {
      router.replace('/onboarding');
    }
  }, [onboarded, onOnboarding, router]);

  return null;
}
