// Shared building blocks for all five era interfaces: heading IDs, event counts, the whole-card EventHeading link,
// source provenance chips, keystone landmark stamps, and the compact collapsed strip for 0-match filtered eras.
'use client';

import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import type { Era } from '@/lib/eras';
import { eventSourceDomain } from '@/lib/event-format';
import { isLandmarkEvent } from '@/lib/landmarks';
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

// Displays the external source domain (e.g. "arxiv.org ↗") so readers know where a click leads
export function SourceDomainBadge({
  link,
  className,
}: {
  link: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex items-center gap-1 font-mono text-[11px] tracking-normal opacity-80 transition-opacity group-hover:opacity-100',
        className
      )}
    >
      <span>{eventSourceDomain(link)}</span>
      <ArrowUpRight aria-hidden="true" className="size-3 shrink-0" />
    </span>
  );
}

// Marks historical inflection points ("Keystone Milestones") across the timeline
export function KeystoneBadge({
  event,
  className,
}: {
  event: TimelineEvent;
  className?: string;
}) {
  if (!isLandmarkEvent(event)) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]',
        className
      )}
    >
      <Sparkles aria-hidden="true" className="size-3 shrink-0" />
      <span>Keystone</span>
    </span>
  );
}

// Compact archival strip rendered when active filters leave an era with 0 matching events,
// eliminating 2,000px of empty era headers while preserving all accessible landmarks and metadata.
export function CollapsedEraBanner({
  era,
  totalEvents,
  className,
}: {
  era: Era;
  totalEvents: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto max-w-5xl rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-zinc-300 backdrop-blur-sm sm:px-6',
        className
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span
            aria-hidden="true"
            className="size-2 shrink-0 translate-y-[-1px] rounded-full"
            style={{ backgroundColor: era.color }}
          />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
            {era.chapter} · {era.subtitle}
          </span>
          <h2
            id={eraHeadingId(era)}
            tabIndex={-1}
            className="text-lg font-semibold tracking-tight text-white focus:outline-none sm:text-xl"
          >
            {era.name}
          </h2>
          <span className="font-mono text-xs text-zinc-400">· {era.interfaceName}</span>
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-400">
          {eraEventCount(era, totalEvents)}
        </p>
      </div>

      <p className="sr-only">{era.description}</p>
      <p className="mt-1.5 font-mono text-xs text-zinc-400">{NO_MATCHING_EVENTS}</p>
    </div>
  );
}
