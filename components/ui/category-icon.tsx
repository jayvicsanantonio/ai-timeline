// Draws the icon of the type that stands for a timeline category (CATEGORY_TYPES in lib/dex.ts) in the dex entries and the
// category filters. The icon is decorative, because the category's name is always shown beside it.
import { Sprite } from '@/components/ui/sprite';
import { CATEGORY_TYPES, typeIconPath } from '@/lib/dex';
import { cn } from '@/lib/utils';
import type { TimelineCategory } from '@/types/timeline';

interface CategoryIconProps {
  category: TimelineCategory;
  className?: string;
}

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const type = CATEGORY_TYPES[category];

  return (
    <span aria-hidden="true" data-type-icon={type.name} className={cn('inline-block shrink-0', className)}>
      <Sprite src={typeIconPath(type)} eager className="size-full rounded-full" />
    </span>
  );
}
