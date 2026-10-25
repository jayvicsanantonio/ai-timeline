// Pieces every era interface shares: its props, the heading id, the event count and the event title.
// The title's link stretches over its whole event card, so a click anywhere on the card opens the source.
'use client';

import { useId, type ReactNode } from 'react';
import type { Era } from '@/lib/eras';
import type { TimelineEvent } from '@/types/timeline';
import { cn } from '@/lib/utils';

export interface EraInterfaceProps {
  era: Era;
  // How many events the era has before filters are applied
  totalEvents: number;
}

export const NO_MATCHING_EVENTS = 'No events in this era match your search and filters.';

export function eraHeadingId(era: Pick<Era, 'id'>) {
  return `${era.id}-title`;
}

export function eraEventCount(era: Pick<Era, 'events'>, totalEvents: number) {
  const shown = era.events.length;
  const noun = totalEvents === 1 ? 'event' : 'events';

  return shown === totalEvents ? `${totalEvents} ${noun}` : `${shown} of ${totalEvents} ${noun}`;
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
