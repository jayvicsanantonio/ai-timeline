// Draws the Foundation Era as an archival deck of 80-column IBM 029 punch cards organized along a Year-Cluster Spine,
// with temporal interval markers, compact Hollerith punch strips, keystone stamps, and source provenance.
'use client';

import { useId } from 'react';
import { CategoryIcon } from '@/components/ui/category-icon';
import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import {
  encodeHollerith,
  keypunchText,
  PUNCH_CARD_COLUMNS,
  PUNCH_CARD_ROWS,
} from '@/lib/hollerith';
import { groupEventsByYear, isLandmarkEvent } from '@/lib/landmarks';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/types/timeline';
import {
  CollapsedEraBanner,
  EventHeading,
  KeystoneBadge,
  SourceDomainBadge,
  eraEventCount,
  eraHeadingId,
  type EraInterfaceProps,
} from './era-parts';

// Card geometry in SVG units. Rows sit farther apart than columns, as on a real card.
const COLUMN_WIDTH = 10;
const ROW_HEIGHT = 11;
// The strip along the top edge where the keypunch printed each character above its column
const PRINT_BAND = 12;
const CARD_WIDTH = PUNCH_CARD_COLUMNS * COLUMN_WIDTH;
const CARD_HEIGHT = PRINT_BAND + PUNCH_CARD_ROWS.length * ROW_HEIGHT;
// Rows 0 to 9 have their digit printed in every column; rows 12 and 11 above them are blank
const FIRST_DIGIT_ROW = PUNCH_CARD_ROWS.indexOf('0');
const PRINTED_DIGITS = PUNCH_CARD_ROWS.slice(FIRST_DIGIT_ROW);

function padNumber(value: number) {
  return String(value).padStart(2, '0');
}

export function PunchCardEra({ era, totalEvents }: EraInterfaceProps) {
  if (era.events.length === 0) {
    return (
      <div className="punch-card-room border-b border-white/10 px-4 py-6 sm:px-6">
        <CollapsedEraBanner era={era} totalEvents={totalEvents} />
      </div>
    );
  }

  const yearClusters = groupEventsByYear(era.events);
  let runningCardIndex = 0;

  return (
    <div className="punch-card-room border-b border-white/10 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <header className="teletype-paper mx-auto max-w-3xl px-10 py-9 font-mono text-[#3a3226] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] sm:px-16 sm:py-12">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs uppercase tracking-[0.25em] text-[#5e5139]">
            <span>{era.chapter} · IBM 029 KEYPUNCH ARCHIVE</span>
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
        </header>

        <div className="mt-14 space-y-10 sm:mt-20 sm:space-y-12">
          {yearClusters.map((cluster) => (
            <div key={cluster.year} className="relative">
              {cluster.yearGap !== null && cluster.yearGap > 1 ? (
                <div
                  aria-hidden="true"
                  className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-[#c98500]/80"
                >
                  <span className="h-px w-8 bg-[#c98500]/40" />
                  <span>↕ +{cluster.yearGap} Year Interval</span>
                  <span className="h-px flex-1 bg-white/[0.06]" />
                </div>
              ) : null}

              <div className="md:grid md:grid-cols-[9.5rem_minmax(0,1fr)] md:gap-8">
                {/* Left Sticky Year Spine */}
                <div
                  aria-hidden="true"
                  className="mb-3 flex items-baseline justify-between border-b border-[#f3e9cf]/15 pb-2 md:mb-0 md:block md:border-b-0 md:border-r md:pr-6 md:pb-0"
                >
                  <div className="md:sticky md:top-[calc(var(--timeline-sticky-offset,0px)+1.5rem)]">
                    <span className="block font-mono text-2xl font-bold tracking-tight text-[#f3e9cf] sm:text-3xl">
                      {cluster.year}
                    </span>
                    <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.18em] text-[#b9aa89]">
                      {cluster.events.length} {cluster.events.length === 1 ? 'record' : 'records'}
                    </span>
                    <div className="mt-2.5 hidden grid-cols-12 gap-0.5 md:grid" title="Monthly distribution">
                      {cluster.monthCounts.map((count, monthIdx) => (
                        <span
                          key={monthIdx}
                          className={cn(
                            'h-2 rounded-[1px]',
                            count > 0 ? 'bg-[#c98500]' : 'bg-[#f3e9cf]/15'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Punch Cards */}
                <ol className="space-y-6 sm:space-y-8">
                  {cluster.events.map((event) => {
                    runningCardIndex += 1;
                    return (
                      <li key={eventAnchorId(event)}>
                        <PunchCard
                          event={event}
                          cardNumber={runningCardIndex}
                          deckSize={era.events.length}
                        />
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PunchCardProps {
  event: TimelineEvent;
  cardNumber: number;
  deckSize: number;
}

function PunchCard({ event, cardNumber, deckSize }: PunchCardProps) {
  const landmark = isLandmarkEvent(event);

  return (
    <article
      id={eventAnchorId(event)}
      data-year={event.year}
      className="reveal-on-scroll group relative scroll-mt-[var(--timeline-sticky-offset,0px)] motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-[#f3e9cf]"
    >
      <div
        className={cn(
          'punch-card bg-[#f3e9cf] px-5 pb-5 pt-5 text-[#2b2418] shadow-[0_24px_50px_-28px_rgba(0,0,0,0.95)] sm:px-7 sm:pb-6 sm:pt-5',
          landmark && 'ring-2 ring-[#9b3a26]/60'
        )}
      >
        {/* Top Stamped Telemetry Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3a3226]/20 pb-2.5 pl-3 font-mono text-xs uppercase tracking-[0.18em]">
          <div className="flex flex-wrap items-center gap-2.5">
            <time
              dateTime={eventDateTime(event)}
              className="bg-[#3a3226] px-2 py-0.5 font-bold text-[#f3e9cf]"
            >
              {formatEventDate(event)}
            </time>
            <KeystoneBadge
              event={event}
              className="border border-[#9b3a26] bg-[#9b3a26]/10 px-1.5 py-0.5 text-[#8a3121]"
            />
          </div>
          <span aria-hidden="true" className="text-[11px] text-[#6e604a]">
            Card {padNumber(cardNumber)} / {padNumber(deckSize)}
          </span>
        </div>

        <EventHeading
          event={event}
          className="mt-3 min-w-0 font-mono text-base font-bold uppercase tracking-[0.05em] text-[#1f1a12] sm:text-lg"
          linkClassName="decoration-2 underline-offset-4 group-hover:underline"
        />

        <PunchedTitle title={event.title} className="mt-3 rounded-sm border border-[#3a3226]/15 bg-[#ece0c1]/70 p-1" />

        <p className="mt-3.5 font-mono text-[13px] leading-6 text-[#3b3324] sm:text-sm sm:leading-6">
          {event.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#3a3226]/15 pt-3 font-mono text-[11px] uppercase tracking-[0.16em]">
          <span className="inline-flex items-center gap-1.5 border-[1.5px] border-[#9b3a26] px-2 py-0.5 text-[#8a3121]">
            <CategoryIcon category={event.category} className="size-3.5 shrink-0" />
            <span>{event.category}</span>
          </span>
          <SourceDomainBadge link={event.link} className="text-[#5e5139]" />
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
              y={index * ROW_HEIGHT + ROW_HEIGHT * 0.7}
              textAnchor="middle"
              fontSize={7}
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
          y={PRINT_BAND - 3}
          textAnchor="middle"
          fontSize={8}
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
            x={column * COLUMN_WIDTH + 2.25}
            y={PRINT_BAND + PUNCH_CARD_ROWS.indexOf(row) * ROW_HEIGHT + 1.5}
            width={5.5}
            height={ROW_HEIGHT - 3}
            rx={1}
            fill="#12100c"
          />
        ))
      )}
    </svg>
  );
}
