// The opening of the Turing Archive: architectural telemetry bar, editorial lockup, the Chrono-Spectrometer
// events-per-year seismograph of all of AI history, and a specimen index tile for each of the five eras.
'use client';

import { ArrowDown, Compass, Sparkles } from 'lucide-react';
import { EraPreview } from '@/components/eras/era-preview';
import { ActivityChart } from '@/components/timeline/activity-chart';
import type { Era } from '@/lib/eras';
import type { YearActivity } from '@/lib/timeline-activity';
import { scrollToYear } from '@/lib/timeline-scroll';
import { cn } from '@/lib/utils';

interface PrologueSceneProps {
  // Every era with all of its events
  eras: Era[];
  activity: YearActivity[];
  totalEvents: number;
}

export function PrologueScene({ eras, activity, totalEvents }: PrologueSceneProps) {
  const firstYear = activity[0]?.year;
  const lastYear = activity.at(-1)?.year;
  const latestEra = eras.at(-1);
  const spanYears = firstYear !== undefined && lastYear !== undefined ? lastYear - firstYear + 1 : 0;

  return (
    <section
      aria-labelledby="prologue-title"
      className="archive-grid-bg relative overflow-hidden border-b border-white/10 bg-[#09090b] px-4 pb-20 pt-14 text-white sm:px-6 sm:pt-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(54rem_26rem_at_15%_0%,rgba(201,133,0,0.14),transparent_70%),radial-gradient(50rem_24rem_at_85%_8%,rgba(144,133,233,0.16),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Top Archival Telemetry Bar */}
        <div className="prologue-rise flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 font-mono text-xs uppercase tracking-[0.26em] text-zinc-400">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
            />
            <span aria-hidden="true" className="text-zinc-300">
              Turing Archive // Chrono-Spectrometer
            </span>
          </div>
          <p>
            {firstYear} – {lastYear} <span aria-hidden="true">·</span> {totalEvents} events{' '}
            <span aria-hidden="true">·</span> {eras.length} eras
          </p>
        </div>

        {/* Editorial Title & Two-Column Monograph Header */}
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p
              aria-hidden="true"
              className="prologue-rise font-mono text-[11px] uppercase tracking-[0.32em] text-amber-400/90"
            >
               Exhibition Monograph · {spanYears}-Year Empirical Record
            </p>
            <h1
              id="prologue-title"
              className="prologue-rise mt-4 text-6xl font-semibold leading-[0.9] tracking-[-0.045em] [animation-delay:80ms] sm:text-7xl lg:text-[7.75rem]"
            >
              The AI Timeline
            </h1>
          </div>

          <div className="prologue-rise lg:col-span-4 [animation-delay:140ms]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
              <p
                aria-hidden="true"
                className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400"
              >
                <Compass className="size-3.5 text-amber-400" />
                Curatorial Thesis
              </p>
              <p className="mt-2.5 text-sm leading-6 text-zinc-300 sm:text-[15px] sm:leading-7">
                For decades, humanity has dreamed of building minds. This is the story of that dream, from its
                first spark to its living, breathing forms today, with each era drawn in the computer interface
                of its day.
              </p>
            </div>
          </div>
        </div>

        {/* Chrono-Spectrometer Console Figure */}
        <figure className="prologue-rise mt-12 rounded-3xl border border-white/10 bg-[#0d0d11]/90 p-5 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)] backdrop-blur-md [animation-delay:240ms] sm:mt-16 sm:p-8">
          <div
            aria-hidden="true"
            className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] pb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400"
          >
            <span>Fig. 01 // Annual Breakthrough Frequency ({firstYear}–{lastYear})</span>
            <span className="text-zinc-500">Click any year bar to jump to specimen</span>
          </div>

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
          <figcaption className="mt-6 flex flex-col gap-3 border-t border-white/[0.07] pt-4 text-sm leading-6 text-zinc-400 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            {latestEra ? (
              <p>
                Events per year. {latestEra.events.length} of the {totalEvents} events happened in the{' '}
                {latestEra.range[0]}s.
              </p>
            ) : null}
            <YearTable activity={activity} />
          </figcaption>
        </figure>

        {/* Five Era Specimen Index Cards */}
        <div className="mt-14 sm:mt-16">
          <div
            aria-hidden="true"
            className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400"
          >
            <span>Five Computing Substrates // Select an Era to Inspect</span>
            <span className="hidden sm:inline">Keys 1 – 5 for direct jump</span>
          </div>

          <ol
            aria-label="Eras"
            className="prologue-rise -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3.5 overflow-x-auto px-4 pb-2 [animation-delay:320ms] [scrollbar-width:none] sm:mx-0 sm:scroll-px-0 sm:px-0 lg:grid lg:grid-cols-5 lg:overflow-visible"
          >
            {eras.map((era) => {
              const sharePercent =
                totalEvents > 0 ? Math.max(4, Math.round((era.events.length / totalEvents) * 100)) : 0;

              return (
                <li key={era.id} className="w-[16rem] shrink-0 snap-start lg:w-auto">
                  <a
                    href={`#${era.id}`}
                    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#111116] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-[#16161d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <div>
                      <EraPreview
                        eraInterface={era.interface}
                        className="h-28 rounded-xl ring-1 ring-white/10"
                      />
                      <span className="mt-3.5 flex items-baseline gap-2 px-1 text-xs font-mono uppercase tracking-[0.12em] text-zinc-400">
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
                      <span className="mt-1.5 block px-1 text-base font-semibold leading-snug text-white group-hover:text-amber-50">
                        {era.name}
                      </span>
                    </div>

                    <div className="mt-3 px-1 pb-1">
                      <span className="block text-xs text-zinc-400">
                        {era.interfaceName} <span aria-hidden="true">·</span> {era.events.length} events
                      </span>
                      <span
                        aria-hidden="true"
                        className="mt-2.5 block h-1 w-full overflow-hidden rounded-full bg-white/[0.07]"
                      >
                        <span
                          className="block h-full rounded-full transition-all duration-300"
                          style={{ width: `${sharePercent}%`, backgroundColor: era.color }}
                        />
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Footer CTA & Curatorial Legend */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
          {eras[0] && firstYear !== undefined ? (
            <a
              href={`#${eras[0].id}`}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/[0.06] px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:border-white/40 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Begin in {firstYear}
              <ArrowDown aria-hidden="true" className="size-4 motion-safe:animate-bounce" />
            </a>
          ) : null}

          <p
            aria-hidden="true"
            className="flex items-center gap-2 font-mono text-xs text-zinc-400"
          >
            <Sparkles className="size-3.5 text-amber-400" />
            <span>Keystone breakthroughs are stamped across every era spine</span>
          </p>
        </div>
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
        'absolute top-0 whitespace-nowrap font-mono text-xs text-zinc-300',
        position > 0.85 ? '-translate-x-full text-right' : '-translate-x-1/2'
      )}
      style={{ left: `${position * 100}%` }}
    >
      <span className="rounded bg-white/10 px-1.5 py-0.5 font-semibold text-white">
        {busiest.total} events
      </span>{' '}
      in {busiest.year}
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
    <div aria-hidden="true" className="mt-2.5 flex gap-[2px]">
      {eras.map((era, index) => {
        const start = Math.max(era.range[0], firstYear);
        const end = Math.min(era.range[1] - 1, lastYear);
        const isLast = index === eras.length - 1;

        return (
          <div key={era.id} className="min-w-0" style={{ flexGrow: end - start + 1, flexBasis: 0 }}>
            <div className="h-1 rounded-full" style={{ backgroundColor: era.color }} />
            <div className={cn('mt-2 flex items-baseline gap-1.5 text-xs', isLast && 'justify-end')}>
              <span className="font-mono tabular-nums text-zinc-400">{isLast ? lastYear : start}</span>
              <span className="hidden truncate text-zinc-300 md:inline">{isLast ? '' : era.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// The chart's numbers for readers who want them exactly, or who cannot see the bars
function YearTable({ activity }: { activity: YearActivity[] }) {
  const yearsWithEvents = activity.filter((year) => year.total > 0);

  return (
    <details className="shrink-0 sm:text-right">
      <summary className="cursor-pointer select-none font-mono text-xs uppercase tracking-[0.16em] text-zinc-300 underline-offset-4 hover:text-white hover:underline">
        Show the numbers
      </summary>
      <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-[#121217] text-left">
        <table className="w-full min-w-48 text-sm">
          <caption className="sr-only">Events per year</caption>
          <thead className="sticky top-0 bg-[#18181f] font-mono text-xs uppercase tracking-wider text-zinc-400">
            <tr>
              <th scope="col" className="px-4 py-2 text-left font-medium">
                Year
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium">
                Events
              </th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
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
