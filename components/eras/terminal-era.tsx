// Draws the Knowledge Era as a session on a green-phosphor terminal, the screen of the expert-system years.
// Each event is recalled at a command prompt that prints its date, with its title, category, description and source.
'use client';

import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import type { TimelineEvent } from '@/types/timeline';
import {
  CompactEraText,
  EventHeading,
  EventSource,
  LANDMARK_LABEL,
  YearGap,
  eraEventCount,
  eraHeadingId,
  eventCardAttributes,
  type EraInterfaceProps,
} from './era-parts';

export function TerminalEra({ era, totalEvents }: EraInterfaceProps) {
  if (era.events.length === 0) {
    return (
      <div className="bg-[#020503] px-3 py-6 sm:px-6">
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

  return (
    <div className="bg-[#020503] px-3 py-24 sm:px-6 sm:py-32">
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
        </header>

        <ol className="mt-10 border-b border-dashed border-[#1d5236]">
          {era.events.map((event, index) => (
            <li key={eventAnchorId(event)}>
              <YearGap
                events={era.events}
                index={index}
                className="border-t border-dashed border-[#1d5236] py-3 text-xs uppercase tracking-[0.2em] text-[#38b874]"
              />
              <TerminalRecord event={event} />
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
      className="reveal-on-scroll group relative scroll-mt-[var(--timeline-sticky-offset,0px)] border-t border-dashed border-[#1d5236] py-6 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#9dffc4]"
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
