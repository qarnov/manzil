import i18next from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from '../locales/en.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';
import { KEYS, getItem, setItem, useStorageValue } from './storage';

export const LANGUAGES = [
  { code: 'en', label: 'English', english: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'ml', label: 'മലയാളം', english: 'Malayalam' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const SUPPORTED = LANGUAGES.map((l) => l.code) as readonly string[];

/** Stored choice first, then the device locale, then English. */
export function resolveInitialLanguage(): LanguageCode {
  const stored = getItem(KEYS.language);
  if (stored && SUPPORTED.includes(stored)) return stored as LanguageCode;

  const device = getLocales()[0]?.languageCode;
  if (device && SUPPORTED.includes(device)) return device as LanguageCode;

  return 'en';
}

/** Call once, after storage has hydrated. */
export function initI18n() {
  if (i18next.isInitialized) return;
  i18next.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      kn: { translation: kn },
      ml: { translation: ml },
    },
    lng: resolveInitialLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

export function useLanguage() {
  const stored = useStorageValue(KEYS.language);
  const language = (stored && SUPPORTED.includes(stored) ? stored : 'en') as LanguageCode;

  return {
    language,
    setLanguage: (code: LanguageCode) => {
      setItem(KEYS.language, code);
      i18next.changeLanguage(code);
    },
  };
}

export { useTranslation };
