import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Check, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LANGUAGES, useLanguage, useTranslation, type LanguageCode } from '../src/lib/i18n';
import { KEYS, setItem } from '../src/lib/storage';
import { Box, Text, useTheme } from '../src/theme/components';

export default function OnboardingScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const [step, setStep] = useState<'language' | 'location'>('language');
  const [locating, setLocating] = useState(false);

  const finish = (to: '/' | '/select-masjid') => {
    setItem(KEYS.onboarded, 'true');
    router.replace(to);
  };

  const requestLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      }
    } catch {
      // Denied or unavailable — they can still browse masjids manually.
    } finally {
      setLocating(false);
      finish('/select-masjid');
    }
  };

  return (
    <Box
      flex={1}
      backgroundColor="bg"
      paddingHorizontal="l"
      style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }}
    >
      <Box alignItems="center" marginBottom="xl">
        <Text variant="arabic" fontSize={40} lineHeight={64}>
          مَنْزِل
        </Text>
        <Text variant="title" marginTop="xs">
          Manzil
        </Text>
        <Text variant="bodySecondary" marginTop="xxs">
          {t('onboarding.tagline')}
        </Text>
      </Box>

      {step === 'language' ? (
        <>
          <Text variant="heading" textAlign="center" marginBottom="m">
            {t('onboarding.chooseLanguage')}
          </Text>

          <Box flex={1}>
            {LANGUAGES.map((l) => {
              const active = language === l.code;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => setLanguage(l.code as LanguageCode)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={l.english}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginBottom: 12 })}
                >
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    backgroundColor={active ? 'accentSoftBg' : 'surface'}
                    borderRadius="l"
                    padding="m"
                    minHeight={64}
                  >
                    <Box flex={1}>
                      <Text
                        variant="labelMedium"
                        fontSize={18}
                        color={active ? 'accentSoftText' : 'textPrimary'}
                      >
                        {l.label}
                      </Text>
                      <Text variant="bodySecondary" fontSize={13} marginTop="xxs">
                        {l.english}
                      </Text>
                    </Box>
                    {active ? (
                      <Check size={20} color={theme.colors.accentSoftText} strokeWidth={2} />
                    ) : null}
                  </Box>
                </Pressable>
              );
            })}
          </Box>

          <Pressable
            onPress={() => setStep('location')}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.continue')}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Box
              backgroundColor="accent"
              borderRadius="l"
              minHeight={52}
              alignItems="center"
              justifyContent="center"
            >
              <Text variant="labelMedium" fontSize={16} style={{ color: theme.colors.surface }}>
                {t('onboarding.continue')}
              </Text>
            </Box>
          </Pressable>
        </>
      ) : (
        <>
          <Box flex={1} alignItems="center" justifyContent="center">
            <Box
              width={72}
              height={72}
              borderRadius="full"
              backgroundColor="accentCircle"
              alignItems="center"
              justifyContent="center"
            >
              <MapPin size={30} color={theme.colors.accent} strokeWidth={1.5} />
            </Box>
            <Text variant="heading" fontSize={20} marginTop="l" textAlign="center">
              {t('onboarding.locationTitle')}
            </Text>
            <Text variant="bodySecondary" textAlign="center" marginTop="s">
              {t('onboarding.locationBody')}
            </Text>
          </Box>

          <Pressable
            onPress={requestLocation}
            disabled={locating}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.allowLocation')}
            style={({ pressed }) => ({ opacity: pressed || locating ? 0.7 : 1 })}
          >
            <Box
              backgroundColor="accent"
              borderRadius="l"
              minHeight={52}
              alignItems="center"
              justifyContent="center"
            >
              <Text variant="labelMedium" fontSize={16} style={{ color: theme.colors.surface }}>
                {locating ? t('onboarding.gettingLocation') : t('onboarding.allowLocation')}
              </Text>
            </Box>
          </Pressable>

          <Pressable
            onPress={() => finish('/')}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.skip')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              minHeight: 44,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 8,
            })}
          >
            <Text variant="label" color="textSecondary">
              {t('onboarding.skip')}
            </Text>
          </Pressable>
        </>
      )}
    </Box>
  );
}
