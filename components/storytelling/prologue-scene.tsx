// The opening of the page: the title and the story's premise beside MEW, the ancestor every line descends from, the way
// into the journey at 1943 or straight to now, the latest news, a link to each era in the order the page runs, and a slim
// events-per-year chart of all of AI history. Each of the latest sightings links to its entry at the end of the timeline.
'use client';

import { ArrowDown, ChevronsDown } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useDexEntry } from '@/components/eras/dex-context';
import { ActivityChart } from '@/components/timeline/activity-chart';
import { CategoryBadge } from '@/components/ui/category-badge';
import { RelativeTime } from '@/components/ui/relative-time';
import { Sprite } from '@/components/ui/sprite';
import { ART, badgePath, formatDexNumber, iconPath, LINES } from '@/lib/dex';
import type { Era } from '@/lib/eras';
import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import type { YearActivity } from '@/lib/timeline-activity';
import { scrollToEvent, scrollToYear } from '@/lib/timeline-scroll';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/types/timeline';

interface PrologueSceneProps {
  // Every era with all of its events, in time order, as the page and the chart run
  eras: Era[];
  activity: YearActivity[];
  // The newest events, newest first
  latest: TimelineEvent[];
  totalEvents: number;
}

export function PrologueScene({ eras, activity, latest, totalEvents }: PrologueSceneProps) {
  const firstYear = activity[0]?.year;
  const lastYear = activity.at(-1)?.year;
  const latestEra = eras.at(-1);

  return (
    <section
      aria-labelledby="prologue-title"
      className="relative overflow-hidden bg-background px-4 pb-10 pt-10 text-white sm:px-6 sm:pb-12 sm:pt-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(50rem_24rem_at_15%_0%,rgba(255,203,5,0.12),transparent_70%),radial-gradient(46rem_22rem_at_85%_10%,rgba(249,85,135,0.16),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-12">
          <div>
            <p className="prologue-rise font-pixel text-[0.625rem] uppercase leading-5 text-[#c9cde6]">
              AI Dex <span aria-hidden="true">·</span> {firstYear} – {lastYear} <span aria-hidden="true">·</span>{' '}
              {totalEvents} entries <span aria-hidden="true">·</span> {LINES.length} lines
            </p>
            <h1
              id="prologue-title"
              className="dex-wordmark prologue-rise mt-4 text-5xl font-bold leading-[0.95] tracking-[-0.03em] [animation-delay:80ms] sm:text-7xl lg:text-[5.5rem]"
            >
              The AI Timeline
            </h1>
            {firstYear !== undefined && lastYear !== undefined ? (
              <p className="prologue-rise mt-4 max-w-xl text-lg leading-8 text-[#d9dcef] [animation-delay:160ms]">
                {lastYear - firstYear} years of artificial intelligence as {LINES.length} evolution lines. Neural networks
                splash around as a MAGIKARP for fifty years, chatbots grow into PORYGON-Z, and agents start haunting our
                machines. Watch every line hatch, freeze, battle and evolve.
              </p>
            ) : null}
            <p className="prologue-rise mt-5 flex flex-wrap gap-3 [animation-delay:200ms]">
              <a
                href={`#${eras[0]?.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#ffcb05] px-5 py-2.5 text-sm font-semibold text-[#14161f] shadow-[0_5px_0_#b38f00] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                Start the journey in {firstYear}
                <ChevronsDown aria-hidden="true" className="size-4" />
              </a>
              <a
                href="#party-title"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcb05]"
              >
                Meet the {LINES.length} lines
              </a>
            </p>
          </div>

          <AncestorDex />
        </div>

        <LatestEvents events={latest} />

        <EraLinks eras={eras} />

        <figure className="prologue-rise mt-8 [animation-delay:320ms]">
          <div className="relative pt-7">
            <BusiestYearLabel activity={activity} />
            <ActivityChart
              activity={activity}
              orientation="horizontal"
              onSelectYear={scrollToYear}
              className="h-14 sm:h-16"
            />
          </div>
          <EraAxis eras={eras} activity={activity} />
          <figcaption className="mt-4 flex flex-col gap-3 text-sm leading-6 text-[#a7acc8] sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            {latestEra ? (
              <p>
                Entries per year. {latestEra.events.length} of the {totalEvents} events happened since{' '}
                {latestEra.range[0]}.{' '}
                {/* The bars answer only the pointer, so assistive technology skips this with the chart */}
                <span aria-hidden="true">Click a bar to jump to that year.</span>
              </p>
            ) : null}
            <YearTable activity={activity} />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

// The handheld beside the title, its screen showing MEW: every line in the story descends from the first model of a
// neuron, as every Pokémon is said to descend from MEW
function AncestorDex() {
  return (
    <figure className="dex-shell prologue-rise relative mx-auto w-full max-w-sm rounded-[2rem] p-4 [animation-delay:200ms]">
      <div aria-hidden="true" className="flex items-center gap-3 px-1 pb-3">
        <span className="dex-lens size-9 rounded-full" />
        <span className="size-3 rounded-full bg-[#ff5a6e] shadow-[inset_0_-2px_0_rgba(0,0,0,0.3)]" />
        <span className="size-3 rounded-full bg-[#ffcb05] shadow-[inset_0_-2px_0_rgba(0,0,0,0.3)]" />
        <span className="size-3 rounded-full bg-[#4ade80] shadow-[inset_0_-2px_0_rgba(0,0,0,0.3)]" />
      </div>
      <div aria-hidden="true" className="dex-screen relative rounded-2xl px-3 pb-3 pt-4">
        <div className="grid h-24 place-items-center">
          <span className="sprite-bob">
            <Sprite src={ART.ancestor.sprite} eager className="h-20 w-20 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" />
          </span>
        </div>
        <ol className="mt-2 grid grid-cols-9 gap-0.5 border-t border-white/10 pt-2">
          {LINES.map((line) => (
            <li key={line.id} className="grid place-items-center">
              <Sprite src={iconPath(line.stages[0].species)} eager pixelated className="size-8 object-contain" />
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="mt-3 px-1 text-sm leading-6 text-white/90">
        Every Pokémon is said to descend from MEW. Every line in this story descends from one idea: a model of a neuron,
        written down in 1943.
      </figcaption>
    </figure>
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
    <div data-latest-events="" className="prologue-rise mt-9 [animation-delay:240ms]">
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
      <ol aria-labelledby="latest-title" className="mt-4 grid gap-3 lg:grid-cols-3">
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
        className="group flex h-full gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-white/25 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcb05] sm:p-5"
      >
        <span
          aria-hidden="true"
          className="grid size-16 shrink-0 place-items-center rounded-xl"
          style={{ background: `radial-gradient(circle at 50% 60%, ${entry.line.color}55, transparent 70%)` }}
        >
          <Sprite src={entry.sprite} eager className="max-h-14 max-w-14 object-contain" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex flex-wrap items-center gap-x-2 text-xs text-[#a7acc8]">
            <span className="font-pixel text-[0.5625rem]">{formatDexNumber(entry.number)}</span>
            <time dateTime={eventDateTime(event)} className="font-medium text-[#e4e6f5]">
              {formatEventDate(event)}
            </time>
            <RelativeTime event={event} before="· " className="text-[#ffcb05]" />
          </span>
          <span className="mt-2 text-pretty text-base font-semibold leading-snug text-white">{event.title}</span>
          <span className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-[#a7acc8]">
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

// A link to each era in the page's order, the first first, named with its years. On a phone the row scrolls sideways.
function EraLinks({ eras }: { eras: Era[] }) {
  return (
    <ol
      aria-label="Eras"
      className="prologue-rise -mx-4 mt-5 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [animation-delay:280ms] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      {eras.map((era) => (
        <li key={era.id} className="shrink-0 snap-start">
          <a
            href={`#${era.id}`}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1.5 pr-3.5 text-sm transition-colors hover:border-white/25 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcb05]"
          >
            <Sprite src={badgePath(era.badge)} eager className="size-6 shrink-0 object-contain" />
            <span className="font-medium text-white">{era.label}</span>
            <span className="text-[#a7acc8]">{era.subtitle}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

// Labels the year with the most events directly above its bar, the one value the chart calls out
function BusiestYearLabel({ activity }: { activity: YearActivity[] }) {
  if (activity.length === 0) {
    return null;
  }

  const busiestIndex = activity.reduce(
    (best, year, index) => (year.total > activity[best].total ? index : best),
    0
  );
  const busiest = activity[busiestIndex];
  const position = (busiestIndex + 0.5) / activity.length;

  return (
    <p
      aria-hidden="true"
      className={cn(
        'absolute top-0 whitespace-nowrap text-xs text-[#d9dcef]',
        position > 0.85 ? '-translate-x-full text-right' : '-translate-x-1/2'
      )}
      style={{ left: `${position * 100}%` }}
    >
      <span className="font-semibold text-white">{busiest.total} events</span> in {busiest.year}
    </p>
  );
}

// The era bands under the chart: a colored rule across each era's years, its first year and its name
function EraAxis({ eras, activity }: { eras: Era[]; activity: YearActivity[] }) {
  if (activity.length === 0) {
    return null;
  }

  const firstYear = activity[0].year;
  const lastYear = activity[activity.length - 1].year;

  return (
    <div aria-hidden="true" data-era-axis="" className="mt-2 flex gap-[2px]">
      {eras.map((era, index) => {
        const start = Math.max(era.range[0], firstYear);
        const end = Math.min(era.range[1] - 1, lastYear);
        const isLast = index === eras.length - 1;
        // An era of only a few years has room for its first year on a wide screen, and never for its name
        const isShort = end - start + 1 < 8;

        return (
          <div key={era.id} className="min-w-0" style={{ flexGrow: end - start + 1, flexBasis: 0 }}>
            <div className="h-0.5 rounded-full" style={{ backgroundColor: era.color }} />
            <div className={cn('mt-2 flex items-baseline gap-1.5 text-xs', isLast && 'justify-end')}>
              <span className={cn('font-mono tabular-nums text-[#7d84a6]', isShort && !isLast && 'hidden lg:inline')}>
                {isLast ? lastYear : start}
              </span>
              <span className="hidden truncate text-[#d9dcef] md:inline">{isLast || isShort ? '' : era.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// The chart's numbers for readers who want them exactly, or who cannot see the bars, the first year first
function YearTable({ activity }: { activity: YearActivity[] }) {
  const yearsWithEvents = activity.filter((year) => year.total > 0);

  return (
    <details className="shrink-0 sm:text-right">
      <summary className="cursor-pointer select-none font-medium text-[#d9dcef] underline-offset-4 hover:underline">
        Show the numbers
      </summary>
      <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-white/10 text-left">
        <table className="w-full min-w-48 text-sm">
          <caption className="sr-only">Events per year</caption>
          <thead className="sticky top-0 bg-[#161a2e] text-xs text-[#a7acc8]">
            <tr>
              <th scope="col" className="px-4 py-2 text-left font-medium">
                Year
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium">
                Events
              </th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {yearsWithEvents.map((year) => (
              <tr key={year.year} className="border-t border-white/5">
                <td className="px-4 py-1.5 text-[#d9dcef]">{year.year}</td>
                <td className="px-4 py-1.5 text-right text-white">{year.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
