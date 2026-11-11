// Draws the item from the bag that stands for a timeline category (CATEGORY_ITEMS in lib/dex.ts) in the entries and the
// category filters: a Rare Candy for research, a Nugget for money. The icon is decorative, because the category's name is
// always shown beside it.
import { Sprite } from '@/components/pokemon/ui/sprite';
import { CATEGORY_ITEMS, itemPath } from '@/lib/dex';
import { cn } from '@/lib/utils';
import type { TimelineCategory } from '@/types/timeline';

interface CategoryIconProps {
  category: TimelineCategory;
  className?: string;
}

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const { item } = CATEGORY_ITEMS[category];

  return (
    <span aria-hidden="true" data-category-item={item} className={cn('inline-block shrink-0', className)}>
      <Sprite src={itemPath(item)} eager pixelated className="size-full object-contain" />
    </span>
  );
}
