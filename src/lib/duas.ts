import duasData from '../data/duas.json';

export type Dua = {
  id: string;
  arabic: string;
  translation: string;
  reference: string;
  repetitions: number;
  benefit: string;
};

export type DuaCategory = {
  id: string;
  name: string;
  arabicName: string;
  emoji: string;
  instruction?: string;
  count: number;
  duas: Dua[];
};

export const DUA_CATEGORIES = duasData.categories as DuaCategory[];

export function getCategory(id: string): DuaCategory | null {
  return DUA_CATEGORIES.find((c) => c.id === id) ?? null;
}

/** Case-insensitive search across category names, Arabic and translations. */
export function searchDuas(query: string): { category: DuaCategory; dua: Dua }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: { category: DuaCategory; dua: Dua }[] = [];
  for (const category of DUA_CATEGORIES) {
    for (const dua of category.duas) {
      if (
        dua.translation.toLowerCase().includes(q) ||
        dua.reference.toLowerCase().includes(q) ||
        category.name.toLowerCase().includes(q) ||
        dua.arabic.includes(query.trim())
      ) {
        out.push({ category, dua });
      }
    }
  }
  return out;
}
