// Draws the Deep Learning Revolution inside a dark research compute lab framing a Jupyter studio notebook,
// with Markdown Year Dividers, de-duplicated dates, keystone badges, and source provenance.
'use client';

import { CategoryIcon } from '@/components/ui/category-icon';
import {
  eventAnchorId,
  eventDateTime,
  eventSourceDomain,
  formatEventDate,
} from '@/lib/event-format';
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

// The introduction runs the notebook's first cell, so the events start at cell 2
const FIRST_EVENT_CELL = 2;

export function NotebookEra({ era, totalEvents }: EraInterfaceProps) {
  if (era.events.length === 0) {
    return (
      <div className="notebook-room border-b border-white/10 px-3 py-6 sm:px-6">
        <CollapsedEraBanner era={era} totalEvents={totalEvents} />
      </div>
    );
  }

  const yearClusters = groupEventsByYear(era.events);
  let cellCounter = FIRST_EVENT_CELL;

  return (
    <div className="notebook-room border-b border-white/10 px-3 py-20 text-[#1f1f1f] sm:px-6 sm:py-28">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-[0_35px_90px_-40px_rgba(0,0,0,0.85)] ring-1 ring-white/15">
        <div
          aria-hidden="true"
          className="flex items-center justify-between gap-4 border-b border-[#e0e0e0] bg-[#f4f4f6] px-4 py-3 font-mono text-xs text-[#4a4a52] sm:px-6"
        >
          <span className="truncate font-semibold">deep_learning_revolution.ipynb</span>
          <span className="flex shrink-0 items-center gap-2">
            <span>Python 3 · CUDA GPU:0</span>
            <span className="size-2.5 rounded-full bg-emerald-500" />
          </span>
        </div>

        <div className="px-3 py-8 sm:px-8 sm:py-10">
          <header className="notebook-cell">
            <span aria-hidden="true" className="notebook-prompt text-[#71717a]">
              [md]:
            </span>
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#5f5f5f]">
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
              <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-[#5f5f5f]">
                {era.interfaceName}
              </p>
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

          <div className="mt-6 space-y-8">
            {yearClusters.map((cluster) => (
              <div key={cluster.year} className="border-t border-[#ececef] pt-6">
                {/* Notebook Markdown Year Cell Header */}
                <div aria-hidden="true" className="notebook-cell mb-3 items-baseline">
                  <span className="notebook-prompt pt-0 font-bold text-[#d95926]">
                    # {cluster.year}
                  </span>
                  <div className="flex flex-wrap items-center gap-3 border-b border-[#ececef] pb-2">
                    <span className="font-mono text-lg font-bold text-[#18181b]">
                      Epoch {cluster.year}
                    </span>
                    <span className="rounded-full bg-[#f4f4f6] px-2.5 py-0.5 font-mono text-xs text-[#52525b]">
                      {cluster.events.length} {cluster.events.length === 1 ? 'cell' : 'cells'}
                    </span>
                  </div>
                </div>

                <ol className="space-y-4">
                  {cluster.events.map((event) => {
                    const currentCellNumber = cellCounter;
                    cellCounter += 1;

                    return (
                      <li key={eventAnchorId(event)}>
                        <NotebookCell event={event} cellNumber={currentCellNumber} />
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>

          <div aria-hidden="true" className="notebook-cell mt-8">
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
  const landmark = isLandmarkEvent(event);
  const domain = eventSourceDomain(event.link);

  return (
    <article
      id={eventAnchorId(event)}
      data-year={event.year}
      className={cn(
        'reveal-on-scroll notebook-cell group relative scroll-mt-[var(--timeline-sticky-offset,0px)] rounded-r-xl py-2.5 pr-3 transition-colors hover:border-l-[#2a78d6] hover:bg-[#f8fafc] has-[a:focus-visible]:border-l-[#2a78d6] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#2a78d6]',
        landmark && 'bg-[#fff8f5]'
      )}
    >
      <span aria-hidden="true" className="notebook-prompt text-[#303f9f]">
        In [{cellNumber}]:
      </span>
      <div className="notebook-code flex flex-wrap items-baseline justify-between gap-2">
        <div>
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
            , src=<span className="text-[#303f9f]">&quot;{domain}&quot;</span>)
          </span>
        </div>
        <KeystoneBadge
          event={event}
          className="rounded bg-[#d95926]/15 px-1.5 py-0.5 text-[#b54215]"
        />
      </div>

      <span aria-hidden="true" className="notebook-prompt text-[#d84315]">
        Out[{cellNumber}]:
      </span>
      <div className="notebook-output">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#5f5f5f]">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="rounded bg-[#18181b] px-2 py-0.5 font-mono text-white">
              <time dateTime={eventDateTime(event)}>{formatEventDate(event)}</time>
            </span>
            <span aria-hidden="true">·</span>
            <CategoryIcon category={event.category} className="size-3.5 shrink-0 text-[#d95926]" />
            <span>{event.category}</span>
          </p>
          <SourceDomainBadge link={event.link} className="text-[#52525b]" />
        </div>
        <p className="mt-2.5 text-[15px] leading-7 text-[#262626]">{event.description}</p>
      </div>
    </article>
  );
}
