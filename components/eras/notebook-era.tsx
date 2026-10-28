// Draws the Deep Learning Revolution as a research notebook open on a dark desk, the tool of the 2010s neural network boom, with a heading for each year.
// Each event is a code cell that records the milestone's date and title, followed by an output cell that describes it.
'use client';

import { CategoryIcon } from '@/components/ui/category-icon';
import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import { groupEventsByYear } from '@/lib/year-groups';
import type { TimelineEvent } from '@/types/timeline';
import {
  CompactEraText,
  EventHeading,
  EventSource,
  LANDMARK_LABEL,
  YearColumn,
  countOf,
  eraEventCount,
  eraHeadingId,
  eventCardAttributes,
  type EraInterfaceProps,
} from './era-parts';

// The introduction runs the notebook's first cell, so the events start at cell 2
const FIRST_EVENT_CELL = 2;

export function NotebookEra({ era, totalEvents }: EraInterfaceProps) {
  if (era.events.length === 0) {
    return (
      <div className="notebook-desk px-3 py-6 text-[#1f1f1f] sm:px-6">
        <div className="mx-auto max-w-4xl rounded-lg bg-white px-3 py-4 ring-1 ring-black/10 sm:px-6">
          <div className="notebook-cell">
            <span aria-hidden="true" className="notebook-prompt text-[#303f9f]">
              In [1]:
            </span>
            <div className="min-w-0 py-1">
              <CompactEraText
                era={era}
                totalEvents={totalEvents}
                metaClassName="text-[13px] text-[#5f5f5f]"
                headingClassName="mt-0.5 text-xl font-bold tracking-tight"
                messageClassName="mt-0.5 font-mono text-[13px] text-[#a31515]"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notebook-desk px-3 py-24 text-[#1f1f1f] sm:px-6 sm:py-32">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-lg bg-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] ring-1 ring-black/10">
        <div
          aria-hidden="true"
          className="flex items-center justify-between gap-4 border-b border-[#e0e0e0] bg-[#fafafa] px-4 py-2.5 font-mono text-xs text-[#5f5f5f] sm:px-6"
        >
          <span className="truncate">deep_learning_revolution.ipynb</span>
          <span className="flex shrink-0 items-center gap-2">
            Python 3 <span className="size-2.5 rounded-full border-2 border-[#5f5f5f]" />
          </span>
        </div>

        <div className="px-3 py-8 sm:px-6 sm:py-10">
          <header className="notebook-cell">
            <span aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm text-[#5f5f5f]">
                {era.chapter} <span aria-hidden="true">·</span> {era.subtitle}
              </p>
              <h2
                id={eraHeadingId(era)}
                tabIndex={-1}
                className="mt-2 text-3xl font-bold tracking-tight focus:outline-none sm:text-5xl"
              >
                {era.name}
              </h2>
              <p className="mt-4 text-base leading-7 text-[#333]">{era.description}</p>
              <p className="mt-3 text-sm text-[#5f5f5f]">{era.interfaceName}</p>
            </div>
          </header>

          <div className="notebook-cell mt-6">
            <span aria-hidden="true" className="notebook-prompt text-[#303f9f]">
              In [1]:
            </span>
            <p className="notebook-code">
              <span aria-hidden="true">len(</span>
              <span aria-hidden="true" className="text-[#008000]">
                events
              </span>
              <span aria-hidden="true">)</span>
            </p>
            <span aria-hidden="true" className="notebook-prompt text-[#d84315]">
              Out[1]:
            </span>
            <p className="notebook-output font-mono text-sm">{eraEventCount(era, totalEvents)}</p>
          </div>

          <ol className="mt-2">
            {groupEventsByYear(era.events).map((group) => (
              <li
                key={group.year}
                className="mt-4 border-t border-[#ececef] pt-2 first:mt-0 first:border-t-0 first:pt-0 md:grid md:grid-cols-[6.5rem_minmax(0,1fr)] md:gap-4"
              >
                <YearColumn
                  group={group}
                  className="mt-4 border-b border-[#e6e6e9] pb-2 md:border-b-0 md:border-r md:pb-0 md:pr-4 md:pt-4"
                >
                  <p className="flex items-baseline gap-3 font-mono md:block">
                    <span className="block text-base font-bold text-[#1f1f1f] md:text-xl">
                      <span className="text-[#d95926]"># </span>
                      {group.year}
                    </span>
                    <span className="block text-xs text-[#5f5f5f] md:mt-1">
                      {countOf(group.events.length, 'cell')}
                    </span>
                  </p>
                </YearColumn>
                <ol>
                  {group.events.map((event) => (
                    <li key={eventAnchorId(event)}>
                      <NotebookCell event={event} cellNumber={FIRST_EVENT_CELL + era.events.indexOf(event)} />
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>

          <div aria-hidden="true" className="notebook-cell mt-6">
            <span className="notebook-prompt text-[#303f9f]">In [ ]:</span>
            <p className="notebook-code h-9" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface NotebookCellProps {
  event: TimelineEvent;
  cellNumber: number;
}

function NotebookCell({ event, cellNumber }: NotebookCellProps) {
  return (
    <article
      {...eventCardAttributes(event)}
      className="reveal-on-scroll notebook-cell group relative mt-4 scroll-mt-[var(--timeline-sticky-offset,0px)] py-2 hover:border-l-[#2a78d6] has-[a:focus-visible]:border-l-[#2a78d6] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#2a78d6] data-[landmark]:border-l-[#d95926]"
    >
      <span aria-hidden="true" className="notebook-prompt text-[#303f9f]">
        In [{cellNumber}]:
      </span>
      <div className="notebook-code">
        <span aria-hidden="true" className="text-[#008000]">
          milestone
        </span>
        <span aria-hidden="true">(date=&quot;</span>
        <time dateTime={eventDateTime(event)} className="font-semibold text-[#ba2121]">
          {formatEventDate(event)}
        </time>
        <span aria-hidden="true">&quot;, title=</span>
        <EventHeading
          event={event}
          className="inline font-semibold text-[#ba2121]"
          linkClassName="decoration-1 underline-offset-2 group-hover:underline"
          before={<span aria-hidden="true">&quot;</span>}
          after={<span aria-hidden="true">&quot;</span>}
        />
        <span aria-hidden="true">)</span>
      </div>
      <span aria-hidden="true" className="notebook-prompt text-[#d84315]">
        Out[{cellNumber}]:
      </span>
      <div className="notebook-output">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium uppercase tracking-[0.12em] text-[#5f5f5f]">
          <CategoryIcon category={event.category} className="size-3.5 shrink-0 text-[#d95926]" />
          <span>{event.category}</span>
          {event.landmark ? (
            <span className="rounded-sm bg-[#c2410c] px-1.5 py-px font-semibold text-white">
              {LANDMARK_LABEL}
            </span>
          ) : null}
        </p>
        <p className="mt-2 text-[15px] leading-7 text-[#262626]">{event.description}</p>
        <p className="mt-1 font-mono text-xs text-[#1f5fa8]">
          <EventSource event={event} />
        </p>
      </div>
    </article>
  );
}
