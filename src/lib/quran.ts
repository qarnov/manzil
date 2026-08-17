// Quran API access. The web prototype used raw fetch with no caching and
// re-downloaded a surah on every visit; these are react-query hooks with a
// long staleTime since the text never changes.

import { useQuery } from '@tanstack/react-query';
import { KEYS, getJSON, setJSON, useStorageJSON } from './storage';

const ALQURAN = 'https://api.alquran.cloud/v1';
const QURAN_COM = 'https://api.quran.com/api/v4';

export type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

export type Ayah = {
  number: number;
  numberInSurah: number;
  text: string;
  audio?: string;
};

export type SurahDetail = {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
  translations: Record<number, string>;
};

export type TafsirEntry = { verse_key: string; text: string };

async function getJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

/** Strips the HTML the tafsir and translation endpoints return. */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** True for characters that carry no letter of their own. */
const isMark = (ch: string) => /\p{Mn}/u.test(ch) || /\s/.test(ch);

/**
 * Reduce Arabic to bare letters: drop all harakat, fold alef wasla (used
 * throughout the Uthmani text) to a plain alef, and drop tatweel/whitespace.
 */
function bareLetters(s: string): string {
  return s
    .normalize('NFC')
    .replace(/\p{Mn}/gu, '')
    .replace(/ٱ/g, 'ا')
    .replace(/ـ/g, '')
    .replace(/\s+/g, '');
}

const BASMALA_BARE = bareLetters('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');

/**
 * alquran.cloud prefixes the basmala onto the first ayah of most surahs. The
 * reader renders the basmala as its own heading, so strip it from ayah 1 to
 * avoid showing it twice. Al-Fatiha (where it *is* ayah 1) and At-Tawbah
 * (which has none) are left alone by the caller.
 */
export function stripLeadingBasmala(text: string): string {
  const bare = bareLetters(text);
  if (!bare.startsWith(BASMALA_BARE) || bare.length === BASMALA_BARE.length) return text;

  // Walk the original string counting only real letters, so the basmala
  // comes off together with the marks attached to it.
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (isMark(text[i])) continue;
    seen++;
    if (seen === BASMALA_BARE.length) {
      let end = i + 1;
      while (end < text.length && isMark(text[end])) end++;
      return text.slice(end).trim();
    }
  }
  return text;
}

export function useSurahs() {
  return useQuery({
    queryKey: ['surahs'],
    queryFn: async (): Promise<Surah[]> => {
      const json = await getJson(`${ALQURAN}/surah`);
      return json.data ?? [];
    },
  });
}

/**
 * Arabic + per-ayah al-Afasy audio, plus the Sahih International translation.
 * The translation is optional — a failure there still yields a readable surah.
 */
export function useSurah(surahNumber: number) {
  return useQuery({
    queryKey: ['surah', surahNumber],
    queryFn: async (): Promise<SurahDetail> => {
      const [arabic, translation] = await Promise.all([
        getJson(`${ALQURAN}/surah/${surahNumber}/ar.alafasy`),
        getJson(`${ALQURAN}/surah/${surahNumber}/en.sahih`).catch(() => null),
      ]);

      const d = arabic.data;

      // Al-Fatiha counts the basmala as its first ayah; At-Tawbah has none.
      const ayahs: Ayah[] =
        surahNumber === 1 || surahNumber === 9
          ? d.ayahs
          : d.ayahs.map((a: Ayah) =>
              a.numberInSurah === 1 ? { ...a, text: stripLeadingBasmala(a.text) } : a
            );

      const translations: Record<number, string> = {};
      const verses: { numberInSurah: number; text: string }[] = translation?.data?.ayahs ?? [];
      verses.forEach((v) => {
        translations[v.numberInSurah] = stripHtml(v.text ?? '');
      });

      return {
        number: d.number,
        name: d.name,
        englishName: d.englishName,
        numberOfAyahs: d.numberOfAyahs,
        ayahs,
        translations,
      };
    },
    enabled: Number.isFinite(surahNumber) && surahNumber > 0,
  });
}

/** Tafsir Ibn Kathir (resource 169), paired with the plain Uthmani text. */
export function useTafsir(surahNumber: number, enabled: boolean) {
  return useQuery({
    queryKey: ['tafsir', surahNumber],
    queryFn: async (): Promise<{ entries: TafsirEntry[]; ayahs: Ayah[] }> => {
      const [tafsir, arabic] = await Promise.all([
        getJson(`${QURAN_COM}/tafsirs/169/by_chapter/${surahNumber}`),
        getJson(`${ALQURAN}/surah/${surahNumber}/quran-uthmani`),
      ]);
      return {
        entries: tafsir?.tafsirs ?? [],
        ayahs: arabic?.data?.ayahs ?? [],
      };
    },
    enabled: enabled && Number.isFinite(surahNumber) && surahNumber > 0,
  });
}

// ---------------------------------------------------------------- favourites

export type Favorite = {
  surah: number;
  ayah: number;
  arabic: string;
  translation: string;
  surahName: string;
};

export type LastRead = { surah: number; ayah: number; surahName: string };

export function useFavorites() {
  return useStorageJSON<Favorite[]>(KEYS.favorites, []);
}

export function toggleFavorite(fav: Favorite) {
  const current = getJSON<Favorite[]>(KEYS.favorites, []);
  const exists = current.some((f) => f.surah === fav.surah && f.ayah === fav.ayah);
  setJSON(
    KEYS.favorites,
    exists ? current.filter((f) => !(f.surah === fav.surah && f.ayah === fav.ayah)) : [...current, fav]
  );
}

export function isFavorite(favorites: Favorite[], surah: number, ayah: number) {
  return favorites.some((f) => f.surah === surah && f.ayah === ayah);
}

export function useLastRead() {
  return useStorageJSON<LastRead | null>(KEYS.lastRead, null);
}

export function setLastRead(value: LastRead) {
  setJSON(KEYS.lastRead, value);
}
