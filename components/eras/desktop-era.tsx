// Draws the Learning Era as beveled windows cascading across a teal desktop, the look of 1990s PCs.
// Each event is a window: its category icon and title in the title bar, its description inside, its date below.
'use client';

import { Info } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/category-icon';
import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/types/timeline';
import {
  EventHeading,
  NO_MATCHING_EVENTS,
  eraEventCount,
  eraHeadingId,
  type EraInterfaceProps,
} from './era-parts';

// Each window steps right of the one before it, then the cascade starts over
const CASCADE_OFFSETS = ['md:ml-0', 'md:ml-12', 'md:ml-24'];

export function DesktopEra({ era, totalEvents }: EraInterfaceProps) {
  return (
    <div className="desktop-wallpaper font-desktop px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <header className="desktop-window mx-auto max-w-2xl">
          <div className="desktop-title-bar">
            <Info aria-hidden="true" className="size-4 shrink-0" />
            <p className="min-w-0 flex-1 truncate">
              {era.chapter} <span aria-hidden="true">-</span> {era.interfaceName}
            </p>
            <WindowControls />
          </div>
          <div className="px-5 py-6 text-black sm:px-8 sm:py-8">
            <p className="text-sm text-[#333]">{era.subtitle}</p>
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
            <p className="mt-2 text-sm text-[#333]">{eraEventCount(era, totalEvents)} loaded</p>
          </div>
        </header>

        {era.events.length > 0 ? (
          <ol className="mt-14 space-y-8 sm:mt-20 sm:space-y-10">
            {era.events.map((event, index) => (
              <li key={eventAnchorId(event)} className={CASCADE_OFFSETS[index % CASCADE_OFFSETS.length]}>
                <EventWindow event={event} />
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-14 text-center text-base text-white [text-shadow:1px_1px_0_#000]">
            {NO_MATCHING_EVENTS}
          </p>
        )}
      </div>
    </div>
  );
}

function EventWindow({ event }: { event: TimelineEvent }) {
  return (
    <article
      id={eventAnchorId(event)}
      data-year={event.year}
      className="reveal-on-scroll desktop-window group relative max-w-2xl scroll-mt-[var(--timeline-sticky-offset,0px)] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-white"
    >
      <div className="desktop-title-bar">
        <CategoryIcon category={event.category} className="size-4 shrink-0" />
        <EventHeading event={event} className="min-w-0 flex-1 text-[15px] font-bold leading-snug" />
        <WindowControls />
      </div>
      <div className="desktop-sunken m-1 bg-white px-4 py-3 text-[15px] leading-7 text-black">
        <p>{event.description}</p>
      </div>
      <div className="flex gap-1 px-1 pb-1 text-[13px] text-black">
        <p className="desktop-sunken min-w-0 flex-1 px-2 py-0.5">
          <time dateTime={eventDateTime(event)}>{formatEventDate(event)}</time>
        </p>
        <p className="desktop-sunken min-w-0 flex-[2] truncate px-2 py-0.5">
          <span>{event.category}</span>
        </p>
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
            'desktop-raised grid size-5 place-items-center bg-[#c0c0c0] text-[13px] font-bold leading-none text-black',
            index === 2 && 'ml-0.5'
          )}
        >
          {glyph}
        </span>
      ))}
    </span>
  );
}
