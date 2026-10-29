// Draws the Learning Era as beveled windows cascading across a teal desktop, the look of 1990s PCs, beside a folder for each year.
// Each event is a window: its date, icon and title in the title bar, its description inside, its category and source below.
'use client';

import { FolderOpen, Info, Star } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/category-icon';
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

// Each window steps a little right of the one before it, then the cascade starts over. The steps
// stay small so the dates in the title bars still line up for scanning.
const CASCADE_OFFSETS = ['md:ml-0', 'md:ml-4', 'md:ml-8'];

export function DesktopEra({ era, totalEvents }: EraInterfaceProps) {
  if (era.events.length === 0) {
    return (
      <div className="desktop-wallpaper font-desktop px-4 py-6 sm:px-6">
        <div className="desktop-window mx-auto max-w-2xl">
          <div className="desktop-title-bar">
            <Info aria-hidden="true" className="size-4 shrink-0" />
            <p className="min-w-0 flex-1 truncate text-[15px] font-bold">{era.interfaceName}</p>
            <WindowControls />
          </div>
          <div className="px-4 py-3 text-black">
            <CompactEraText
              era={era}
              totalEvents={totalEvents}
              metaClassName="text-[13px] text-[#333]"
              headingClassName="mt-0.5 text-lg font-bold"
              messageClassName="mt-0.5 text-[13px]"
            />
          </div>
        </div>
      </div>
    );
  }

  const years = groupEventsByYear(era.events);

  return (
    <div className="desktop-wallpaper font-desktop relative px-4 py-24 sm:px-6 sm:py-32">
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
            {/* A list box of the landmarks, highlighting the row the pointer or keyboard is on, as list boxes did */}
            <TurningPoints
              era={era}
              className="mt-6"
              labelClassName="text-sm font-bold"
              marker="★ "
              listClassName="desktop-sunken mt-1.5 bg-white py-1 text-[15px]"
              linkClassName="flex gap-3 px-2 py-0.5 hover:bg-[#000080] hover:text-white focus-visible:bg-[#000080] focus-visible:text-white focus-visible:outline-1 focus-visible:outline-dotted focus-visible:outline-offset-[-2px] focus-visible:outline-white"
              yearClassName="w-10 shrink-0 tabular-nums"
            />
          </div>
        </header>

        <ol className="mt-14 space-y-8 sm:mt-20 sm:space-y-10">
          {years.map((group, index) => (
            <li key={group.year}>
              <YearGap
                events={years}
                index={index}
                className="mb-6 text-sm font-bold text-white [text-shadow:1px_1px_0_#000]"
              />
              <div className="md:grid md:grid-cols-[9rem_minmax(0,1fr)] md:gap-6">
                <YearColumn
                  group={group}
                  className="mb-3 border-b border-black/25 pb-2 shadow-[0_1px_0_rgb(255_255_255/0.3)] md:mb-0 md:border-b-0 md:border-r md:pb-0 md:pr-5 md:shadow-[1px_0_0_rgb(255_255_255/0.3)]"
                >
                  <div className="flex items-center gap-3 md:block">
                    <p className="inline-flex items-center gap-2 rounded bg-black/30 px-2.5 py-1 text-white ring-1 ring-white/15">
                      <FolderOpen className="size-4 shrink-0 text-amber-300" />
                      <span className="text-lg font-bold leading-none md:text-2xl">{group.year}</span>
                    </p>
                    <p className="font-mono text-[11px] tracking-[0.1em] text-white [text-shadow:1px_1px_0_#000] md:mt-1.5">
                      C:\AI\{group.year} ({group.events.length})
                    </p>
                  </div>
                </YearColumn>
                <ol className="space-y-8 sm:space-y-10">
                  {group.events.map((event) => (
                    <li
                      key={eventAnchorId(event)}
                      className={CASCADE_OFFSETS[era.events.indexOf(event) % CASCADE_OFFSETS.length]}
                    >
                      <EventWindow event={event} />
                    </li>
                  ))}
                </ol>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* The words the desktops of the day left on screen once they had shut down, set where the
          wallpaper has faded to black */}
      <p
        aria-hidden="true"
        className="absolute inset-x-0 bottom-9 px-4 text-center text-sm font-bold tracking-wide text-[#ff9d2e] sm:bottom-12 sm:text-base"
      >
        It&apos;s now safe to turn off your computer.
      </p>
    </div>
  );
}

// A landmark opens wider, its label raised in the title bar like the bar's buttons, and a star beside its
// text, as the message boxes of the day set an icon beside theirs.
function EventWindow({ event }: { event: TimelineEvent }) {
  return (
    <article
      {...eventCardAttributes(event)}
      className={cn(
        'reveal-on-scroll desktop-window group relative scroll-mt-[var(--timeline-sticky-offset,0px)] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-white',
        event.landmark ? 'max-w-3xl' : 'max-w-2xl'
      )}
    >
      <div className="desktop-title-bar">
        <CategoryIcon category={event.category} className="size-4 shrink-0" />
        <time
          dateTime={eventDateTime(event)}
          className="shrink-0 rounded-[2px] bg-white/20 px-1.5 text-[13px] font-bold"
        >
          {formatEventDate(event)}
        </time>
        <EventHeading event={event} className="min-w-0 flex-1 text-[15px] font-bold leading-snug" />
        {event.landmark ? (
          <span className="desktop-raised inline-flex shrink-0 items-center gap-1 bg-[#c0c0c0] px-1.5 text-[13px] font-bold leading-5 text-black">
            <span aria-hidden="true">★</span>
            <span>{LANDMARK_LABEL}</span>
          </span>
        ) : null}
        <WindowControls className="hidden sm:flex" />
      </div>
      <div
        className={cn(
          'desktop-sunken m-1 bg-white text-black',
          event.landmark ? 'flex gap-4 px-4 py-4 text-base leading-7 sm:px-5' : 'px-4 py-3 text-[15px] leading-7'
        )}
      >
        {event.landmark ? (
          <Star aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-9 shrink-0 fill-[#ffd400] text-black" />
        ) : null}
        <p>{event.description}</p>
      </div>
      <div className="flex gap-1 px-1 pb-1 text-[13px] text-black">
        <p className="desktop-sunken min-w-0 flex-[3] truncate px-2 py-0.5">
          <span>{event.category}</span>
        </p>
        <p className="desktop-sunken flex min-w-0 flex-[2] px-2 py-0.5">
          <EventSource event={event} />
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
