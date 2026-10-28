// Draws the icon that stands for a timeline category in the era interfaces and the category filters.
// The icon is decorative, because the category's name is always shown beside it.
import {
  Bot,
  Building2,
  Cpu,
  FlaskConical,
  Network,
  Rocket,
  Scale,
  Siren,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { TimelineCategory } from '@/types/timeline';

const CATEGORY_ICONS: Record<TimelineCategory, LucideIcon> = {
  'Models & Architectures': Network,
  'Research Breakthroughs': FlaskConical,
  'Public Releases': Rocket,
  'Ethics & Policy': Scale,
  'Hardware Advances': Cpu,
  'Companies & Investments': Building2,
  'AI Tools': Wrench,
  'Bombshell News': Siren,
  Agents: Bot,
};

interface CategoryIconProps {
  category: TimelineCategory;
  className?: string;
}

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[category];

  return <Icon aria-hidden="true" focusable="false" className={className} />;
}
