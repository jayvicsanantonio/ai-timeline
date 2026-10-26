// Draws the Learning Era as beveled workstation windows organized along a Year-Cluster Directory Spine,
// with dates promoted to the top toolbar, keystone flags, and source provenance.
'use client';

import { FolderOpen, Info } from 'lucide-react';
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

export function DesktopEra({ era, totalEvents }: EraInterfaceProps) {
  if (era.events.length === 0) {
    return (
      <div className="desktop-wallpaper font-desktop border-b border-white/10 px-4 py-6 sm:px-6">
        <CollapsedEraBanner era={era} totalEvents={totalEvents} />
      </div>
    );
  }

  const yearClusters = groupEventsByYear(era.events);

  return (
    <div className="desktop-wallpaper font-desktop border-b border-white/10 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <header className="desktop-window mx-auto max-w-3xl">
          <div className="desktop-title-bar">
            <Info aria-hidden="true" className="size-4 shrink-0" />
            <p className="min-w-0 flex-1 truncate font-bold">
              {era.chapter} <span aria-hidden="true">-</span> {era.interfaceName}
            </p>
            <WindowControls />
          </div>
          <div className="px-5 py-6 text-black sm:px-8 sm:py-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#333]">{era.subtitle}</p>
            <h2
              id={eraHeadingId(era)}
              tabIndex={-1}
              className="mt-2 text-3xl font-bold tracking-tight focus:outline-none sm:text-4xl"
            >
              {era.name}
            </h2>
            <p className="mt-4 text-[15px] leading-7">{era.description}</p>
            <div aria-hidden="true" className="desktop-sunken mt-6 h-6 bg-white p-0.5">
              <div className="desktop-progress h-full" />
            </div>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-[#333]">
              {eraEventCount(era, totalEvents)} loaded
            </p>
          </div>
        </header>

        <div className="mt-14 space-y-10 sm:mt-20 sm:space-y-12">
          {yearClusters.map((cluster) => (
            <div key={cluster.year}>
              {cluster.yearGap !== null && cluster.yearGap > 1 ? (
                <div
                  aria-hidden="true"
                  className="mb-5 inline-flex items-center gap-2 rounded border border-white/20 bg-black/35 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-sky-200"
                >
                  <span>↕ +{cluster.yearGap} Year Interval</span>
                </div>
              ) : null}

              <div className="md:grid md:grid-cols-[9.5rem_minmax(0,1fr)] md:gap-8">
                {/* Left Workstation Directory Year Spine */}
                <div
                  aria-hidden="true"
                  className="mb-3 flex items-center justify-between border-b border-white/15 pb-2 text-white md:mb-0 md:block md:border-b-0 md:border-r md:pr-6 md:pb-0"
                >
                  <div className="md:sticky md:top-[calc(var(--timeline-sticky-offset,0px)+1.5rem)]">
                    <div className="inline-flex items-center gap-2 rounded bg-black/30 px-2.5 py-1 ring-1 ring-white/15">
                      <FolderOpen className="size-4 text-amber-300" />
                      <span className="font-mono text-xl font-bold tracking-tight sm:text-2xl">
                        {cluster.year}
                      </span>
                    </div>
                    <span className="mt-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-sky-100/75">
                      C:\AI\{cluster.year} ({cluster.events.length})
                    </span>
                  </div>
                </div>

                {/* Right Workstation Windows */}
                <ol className="space-y-6 sm:space-y-8">
                  {cluster.events.map((event) => (
                    <li key={eventAnchorId(event)}>
                      <EventWindow event={event} />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventWindow({ event }: { event: TimelineEvent }) {
  const landmark = isLandmarkEvent(event);

  return (
    <article
      id={eventAnchorId(event)}
      data-year={event.year}
      className={cn(
        'reveal-on-scroll desktop-window group relative scroll-mt-[var(--timeline-sticky-offset,0px)] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-white',
        landmark && 'ring-2 ring-amber-300/80'
      )}
    >
      <div className="desktop-title-bar">
        <CategoryIcon category={event.category} className="size-4 shrink-0" />
        <EventHeading event={event} className="min-w-0 flex-1 text-[15px] font-bold leading-snug" />
        <WindowControls />
      </div>

      {/* Top Metadata Address Bar (Promoted from bottom status bar so date is scanned first) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1.5 py-1 text-xs text-black">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="desktop-sunken bg-white px-2 py-0.5 font-mono font-semibold text-[#000080]">
            <time dateTime={eventDateTime(event)}>{formatEventDate(event)}</time>
          </span>
          <span className="desktop-sunken bg-[#ece9d8] px-2 py-0.5 font-medium">
            {event.category}
          </span>
          <KeystoneBadge
            event={event}
            className="desktop-raised bg-[#000080] px-1.5 py-0.5 text-white"
          />
        </div>
        <SourceDomainBadge link={event.link} className="px-1 text-[#222]" />
      </div>

      <div className="desktop-sunken m-1 bg-white px-4 py-3 text-[15px] leading-7 text-black">
        <p>{event.description}</p>
      </div>
    </article>
  );
}

// Minimize, maximize and close boxes. They are part of the picture, not working controls.
function WindowControls({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('flex shrink-0 gap-0.5', className)}>
      {['_', '□', '×'].map((glyph, index) => (
        <span
          key={glyph}
          className={cn(
            'desktop-raised grid size-5 place-items-center bg-[#d4d0c8] text-[13px] font-bold leading-none text-black',
            index === 2 && 'ml-0.5'
          )}
        >
          {glyph}
        </span>
      ))}
    </span>
  );
}
