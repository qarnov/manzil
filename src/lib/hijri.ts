// Device-driven Hijri (Islamic) date helpers.
//
// Preferred path is the platform's own Umm al-Qura calendar via `Intl`, which
// is what the web prototype used. Hermes, however, is often built without the
// full ICU data, so `Intl.DateTimeFormat` with a non-Gregorian calendar can
// silently return Gregorian values. We probe for that once at startup and fall
// back to the tabular (arithmetic) Islamic calendar when it isn't supported.

const CAL = 'islamic-umalqura';

export const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Ula',
  'Jumada al-Akhirah',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhul-Qa'dah",
  'Dhul-Hijjah',
];

const HIJRI_MONTHS_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

/**
 * True when the runtime really supports the Umm al-Qura calendar. A Hermes
 * build without ICU quietly ignores the calendar and hands back the Gregorian
 * year, so we check that the year looks Hijri (~1400s) rather than ~2000s.
 */
export const hasIntlHijri: boolean = (() => {
  try {
    const value = new Intl.DateTimeFormat(`en-u-ca-${CAL}`, { year: 'numeric' }).format(
      new Date(2026, 6, 28)
    );
    const year = parseInt(value.replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(year) && year > 1300 && year < 1600;
  } catch {
    return false;
  }
})();

// --------------------------------------------------------- tabular fallback

// Tabular Islamic calendar (civil epoch). Accurate to within a day or two of
// the observed calendar — good enough to keep the screen usable when ICU is
// missing, and far better than silently showing a Gregorian date.
const ISLAMIC_EPOCH = 1948439.5;

function gregorianToJD(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045
  );
}

function islamicToJD(year: number, month: number, day: number): number {
  return (
    day +
    Math.ceil(29.5 * (month - 1)) +
    (year - 1) * 354 +
    Math.floor((3 + 11 * year) / 30) +
    ISLAMIC_EPOCH -
    1
  );
}

function jdToIslamic(jd: number): { year: number; month: number; day: number } {
  const j = Math.floor(jd) + 0.5;
  const year = Math.floor((30 * (j - ISLAMIC_EPOCH) + 10646) / 10631);
  const dayOfYear = Math.floor(j - islamicToJD(year, 1, 1));
  const month = Math.max(1, Math.min(12, Math.ceil((dayOfYear + 1) / 29.5)));
  const day = Math.floor(j - islamicToJD(year, month, 1)) + 1;
  return { year, month, day };
}

function fallbackParts(date: Date) {
  return jdToIslamic(gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate()));
}

// -------------------------------------------------------------- public API

function intlParts(date: Date, locale: string) {
  const fmt = new Intl.DateTimeFormat(`${locale}-u-ca-${CAL}`, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });
  const parts = fmt.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return {
    day: parseInt(get('day'), 10),
    monthName: get('month'),
    year: parseInt(get('year'), 10),
    weekday: get('weekday'),
  };
}

function intlMonthNumber(date: Date): number {
  return parseInt(
    new Intl.DateTimeFormat(`en-u-ca-${CAL}`, { month: 'numeric' }).format(date),
    10
  );
}

export type HijriToday = {
  day: number;
  month: number;
  monthName: string;
  arabicMonth: string;
  year: number;
  weekday: string;
  gregorian: string;
  /** False when derived from the arithmetic fallback rather than ICU. */
  exact: boolean;
};

export function getHijriToday(date: Date = new Date()): HijriToday {
  const gregorian = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
    .format(date)
    .replace(',', '');

  if (hasIntlHijri) {
    const en = intlParts(date, 'en');
    const ar = intlParts(date, 'ar-SA');
    return {
      day: en.day,
      month: intlMonthNumber(date),
      monthName: en.monthName,
      arabicMonth: ar.monthName,
      year: en.year,
      weekday: en.weekday,
      gregorian,
      exact: true,
    };
  }

  const f = fallbackParts(date);
  return {
    day: f.day,
    month: f.month,
    monthName: HIJRI_MONTHS[f.month - 1] ?? '',
    arabicMonth: HIJRI_MONTHS_AR[f.month - 1] ?? '',
    year: f.year,
    weekday: new Intl.DateTimeFormat('en', { weekday: 'long' }).format(date),
    gregorian,
    exact: false,
  };
}

function hijriDayOfMonth(date: Date): number {
  if (hasIntlHijri) {
    return parseInt(
      new Intl.DateTimeFormat(`en-u-ca-${CAL}`, { day: 'numeric' }).format(date),
      10
    );
  }
  return fallbackParts(date).day;
}

export type HijriMonthGrid = {
  offset: number; // weekday (0=Sun) of Hijri day 1
  daysInMonth: number; // 29 or 30
  todayDay: number;
};

/** The current Hijri month's layout, derived from the device date. */
export function getHijriMonthGrid(date: Date = new Date()): HijriMonthGrid {
  const todayDay = hijriDayOfMonth(date);

  const firstG = new Date(date);
  firstG.setDate(firstG.getDate() - (todayDay - 1));
  const offset = firstG.getDay();

  // Walk forward from day 1 until the Hijri day resets — that count is the
  // number of days in this Hijri month.
  let daysInMonth = 0;
  const cursor = new Date(firstG);
  for (let i = 0; i < 32; i++) {
    const d = hijriDayOfMonth(cursor);
    if (d === 1 && daysInMonth > 0) break;
    daysInMonth++;
    cursor.setDate(cursor.getDate() + 1);
  }

  return { offset, daysInMonth, todayDay };
}

export function hijriMonthNumber(date: Date = new Date()): number {
  return hasIntlHijri ? intlMonthNumber(date) : fallbackParts(date).month;
}

// Fixed annual Islamic observances, expressed only as Hijri dates so they are
// never stale. `month` is the Hijri month number (1=Muharram … 12=Dhul-Hijjah).
export const OBSERVANCES: {
  month: number;
  day: number;
  name: string;
  note?: string;
  highlight?: boolean;
}[] = [
  { month: 1, day: 1, name: 'Islamic new year' },
  { month: 1, day: 10, name: 'Day of Ashura', note: 'Fast recommended' },
  { month: 3, day: 12, name: 'Mawlid an-Nabi ﷺ' },
  { month: 7, day: 27, name: "Isra and Mi'raj" },
  { month: 8, day: 15, name: "Laylat al-Bara'ah" },
  { month: 9, day: 1, name: 'Start of Ramadan', highlight: true },
  { month: 9, day: 27, name: 'Laylat al-Qadr', note: 'Seek in the last ten nights' },
  { month: 10, day: 1, name: 'Eid al-Fitr', highlight: true },
  { month: 12, day: 9, name: 'Yawm al-Arafah', note: 'Fast recommended' },
  { month: 12, day: 10, name: 'Eid al-Adha', highlight: true },
];

export function monthNameOf(m: number): string {
  return HIJRI_MONTHS[m - 1] ?? '';
}
