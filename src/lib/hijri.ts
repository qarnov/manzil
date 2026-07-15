// Device-driven Hijri (Islamic) date helpers.
// Uses the browser's built-in Umm al-Qura Islamic calendar via Intl — no
// network, always based on the device's own clock and timezone.

const CAL = "islamic-umalqura";

function partsFor(date: Date, locale: string) {
  const fmt = new Intl.DateTimeFormat(`${locale}-u-ca-${CAL}`, {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
  const parts = fmt.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    day: parseInt(get("day"), 10),
    monthName: get("month"),
    year: parseInt(get("year"), 10),
    weekday: get("weekday"),
  };
}

// Hijri day-of-month as a plain integer, for arithmetic.
function hijriDay(date: Date): number {
  const v = new Intl.DateTimeFormat(`en-u-ca-${CAL}`, { day: "numeric" }).format(date);
  return parseInt(v, 10);
}

export type HijriToday = {
  day: number;
  monthName: string;   // e.g. "Dhuʻl-Qiʻdah"
  arabicMonth: string; // e.g. "ذو القعدة"
  year: number;        // e.g. 1447
  weekday: string;     // e.g. "Wednesday"
  gregorian: string;   // e.g. "WED, 14 JUL 2026"
};

export function getHijriToday(date: Date = new Date()): HijriToday {
  const en = partsFor(date, "en");
  const ar = partsFor(date, "ar-SA");
  const gregorian = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(",", "")
    .toUpperCase();
  return {
    day: en.day,
    monthName: en.monthName,
    arabicMonth: ar.monthName,
    year: en.year,
    weekday: en.weekday,
    gregorian,
  };
}

export type HijriMonthGrid = {
  offset: number;       // weekday (0=Sun) of Hijri day 1
  daysInMonth: number;  // 29 or 30
  todayDay: number;     // current Hijri day-of-month
};

// Build the current Hijri month layout from the device date.
export function getHijriMonthGrid(date: Date = new Date()): HijriMonthGrid {
  const todayDay = hijriDay(date);

  // Gregorian date of Hijri day 1 of the current Hijri month.
  const firstG = new Date(date);
  firstG.setDate(firstG.getDate() - (todayDay - 1));
  const offset = firstG.getDay();

  // Walk forward from day 1 until the Hijri day resets — that count is the
  // number of days in this Hijri month.
  let daysInMonth = 0;
  const cursor = new Date(firstG);
  for (let i = 0; i < 32; i++) {
    const d = hijriDay(cursor);
    if (d === 1 && daysInMonth > 0) break;
    daysInMonth++;
    cursor.setDate(cursor.getDate() + 1);
  }

  return { offset, daysInMonth, todayDay };
}

// Fixed annual Islamic observances, expressed only as Hijri dates so they are
// never stale. `month` is the Hijri month number (1=Muharram … 12=Dhul-Hijjah).
export const OBSERVANCES: { month: number; day: number; name: string; highlight?: boolean }[] = [
  { month: 1, day: 1, name: "Islamic New Year" },
  { month: 1, day: 10, name: "Day of Ashura · Fast recommended" },
  { month: 3, day: 12, name: "Mawlid an-Nabi ﷺ" },
  { month: 7, day: 27, name: "Isra & Mi'raj" },
  { month: 8, day: 15, name: "Laylat al-Bara'ah" },
  { month: 9, day: 1, name: "Start of Ramadan 🌙", highlight: true },
  { month: 9, day: 27, name: "Laylat al-Qadr (seek in last 10 nights)" },
  { month: 10, day: 1, name: "Eid al-Fitr 🌙", highlight: true },
  { month: 12, day: 9, name: "Yawm al-Arafah · Fast recommended" },
  { month: 12, day: 10, name: "Eid al-Adha 🌙", highlight: true },
];

// Map a Hijri month name (from Intl) to its number, so we can highlight
// observances that fall in the current month.
export function hijriMonthNumber(date: Date = new Date()): number {
  const name = new Intl.DateTimeFormat(`en-u-ca-${CAL}`, { month: "numeric" }).format(date);
  return parseInt(name, 10);
}
