import { useEffect, useState } from "react";

export type Prayer = { name: string; azaan: string; iqamah: string };

// Azaan times come from "API" — hardcoded mock for now.
export const AZAAN_TIMES: Record<string, string> = {
  Fajr: "5:04 AM",
  Dhuhr: "12:31 PM",
  Asr: "4:32 PM",
  Maghrib: "6:47 PM",
  Isha: "8:01 PM",
};

export const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

const DEFAULT_IQAMAH: Record<string, string> = {
  Fajr: "5:20 AM",
  Dhuhr: "12:45 PM",
  Asr: "4:50 PM",
  Maghrib: "6:50 PM",
  Isha: "8:15 PM",
};

const STORAGE_KEY = "manzil.iqamah.v1";

function readIqamah(): Record<string, string> {
  if (typeof window === "undefined") return DEFAULT_IQAMAH;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_IQAMAH;
    return { ...DEFAULT_IQAMAH, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_IQAMAH;
  }
}

export function usePrayerTimes(): {
  prayers: Prayer[];
  setIqamah: (name: string, time: string) => void;
} {
  const [iqamah, setState] = useState<Record<string, string>>(DEFAULT_IQAMAH);

  useEffect(() => {
    setState(readIqamah());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setState(readIqamah());
    };
    window.addEventListener("storage", onStorage);
    const onCustom = () => setState(readIqamah());
    window.addEventListener("manzil:iqamah-updated", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("manzil:iqamah-updated", onCustom);
    };
  }, []);

  const setIqamah = (name: string, time: string) => {
    const next = { ...readIqamah(), [name]: time };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
    window.dispatchEvent(new Event("manzil:iqamah-updated"));
  };

  const prayers: Prayer[] = PRAYER_NAMES.map((n) => ({
    name: n,
    azaan: AZAAN_TIMES[n],
    iqamah: iqamah[n] ?? DEFAULT_IQAMAH[n],
  }));

  return { prayers, setIqamah };
}
