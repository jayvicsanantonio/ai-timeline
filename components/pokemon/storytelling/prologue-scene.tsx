// The opening of the page, drawn as the title screen of a game under a night sky: the title and the premise, MEW floating
// above the first creature of every line, which all descend from it, and the start menu: NEW GAME starts the journey in
// the first era, CONTINUE jumps to the latest entry, and POKéDEX opens the map of the lines. Below the menu, the latest
// news, each linking to its entry at the end of the timeline.
'use client';

import { ArrowDown } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useDexEntry } from '@/components/pokemon/eras/dex-context';
import { CategoryBadge } from '@/components/pokemon/ui/category-badge';
import { RelativeTime } from '@/components/ui/relative-time';
import { Sprite } from '@/components/pokemon/ui/sprite';
import { ART, formatDexNumber, LINES } from '@/lib/dex';
import type { Era } from '@/lib/eras';
import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import { scrollToEvent } from '@/lib/timeline-scroll';
import type { TimelineEvent } from '@/types/timeline';

interface PrologueSceneProps {
  // Every era with all of its events, in time order, as the page runs
  eras: Era[];
  // The newest events, newest first
  latest: TimelineEvent[];
  totalEvents: number;
  // The years the timeline spans
  firstYear: number;
  lastYear: number;
}

export function PrologueScene({ eras, latest, totalEvents, firstYear, lastYear }: PrologueSceneProps) {
  const newest = latest[0];

  return (
    <section
      aria-labelledby="prologue-title"
      className="title-sky relative overflow-hidden px-4 pb-12 pt-10 text-center text-white sm:px-6 sm:pt-12"
    >
      <div className="relative mx-auto max-w-5xl">
        <p className="prologue-rise font-pixel text-[0.625rem] uppercase leading-5 text-[#c9cde6]">
          An AI adventure <span aria-hidden="true">·</span> {firstYear} – {lastYear} <span aria-hidden="true">·</span>{' '}
          {totalEvents} entries <span aria-hidden="true">·</span> {LINES.length} branches
        </p>
        <h1
          id="prologue-title"
          className="dex-wordmark prologue-rise mt-4 text-5xl font-bold leading-[0.95] tracking-[-0.03em] [animation-delay:80ms] sm:text-7xl lg:text-[5.5rem]"
        >
          The AI Timeline
        </h1>
        <p className="prologue-rise mx-auto mt-4 max-w-3xl text-pretty text-base leading-7 text-[#d9dcef] [animation-delay:160ms]">
          {lastYear - firstYear} years of artificial intelligence, split into {LINES.length} branches, each played by a
          Pokémon that evolves at its breakthroughs. Neural networks splash around as a MAGIKARP for fifty years, chatbots
          grow into PORYGON-Z, and agents start haunting our machines. Walk the route from {firstYear} and watch every
          branch hatch, freeze, battle and evolve.
        </p>

        <TitleLineup />

        <nav aria-label="Start menu" className="prologue-rise mx-auto mt-5 max-w-md [animation-delay:240ms]">
          <ul className="start-menu rounded-2xl p-2 text-left">
            <MenuItem href={`#${eras[0]?.id}`} label="New game" detail={`Start the journey in ${firstYear}`} />
            {newest ? (
              <MenuItem
                href={`#${eventAnchorId(newest)}`}
                label="Continue"
                detail={`Jump to the latest, ${formatEventDate(newest)}`}
              />
            ) : null}
            <MenuItem href="#party-title" label="Pokédex" detail={`Meet the ${LINES.length} branches of AI`} />
          </ul>
        </nav>

        <LatestEvents events={latest} />
      </div>
    </section>
  );
}

// One choice of the start menu, its cursor showing on hover and focus as a game's does
function MenuItem({ href, label, detail }: { href: string; label: string; detail: string }) {
  return (
    <li>
      <a
        href={href}
        className="start-menu-item group flex items-baseline gap-3 rounded-xl px-4 py-2.5 focus-visible:outline-none"
      >
        <span aria-hidden="true" className="start-menu-cursor font-pixel text-xs">
          ▶
        </span>
        <span className="w-28 shrink-0 font-pixel text-xs uppercase leading-5">{label}</span>
        <span className="min-w-0 text-sm text-[#5b6275]">{detail}</span>
      </a>
    </li>
  );
}

// MEW floating over the first creature of every line, standing on the grass where the journey starts
function TitleLineup() {
  return (
    <div aria-hidden="true" className="prologue-rise relative mx-auto mt-4 max-w-3xl [animation-delay:200ms]">
      <div className="grid h-14 place-items-center">
        <span className="sprite-bob">
          <Sprite src={ART.ancestor.sprite} eager className="h-12 w-12 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" />
        </span>
      </div>
      <ol className="title-ledge mt-1 grid grid-cols-9 items-end gap-1 rounded-full px-3 pb-2 sm:px-6">
        {LINES.map((line) => (
          <li key={line.id} className="grid h-12 place-items-end justify-center sm:h-16">
            <Sprite src={ART.lineSprite(line.stages[0].species)} eager className="max-h-full max-w-full object-contain" />
          </li>
        ))}
      </ol>
    </div>
  );
}

// The newest events, so the latest news is the first thing on the page, each with how long ago it happened. Each one jumps to
// its entry at the end of the timeline, and works as a plain link to the entry before the page loads.
function LatestEvents({ events }: { events: TimelineEvent[] }) {
  const newest = events[0];
  if (!newest) {
    return null;
  }

  return (
    <div data-latest-events="" className="prologue-rise mt-8 text-left [animation-delay:280ms]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2
          id="latest-title"
          className="flex items-center gap-2.5 font-pixel text-[0.625rem] uppercase leading-none text-white"
        >
          <span aria-hidden="true" className="size-2 rounded-full bg-[#ff5a6e] motion-safe:animate-pulse" />
          Latest sightings
        </h2>
        <p className="text-sm text-[#a7acc8]">
          Through <time dateTime={eventDateTime(newest)}>{formatEventDate(newest)}</time>
        </p>
      </div>
      <ol aria-labelledby="latest-title" className="mt-3 grid gap-2 lg:grid-cols-3">
        {events.map((event) => (
          <LatestEvent key={eventAnchorId(event)} event={event} />
        ))}
      </ol>
    </div>
  );
}

function LatestEvent({ event }: { event: TimelineEvent }) {
  const entry = useDexEntry(event);
  const anchorId = eventAnchorId(event);

  const jumpToEvent = (click: MouseEvent<HTMLAnchorElement>) => {
    if (scrollToEvent(anchorId)) {
      click.preventDefault();
    }
  };

  return (
    <li>
      <a
        href={`#${anchorId}`}
        onClick={jumpToEvent}
        className="group flex h-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition-colors hover:border-white/25 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcb05]"
      >
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-xl"
          style={{ background: `radial-gradient(circle at 50% 60%, ${entry.line.color}55, transparent 70%)` }}
        >
          <Sprite src={entry.sprite} eager className="max-h-11 max-w-11 object-contain" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex flex-wrap items-center gap-x-2 text-xs text-[#a7acc8]">
            <span className="font-pixel text-[0.5625rem]">{formatDexNumber(entry.number)}</span>
            <time dateTime={eventDateTime(event)} className="font-medium text-[#e4e6f5]">
              {formatEventDate(event)}
            </time>
            <RelativeTime event={event} before="· " className="text-[#ffcb05]" />
          </span>
          <span className="mt-1 line-clamp-2 text-pretty text-sm font-semibold leading-snug text-white">{event.title}</span>
          <span className="mt-1 flex items-center justify-between gap-3 text-xs text-[#a7acc8]">
            <CategoryBadge category={event.category} className="min-w-0" />
            <ArrowDown
              aria-hidden="true"
              className="size-3.5 shrink-0 text-[#7d84a6] transition-colors group-hover:text-white"
            />
          </span>
        </span>
      </a>
    </li>
  );
}

