// Draws the Foundation Era as a deck of 80-column punch cards under a teletype printout, grouped beside each year's label.
// Each card leads with its date, then carries its title punched in IBM 029 Hollerith code, its description and source.
'use client';

import { useId } from 'react';
import { CategoryIcon } from '@/components/ui/category-icon';
import { eventAnchorId, eventDateTime, formatEventDate, MONTHS } from '@/lib/event-format';
import {
  encodeHollerith,
  keypunchText,
  PUNCH_CARD_COLUMNS,
  PUNCH_CARD_ROWS,
} from '@/lib/hollerith';
import { cn } from '@/lib/utils';
import { countEventsByMonth, groupEventsByYear } from '@/lib/year-groups';
import type { TimelineEvent } from '@/types/timeline';
import {
  CompactEraText,
  EventHeading,
  EventSource,
  LANDMARK_LABEL,
  TurningPoints,
  YearColumn,
  YearGap,
  countOf,
  eraEventCount,
  eraHeadingId,
  eventCardAttributes,
  type EraInterfaceProps,
} from './era-parts';

// Card geometry in SVG units. Rows sit farther apart than columns, as on a real card, but closer
// than on paper, so the strip stays shallow beside the card's text.
const COLUMN_WIDTH = 10;
const ROW_HEIGHT = 9;
// The strip along the top edge where the keypunch printed each character above its column
const PRINT_BAND = 10;
const CARD_WIDTH = PUNCH_CARD_COLUMNS * COLUMN_WIDTH;
const CARD_HEIGHT = PRINT_BAND + PUNCH_CARD_ROWS.length * ROW_HEIGHT;
const HOLE_WIDTH = 4.5;
// Rows 0 to 9 have their digit printed in every column; rows 12 and 11 above them are blank
const FIRST_DIGIT_ROW = PUNCH_CARD_ROWS.indexOf('0');
const PRINTED_DIGITS = PUNCH_CARD_ROWS.slice(FIRST_DIGIT_ROW);

export function PunchCardEra({ era, totalEvents }: EraInterfaceProps) {
  if (era.events.length === 0) {
    return (
      <div className="punch-card-room px-4 py-6 sm:px-6">
        <div className="teletype-paper mx-auto max-w-3xl px-10 py-4 font-mono text-[#3a3226] sm:px-16">
          <CompactEraText
            era={era}
            totalEvents={totalEvents}
            metaClassName="text-[11px] uppercase tracking-[0.2em] text-[#5e5139]"
            headingClassName="mt-1 text-xl font-bold uppercase tracking-tight text-[#1f1a12]"
            messageClassName="mt-1 text-xs uppercase tracking-[0.12em]"
          />
        </div>
      </div>
    );
  }

  const years = groupEventsByYear(era.events);

  return (
    <div className="punch-card-room px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <header className="teletype-paper mx-auto max-w-3xl px-10 py-9 font-mono text-[#3a3226] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] sm:px-16 sm:py-12">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs uppercase tracking-[0.25em] text-[#5e5139]">
            <span>{era.chapter}</span>
            <span>{era.subtitle}</span>
          </div>
          <h2
            id={eraHeadingId(era)}
            tabIndex={-1}
            className="mt-6 border-y-4 border-double border-[#3a3226]/70 py-4 text-3xl font-bold uppercase leading-none tracking-tight text-[#1f1a12] focus:outline-none sm:text-5xl"
          >
            {era.name}
          </h2>
          <p className="mt-6 text-sm leading-7 sm:text-base sm:leading-8">{era.description}</p>
          <p className="mt-6 text-xs uppercase tracking-[0.25em] text-[#5e5139]">
            {eraEventCount(era, totalEvents)} <span aria-hidden="true">·</span>{' '}
            {era.interfaceName}
          </p>
          {/* Printed on the teletype as the run's index of its marked cards */}
          <TurningPoints
            era={era}
            className="mt-8 border-t-2 border-dashed border-[#3a3226]/35 pt-5"
            labelClassName="text-xs uppercase tracking-[0.25em] text-[#a63a28]"
            marker="★ "
            listClassName="mt-3 space-y-1.5 text-sm uppercase tracking-[0.06em]"
            linkClassName="font-semibold text-[#1f1a12] decoration-2 underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a3226]"
            yearClassName="mr-3 text-[#a63a28]"
          />
        </header>

        <ol className="mt-14 space-y-8 sm:mt-20 sm:space-y-10">
          {years.map((group, index) => (
            <li key={group.year}>
              <YearGap
                events={years}
                index={index}
                className="mb-8 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.3em] text-[#b9aa89] before:h-px before:flex-1 before:bg-[#b9aa89]/30 after:h-px after:flex-1 after:bg-[#b9aa89]/30 sm:mb-10"
              />
              <div className="md:grid md:grid-cols-[8rem_minmax(0,1fr)] md:gap-8">
                <YearColumn
                  group={group}
                  className="mb-4 border-b border-dashed border-[#f3e9cf]/20 pb-2 md:mb-0 md:border-b-0 md:border-r md:pb-0 md:pr-6"
                >
                  <div className="flex items-baseline gap-3 font-mono md:block">
                    <p className="text-lg font-bold text-[#f3e9cf] md:text-3xl">{group.year}</p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#b9aa89] md:mt-1">
                      {countOf(group.events.length, 'record')}
                    </p>
                    <MonthSquares events={group.events} className="mt-3 hidden md:grid" />
                  </div>
                </YearColumn>
                <ol className="space-y-8 sm:space-y-10">
                  {group.events.map((event) => (
                    <li key={eventAnchorId(event)}>
                      <PunchCard event={event} />
                    </li>
                  ))}
                </ol>
              </div>
            </li>
          ))}
        </ol>

        {/* The teletype's last line once the deck has run, the way a job's printout ended */}
        <p
          aria-hidden="true"
          className="teletype-paper mx-auto mt-16 max-w-3xl px-10 py-4 text-center font-mono text-xs uppercase tracking-[0.3em] text-[#3a3226] sm:mt-20 sm:px-16"
        >
          <span>***</span> <span>END OF JOB</span> <span>***</span>
        </p>
      </div>
    </div>
  );
}

// The year's twelve months as squares, filled where the year has cards, like a row of punched holes
function MonthSquares({ events, className }: { events: TimelineEvent[]; className?: string }) {
  return (
    <div className={cn('grid-cols-12 gap-0.5', className)}>
      {countEventsByMonth(events).map((count, index) => (
        <span
          key={MONTHS[index]}
          data-month-square={MONTHS[index]}
          data-count={count}
          className={cn('h-2 rounded-[1px]', count > 0 ? 'bg-[#c98500]' : 'bg-[#f3e9cf]/15')}
        />
      ))}
    </div>
  );
}

function PunchCard({ event }: { event: TimelineEvent }) {
  return (
    <article
      {...eventCardAttributes(event)}
      className="reveal-on-scroll group relative scroll-mt-[var(--timeline-sticky-offset,0px)] motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-[#f3e9cf]"
    >
      <div className="punch-card bg-[#f3e9cf] px-5 pb-5 pt-5 text-[#2b2418] shadow-[0_24px_50px_-28px_rgba(0,0,0,0.95)] sm:px-8 sm:pb-6 sm:pt-6">
        {/* Colored stripes marked special cards in a deck */}
        {event.landmark ? (
          <p className="-mx-5 -mt-5 mb-4 flex h-7 items-center justify-end gap-2 bg-[#a63a28] px-5 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[#fbefd5] [grid-area:stripe] sm:-mx-8 sm:-mt-6 sm:px-8">
            <span aria-hidden="true">★</span>
            <span>{LANDMARK_LABEL}</span>
          </p>
        ) : null}

        <div className="pl-4 font-mono uppercase [grid-area:heading] sm:pl-3">
          <time
            dateTime={eventDateTime(event)}
            className="block text-lg font-bold tracking-[0.12em] text-[#1f1a12] sm:text-xl"
          >
            {formatEventDate(event)}
          </time>
          <EventHeading
            event={event}
            className="mt-1 text-sm font-semibold tracking-[0.06em] text-[#3b3324] sm:text-base lg:text-balance"
            linkClassName="decoration-2 underline-offset-4 group-hover:underline"
          />
        </div>

        <PunchedTitle title={event.title} className="mt-3 [grid-area:holes]" />

        <p className="mt-4 font-mono text-[13px] leading-6 text-[#3b3324] [grid-area:description] sm:text-sm sm:leading-6">
          {event.description}
        </p>

        {/* From 1024px these sit beside the date and title, stacked against the card's right edge */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.16em] [grid-area:fields] lg:mt-1 lg:flex-col lg:items-end lg:justify-start lg:gap-2.5">
          <span className="inline-flex items-center gap-1.5 border-[1.5px] border-[#9b3a26] px-2 py-1 text-[#8a3121]">
            <CategoryIcon category={event.category} className="size-3.5 shrink-0" />
            <span>{event.category}</span>
          </span>
          <EventSource event={event} className="text-[#5e5139]" />
        </div>
      </div>
    </article>
  );
}

// The title's keypunched columns: printed characters along the top edge, the card's
// printed digit grid, and the holes the 029 code punches for each character.
export function PunchedTitle({ title, className }: { title: string; className?: string }) {
  const digitPatternId = useId();
  const printed = Array.from(keypunchText(title));
  const columns = encodeHollerith(title);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
      className={cn('block h-auto w-full', className)}
    >
      <defs>
        <pattern
          id={digitPatternId}
          x={0}
          y={PRINT_BAND + FIRST_DIGIT_ROW * ROW_HEIGHT}
          width={COLUMN_WIDTH}
          height={PRINTED_DIGITS.length * ROW_HEIGHT}
          patternUnits="userSpaceOnUse"
        >
          {PRINTED_DIGITS.map((digit, index) => (
            <text
              key={digit}
              x={COLUMN_WIDTH / 2}
              y={index * ROW_HEIGHT + ROW_HEIGHT * 0.72}
              textAnchor="middle"
              fontSize={6}
              fontFamily="ui-monospace, monospace"
              fill="#b29f76"
            >
              {digit}
            </text>
          ))}
        </pattern>
      </defs>

      {printed.map((character, column) => (
        <text
          key={column}
          x={column * COLUMN_WIDTH + COLUMN_WIDTH / 2}
          y={PRINT_BAND - 2.5}
          textAnchor="middle"
          fontSize={7}
          fontFamily="ui-monospace, monospace"
          fill="#4a3f2c"
        >
          {character}
        </text>
      ))}

      <rect
        x={0}
        y={PRINT_BAND + FIRST_DIGIT_ROW * ROW_HEIGHT}
        width={CARD_WIDTH}
        height={PRINTED_DIGITS.length * ROW_HEIGHT}
        fill={`url(#${digitPatternId})`}
      />

      {columns.flatMap((rows, column) =>
        rows.map((row) => (
          <rect
            key={`${column}-${row}`}
            data-hole=""
            x={column * COLUMN_WIDTH + (COLUMN_WIDTH - HOLE_WIDTH) / 2}
            y={PRINT_BAND + PUNCH_CARD_ROWS.indexOf(row) * ROW_HEIGHT + 1.5}
            width={HOLE_WIDTH}
            height={ROW_HEIGHT - 3}
            rx={1}
            fill="#101318"
          />
        ))
      )}
    </svg>
  );
}
