// Ayah of the day. The web prototype hardcoded a single ayah; this rotates
// through a small curated set keyed by the day of the year, so the card is
// stable for a whole day and needs no network call.

export type Ayah = {
  arabic: string;
  english: string;
  reference: string;
  surah: number;
  ayah: number;
};

export const AYAT: Ayah[] = [
  {
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    english: 'Indeed, with hardship comes ease.',
    reference: 'Surah Ash-Sharh · 94:6',
    surah: 94,
    ayah: 6,
  },
  {
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    english: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
    reference: 'Surah Al-Baqarah · 2:152',
    surah: 2,
    ayah: 152,
  },
  {
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    english: 'And whoever relies upon Allah — then He is sufficient for him.',
    reference: 'Surah At-Talaq · 65:3',
    surah: 65,
    ayah: 3,
  },
  {
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    english: 'Unquestionably, by the remembrance of Allah hearts are assured.',
    reference: "Surah Ar-Ra'd · 13:28",
    surah: 13,
    ayah: 28,
  },
  {
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    english: 'Allah does not burden a soul beyond that it can bear.',
    reference: 'Surah Al-Baqarah · 2:286',
    surah: 2,
    ayah: 286,
  },
  {
    arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    english: 'And say: My Lord, increase me in knowledge.',
    reference: 'Surah Ta-Ha · 20:114',
    surah: 20,
    ayah: 114,
  },
  {
    arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    english: 'Indeed, Allah is with the patient.',
    reference: 'Surah Al-Baqarah · 2:153',
    surah: 2,
    ayah: 153,
  },
];

export function ayahOfTheDay(date: Date = new Date()): Ayah {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return AYAT[dayOfYear % AYAT.length];
}
