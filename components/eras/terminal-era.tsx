// Draws the Knowledge Era as a session on a green-phosphor terminal, the screen of the expert-system years, listing its records
// newest first, grouped by year.
// Each event is recalled at a command prompt that prints its date, with its title, category, description and source.
'use client';

import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import { groupEventsByYear } from '@/lib/year-groups';
import type { TimelineEvent } from '@/types/timeline';
import {
  EventHeading,
  EventSource,
  LANDMARK_LABEL,
  YearColumn,
  YearGap,
  eventCardAttributes,
  type EraInterfaceProps,
} from './era-parts';

export function TerminalEra({ era }: EraInterfaceProps) {
  const years = groupEventsByYear(era.events);

  return (
    <div data-era-backdrop="" className="terminal-room px-3 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
      <div className="crt-screen crt-scanlines mx-auto max-w-4xl rounded-[1.75rem] border border-[#173b26] bg-[#04100a] px-5 py-8 font-mono text-[#5cf09a] sm:rounded-[2.5rem] sm:px-12 sm:py-12">
        <div aria-hidden="true">
          <p className="flex flex-wrap justify-between gap-x-4 border-b border-[#1d5236] pb-3 text-[11px] uppercase tracking-[0.25em] text-[#38b874]">
            <span>Knowledge base terminal</span>
            <span>Mem 64K OK</span>
          </p>
          <p className="mt-4 text-sm text-[#38b874]">
            READY.
            <br />
            &gt; LIST {era.label.toUpperCase().replace(/\s+/g, '.')}, NEWEST FIRST
          </p>
        </div>

        <ol className="mt-6 border-b border-dashed border-[#1d5236]">
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

function TerminalRecord({ event }: { event: TimelineEvent }) {
  return (
    <article
      {...eventCardAttributes(event)}
      className="reveal-on-scroll group relative scroll-mt-[var(--timeline-sticky-offset,0px)] py-6 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#9dffc4]"
    >
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.2em] text-[#38b874]">
        <span>
          <span aria-hidden="true">&gt; RECALL </span>
          <time dateTime={eventDateTime(event)} className="crt-glow text-sm font-bold text-[#9dffc4]">
            {formatEventDate(event)}
          </time>
        </span>
        {event.landmark ? (
          <span className="bg-[#5cf09a] px-1.5 font-bold text-[#03140a]">{LANDMARK_LABEL}</span>
        ) : null}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <EventHeading
          event={event}
          className="min-w-0 text-base font-bold uppercase leading-snug tracking-[0.04em] text-[#9dffc4] sm:text-lg"
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
