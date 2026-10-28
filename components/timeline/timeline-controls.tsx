// The timeline's toolbar: a search box, a panel of category toggles and a live count of the events shown.
// The filters narrow every era at once, and the panel closes on Escape, on a click outside or from its toggle.
'use client';

import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type Ref } from 'react';
import { CategoryIcon } from '@/components/ui/category-icon';
import { isFiltering, NO_FILTERS, type TimelineFilters } from '@/lib/timeline-filter';
import { cn } from '@/lib/utils';
import { TIMELINE_CATEGORIES, type TimelineCategory } from '@/types/timeline';

interface TimelineControlsProps {
  filters: TimelineFilters;
  onFiltersChange: (filters: TimelineFilters) => void;
  categoryCounts: Record<TimelineCategory, number>;
  shownCount: number;
  totalCount: number;
  searchInputRef?: Ref<HTMLInputElement>;
  // The toolbar's root, which sticks to the top of the timeline
  ref?: Ref<HTMLDivElement>;
  className?: string;
}

// Hands one element to a ref the component owns and to a ref its parent passed in
function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export function TimelineControls({
  filters,
  onFiltersChange,
  categoryCounts,
  shownCount,
  totalCount,
  searchInputRef,
  ref,
  className,
}: TimelineControlsProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const ownSearchRef = useRef<HTMLInputElement>(null);
  const pickedCount = filters.categories.length;
  const filtering = isFiltering(filters);

  useEffect(() => {
    if (!isPanelOpen) {
      return;
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [isPanelOpen]);

  const toggleCategory = (category: TimelineCategory) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((picked) => picked !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories });
  };

  const closePanelOnEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isPanelOpen) {
      event.stopPropagation();
      setIsPanelOpen(false);
      toggleRef.current?.focus();
    }
  };

  // The Clear button disappears once pressed, so focus moves on to the search box
  const clearFilters = () => {
    onFiltersChange(NO_FILTERS);
    ownSearchRef.current?.focus();
  };

  const setSearchInput = (input: HTMLInputElement | null) => {
    ownSearchRef.current = input;
    assignRef(searchInputRef, input);
  };

  const setRoot = (root: HTMLDivElement | null) => {
    rootRef.current = root;
    assignRef(ref, root);
  };

  return (
    <div
      ref={setRoot}
      className={cn(
        'sticky top-0 z-40 border-b border-white/10 bg-[#0b0b0d]/85 text-white backdrop-blur-xl',
        className
      )}
      onKeyDown={closePanelOnEscape}
    >
      <div
        role="search"
        aria-label="Search and filter the timeline"
        className="relative mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6"
      >
        <div className="relative flex min-w-0 flex-1 items-center sm:max-w-sm">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 size-4 text-zinc-400"
          />
          <input
            ref={setSearchInput}
            type="search"
            aria-label="Search events"
            placeholder={`Search ${totalCount} events`}
            value={filters.query}
            onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
            className="h-10 w-full rounded-full border border-white/10 bg-white/[0.06] pl-10 pr-10 text-[15px] text-white placeholder:text-zinc-500 focus:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          />
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute right-3 hidden rounded border border-white/15 px-1.5 font-mono text-[11px] text-zinc-400 lg:block"
          >
            /
          </kbd>
        </div>

        <button
          ref={toggleRef}
          type="button"
          aria-expanded={isPanelOpen}
          aria-controls={isPanelOpen ? panelId : undefined}
          aria-label={pickedCount > 0 ? `Categories, ${pickedCount} picked` : 'Categories'}
          onClick={() => setIsPanelOpen((isOpen) => !isOpen)}
          className={cn(
            'inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
            pickedCount > 0 || isPanelOpen
              ? 'border-white/30 bg-white/[0.12] text-white'
              : 'border-white/10 bg-white/[0.06] text-zinc-200 hover:bg-white/[0.1]'
          )}
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">Categories</span>
          {pickedCount > 0 ? (
            <span className="grid min-w-5 place-items-center rounded-full bg-white px-1.5 text-xs font-semibold text-black">
              {pickedCount}
            </span>
          ) : null}
          <ChevronDown
            aria-hidden="true"
            className={cn('size-4 motion-safe:transition-transform', isPanelOpen && 'rotate-180')}
          />
        </button>

        {/* On phones the count only takes up a row while filtering, and stays readable to screen readers */}
        <div
          className={cn(
            'flex items-center gap-3',
            filtering ? 'w-full sm:w-auto' : 'sr-only sm:not-sr-only'
          )}
        >
          <p role="status" className="text-sm text-zinc-400">
            {filtering ? `Showing ${shownCount} of ${totalCount} events` : `${totalCount} events`}
          </p>
          {filtering ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <X aria-hidden="true" className="size-3.5" />
              Clear filters
            </button>
          ) : null}
        </div>

        <p
          aria-hidden="true"
          className="ml-auto hidden items-center gap-1.5 text-xs text-zinc-500 xl:flex"
        >
          <kbd className="rounded border border-white/15 px-1.5 font-mono text-[11px] text-zinc-300">J</kbd>
          <kbd className="rounded border border-white/15 px-1.5 font-mono text-[11px] text-zinc-300">K</kbd>
          events
          <span className="px-1">·</span>
          <kbd className="rounded border border-white/15 px-1.5 font-mono text-[11px] text-zinc-300">1</kbd>
          –
          <kbd className="rounded border border-white/15 px-1.5 font-mono text-[11px] text-zinc-300">5</kbd>
          eras
        </p>

        {isPanelOpen ? (
          <div
            id={panelId}
            role="group"
            aria-label="Filter by category"
            className="absolute inset-x-4 top-full mt-2 grid max-h-[70vh] gap-1.5 overflow-y-auto rounded-2xl border border-white/10 bg-[#141417] p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:inset-x-auto sm:left-6 sm:w-[38rem] sm:grid-cols-2 lg:w-[46rem] lg:grid-cols-3"
          >
            {TIMELINE_CATEGORIES.map((category) => {
              const isPicked = filters.categories.includes(category);

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isPicked}
                  onClick={() => toggleCategory(category)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                    isPicked
                      ? 'border-white/40 bg-white text-black'
                      : 'border-transparent text-zinc-200 hover:bg-white/[0.08]'
                  )}
                >
                  <CategoryIcon category={category} className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1">{category}</span>{' '}
                  <span className={cn('tabular-nums', isPicked ? 'text-black/60' : 'text-zinc-500')}>
                    {categoryCounts[category]}
                    <span className="sr-only"> events</span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
