// An era of the AI Dex, drawn in the sprites and screens of its generation (`data-gen`, styled in app/globals.css): four
// shades of green for the Foundation Era up to today's animated 3D for the Agentic Era. Its years run from the first
// forward beside a year column. Each event is an entry showing its line at the stage and level that line had reached, with
// its number, title, description, category and source; an AI winter freezes it, and the first event of a line says the line
// has appeared. After an entry come the scenes it sets off: evolutions, battles, moves, encounters and weather. A busy year
// lists its quieter entries in brief until its Show all button, the years that have them open on their field notes, and the
// current era ends on a Poké Ball watching for the next entry.
'use client';

import { ChevronsUpDown } from 'lucide-react';
import type { CSSProperties } from 'react';
import { CategoryBadge } from '@/components/pokemon/ui/category-badge';
import { RelativeTime } from '@/components/ui/relative-time';
import { Sprite } from '@/components/pokemon/ui/sprite';
import { ART, formatDexNumber, type DexEntry } from '@/lib/dex';
import { STATUS_CONDITIONS } from '@/lib/dex-actions';
import { isCurrentEra } from '@/lib/eras';
import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import { groupEventsByYear, type YearGroup } from '@/lib/year-groups';
import { yearSummary } from '@/lib/year-summaries';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/types/timeline';
import { useDexEntry, useDexStory } from './dex-context';
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
import { GymChallenge } from './gym-challenge';
import { Scene } from './scenes';


export function DexEra({ era, totalEvents }: EraInterfaceProps) {
  const groups = groupEventsByYear(era.events);
  // The era's events arrive filtered, so a shorter list means the reader is filtering
  const filtering = era.events.length < totalEvents;
  const current = isCurrentEra(era);

  return (
    <div data-era-backdrop="" data-biome={era.biome} className={cn('pb-16 pt-6 sm:pb-24', `biome-${era.biome}`)}>
      {era.generation === 'gen-1' ? <GameBoyPalette /> : null}
      <div aria-hidden="true" className="biome-scenery biome-scenery-left" />
      <div aria-hidden="true" className="biome-scenery biome-scenery-right" />
      <div data-gen={era.generation} className="dex-era mx-auto max-w-4xl px-4 sm:px-6">
        {groups.map((group, index) => (
          <div key={group.year}>
            <YearGap events={groups} index={index} className="dex-gap my-8 flex items-center gap-4 font-pixel text-[0.625rem] uppercase" />
            <DexYear group={group} filtering={filtering} first={index === 0} />
          </div>
        ))}
        {current && !filtering ? <Frontier latestEvent={era.events[era.events.length - 1]} /> : null}
      </div>
      {filtering ? null : <GymChallenge era={era} />}
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

// A Poké Ball wobbling after the latest entry, waiting on what comes next
function Frontier({ latestEvent }: { latestEvent: TimelineEvent }) {
  return (
    <p
      data-frontier=""
      className="mt-12 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-2 pl-2 pr-4 text-sm text-[#c9cde6]"
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

// A year beside its column: its field notes, the Show all button of a busy year, and its entries with their scenes.
// An entry that sets off a scene always shows in full.
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
        className="dex-year-column mb-4 border-b pb-2 md:mb-0 md:border-b-0 md:pb-0 md:pr-6"
      >
        <DexYearLabel group={group} />
      </YearColumn>

      <div className="min-w-0">
        {summary ? (
          <div data-year-summary="" className="dex-textbox mb-6 px-5 py-4">
            <p className="font-pixel text-[0.5625rem] uppercase text-[#48506b]">Field notes · {group.year}</p>
            <p className="mt-2 text-pretty text-[15px] leading-7">{summary}</p>
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
            <DexListItem key={eventAnchorId(event)} event={event} inBrief={inBrief(event)} filtering={filtering} />
          ))}
        </ol>
      </div>
    </div>
  );
}

function DexListItem({ event, inBrief, filtering }: { event: TimelineEvent; inBrief: boolean; filtering: boolean }) {
  const entry = useDexEntry(event);
  // Scenes tell the story in order, so they stay out of filtered results
  const scenes = filtering ? [] : entry.scenes;

  return (
    <li className="dex-route-stop grid grid-cols-[minmax(0,1fr)] gap-5">
      {inBrief && scenes.length === 0 ? <DexBrief event={event} entry={entry} /> : <DexCard event={event} entry={entry} />}
      {scenes.map((played) => (
        <Scene key={played.id} played={played} pixelated={entry.pixelated} />
      ))}
    </li>
  );
}

// The year as the era's screen prints it, how many entries it holds and how many are landmarks
function DexYearLabel({ group }: { group: YearGroup }) {
  const landmarks = group.events.filter((event) => event.landmark).length;
  const story = useDexStory();
  // The creatures met on the route this year, once each, as they stood when the year began
  const met = new Map<number, string>();
  for (const event of group.events) {
    const entry = story?.dex.get(eventAnchorId(event));
    if (entry && !met.has(entry.species.id)) {
      met.set(entry.species.id, entry.icon);
    }
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 md:block">
      <p className="dex-year font-pixel text-lg leading-none md:text-xl">{group.year}</p>
      <p className="dex-year-meta text-xs md:mt-3">{countOf(group.events.length, 'event')}</p>
      {landmarks > 0 ? (
        <p className="text-xs text-[var(--legend-gold)] md:mt-1">★ {countOf(landmarks, 'landmark')}</p>
      ) : null}
      {met.size > 0 ? (
        <p data-year-met="" className="mt-3 hidden flex-wrap gap-0.5 md:flex">
          {[...met].slice(0, 6).map(([id, icon]) => (
            <Sprite key={id} src={icon} pixelated className="size-8 object-contain" />
          ))}
        </p>
      ) : null}
    </div>
  );
}

// The line's creature, with its level, and whether an AI winter has frozen it
function LineChip({ entry }: { entry: DexEntry }) {
  return (
    <span data-line={entry.line.id} className="line-chip inline-flex min-w-0 items-center gap-2">
      <span aria-hidden="true" className="line-chip-name font-pixel text-[0.5625rem] uppercase leading-none">
        {entry.species.name} <span className="opacity-70">Lv.{entry.level}</span>
      </span>
      <span className="truncate">
        <span className="sr-only">
          {entry.species.name}, level {entry.level}, of the{' '}
        </span>
        {entry.line.name}
        <span className="sr-only"> line</span>
      </span>
    </span>
  );
}

// What the event did to its line, as the games' battle text: a move learned or used, a stat that rose or fell, or a
// status condition, which the brief entry shows as a chip beside the text and the full entry on the creature's screen
function ActionLine({ entry, brief = false }: { entry: DexEntry; brief?: boolean }) {
  const { text, status } = entry.action;

  return (
    <p
      data-action=""
      data-status={status}
      className={brief ? 'dex-brief-action flex min-w-0 items-center gap-2 text-xs' : 'dex-action mt-3 font-pixel'}
    >
      {brief && status ? (
        <span aria-hidden="true" data-status={status} className="status-badge status-inline font-pixel">
          {status}
        </span>
      ) : null}
      <span className={brief ? 'truncate' : undefined}>{text}</span>
      {status ? <span className="sr-only"> Status: {STATUS_CONDITIONS[status].name}.</span> : null}
    </p>
  );
}

// An entry in full: the line's creature on its screen, then the entry's number and date, its title linking to the source,
// what it did to its line, what happened, and its line, category and source
export function DexCard({ event, entry }: { event: TimelineEvent; entry: DexEntry }) {
  return (
    <article
      {...eventCardAttributes(event)}
      data-dex-card=""
      data-line={entry.line.id}
      data-frozen={entry.frozen ? '' : undefined}
      data-status={entry.action.status}
      style={{ '--line-color': entry.line.color } as CSSProperties}
      className="dex-card reveal-on-scroll scroll-mt-[calc(var(--timeline-sticky-offset,0px)+1.5rem)] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-[#ffcb05]"
    >
      <div aria-hidden="true" className="dex-stage">
        <Sprite
          src={entry.sprite}
          pixelated={entry.pixelated}
          className={entry.generation === 'modern' ? 'sprite-bob' : undefined}
        />
        {entry.frozen ? <span className="frz-badge font-pixel">FRZ</span> : null}
        {entry.action.status ? (
          <span data-status={entry.action.status} className="status-badge status-on-stage font-pixel">
            {entry.action.status}
          </span>
        ) : null}
      </div>

      <div className="dex-body">
        {entry.firstOfLine ? (
          <p data-new-line="" className="new-line-tag mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium">
            <span className="font-pixel text-[0.5rem] uppercase">New branch</span>
            {entry.line.name} begins as {entry.species.name}
          </p>
        ) : null}
        {event.landmark ? (
          <p className="legend-tag mb-2 ml-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-pixel text-[0.5625rem] uppercase leading-none">
            ★ {LANDMARK_LABEL}
          </p>
        ) : null}
        <p className="dex-meta flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="font-pixel text-[0.625rem]">{formatDexNumber(entry.number)}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={eventDateTime(event)} className="font-medium">
            {formatEventDate(event)}
          </time>
          <RelativeTime event={event} before="· " className="font-medium text-[var(--line-color)]" />
          {entry.frozen ? <span className="sr-only">, during an AI winter</span> : null}
        </p>
        <EventHeading event={event} className="dex-title mt-2 text-pretty" linkClassName="underline-offset-4 hover:underline" />
        <ActionLine entry={entry} />
        <p className="dex-description mt-3 text-pretty text-[15px] leading-7">{event.description}</p>
        <p className="dex-footer mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-xs">
          <LineChip entry={entry} />
          <CategoryBadge category={event.category} className="max-w-full" />
          <EventSource event={event} className="ml-auto max-w-full" />
        </p>
      </div>
    </article>
  );
}

// An entry in brief, for the rest of a busy year: the creature's icon, the number and date, the title, and what the event
// did to its line
function DexBrief({ event, entry }: { event: TimelineEvent; entry: DexEntry }) {
  return (
    <article
      {...eventCardAttributes(event)}
      data-brief=""
      data-line={entry.line.id}
      className="dex-brief relative flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-white/[0.06] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-[#ffcb05]"
    >
      <Sprite src={entry.icon} pixelated className="size-9 shrink-0 object-contain" />
      <div className="min-w-0 flex-1">
        <div className="sm:flex sm:items-baseline sm:gap-3">
          <p className="dex-brief-meta flex shrink-0 items-center gap-2 text-xs">
            <span className="font-pixel text-[0.5625rem]">{formatDexNumber(entry.number)}</span>
            <time dateTime={eventDateTime(event)} className="sm:w-[6.75rem]">
              {formatEventDate(event)}
            </time>
          </p>
          <EventHeading event={event} className="min-w-0 truncate text-sm font-medium" linkClassName="hover:underline" />
        </div>
        <ActionLine entry={entry} brief />
      </div>
      <EventSource event={event} className="dex-brief-meta hidden shrink-0 text-xs sm:inline-flex" />
    </article>
  );
}
