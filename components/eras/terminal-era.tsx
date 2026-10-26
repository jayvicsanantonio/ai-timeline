// Draws the Knowledge Era as a session on a P31 green-phosphor terminal with a Year-Cluster Bus Gutter,
// temporal interval markers (AI Winter gaps), keystone flags, and source provenance.
'use client';

import { CategoryIcon } from '@/components/ui/category-icon';
import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
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

export function TerminalEra({ era, totalEvents }: EraInterfaceProps) {
  if (era.events.length === 0) {
    return (
      <div className="border-b border-white/10 bg-[#020503] px-3 py-6 sm:px-6">
        <CollapsedEraBanner era={era} totalEvents={totalEvents} />
      </div>
    );
  }

  const yearClusters = groupEventsByYear(era.events);

  return (
    <div className="border-b border-white/10 bg-[#020503] px-3 py-20 sm:px-6 sm:py-28">
      <div className="crt-screen crt-scanlines mx-auto max-w-5xl rounded-[1.75rem] border border-[#173b26] bg-[#04100a] px-5 py-8 font-mono text-[#5cf09a] sm:rounded-[2.5rem] sm:px-12 sm:py-14">
        <header>
          <p
            aria-hidden="true"
            className="flex flex-wrap justify-between gap-x-4 border-b border-[#1d5236] pb-3 text-[11px] uppercase tracking-[0.25em] text-[#38b874]"
          >
            <span>DEC VT-100 // KNOWLEDGE BASE TERMINAL</span>
            <span>MEM 64K OK · BAUD 9600</span>
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

        <div className="mt-10 border-b border-dashed border-[#1d5236]">
          {yearClusters.map((cluster) => (
            <div key={cluster.year} className="border-t border-dashed border-[#1d5236] py-6">
              {cluster.yearGap !== null && cluster.yearGap > 1 ? (
                <p
                  aria-hidden="true"
                  className="mb-5 inline-flex items-center gap-2 border border-[#1d5236] bg-[#071f13] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#38b874]"
                >
                  <span>SYS.WAIT // +{cluster.yearGap} YEAR INTERVAL</span>
                </p>
              ) : null}

              <div className="md:grid md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-8">
                <div
                  aria-hidden="true"
                  className="mb-3 flex items-baseline justify-between md:mb-0 md:block md:border-r md:border-dashed md:border-[#1d5236] md:pr-5"
                >
                  <div className="md:sticky md:top-[calc(var(--timeline-sticky-offset,0px)+1.5rem)]">
                    <span className="crt-glow block text-2xl font-bold text-[#9dffc4]">
                      {cluster.year}
                    </span>
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.18em] text-[#38b874]">
                      0x{cluster.year.toString(16).toUpperCase()} · {cluster.events.length} REC
                    </span>
                  </div>
                </div>

                <ol className="divide-y divide-dashed divide-[#1d5236]/70">
                  {cluster.events.map((event) => (
                    <li key={eventAnchorId(event)} className="first:pt-0 last:pb-0 py-5">
                      <TerminalRecord event={event} />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>

        <p aria-hidden="true" className="mt-8 text-sm text-[#38b874]">
          &gt; <span className="terminal-caret">█</span>
        </p>
      </div>
    </div>
  );
}

function TerminalRecord({ event }: { event: TimelineEvent }) {
  const landmark = isLandmarkEvent(event);

  return (
    <article
      id={eventAnchorId(event)}
      data-year={event.year}
      className={cn(
        'reveal-on-scroll group relative scroll-mt-[var(--timeline-sticky-offset,0px)] rounded-lg px-3 py-2 transition-colors hover:bg-[#082014] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#9dffc4]',
        landmark && 'border-l-2 border-[#5cf09a] bg-[#071c12]/80 pl-4'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.2em] text-[#38b874]">
        <p className="flex items-center gap-2.5">
          <span aria-hidden="true">&gt; RECALL </span>
          <time dateTime={eventDateTime(event)} className="font-bold text-[#9dffc4]">
            {formatEventDate(event)}
          </time>
          <KeystoneBadge
            event={event}
            className="border border-[#5cf09a]/60 bg-[#5cf09a]/15 px-1.5 py-0.5 text-[#9dffc4]"
          />
        </p>
        <SourceDomainBadge link={event.link} className="text-[#38b874]" />
      </div>

      <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <EventHeading
          event={event}
          className="min-w-0 text-base font-bold uppercase leading-snug tracking-[0.04em] text-[#9dffc4] sm:text-lg"
          linkClassName="crt-glow -mx-1 px-1 group-hover:bg-[#5cf09a] group-hover:text-[#03140a] group-hover:[text-shadow:none]"
        />
        <p className="inline-flex shrink-0 items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-[#38b874] sm:pt-1">
          <span aria-hidden="true">[</span>
          <CategoryIcon category={event.category} className="size-3.5 shrink-0" />
          <span>{event.category}</span>
          <span aria-hidden="true">]</span>
        </p>
      </div>
      <p className="mt-2.5 max-w-3xl text-sm leading-7 text-[#5cf09a]">{event.description}</p>
    </article>
  );
}
