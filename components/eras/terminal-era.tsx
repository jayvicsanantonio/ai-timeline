// Draws the Knowledge Era as a session on a green-phosphor terminal, the screen of the expert-system years, its records grouped by year.
// Each event is recalled at a command prompt that prints its date, with its title, category, description and source.
'use client';

import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import { cn } from '@/lib/utils';
import { groupEventsByYear } from '@/lib/year-groups';
import type { TimelineEvent } from '@/types/timeline';
import {
  CompactEraText,
  EventHeading,
  EventSource,
  LANDMARK_LABEL,
  TurningPoints,
  YearColumn,
  YearGap,
  eraEventCount,
  eraHeadingId,
  eventCardAttributes,
  type EraInterfaceProps,
} from './era-parts';

export function TerminalEra({ era, totalEvents }: EraInterfaceProps) {
  if (era.events.length === 0) {
    return (
      <div className="terminal-room px-3 py-6 sm:px-6">
        <div className="crt-scanlines mx-auto max-w-4xl rounded-2xl border border-[#173b26] bg-[#04100a] px-5 py-4 font-mono text-[#5cf09a] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] sm:px-8">
          <CompactEraText
            era={era}
            totalEvents={totalEvents}
            metaClassName="text-[11px] uppercase tracking-[0.2em] text-[#38b874]"
            headingClassName="crt-glow mt-1 text-xl font-bold uppercase tracking-[0.04em] text-[#9dffc4]"
            messageClassName="mt-1 text-xs uppercase tracking-[0.12em]"
          />
        </div>
      </div>
    );
  }

  const years = groupEventsByYear(era.events);

  return (
    <div className="terminal-room px-3 py-24 sm:px-6 sm:py-32">
      <div className="crt-screen crt-scanlines mx-auto max-w-4xl rounded-[1.75rem] border border-[#173b26] bg-[#04100a] px-5 py-8 font-mono text-[#5cf09a] sm:rounded-[2.5rem] sm:px-12 sm:py-14">
        <header>
          <p
            aria-hidden="true"
            className="flex flex-wrap justify-between gap-x-4 border-b border-[#1d5236] pb-3 text-[11px] uppercase tracking-[0.25em] text-[#38b874]"
          >
            <span>Knowledge base terminal</span>
            <span>Mem 64K OK</span>
          </p>
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-[#38b874]">
            {era.chapter} <span aria-hidden="true">·</span> {era.subtitle}
          </p>
          <p aria-hidden="true" className="mt-2 text-sm text-[#38b874]">
            READY.
            <br />
            &gt; RUN {era.label.toUpperCase().replace(/\s+/g, '.')}
          </p>
          <h2
            id={eraHeadingId(era)}
            tabIndex={-1}
            className="crt-glow mt-6 text-3xl font-bold uppercase leading-tight tracking-[0.04em] text-[#9dffc4] focus:outline-none sm:text-5xl"
          >
            {era.name}
          </h2>
          <p className="mt-6 max-w-3xl text-sm leading-7 text-[#5cf09a] sm:text-base sm:leading-8">
            {era.description}
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.25em] text-[#38b874]">
            {eraEventCount(era, totalEvents)} found <span aria-hidden="true">·</span>{' '}
            {era.interfaceName}
          </p>
          {/* The session lists its priority records before recalling them all */}
          <TurningPoints
            era={era}
            className="mt-8 border-t border-dashed border-[#1d5236] pt-5"
            labelClassName="text-xs uppercase tracking-[0.2em] text-[#38b874]"
            marker="> LIST PRIORITY · "
            listClassName="mt-3 space-y-1 text-sm uppercase tracking-[0.04em]"
            linkClassName="crt-glow -mx-1 px-1 font-bold text-[#9dffc4] hover:bg-[#5cf09a] hover:text-[#03140a] hover:[text-shadow:none] focus-visible:bg-[#5cf09a] focus-visible:text-[#03140a] focus-visible:outline-none focus-visible:[text-shadow:none]"
            yearClassName="mr-3"
          />
        </header>

        <ol className="mt-10 border-b border-dashed border-[#1d5236]">
          {years.map((group, index) => (
            <li key={group.year} className="border-t border-dashed border-[#1d5236]">
              <YearGap
                events={years}
                index={index}
                className="border-b border-dashed border-[#1d5236] py-3 text-xs uppercase tracking-[0.2em] text-[#38b874]"
              />
              <div className="md:grid md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-6">
                <YearColumn
                  group={group}
                  className="mt-5 border-b border-dashed border-[#1d5236] pb-2 md:mt-0 md:border-b-0 md:border-r md:pb-0 md:pr-5 md:pt-6"
                >
                  <div className="flex items-baseline gap-3 md:block">
                    <p className="crt-glow text-lg font-bold text-[#9dffc4] md:text-2xl">{group.year}</p>
                    <p className="text-[11px] tracking-[0.18em] text-[#38b874] md:mt-1">
                      0X{group.year.toString(16).toUpperCase()} · {group.events.length} REC
                    </p>
                  </div>
                </YearColumn>
                <ol className="divide-y divide-dashed divide-[#1d5236]">
                  {group.events.map((event) => (
                    <li key={eventAnchorId(event)}>
                      <TerminalRecord event={event} />
                    </li>
                  ))}
                </ol>
              </div>
            </li>
          ))}
        </ol>

        <p aria-hidden="true" className="mt-8 text-sm text-[#38b874]">
          &gt; <span className="terminal-caret">█</span>
        </p>
      </div>
    </div>
  );
}

// A landmark is printed as a priority record: boxed in a double rule under a bar in inverse video, as
// terminals flagged the records that mattered most, with a larger title.
function TerminalRecord({ event }: { event: TimelineEvent }) {
  return (
    <article
      {...eventCardAttributes(event)}
      className={cn(
        'reveal-on-scroll group relative scroll-mt-[var(--timeline-sticky-offset,0px)] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#9dffc4]',
        event.landmark
          ? 'my-6 border-[3px] border-double border-[#5cf09a]/80 px-4 pb-6 shadow-[0_0_32px_-8px_rgba(92,240,154,0.45)] sm:px-6'
          : 'py-6'
      )}
    >
      {event.landmark ? (
        <p className="-mx-4 mb-5 flex flex-wrap items-center justify-between gap-x-4 bg-[#5cf09a] px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-[#03140a] sm:-mx-6 sm:px-6">
          <span aria-hidden="true">
            *** Priority<span className="hidden sm:inline"> record</span> ***
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true">★</span>
            <span>{LANDMARK_LABEL}</span>
          </span>
        </p>
      ) : null}
      <p className="text-xs uppercase tracking-[0.2em] text-[#38b874]">
        <span aria-hidden="true">&gt; RECALL </span>
        <time dateTime={eventDateTime(event)} className="crt-glow text-sm font-bold text-[#9dffc4]">
          {formatEventDate(event)}
        </time>
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <EventHeading
          event={event}
          className={cn(
            'min-w-0 font-bold uppercase leading-snug tracking-[0.04em] text-[#9dffc4]',
            event.landmark ? 'text-lg sm:text-2xl' : 'text-base sm:text-lg'
          )}
          linkClassName="crt-glow -mx-1 px-1 group-hover:bg-[#5cf09a] group-hover:text-[#03140a] group-hover:[text-shadow:none]"
        />
        <p className="shrink-0 text-xs uppercase tracking-[0.15em] text-[#38b874] sm:pt-1">
          <span aria-hidden="true">[</span>
          <span>{event.category}</span>
          <span aria-hidden="true">]</span>
        </p>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5cf09a]">{event.description}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.15em] text-[#38b874]">
        <span aria-hidden="true">SRC </span>
        <EventSource event={event} />
      </p>
    </article>
  );
}
