// A category beside its item from the bag, the way an entry's footer and the opening's latest sightings name it
import { CategoryIcon } from '@/components/ui/category-icon';
import { cn } from '@/lib/utils';
import type { TimelineCategory } from '@/types/timeline';

interface CategoryBadgeProps {
  category: TimelineCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span data-category={category} className={cn('inline-flex min-w-0 items-center gap-1.5', className)}>
      <CategoryIcon category={category} className="size-5" />
      <span className="truncate">{category}</span>
    </span>
  );
}
