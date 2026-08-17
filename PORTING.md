# Manzil — web ➝ React Native port

Rebuild of the Capacitor/TanStack Start web prototype (`../manzil`) as a true
Expo app. The old app is left untouched for reference.

## Stack

| Concern | Choice |
| --- | --- |
| Runtime | Expo SDK 57 (RN 0.86, React 19.2), managed workflow |
| Navigation | Expo Router — root `Stack` wrapping a `(tabs)` group |
| Theming | Shopify Restyle, typed theme + OS-driven dark mode |
| Icons | lucide-react-native (line icons only, no emoji) |
| Data fetching | @tanstack/react-query (24h staleTime for Quran data) |
| Storage | AsyncStorage behind `src/lib/storage.ts` |
| Location / compass | expo-location (`watchHeadingAsync` gives true north) |
| Audio | expo-audio (`useAudioPlayer` + `replace()` for per-ayah recitation) |
| i18n | i18next + react-i18next (en, kn, ml) |
| Fonts | expo-font + @expo-google-fonts (Inter 400/500, Amiri, Lora) |

## Screens — all ported

| Screen | Notes |
| --- | --- |
| Onboarding | Language + location; writes the onboarding flag |
| Home | Ayah card, live next-prayer countdown, prayer list, masjid selector |
| Bottom tab nav | Line icons, accent active state, sentence case |
| Quran list | Surah list + favourites tab + continue-reading card |
| Quran reader | Arabic, translation, per-ayah favourite, recitation, tafsir tab |
| Duas | Search across all 46 duas + 8 categories |
| Dua category | Arabic, translation, collapsible benefit, share |
| Qibla | **Live compass** — real GPS + device heading, haptic on alignment |
| Tasbih | 100-bead SVG ring, presets, custom dhikr, **now persisted** |
| Zakat | Assets − liabilities, nisab, 2.5% |
| Hijri | Month grid, today card, observances |
| Prayer settings | Per-prayer iqamah offsets |
| Masjids | List, state filter, register-a-masjid |
| Select masjid | Location-assisted picker |
| Muazzin | PIN gate + azaan/iqamah editor with time validation |
| Donate | Static, matching the original |
| More | Hub + language switcher |
| ~~`prayer.tsx`~~ | **Dropped** — dead screen, fully hardcoded, superseded by Home |

## Reused verbatim

- `src/data/duas.json` — 8 categories, 46 duas
- `src/data/masjids.json` — 3 masjids

## Rewritten

- `src/lib/prayerTimes.ts` — math kept as-is; persistence moved to `storage.ts`.
- `src/lib/masjids.ts` — same public API; storage and reactivity swapped.
- `src/lib/hijri.ts` — `Intl` path kept, plus an arithmetic fallback (below).
- `src/lib/qibla.ts` — bearing/distance helpers extracted from the old screen.

## Deliberate improvements over the prototype

- Quran requests are cached by react-query instead of refetched every visit.
- The tasbih count survives leaving the screen (it did not before).
- Qibla uses real GPS + heading; the web version hardcoded Mangaluru.
- Ayah of the day rotates through 7 curated ayat by day-of-year.
- alquran.cloud prefixes the basmala onto ayah 1 of most surahs; the reader
  renders the basmala as its own heading and strips the duplicate (correctly
  leaving Al-Fatiha and At-Tawbah alone).

## Known gaps and caveats

- **Hermes + `Intl`**: `hijri.ts` prefers the platform Umm al-Qura calendar but
  probes for it at startup, since Hermes is often built without full ICU. The
  tabular fallback matches ICU on month and year and lands within ±1 day; the
  UI says so when the fallback is active. **Verify on a real Android build.**
- **Translations are partial.** The i18n plumbing is complete and onboarding,
  the tab bar and Home are translated, but most screen copy is still English.
  The Kannada and Malayalam strings need a native-speaker review before release.
- **react-native-maps was not added** — no screen in the app uses a map, so it
  would be an unused dependency. Add it if a masjid map view is wanted.
- **Web preview only**: `react-native-svg`'s web shim logs an
  `Invalid DOM property transform-origin` error on the tasbih screen. It comes
  from the library's DOM output, not from app code, and cannot occur on native.

## Verifying

```bash
npx expo start
```

A web target is configured for quick checks (`npx expo start --web`), but it is
a dev convenience only — the deliverable is the native app.
