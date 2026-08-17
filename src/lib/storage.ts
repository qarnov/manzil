// Every persisted value in the app goes through here.
//
// The web prototype scattered localStorage calls across screens and kept them
// in sync with `window` events. AsyncStorage is async, so instead there is one
// in-memory cache hydrated at startup plus a subscriber list — screens read
// synchronously off the cache and re-render when a write lands.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useSyncExternalStore } from 'react';

export const KEYS = {
  onboarded: 'manzil_onboarded',
  language: 'manzil_language',
  selectedMasjid: 'manzil_selected_masjid',
  masjidOverrides: 'manzil_masjid_overrides',
  iqamahOffsets: 'manzil.iqamah-offsets.v1',
  favorites: 'manzil_favorites',
  lastRead: 'manzil_last_read',
  tasbih: 'manzil_tasbih',
} as const;

export type StorageKey = (typeof KEYS)[keyof typeof KEYS];

const ALL_KEYS = Object.values(KEYS) as StorageKey[];

const cache = new Map<string, string | null>();
const listeners = new Set<() => void>();

let hydrated = false;

function emit() {
  listeners.forEach((l) => l());
}

/** Load every known key into the cache. Called once, before the UI renders. */
export async function hydrateStorage(): Promise<void> {
  if (hydrated) return;
  try {
    const entries = await AsyncStorage.multiGet(ALL_KEYS);
    entries.forEach(([k, v]) => cache.set(k, v));
  } catch {
    // A read failure just means we start from defaults.
  }
  hydrated = true;
  emit();
}

export function isHydrated() {
  return hydrated;
}

/** Synchronous read from the cache. Returns null before hydration completes. */
export function getItem(key: StorageKey): string | null {
  return cache.get(key) ?? null;
}

export function getJSON<T>(key: StorageKey, fallback: T): T {
  const raw = getItem(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Optimistic write: the cache and subscribers update immediately. */
export function setItem(key: StorageKey, value: string): void {
  cache.set(key, value);
  emit();
  AsyncStorage.setItem(key, value).catch(() => {});
}

export function setJSON(key: StorageKey, value: unknown): void {
  setItem(key, JSON.stringify(value));
}

export function removeItem(key: StorageKey): void {
  cache.set(key, null);
  emit();
  AsyncStorage.removeItem(key).catch(() => {});
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Re-renders the calling component whenever any stored value changes. */
export function useStorageValue(key: StorageKey): string | null {
  const getSnapshot = useCallback(() => getItem(key), [key]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * JSON-valued counterpart. `parse` runs on every render, so the caller must
 * hand back a stable value for a stable input — the raw string is what
 * `useSyncExternalStore` actually compares.
 */
export function useStorageJSON<T>(key: StorageKey, fallback: T): T {
  const raw = useStorageValue(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
