import {
  Car,
  Droplets,
  HandHeart,
  Landmark,
  Moon,
  Sunrise,
  Sunset,
  Utensils,
  type LucideIcon,
} from 'lucide-react-native';

/**
 * duas.json carries an emoji per category, but the design is line-icons-only,
 * so the emoji is ignored and mapped to a lucide icon here.
 */
const ICONS: Record<string, LucideIcon> = {
  morning: Sunrise,
  evening: Sunset,
  bathroom: Droplets,
  masjid: Landmark,
  after_prayer: HandHeart,
  eating: Utensils,
  sleeping: Moon,
  travelling: Car,
};

export function duaCategoryIcon(id: string): LucideIcon {
  return ICONS[id] ?? HandHeart;
}
