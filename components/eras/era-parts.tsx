// Pieces every era interface shares: its props, the heading id, the event count, card attributes and the event title.
// The title's link stretches over its whole event card, so a click anywhere on the card opens the source.
'use client';

import { useId, type ReactNode } from 'react';
import type { Era } from '@/lib/eras';
import { eventAnchorId, eventSource } from '@/lib/event-format';
import type { TimelineEvent } from '@/types/timeline';
import { cn } from '@/lib/utils';

export interface EraInterfaceProps {
  era: Era;
  // How many events the era has before filters are applied
  totalEvents: number;
}

export const NO_MATCHING_EVENTS = 'No events in this era match your search and filters.';

export const LANDMARK_LABEL = 'Landmark';

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
