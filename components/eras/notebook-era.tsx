// Draws the Deep Learning Revolution as a research notebook, the tool of the 2010s neural network boom.
// Each event is a code cell that records the milestone, followed by an output cell that describes it.
'use client';

import { CategoryIcon } from '@/components/ui/category-icon';
import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import type { TimelineEvent } from '@/types/timeline';
import {
  EventHeading,
  NO_MATCHING_EVENTS,
  eraEventCount,
  eraHeadingId,
  type EraInterfaceProps,
} from './era-parts';

// The introduction runs the notebook's first cell, so the events start at cell 2
const FIRST_EVENT_CELL = 2;

export function NotebookEra({ era, totalEvents }: EraInterfaceProps) {
  return (
    <div className="bg-[#e9e9e7] px-3 py-24 text-[#1f1f1f] sm:px-6 sm:py-32">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-lg bg-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)] ring-1 ring-black/10">
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

          {era.events.length > 0 ? (
            <ol className="mt-2">
              {era.events.map((event, index) => (
                <li key={eventAnchorId(event)}>
                  <NotebookCell event={event} cellNumber={FIRST_EVENT_CELL + index} />
                </li>
              ))}
            </ol>
          ) : (
            <p className="notebook-cell mt-6">
              <span aria-hidden="true" />
              <span className="font-mono text-sm text-[#a31515]">{NO_MATCHING_EVENTS}</span>
            </p>
          )}

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
      id={eventAnchorId(event)}
      data-year={event.year}
      className="reveal-on-scroll notebook-cell group relative mt-4 scroll-mt-[var(--timeline-sticky-offset,0px)] py-2 hover:border-l-[#2a78d6] has-[a:focus-visible]:border-l-[#2a78d6] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#2a78d6]"
    >
      <span aria-hidden="true" className="notebook-prompt text-[#303f9f]">
        In [{cellNumber}]:
      </span>
      <div className="notebook-code">
        <span aria-hidden="true" className="text-[#008000]">
          milestone
        </span>
        <span aria-hidden="true">(</span>
        <EventHeading
          event={event}
          className="inline font-semibold text-[#ba2121]"
          linkClassName="decoration-1 underline-offset-2 group-hover:underline"
          before={<span aria-hidden="true">&quot;</span>}
          after={<span aria-hidden="true">&quot;</span>}
        />
        <span aria-hidden="true">
          , date=<span className="text-[#ba2121]">&quot;{eventDateTime(event)}&quot;</span>)
        </span>
      </div>
      <span aria-hidden="true" className="notebook-prompt text-[#d84315]">
        Out[{cellNumber}]:
      </span>
      <div className="notebook-output">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium uppercase tracking-[0.12em] text-[#5f5f5f]">
          <CategoryIcon category={event.category} className="size-3.5 shrink-0 text-[#d95926]" />
          <span>{event.category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={eventDateTime(event)}>{formatEventDate(event)}</time>
        </p>
        <p className="mt-2 text-[15px] leading-7 text-[#262626]">{event.description}</p>
      </div>
    </article>
  );
}
