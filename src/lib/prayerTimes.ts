// Prayer-time math. The parsing/arithmetic below is carried over unchanged
// from the web prototype — it is pure TypeScript with no platform coupling.
// Only the persistence hook was rewritten (localStorage -> src/lib/storage).

import { KEYS, getJSON, setJSON, useStorageJSON } from './storage';

export type Prayer = { name: string; azaan: string; iqamah: string; offset: number };

export const AZAAN_TIMES: Record<string, string> = {
  Fajr: '5:04 AM',
  Dhuhr: '12:31 PM',
  Asr: '4:32 PM',
  Maghrib: '6:47 PM',
  Isha: '8:01 PM',
};

export const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export const OFFSET_OPTIONS = [5, 10, 15, 20] as const;

const DEFAULT_OFFSETS: Record<string, number> = {
  Fajr: 10,
  Dhuhr: 10,
  Asr: 10,
  Maghrib: 10,
  Isha: 10,
};

// "5:04 AM" + minutes -> "5:14 AM"
export function addMinutes(time: string, minutes: number): string {
  const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return time;
  const hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  const h24 = (hh % 12) + (ap === 'PM' ? 12 : 0);
  const total = h24 * 60 + mm + minutes;
  const nh24 = ((total / 60) | 0) % 24;
  const nmm = total % 60;
  const nap = nh24 >= 12 ? 'PM' : 'AM';
  const nhh = nh24 % 12 === 0 ? 12 : nh24 % 12;
  return `${nhh}:${String(nmm).padStart(2, '0')} ${nap}`;
}

// "5:04 AM" -> minutes since midnight (or null if unparseable)
export function toMinutes(time: string): number | null {
  const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  const hh = parseInt(m[1], 10) % 12;
  const mm = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  return (hh + (ap === 'PM' ? 12 : 0)) * 60 + mm;
}

export type NextPrayer = {
  name: string;
  azaan: string;
  inLabel: string;
  minutesAway: number;
};

// Given the prayers and the current device time, find the next upcoming prayer
// and a human "in Xh Ym" label. Wraps to tomorrow's Fajr after Isha.
export function nextPrayer(prayers: Prayer[], now: Date = new Date()): NextPrayer | null {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const parsed = prayers
    .map((p) => ({ p, min: toMinutes(p.azaan) }))
    .filter((x): x is { p: Prayer; min: number } => x.min !== null);
  if (parsed.length === 0) return null;

  let target = parsed.find((x) => x.min > nowMin);
  let diff: number;
  if (target) {
    diff = target.min - nowMin;
  } else {
    target = parsed[0]; // wrap to first prayer tomorrow
    diff = 24 * 60 - nowMin + target.min;
  }
  const h = Math.floor(diff / 60);
  const mm = diff % 60;
  const inLabel = h > 0 ? `in ${h}h ${mm}m` : `in ${mm}m`;
  return { name: target.p.name, azaan: target.p.azaan, inLabel, minutesAway: diff };
}

export function readOffsets(): Record<string, number> {
  return { ...DEFAULT_OFFSETS, ...getJSON<Record<string, number>>(KEYS.iqamahOffsets, {}) };
}

export function setOffset(name: string, minutes: number) {
  setJSON(KEYS.iqamahOffsets, { ...readOffsets(), [name]: minutes });
}

/**
 * The per-device fallback prayer rows, used when no masjid is selected.
 * Azaan times are fixed seed values; iqamah is azaan + the user's offset.
 */
export function usePrayerTimes(): {
  prayers: Prayer[];
  setOffset: (name: string, minutes: number) => void;
} {
  const stored = useStorageJSON<Record<string, number>>(KEYS.iqamahOffsets, {});
  const offsets = { ...DEFAULT_OFFSETS, ...stored };

  const prayers: Prayer[] = PRAYER_NAMES.map((n) => {
    const off = offsets[n] ?? DEFAULT_OFFSETS[n];
    return {
      name: n,
      azaan: AZAAN_TIMES[n],
      iqamah: addMinutes(AZAAN_TIMES[n], off),
      offset: off,
    };
  });

  return { prayers, setOffset };
}
