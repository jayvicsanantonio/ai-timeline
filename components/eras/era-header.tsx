// The header every era shares, set in the page's black between two interfaces like a film's intertitle. The timeline rewinds
// from the top, so the current era is marked "Now" and every other one "Before" the year the era above it began. Below the
// marker come the era's name, its years, its count and its interface, and a sentence on what it was.
'use client';

import { Rewind } from 'lucide-react';
import { formatEventDate } from '@/lib/event-format';
import { isCurrentEra, type Era } from '@/lib/eras';
import { cn } from '@/lib/utils';
import { NO_MATCHING_EVENTS, eraEventCount, eraHeadingId } from './era-parts';

interface EraHeaderProps {
  // The era with its events newest first
  era: Era;
  // How many events the era has before filters are applied
  totalEvents: number;
}

export function EraHeader({ era, totalEvents }: EraHeaderProps) {
  const current = isCurrentEra(era);
  const empty = era.events.length === 0;
  // Only the era still under way says how recent its latest event is
  const latestEvent = current ? era.events[0] : undefined;

  return (
    <header
      data-era-header=""
      className={cn(
        'mx-auto max-w-4xl px-4 sm:px-6',
        // The era at the top sits just under the toolbar, and the others just under the era before them
        empty ? 'pb-8 pt-10' : current ? 'pb-2 pt-10 sm:pt-12' : 'pb-2 pt-12 sm:pt-16'
      )}
    >
      <p
        data-era-marker=""
        className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-zinc-400"
      >
        {current ? (
          <span
            aria-hidden="true"
            className="size-2 rounded-full motion-safe:animate-pulse"
            style={{ backgroundColor: era.color }}
          />
        ) : (
          <Rewind aria-hidden="true" className="size-3.5" style={{ color: era.color }} />
        )}
        {current ? 'Now' : `Before ${era.range[1]}`}
      </p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2
          id={eraHeadingId(era)}
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight text-white focus:outline-none sm:text-3xl"
        >
          {era.name}
        </h2>
        <p className="text-sm text-zinc-400">
          {era.subtitle} <span aria-hidden="true">·</span> {eraEventCount(era, totalEvents)}
          {latestEvent ? ` through ${formatEventDate(latestEvent)}` : null} <span aria-hidden="true">·</span>{' '}
          {era.interfaceName}
        </p>
      </div>
      {empty ? (
        <p className="mt-2 text-sm text-zinc-300">{NO_MATCHING_EVENTS}</p>
      ) : (
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-zinc-400 sm:text-[15px]">{era.description}</p>
      )}
    </header>
  );
}
