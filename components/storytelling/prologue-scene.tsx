// The opening of the page, which reads newest first: the title, the latest events, an events-per-year chart of all of
// AI history and a tile for each era, the latest first. Each tile previews the computer interface its era is drawn in
// and links to the era, and each of the latest events links to its place in the timeline below.
'use client';

import { ArrowDown } from 'lucide-react';
import type { MouseEvent } from 'react';
import { EraPreview } from '@/components/eras/era-preview';
import { ActivityChart } from '@/components/timeline/activity-chart';
import { CategoryIcon } from '@/components/ui/category-icon';
import type { Era } from '@/lib/eras';
import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import { newestFirst } from '@/lib/newest-first';
import type { YearActivity } from '@/lib/timeline-activity';
import { scrollToEvent, scrollToYear } from '@/lib/timeline-scroll';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/types/timeline';

interface PrologueSceneProps {
  // Every era with all of its events, in time order, as the chart runs
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
      className="relative overflow-hidden bg-[#0a0a0b] px-4 pb-16 pt-20 text-white sm:px-6 sm:pt-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(50rem_24rem_at_20%_0%,rgba(201,133,0,0.12),transparent_70%),radial-gradient(46rem_22rem_at_85%_10%,rgba(144,133,233,0.14),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="prologue-rise font-mono text-xs uppercase tracking-[0.3em] text-zinc-400">
          {firstYear} – {lastYear} <span aria-hidden="true">·</span> {totalEvents} events{' '}
          <span aria-hidden="true">·</span> {eras.length} eras
        </p>
        <h1
          id="prologue-title"
          className="prologue-rise mt-6 text-6xl font-semibold leading-[0.92] tracking-[-0.04em] [animation-delay:80ms] sm:text-7xl lg:text-[8.5rem]"
        >
          The AI Timeline
        </h1>
        <p className="prologue-rise mt-8 max-w-2xl text-lg leading-8 text-zinc-300 [animation-delay:160ms] sm:text-xl sm:leading-9">
          For decades, humanity has dreamed of building minds. This is the story of that dream, told from
          the latest news back to its first spark, with each era drawn in the computer interface of its day.
        </p>

        <LatestEvents events={latest} />

        <figure className="prologue-rise mt-14 [animation-delay:240ms] sm:mt-20">
          <div className="relative pt-8">
            <BusiestYearLabel activity={activity} />
            <ActivityChart
              activity={activity}
              orientation="horizontal"
              onSelectYear={scrollToYear}
              className="h-32 sm:h-44"
            />
          </div>
          <EraAxis eras={eras} activity={activity} />
          <figcaption className="mt-6 flex flex-col gap-3 text-sm leading-6 text-zinc-400 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            {latestEra ? (
              <p>
                Events per year. {latestEra.events.length} of the {totalEvents} events happened since{' '}
                {latestEra.range[0]}.{' '}
                {/* The bars answer only the pointer, so assistive technology skips this with the chart */}
                <span aria-hidden="true">Click a bar to jump to that year.</span>
              </p>
            ) : null}
            <YearTable activity={activity} />
          </figcaption>
        </figure>

        <ol
          aria-label="Eras"
          className="prologue-rise -mx-4 mt-16 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [animation-delay:320ms] [scrollbar-width:none] sm:mx-0 sm:scroll-px-0 sm:px-0 lg:grid lg:grid-cols-6 lg:overflow-visible"
        >
          {/* In the page's order, the latest era first */}
          {newestFirst(eras).map((era) => (
            <li key={era.id} className="w-[15.5rem] shrink-0 snap-start lg:w-auto">
              <a
                href={`#${era.id}`}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 transition-colors hover:border-white/25 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <EraPreview eraInterface={era.interface} className="h-28 rounded-xl" />
                <span className="mt-3 flex items-baseline gap-2 px-1.5 text-xs text-zinc-400">
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 translate-y-[-1px] rounded-full"
                    style={{ backgroundColor: era.color }}
                  />
                  <span>
                    {era.chapter} <span aria-hidden="true">·</span>{' '}
                    <span className="whitespace-nowrap">{era.subtitle}</span>
                  </span>
                </span>
                <span className="mt-1.5 px-1.5 text-base font-semibold leading-snug text-white">{era.name}</span>
                <span className="mt-1 px-1.5 pb-1.5 text-sm text-zinc-400">
                  {era.interfaceName} <span aria-hidden="true">·</span>{' '}
                  <span className="whitespace-nowrap">{era.events.length} events</span>
                </span>
              </a>
            </li>
          ))}
        </ol>

        {latestEra ? (
          <a
            href={`#${latestEra.id}`}
            className="mt-14 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Start with the latest
            <ArrowDown aria-hidden="true" className="size-4 motion-safe:animate-bounce" />
          </a>
        ) : null}
      </div>
    </section>
  );
}

// The newest events, so the latest news is the first thing on the page. Each one jumps to its card in the timeline,
// where its description and source are, and works as a plain link to the card before the page has loaded.
function LatestEvents({ events }: { events: TimelineEvent[] }) {
  const newest = events[0];
  if (!newest) {
    return null;
  }

  const jumpToEvent = (event: MouseEvent<HTMLAnchorElement>, anchorId: string) => {
    if (scrollToEvent(anchorId)) {
      event.preventDefault();
    }
  };

  return (
    <div data-latest-events="" className="prologue-rise mt-12 [animation-delay:200ms] sm:mt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2
          id="latest-title"
          className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.3em] text-zinc-200"
        >
          <span aria-hidden="true" className="size-2 rounded-full bg-[#cf4f9a] motion-safe:animate-pulse" />
          Latest
        </h2>
        <p className="text-sm text-zinc-400">
          Through <time dateTime={eventDateTime(newest)}>{formatEventDate(newest)}</time>
        </p>
      </div>
      <ol aria-labelledby="latest-title" className="mt-4 grid gap-3 lg:grid-cols-3">
        {events.map((event) => {
          const anchorId = eventAnchorId(event);

          return (
            <li key={anchorId}>
              <a
                href={`#${anchorId}`}
                onClick={(click) => jumpToEvent(click, anchorId)}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/25 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:p-5"
              >
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
                  <time dateTime={eventDateTime(event)} className="font-medium text-zinc-200">
                    {formatEventDate(event)}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <CategoryIcon category={event.category} className="size-3.5 shrink-0" />
                    {event.category}
                  </span>
                </span>
                <span className="mt-2 text-base font-semibold leading-snug text-white text-pretty">{event.title}</span>
                <span
                  aria-hidden="true"
                  className="mt-auto inline-flex items-center gap-1 pt-3 text-xs text-zinc-500 transition-colors group-hover:text-zinc-300"
                >
                  In the timeline
                  <ArrowDown className="size-3" />
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
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
        'absolute top-0 whitespace-nowrap text-xs text-zinc-300',
        position > 0.85 ? '-translate-x-full text-right' : '-translate-x-1/2'
      )}
      style={{ left: `${position * 100}%` }}
    >
      <span className="font-semibold text-white">{busiest.total} events</span> in {busiest.year}
    </p>
  );
}

// The era bands under the chart: a colored rule across each era's years, its number and its name
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
              <span className={cn('font-mono tabular-nums text-zinc-500', isShort && !isLast && 'hidden lg:inline')}>
                {isLast ? lastYear : start}
              </span>
              <span className="hidden truncate text-zinc-300 md:inline">{isLast || isShort ? '' : era.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// The chart's numbers for readers who want them exactly, or who cannot see the bars, the latest year first
function YearTable({ activity }: { activity: YearActivity[] }) {
  const yearsWithEvents = newestFirst(activity.filter((year) => year.total > 0));

  return (
    <details className="shrink-0 sm:text-right">
      <summary className="cursor-pointer select-none font-medium text-zinc-300 underline-offset-4 hover:underline">
        Show the numbers
      </summary>
      <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-white/10 text-left">
        <table className="w-full min-w-48 text-sm">
          <caption className="sr-only">Events per year</caption>
          <thead className="sticky top-0 bg-[#141417] text-xs text-zinc-400">
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
                <td className="px-4 py-1.5 text-zinc-300">{year.year}</td>
                <td className="px-4 py-1.5 text-right text-white">{year.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
