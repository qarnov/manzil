// Masjid data access layer.
//
// TODAY this reads from a bundled seed file (src/data/masjids.json) plus any
// muazzin edits saved on-device. It is deliberately the ONLY place that knows
// where masjid data comes from, so swapping to a hosted backend later is a
// change to this one module — the screens keep calling the same functions.

import seed from '../data/masjids.json';
import {
  KEYS,
  getItem,
  getJSON,
  setItem,
  setJSON,
  useStorageJSON,
  useStorageValue,
} from './storage';
import { PRAYER_NAMES, usePrayerTimes, type Prayer } from './prayerTimes';

export type PrayerTime = { azaan: string; iqamah: string };
export type MasjidTimes = Record<string, PrayerTime>;
export type Masjid = {
  id: string;
  name: string;
  area: string;
  state: string;
  lat?: number;
  lng?: number;
  times: MasjidTimes;
  updatedAt?: string;
};

type Overrides = Record<string, MasjidTimes>;

const SEED = seed.masjids as Masjid[];

function applyOverrides(overrides: Overrides): Masjid[] {
  return SEED.map((m) =>
    overrides[m.id] ? { ...m, times: { ...m.times, ...overrides[m.id] } } : m
  );
}

/** All masjids, with any local muazzin edits applied on top of the seed. */
export function getAllMasjids(): Masjid[] {
  return applyOverrides(getJSON<Overrides>(KEYS.masjidOverrides, {}));
}

export function getMasjidById(id: string | null): Masjid | null {
  if (!id) return null;
  return getAllMasjids().find((m) => m.id === id) ?? null;
}

/** Unique states present in the data, for grouping/filtering. */
export function getStates(): string[] {
  return Array.from(new Set(SEED.map((m) => m.state))).sort();
}

export function getMasjidsByState(state: string): Masjid[] {
  return getAllMasjids().filter((m) => m.state.toLowerCase() === state.toLowerCase());
}

/** Persist a muazzin's edited times for one masjid (local until backend). */
export function saveMasjidTimes(id: string, times: MasjidTimes) {
  const all = getJSON<Overrides>(KEYS.masjidOverrides, {});
  setJSON(KEYS.masjidOverrides, { ...all, [id]: times });
}

export function getSelectedMasjidId(): string | null {
  return getItem(KEYS.selectedMasjid);
}

export function setSelectedMasjidId(id: string) {
  setItem(KEYS.selectedMasjid, id);
}

/** Reactive list of masjids — re-renders when a muazzin edit is saved. */
export function useMasjids(): Masjid[] {
  const overrides = useStorageJSON<Overrides>(KEYS.masjidOverrides, {});
  return applyOverrides(overrides);
}

/** Reactive access to the currently selected masjid. */
export function useSelectedMasjid(): {
  masjid: Masjid | null;
  select: (id: string) => void;
} {
  const id = useStorageValue(KEYS.selectedMasjid);
  const masjids = useMasjids();

  return {
    masjid: id ? (masjids.find((m) => m.id === id) ?? null) : null,
    select: setSelectedMasjidId,
  };
}

/** Ensure a times object always has all five prayers (fallback to em dash). */
export function normalizeTimes(times?: MasjidTimes): MasjidTimes {
  const out: MasjidTimes = {};
  for (const name of PRAYER_NAMES) {
    out[name] = times?.[name] ?? { azaan: '—', iqamah: '—' };
  }
  return out;
}

/**
 * The prayer rows the app should display right now: the selected masjid's
 * muazzin-set times when one is chosen, otherwise the per-device offset times.
 * Screens use this instead of usePrayerTimes directly.
 */
export function useActivePrayers(): { prayers: Prayer[]; masjid: Masjid | null } {
  const { masjid } = useSelectedMasjid();
  const { prayers: fallback } = usePrayerTimes();

  if (!masjid) return { prayers: fallback, masjid: null };

  const t = normalizeTimes(masjid.times);
  const prayers: Prayer[] = PRAYER_NAMES.map((n) => ({
    name: n,
    azaan: t[n].azaan,
    iqamah: t[n].iqamah,
    offset: 0,
  }));
  return { prayers, masjid };
}
