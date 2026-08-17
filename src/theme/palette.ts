// The two token sets. These are the ONLY place raw hex values may appear in
// the app — everything else reaches them through the Restyle theme.
//
// Dark is a re-mapped warm palette, not an inversion of light: the browns stay
// brown, the golds stay gold, and only the lightness relationship flips.

export const lightPalette = {
  bg: '#F7F2EA',
  surface: '#FFFFFF',
  surfaceHighlight: '#F5EDDD',

  textPrimary: '#2B2521',
  textSecondary: '#A2917D',
  textQuote: '#4A4038',

  accent: '#B08D4F',
  accentSoftBg: '#F1E4C9',
  accentSoftText: '#7A5F2E',
  accentCircle: '#F1E9DA',

  hairline: '#EDE4D3',
  navInactive: '#B4A794',
  navActive: '#B08D4F',
};

export const darkPalette = {
  bg: '#181310',
  surface: '#241D17',
  surfaceHighlight: '#2F261C',
  circle: '#26201A',

  textPrimary: '#F0E7D8',
  textSecondary: '#96897A',
  textQuote: '#C9BCA9',

  accent: '#D4B06A',
  accentSoftBg: '#3A2E1A',
  accentSoftText: '#EBCF8E',
  accentCircle: '#2E2519',

  hairline: 'rgba(255,255,255,0.07)',
  navInactive: '#8A7C6A',
  navActive: '#D4B06A',
};
