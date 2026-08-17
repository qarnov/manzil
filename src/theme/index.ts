import { createTheme } from '@shopify/restyle';
import { darkPalette, lightPalette } from './palette';

// 8pt spacing scale. `s` names map to multiples of 8 (with a 4 half-step),
// so layout code never invents an off-grid number.
const spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  s: 12,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
} as const;

const borderRadii = {
  none: 0,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  full: 999,
} as const;

// Two weights only — 400 and 500. Anything heavier is off-design.
const textVariants = {
  defaults: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'textPrimary',
  },
  // Screen title, e.g. "Manzil"
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 26,
    lineHeight: 32,
    color: 'textPrimary',
  },
  // Section heading, e.g. "Today's prayers"
  heading: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    lineHeight: 24,
    color: 'textPrimary',
  },
  // Tiny muted label above a card's content, e.g. "Ayah of the day"
  overline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: 'textSecondary',
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 23,
    color: 'textPrimary',
  },
  bodySecondary: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: 'textSecondary',
  },
  // The big numeric readout on the next-prayer card
  displayTime: {
    fontFamily: 'Inter_500Medium',
    fontSize: 34,
    lineHeight: 42,
    color: 'textPrimary',
  },
  // Quranic / dua Arabic
  arabic: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 28,
    lineHeight: 52,
    color: 'textPrimary',
    textAlign: 'center',
  },
  arabicSmall: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 22,
    lineHeight: 42,
    color: 'textPrimary',
  },
  // Serif accent, reserved for translated quotes
  quote: {
    fontFamily: 'Lora_400Regular',
    fontSize: 16,
    lineHeight: 26,
    color: 'textQuote',
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 20,
    color: 'textPrimary',
  },
  labelMedium: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    lineHeight: 20,
    color: 'textPrimary',
  },
  tab: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 14,
  },
} as const;

// Soft elevation instead of hard borders. Dark mode leans on surface layering
// (shadows barely read on a near-black background) so its shadow is subtler.
// `shadowColor` is resolved through theme.colors by Restyle, so the shadow
// tint is a token ('shadow') rather than a literal.
const cardShadowLight = {
  shadowColor: 'shadow',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 12,
  elevation: 2,
};

export const theme = createTheme({
  colors: {
    bg: lightPalette.bg,
    surface: lightPalette.surface,
    surfaceHighlight: lightPalette.surfaceHighlight,
    circle: lightPalette.accentCircle,

    textPrimary: lightPalette.textPrimary,
    textSecondary: lightPalette.textSecondary,
    textQuote: lightPalette.textQuote,

    accent: lightPalette.accent,
    accentSoftBg: lightPalette.accentSoftBg,
    accentSoftText: lightPalette.accentSoftText,
    accentCircle: lightPalette.accentCircle,

    hairline: lightPalette.hairline,
    navInactive: lightPalette.navInactive,
    navActive: lightPalette.navActive,

    shadow: '#8C7A5E',
    transparent: 'transparent',
  },
  spacing,
  borderRadii,
  textVariants,
  cardVariants: {
    defaults: {
      backgroundColor: 'surface',
      borderRadius: 'l',
      padding: 'm',
      ...cardShadowLight,
    },
    flat: {
      backgroundColor: 'surface',
      borderRadius: 'l',
      padding: 'm',
    },
  },
});

export type Theme = typeof theme;

export const darkTheme: Theme = {
  ...theme,
  colors: {
    ...theme.colors,
    bg: darkPalette.bg,
    surface: darkPalette.surface,
    surfaceHighlight: darkPalette.surfaceHighlight,
    circle: darkPalette.circle,

    textPrimary: darkPalette.textPrimary,
    textSecondary: darkPalette.textSecondary,
    textQuote: darkPalette.textQuote,

    accent: darkPalette.accent,
    accentSoftBg: darkPalette.accentSoftBg,
    accentSoftText: darkPalette.accentSoftText,
    accentCircle: darkPalette.accentCircle,

    hairline: darkPalette.hairline,
    navInactive: darkPalette.navInactive,
    navActive: darkPalette.navActive,

    shadow: '#000000',
  },
  cardVariants: {
    defaults: {
      backgroundColor: 'surface',
      borderRadius: 'l',
      padding: 'm',
      shadowColor: 'shadow',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 3,
    },
    flat: {
      backgroundColor: 'surface',
      borderRadius: 'l',
      padding: 'm',
    },
  },
};
