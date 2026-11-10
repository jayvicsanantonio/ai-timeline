// The world map, after the opening: the six regions of the journey along one route, each with its badge, its place name,
// its era and years and how many entries it holds, linking to its signpost; and a slim chart of how many entries every year
// holds, with each region's stretch of years marked beneath it.
'use client';

import { ActivityChart } from '@/components/timeline/activity-chart';
import { Sprite } from '@/components/ui/sprite';
import { badgePath } from '@/lib/dex';
import type { Era } from '@/lib/eras';
import type { YearActivity } from '@/lib/timeline-activity';
import { scrollToYear } from '@/lib/timeline-scroll';
import { cn } from '@/lib/utils';

interface WorldMapProps {
  // Every era with all of its events, in time order
  eras: Era[];
  activity: YearActivity[];
  totalEvents: number;
}

export function WorldMap({ eras, activity, totalEvents }: WorldMapProps) {
  const latestEra = eras.at(-1);

  return (
    <section aria-labelledby="world-map-title" className="bg-background px-4 pb-6 pt-14 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-pixel text-[0.625rem] uppercase text-[#7d84a6]">World map</p>
        <h2 id="world-map-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {eras.length} regions, one route
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#a7acc8]">
          Every era of AI is a region you walk through, from the meadow where it began to the summit where it stands now.
          Each ends in a gym challenge: answer it to earn the region&rsquo;s badge.
        </p>

        <ol aria-label="Eras" className="world-route mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:gap-2">
          {eras.map((era) => (
            <li key={era.id} className="world-stop relative">
              <a
                href={`#${era.id}`}
                data-biome={era.biome}
                className="world-stop-link flex h-full items-center gap-3 rounded-2xl p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcb05] lg:flex-col lg:items-start lg:p-4"
              >
                <Sprite src={badgePath(era.badge)} className="size-10 shrink-0 object-contain" />
                <span className="min-w-0">
                  <span className="block font-pixel text-[0.5rem] uppercase text-[#f4e3b5]">Route {era.index + 1}</span>
                  <span className="mt-1 block font-pixel text-[0.625rem] uppercase leading-4 text-white">{era.place}</span>
                  <span className="mt-2 block text-sm font-medium leading-5 text-white">{era.label}</span>
                  <span className="block whitespace-nowrap text-xs text-[#a7acc8]">{era.subtitle}</span>
                  <span className="block text-xs text-[#7d84a6]">{era.events.length} entries</span>
                </span>
              </a>
            </li>
          ))}
        </ol>

        <figure className="mt-10">
          <div className="relative pt-7">
            <BusiestYearLabel activity={activity} />
            <ActivityChart activity={activity} orientation="horizontal" onSelectYear={scrollToYear} className="h-14 sm:h-16" />
          </div>
          <EraAxis eras={eras} activity={activity} />
          <figcaption className="mt-4 flex flex-col gap-3 text-sm leading-6 text-[#a7acc8] sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            {latestEra ? (
              <p>
                Entries per year. {latestEra.events.length} of the {totalEvents} events happened since {latestEra.range[0]}.{' '}
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
