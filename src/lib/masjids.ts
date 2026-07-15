// Masjid data access layer.
//
// TODAY this reads from a bundled seed file (src/data/masjids.json) plus any
// muazzin edits saved in localStorage. It is deliberately the ONLY place that
// knows where masjid data comes from, so swapping to a hosted backend
// (Supabase/Firebase) later is a change to this one module — the screens keep
// calling the same functions and hooks.

import { useEffect, useState } from "react";
import seed from "../data/masjids.json";
import { PRAYER_NAMES, usePrayerTimes, type Prayer } from "./prayerTimes";

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

const SELECTED_KEY = "manzil_selected_masjid";
const OVERRIDES_KEY = "manzil_masjid_overrides"; // muazzin edits, keyed by masjid id
const SELECTED_EVENT = "manzil:masjid-updated";

function readOverrides(): Record<string, MasjidTimes> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}");
  } catch {
    return {};
  }
}

/** All masjids, with any local muazzin edits applied on top of the seed. */
export function getAllMasjids(): Masjid[] {
  const overrides = readOverrides();
  return (seed.masjids as Masjid[]).map((m) =>
    overrides[m.id] ? { ...m, times: { ...m.times, ...overrides[m.id] } } : m
  );
}

export function getMasjidById(id: string | null): Masjid | null {
  if (!id) return null;
  return getAllMasjids().find((m) => m.id === id) ?? null;
}

/** Unique states present in the data, for grouping/filtering. */
export function getStates(): string[] {
  return Array.from(new Set(getAllMasjids().map((m) => m.state))).sort();
}

export function getMasjidsByState(state: string): Masjid[] {
  return getAllMasjids().filter((m) => m.state.toLowerCase() === state.toLowerCase());
}

/** Persist a muazzin's edited times for one masjid (local until backend). */
export function saveMasjidTimes(id: string, times: MasjidTimes) {
  const all = readOverrides();
  all[id] = times;
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(SELECTED_EVENT));
}

export function getSelectedMasjidId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SELECTED_KEY);
}

export function setSelectedMasjidId(id: string) {
  localStorage.setItem(SELECTED_KEY, id);
  window.dispatchEvent(new Event(SELECTED_EVENT));
}

/** Reactive access to the currently selected masjid. */
export function useSelectedMasjid(): {
  masjid: Masjid | null;
  select: (id: string) => void;
} {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    setId(getSelectedMasjidId());
    const sync = () => setId(getSelectedMasjidId());
    window.addEventListener(SELECTED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SELECTED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return {
    masjid: getMasjidById(id),
    select: (next: string) => {
      setSelectedMasjidId(next);
      setId(next);
    },
  };
}

/**
 * Reverse-geocode coordinates to an Indian state name (best-effort).
 * Used at onboarding to pre-filter the masjid list to the user's region.
 */
export async function detectState(lat: number, lng: number): Promise<string | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const d = await r.json();
    return d.address?.state ?? null;
  } catch {
    return null;
  }
}

/** Ensure a times object always has all five prayers (fallback to em dash). */
export function normalizeTimes(times?: MasjidTimes): MasjidTimes {
  const out: MasjidTimes = {};
  for (const name of PRAYER_NAMES) {
    out[name] = times?.[name] ?? { azaan: "—", iqamah: "—" };
  }
  return out;
}

/**
 * The prayer rows the app should display right now: the selected masjid's
 * muazzin-set times when one is chosen, otherwise the legacy per-device
 * offset times. Screens use this instead of usePrayerTimes directly.
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
