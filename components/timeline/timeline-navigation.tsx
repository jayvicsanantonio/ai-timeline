// Chapter navigation: a rail on wide screens with the current year, an events-per-year chart and a button per era,
// and a phone bar that names the current era and opens a chapter list. Both stay hidden until the timeline starts.
'use client';

import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';
import { ActivityChart } from '@/components/timeline/activity-chart';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useTimelinePosition } from '@/hooks/use-timeline-position';
import type { Era } from '@/lib/eras';
import type { YearActivity } from '@/lib/timeline-activity';
import { scrollToEra, scrollToYear } from '@/lib/timeline-scroll';
import { cn } from '@/lib/utils';

interface TimelineNavigationProps {
  // Every era with all of its events, so the chapters keep their counts while filtering
  eras: Era[];
  activity: YearActivity[];
  // Changes whenever the shown events change, so the reading position is measured again
  contentKey?: unknown;
}

// Visibility flips at once when the navigation appears, so it can be reached right away, but waits
// for the fade to finish when it leaves
const SHOWN =
  'visible opacity-100 [transition:opacity_300ms,translate_300ms,visibility_0s] motion-reduce:transition-none';
const HIDDEN =
  'invisible opacity-0 [transition:opacity_300ms,translate_300ms,visibility_0s_linear_300ms] motion-reduce:transition-none';

function padNumber(value: number) {
  return String(value).padStart(2, '0');
}

export function TimelineNavigation({ eras, activity, contentKey }: TimelineNavigationProps) {
  const reduceMotion = usePrefersReducedMotion();
  const eraIds = useMemo(() => eras.map((era) => era.id), [eras]);
  const position = useTimelinePosition(eraIds, contentKey);
  const [isPhoneListOpen, setIsPhoneListOpen] = useState(false);
  const phoneListId = useId();
  const phoneToggleRef = useRef<HTMLButtonElement>(null);

  if (eras.length === 0) {
    return null;
  }

  const activeIndex = Math.max(eraIds.indexOf(position.eraId), 0);
  const activeEra = eras[activeIndex];
  // While an era's introduction is being read, the clock shows the year the era begins
  const year = position.year ?? activeEra.range[0];
  const firstYear = activity[0]?.year ?? activeEra.range[0];
  const lastYear = activity.at(-1)?.year ?? firstYear;

  const startShare = (era: Era) => {
    const index = Math.min(Math.max(era.range[0] - firstYear, 0), activity.length - 1);
    return activity.length > 0 ? index / activity.length : 0;
  };

  const handlePhoneNavigate = (eraId: string) => {
    scrollToEra(eraId);
    setIsPhoneListOpen(false);
    // The picked chapter's button unmounts with the list, so focus moves back to the toggle
    phoneToggleRef.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <nav
        aria-label="Timeline chapter navigation"
        data-state={position.inTimeline ? 'visible' : 'hidden'}
        className={cn(
          'fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block',
          position.inTimeline ? SHOWN : cn(HIDDEN, 'translate-x-4')
        )}
      >
        <div className="w-[8.75rem] rounded-2xl border border-white/10 bg-[#111114]/85 p-3 text-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <p className="px-1">
            <span className="block text-[1.75rem] font-semibold leading-none tabular-nums">{year}</span>
            <span className="mt-2 flex items-start gap-1.5 text-xs leading-tight text-zinc-300">
              <span
                aria-hidden="true"
                className="mt-1 size-2 shrink-0 rounded-full"
                style={{ backgroundColor: activeEra.color }}
              />
              {activeEra.label}
            </span>
          </p>

          <div className="relative mt-4 h-[min(48vh,28rem)]">
            <ActivityChart
              activity={activity}
              orientation="vertical"
              currentYear={position.year}
              onSelectYear={scrollToYear}
              className="absolute inset-y-0 left-11 right-0"
            />
            {eras.map((era) => {
              const isActive = era.id === activeEra.id;

              return (
                <button
                  key={era.id}
                  type="button"
                  aria-label={`${era.chapter}: ${era.label}`}
                  aria-current={isActive ? 'location' : undefined}
                  onClick={() => scrollToEra(era.id)}
                  className={cn(
                    'group absolute left-0 flex h-7 w-9 items-center justify-center gap-1 rounded-lg border font-mono text-[11px] tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                    isActive
                      ? 'border-white/30 bg-white/[0.12] text-white'
                      : 'border-transparent text-zinc-400 hover:bg-white/[0.08] hover:text-white'
                  )}
                  style={{
                    top: `clamp(0px, calc(${startShare(era) * 100}% - 0.875rem), calc(100% - 1.75rem))`,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: era.color }}
                  />
                  {era.number}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md border border-white/10 bg-[#18181b] px-2 py-1 font-sans text-xs text-white shadow-lg group-hover:block group-focus-visible:block"
                  >
                    {era.label} · {era.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-3 px-1 text-[11px] leading-snug text-zinc-500">
            Events per year, {firstYear}–{lastYear}
          </p>
        </div>
      </nav>

      <nav
        aria-label="Timeline chapter navigation"
        data-state={position.inTimeline ? 'visible' : 'hidden'}
        className={cn(
          'fixed inset-x-0 bottom-3 z-40 px-3 xl:hidden',
          position.inTimeline ? SHOWN : cn(HIDDEN, 'translate-y-4')
        )}
      >
        {/* The toggle comes first in DOM order so Tab moves from it into the open list,
            and flex-col-reverse draws the chart and the list above it */}
        <div className="mx-auto flex max-w-lg flex-col-reverse overflow-hidden rounded-2xl border border-white/10 bg-[#111114]/90 text-white shadow-[0_26px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <button
            ref={phoneToggleRef}
            type="button"
            onClick={() => setIsPhoneListOpen((isOpen) => !isOpen)}
            aria-expanded={isPhoneListOpen}
            aria-controls={isPhoneListOpen ? phoneListId : undefined}
            className="flex w-full items-center gap-3 px-4 pb-2.5 pt-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/40"
          >
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: activeEra.color }}
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              <span className="sr-only">Current era: </span>
              {activeEra.label}
            </span>
            <span className="text-sm font-semibold tabular-nums">{year}</span>
            <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] tabular-nums text-zinc-300">
              {activeEra.number} / {padNumber(eras.length)}
            </span>
            <ChevronUp
              aria-hidden="true"
              className={cn(
                'size-4 shrink-0 text-zinc-400 motion-safe:transition-transform',
                isPhoneListOpen && 'rotate-180'
              )}
            />
          </button>

          <ActivityChart
            activity={activity}
            orientation="horizontal"
            currentYear={position.year}
            className="mx-4 mt-2 h-1.5"
            barsClassName="gap-px"
          />

          {isPhoneListOpen ? (
            <motion.div
              id={phoneListId}
              className="flex max-h-[calc(100dvh-6rem)] flex-col gap-1 overflow-y-auto border-b border-white/10 p-2"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {eras.map((era) => {
                const isActive = era.id === activeEra.id;

                return (
                  <button
                    key={era.id}
                    type="button"
                    onClick={() => handlePhoneNavigate(era.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                      isActive ? 'bg-white/[0.1] text-white' : 'text-zinc-300 hover:bg-white/[0.06]'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: era.color }}
                    />
                    <span className="font-mono text-[10px] tabular-nums text-zinc-400">{era.number}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{era.label}</span>
                    <span className="shrink-0 text-xs text-zinc-400">{era.subtitle}</span>
                  </button>
                );
              })}
            </motion.div>
          ) : null}
        </div>
      </nav>
    </>
  );
}
