// An era of the AI Dex, drawn in the sprites and screens of its generation (`data-gen`, styled in app/globals.css): four
// shades of green for the Foundation Era up to today's animated 3D for the Agentic Era. Its years run newest first beside a
// year column, each event an entry with its number, its creature, its type and its source; a landmark is a legendary
// encounter with the creature's lore. A busy year lists its other entries in brief until its Show all button, the current
// era opens on a Poké Ball watching for the next entry, and the years that have them open on their field notes.
'use client';

import { ChevronsUpDown } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Sprite } from '@/components/ui/sprite';
import { RelativeTime } from '@/components/ui/relative-time';
import { TypeBadge } from '@/components/ui/type-badge';
import { ART, formatDexNumber } from '@/lib/dex';
import { isCurrentEra, type GenerationId } from '@/lib/eras';
import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import { groupEventsByYear, type YearGroup } from '@/lib/year-groups';
import { yearSummary } from '@/lib/year-summaries';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/types/timeline';
import { useDexEntry } from './dex-context';
import {
  EventHeading,
  EventSource,
  LANDMARK_LABEL,
  YearColumn,
  YearGap,
  countOf,
  eventCardAttributes,
  useBriefListing,
  type EraInterfaceProps,
} from './era-parts';

const BACKDROPS: Record<GenerationId, string> = {
  'gen-1': 'gen-1-backdrop',
  'gen-2': 'gen-2-backdrop',
  'gen-3': 'gen-3-backdrop',
  'gen-4': 'gen-4-backdrop',
  'gen-5': 'gen-5-backdrop',
  modern: 'modern-backdrop',
};

export function DexEra({ era, totalEvents }: EraInterfaceProps) {
  const groups = groupEventsByYear(era.events);
  // The era's events arrive filtered, so a shorter list means the reader is filtering
  const filtering = era.events.length < totalEvents;
  const current = isCurrentEra(era);

  return (
    <div data-era-backdrop="" className={cn('pb-16 pt-6 sm:pb-24', BACKDROPS[era.generation])}>
      {era.generation === 'gen-1' ? <GameBoyPalette /> : null}
      <div data-gen={era.generation} className="dex-era mx-auto max-w-4xl px-4 sm:px-6">
        {current && !filtering ? <Frontier latestEvent={era.events[0]} /> : null}
        {groups.map((group, index) => (
          <div key={group.year}>
            <YearGap
              events={groups}
              index={index}
              className="dex-gap my-8 flex items-center gap-4 font-pixel text-[0.625rem] uppercase"
            />
            <DexYear group={group} filtering={filtering} first={index === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Maps the gray sprites of Generation I onto the four greens of its screen, for `filter: url(#dmg-palette)`
function GameBoyPalette() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter id="dmg-palette" colorInterpolationFilters="sRGB">
        <feColorMatrix
          type="matrix"
          values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0.059 0.188 0.545 0.608" />
          <feFuncG type="discrete" tableValues="0.22 0.384 0.675 0.737" />
          <feFuncB type="discrete" tableValues="0.059 0.188 0.059 0.059" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}

// A Poké Ball wobbling at the top of the current era, waiting on what comes after the latest entry
function Frontier({ latestEvent }: { latestEvent: TimelineEvent }) {
  return (
    <p
      data-frontier=""
      className="mb-2 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-2 pl-2 pr-4 text-sm text-[#c9cde6]"
    >
      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.06]">
        <Sprite src={ART.pokeBall} pixelated className="ball-wobble size-6" />
      </span>
      <span>
        Watching for what comes after {formatEventDate(latestEvent)}
        <RelativeTime event={latestEvent} before=" · " className="text-[#ffcb05]" />
      </span>
    </p>
  );
}

// A year beside its column: its field notes, the Show all button of a busy year, and its entries in full or in brief
function DexYear({ group, filtering, first }: { group: YearGroup; filtering: boolean; first: boolean }) {
  const { offersShowAll, showAll, toggleShowAll, inBrief } = useBriefListing(group, filtering);
  const summary = filtering ? undefined : yearSummary(group.year);

  return (
    <div
      data-year-group={group.year}
      className={cn('grid gap-x-8 md:grid-cols-[7.5rem_minmax(0,1fr)]', first ? 'mt-6' : 'mt-12')}
    >
      <YearColumn
        group={group}
        className="dex-year-column mb-4 border-b pb-2 md:mb-0 md:border-b-0 md:border-r md:pb-0 md:pr-6"
      >
        <DexYearLabel group={group} />
      </YearColumn>

      <div className="min-w-0">
        {summary ? (
          <div data-year-summary="" className="dex-textbox mb-6 px-5 py-4">
            <p className="font-pixel text-[0.5625rem] uppercase text-[#48506b]">Field notes · {group.year}</p>
            <p className="mt-2 text-pretty text-[15px] leading-7">
              {summary}
              <span aria-hidden="true" className="text-caret ml-1 text-[#e3263b]">
                ▼
              </span>
            </p>
          </div>
        ) : null}

        {offersShowAll ? (
          <p className="mb-5">
            <button
              type="button"
              aria-pressed={showAll}
              onClick={toggleShowAll}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcb05]',
                showAll
                  ? 'border-[#ffcb05]/70 bg-[#ffcb05]/15 text-white'
                  : 'border-white/15 bg-white/[0.05] text-[#d9dcef] hover:border-white/30 hover:text-white'
              )}
            >
              <ChevronsUpDown aria-hidden="true" className="size-3.5" />
              Show all {group.events.length} in full
            </button>
          </p>
        ) : null}
        <ol className="grid grid-cols-[minmax(0,1fr)] gap-5">
          {group.events.map((event) => (
            <li key={eventAnchorId(event)}>
              {inBrief(event) ? <DexBrief event={event} /> : <DexCard event={event} />}
            </li>
          ))}
        </ol>

      </div>
    </div>
  );
}

// The year as the era's screen prints it, how many entries it holds and how many are legendary
function DexYearLabel({ group }: { group: YearGroup }) {
  const landmarks = group.events.filter((event) => event.landmark).length;

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 md:block">
      <p className="dex-year font-pixel text-lg leading-none md:text-xl">{group.year}</p>
      <p className="dex-year-meta text-xs md:mt-3">{countOf(group.events.length, 'entry', 'entries')}</p>
      {landmarks > 0 ? (
        <p className="text-xs text-[var(--legend-gold)] md:mt-1">★ {countOf(landmarks, 'legend')}</p>
      ) : null}
    </div>
  );
}

// An entry in full: the creature on its screen, then the entry's number and date, its title linking to the source, what
// happened, and its type, creature and source. A landmark adds its tag and the legend's lore.
export function DexCard({ event }: { event: TimelineEvent }) {
  const entry = useDexEntry(event);

  return (
    <article
      {...eventCardAttributes(event)}
      data-dex-card=""
      data-type={entry.type.name}
      style={{ '--type-color': entry.type.color } as CSSProperties}
      className="dex-card reveal-on-scroll scroll-mt-[calc(var(--timeline-sticky-offset,0px)+1.5rem)] has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-[#ffcb05]"
    >
      <div aria-hidden="true" className="dex-stage">
        <Sprite
          src={entry.sprite}
          pixelated={entry.pixelated}
          className={entry.generation === 'modern' ? 'sprite-bob' : undefined}
        />
      </div>

      <div className="dex-body">
        {event.landmark ? (
          <p className="legend-tag mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-pixel text-[0.5625rem] uppercase leading-none">
            ★ {LANDMARK_LABEL}
          </p>
        ) : null}
        <p className="dex-meta flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="font-pixel text-[0.625rem]">{formatDexNumber(entry.number)}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={eventDateTime(event)} className="font-medium">
            {formatEventDate(event)}
          </time>
          <RelativeTime event={event} before="· " className="font-medium text-[var(--type-color)]" />
        </p>
        <EventHeading
          event={event}
          className="dex-title mt-2 text-pretty"
          linkClassName="underline-offset-4 hover:underline"
        />
        <p className="dex-description mt-2 text-pretty text-[15px] leading-7">{event.description}</p>
        {entry.legend ? (
          <p data-legend-lore="" className="dex-lore mt-3 pl-3 text-sm italic leading-6">
            {entry.legend.lore}
          </p>
        ) : null}
        <p className="dex-footer mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-xs">
          <TypeBadge category={event.category} className="max-w-full" />
          <span data-species="">
            <span className="sr-only">Spotted as </span>
            {entry.species.name}
          </span>
          <EventSource event={event} className="ml-auto max-w-full" />
        </p>
      </div>
    </article>
  );
}

// An entry in brief, for the rest of a busy year: the creature's icon, the number and date, and the title
function DexBrief({ event }: { event: TimelineEvent }) {
  const entry = useDexEntry(event);

  return (
    <article
      {...eventCardAttributes(event)}
      data-brief=""
      className="dex-brief relative flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-white/[0.06] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-[#ffcb05]"
    >
      <Sprite src={entry.icon} pixelated className="size-9 shrink-0 object-contain" />
      <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-3">
        <p className="dex-brief-meta flex shrink-0 items-center gap-2 text-xs">
          <span className="font-pixel text-[0.5625rem]">{formatDexNumber(entry.number)}</span>
          <time dateTime={eventDateTime(event)} className="sm:w-[6.75rem]">
            {formatEventDate(event)}
          </time>
        </p>
        <EventHeading event={event} className="min-w-0 truncate text-sm font-medium" linkClassName="hover:underline" />
      </div>
      <EventSource event={event} className="dex-brief-meta hidden shrink-0 text-xs sm:inline-flex" />
    </article>
  );
}
