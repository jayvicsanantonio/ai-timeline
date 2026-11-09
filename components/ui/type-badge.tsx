// A category as its type: a chip in the type's color with its icon and name, then the category's own name.
// Screen readers hear the category alone, since the type is the dex's way of drawing it.
import type { CSSProperties } from 'react';
import { CategoryIcon } from '@/components/ui/category-icon';
import { CATEGORY_TYPES } from '@/lib/dex';
import { cn } from '@/lib/utils';
import type { TimelineCategory } from '@/types/timeline';

interface TypeBadgeProps {
  category: TimelineCategory;
  className?: string;
}

export function TypeBadge({ category, className }: TypeBadgeProps) {
  const type = CATEGORY_TYPES[category];

  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      <span
        aria-hidden="true"
        data-type-chip={type.name}
        className="type-chip inline-flex shrink-0 items-center gap-1 rounded-full py-0.5 pl-0.5 pr-2 font-pixel text-[0.5625rem] uppercase leading-none"
        style={{ '--type-color': type.color, '--type-ink': type.ink } as CSSProperties}
      >
        <CategoryIcon category={category} className="size-4" />
        {type.name}
      </span>
      <span className="truncate">{category}</span>
    </span>
  );
}
