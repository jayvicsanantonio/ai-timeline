// Pieces every era interface shares: its props, the heading id, the event count, card attributes, the event title, the era's
// turning points, the year column and a busy year's brief listing.
// The title's link stretches over its whole event card, so a click anywhere on the card opens the source.
'use client';

import { useId, useState, type ReactNode } from 'react';
import type { Era } from '@/lib/eras';
import { eventAnchorId, eventSource } from '@/lib/event-format';
import { yearsSincePreviousEvent } from '@/lib/year-gaps';
import { isBusyYear, type YearGroup } from '@/lib/year-groups';
import type { TimelineEvent } from '@/types/timeline';
import { cn } from '@/lib/utils';

export interface EraInterfaceProps {
  era: Era;
  // How many events the era has before filters are applied
  totalEvents: number;
}

export const NO_MATCHING_EVENTS = 'No events in this era match your search and filters.';

export const LANDMARK_LABEL = 'Landmark';

export const TURNING_POINTS_LABEL = 'Turning points in this chapter';

export function eraHeadingId(era: Pick<Era, 'id'>) {
  return `${era.id}-title`;
}

export function eraEventCount(era: Pick<Era, 'events'>, totalEvents: number) {
  const shown = era.events.length;
  const noun = totalEvents === 1 ? 'event' : 'events';

  return shown === totalEvents ? `${totalEvents} ${noun}` : `${shown} of ${totalEvents} ${noun}`;
}

// The id and data every event card carries, so the navigation can jump to the card and read out its date
export function eventCardAttributes(event: TimelineEvent) {
  return {
    id: eventAnchorId(event),
    'data-year': event.year,
    'data-month': event.month,
    'data-landmark': event.landmark ? '' : undefined,
  };
}

interface EventHeadingProps {
  event: TimelineEvent;
  className?: string;
  linkClassName?: string;
  // Decoration drawn inside the heading around the link, hidden from assistive technology
  before?: ReactNode;
  after?: ReactNode;
}

// The event's level-3 title, linking to its source in a new tab. The card that holds it must be
// `relative` and draw its own focus ring with `has-[a:focus-visible]`, because the link's ::after
// overlay covers the whole card.
export function EventHeading({ event, className, linkClassName, before, after }: EventHeadingProps) {
  const newTabHintId = useId();

  return (
    <>
      <h3 className={className}>
        {before}
        <a
          href={event.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-describedby={newTabHintId}
          data-event-link=""
          className={cn(
            'after:absolute after:inset-0 after:z-10 focus-visible:outline-hidden',
            linkClassName
          )}
        >
          {event.title}
        </a>
        {after}
      </h3>
      {/* Outside the heading, because hidden text that aria-describedby points at still
          counts toward the name of any element that contains it */}
      <span id={newTabHintId} hidden>
        Opens in a new tab
      </span>
    </>
  );
}

// The site an event's card opens, with an arrow that says the link leaves the timeline
export function EventSource({ event, className }: { event: TimelineEvent; className?: string }) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1', className)}>
      <span className="truncate">{eventSource(event)}</span>
      <span aria-hidden="true">↗</span>
    </span>
  );
}

interface TurningPointsProps {
  era: Pick<Era, 'events'>;
  className?: string;
  labelClassName?: string;
  listClassName?: string;
  linkClassName?: string;
  yearClassName?: string;
  // The era's own mark ahead of the label, hidden from assistive technology
  marker?: ReactNode;
}

// The era's landmarks, listed at its opening so its turning points show at a glance, each linking to its card.
// While the reader filters, it lists only the landmarks that match, and nothing when none do.
export function TurningPoints({
  era,
  className,
  labelClassName,
  listClassName,
  linkClassName,
  yearClassName,
  marker,
}: TurningPointsProps) {
  const labelId = useId();
  const landmarks = era.events.filter((event) => event.landmark);
  if (landmarks.length === 0) {
    return null;
  }

  return (
    <div data-turning-points="" className={className}>
      <p id={labelId} className={labelClassName}>
        {marker ? <span aria-hidden="true">{marker}</span> : null}
        {TURNING_POINTS_LABEL}
      </p>
      <ol aria-labelledby={labelId} className={listClassName}>
        {landmarks.map((event) => (
          <li key={eventAnchorId(event)}>
            <a href={`#${eventAnchorId(event)}`} data-turning-point="" className={linkClassName}>
              <span className={yearClassName}>{event.year}</span> {event.title}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

// A count and its noun, such as "1 record" or "2 records"
export function countOf(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

interface YearGapProps {
  // Events, or years of events, in order
  events: Pick<TimelineEvent, 'year'>[];
  index: number;
  className?: string;
}

// Says how many years passed before the entry at `index` when more than one did, so an era's
// quiet stretches show between its cards. It goes ahead of the cards, outside them.
export function YearGap({ events, index, className }: YearGapProps) {
  const years = yearsSincePreviousEvent(events, index);
  if (years === null) {
    return null;
  }

  return <p className={className}>{years} years later</p>;
}

interface YearColumnProps {
  group: YearGroup;
  className?: string;
  // The era's own drawing of the year and its details
  children: ReactNode;
}

// A year beside its events. From the md breakpoint up it is a column whose label stays in view while
// the year's events scroll past; on phones it is one line above them. Assistive technology reads the
// year and its count in plain words and skips the era's drawing of them.
export function YearColumn({ group, className, children }: YearColumnProps) {
  return (
    <div data-year-column={group.year} className={className}>
      <div className="md:sticky md:top-[calc(var(--timeline-sticky-offset,0px)+1.5rem)]">
        <p className="sr-only">
          {group.year}, {countOf(group.events.length, 'event')}
        </p>
        <div aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}

// A busy year lists its events in brief, apart from its landmarks and highlights, and its Show all button
// turns every brief event into a full one and back. While the reader filters, every match shows in full.
export function useBriefListing(group: YearGroup, filtering: boolean) {
  const [showAll, setShowAll] = useState(false);
  const offersShowAll = !filtering && isBusyYear(group.events);

  return {
    offersShowAll,
    showAll,
    toggleShowAll: () => setShowAll((shown) => !shown),
    inBrief: (event: TimelineEvent) => offersShowAll && !showAll && !event.landmark && !event.highlight,
  };
}

interface CompactEraTextProps extends EraInterfaceProps {
  metaClassName?: string;
  headingClassName?: string;
  messageClassName?: string;
}

// An era that the filters have emptied shrinks to its title, chapter, count and a note, so the
// matching events below come into view sooner
export function CompactEraText({
  era,
  totalEvents,
  metaClassName,
  headingClassName,
  messageClassName,
}: CompactEraTextProps) {
  return (
    <>
      <p className={metaClassName}>
        {era.chapter} <span aria-hidden="true">·</span> {era.subtitle} <span aria-hidden="true">·</span>{' '}
        {eraEventCount(era, totalEvents)}
      </p>
      <h2
        id={eraHeadingId(era)}
        tabIndex={-1}
        className={cn('focus:outline-none', headingClassName)}
      >
        {era.name}
      </h2>
      <p className={messageClassName}>{NO_MATCHING_EVENTS}</p>
    </>
  );
}
