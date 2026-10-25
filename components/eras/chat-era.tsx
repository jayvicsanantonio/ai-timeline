// Draws the Generative AI Era as a chat thread, the interface the era made familiar.
// Events arrive as messages grouped under a divider for each month, and the thread ends still typing.
'use client';

import { Sparkles } from 'lucide-react';
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

interface MonthGroup {
  label: string;
  events: TimelineEvent[];
}

// Groups back-to-back events that share a month, which the sorted data keeps together
function groupByMonth(events: TimelineEvent[]) {
  const groups: MonthGroup[] = [];
  for (const event of events) {
    const label = formatEventDate(event);
    const lastGroup = groups.at(-1);
    if (lastGroup?.label === label) {
      lastGroup.events.push(event);
    } else {
      groups.push({ label, events: [event] });
    }
  }
  return groups;
}

export function ChatEra({ era, totalEvents }: EraInterfaceProps) {
  const lastEvent = era.events.at(-1);

  return (
    <div className="chat-backdrop px-4 py-24 text-[#ececf1] sm:px-6 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <header>
          <div className="flex justify-end">
            <p className="max-w-md rounded-3xl rounded-br-lg bg-[#2a2a33] px-5 py-3 text-[15px] leading-7 text-[#ececf1]">
              What happened to AI after 2020?
            </p>
          </div>
          <div className="mt-8 flex gap-3 sm:gap-4">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-[#9085e9] text-[#0c0c10]"
            >
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-[#a1a1aa]">
                {era.chapter} <span aria-hidden="true">·</span> {era.subtitle}
              </p>
              <h2
                id={eraHeadingId(era)}
                tabIndex={-1}
                className="mt-2 text-3xl font-semibold tracking-tight text-white focus:outline-none sm:text-5xl"
              >
                {era.name}
              </h2>
              <p className="mt-4 text-base leading-7 text-[#d4d4d8] sm:text-lg sm:leading-8">
                {era.description}
              </p>
              <p className="mt-4 text-sm text-[#a1a1aa]">
                {eraEventCount(era, totalEvents)}
                {lastEvent ? ` through ${formatEventDate(lastEvent)}` : null}{' '}
                <span aria-hidden="true">·</span> {era.interfaceName}
              </p>
            </div>
          </div>
        </header>

        {era.events.length > 0 ? (
          groupByMonth(era.events).map((group) => (
            <div key={group.label} data-month={group.label} className="relative mt-10">
              {/* The rule stays where the month begins. Only the date pins below the toolbar,
                  and it lets clicks through to the messages scrolling under it. */}
              <span aria-hidden="true" className="absolute inset-x-0 top-[0.8125rem] h-px bg-white/10" />
              <div
                aria-hidden="true"
                className="pointer-events-none sticky top-[calc(var(--timeline-sticky-offset,0px)+0.5rem)] z-20 flex justify-center"
              >
                <span
                  data-month-divider=""
                  className="rounded-full border border-white/10 bg-[#1b1b22] px-3 py-1 text-xs font-medium text-[#c4c4cc] shadow-[0_6px_16px_-6px_rgba(0,0,0,0.9)]"
                >
                  {group.label}
                </span>
              </div>
              <ol className="mt-5 space-y-4">
                {group.events.map((event) => (
                  <li key={eventAnchorId(event)}>
                    <ChatMessage event={event} />
                  </li>
                ))}
              </ol>
            </div>
          ))
        ) : (
          <p className="mt-10 rounded-2xl border border-white/10 bg-[#16161c] px-4 py-3 text-[15px] text-[#d4d4d8]">
            {NO_MATCHING_EVENTS}
          </p>
        )}

        <p className="mt-12 flex items-center gap-3 text-sm text-[#a1a1aa]">
          <span aria-hidden="true" className="chat-typing flex gap-1">
            <span />
            <span />
            <span />
          </span>
          The story is still being written
        </p>
      </div>
    </div>
  );
}

function ChatMessage({ event }: { event: TimelineEvent }) {
  return (
    <article
      id={eventAnchorId(event)}
      data-year={event.year}
      className="reveal-on-scroll group relative flex scroll-mt-[calc(var(--timeline-sticky-offset,0px)+3rem)] gap-3 rounded-2xl has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-[#b4abf5] sm:gap-4"
    >
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-[#1f1f27] text-[#b4abf5]"
      >
        <CategoryIcon category={event.category} className="size-4" />
      </span>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-white/[0.08] bg-[#16161c] px-4 py-3.5 transition-colors group-hover:border-[#9085e9]/60 sm:px-5 sm:py-4">
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-[#a1a1aa]">
          <span>{event.category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={eventDateTime(event)}>{formatEventDate(event)}</time>
        </p>
        <EventHeading
          event={event}
          className="mt-1.5 text-base font-semibold leading-snug text-white sm:text-[17px]"
        />
        <p className="mt-1.5 text-[15px] leading-7 text-[#c9c9d1]">{event.description}</p>
      </div>
    </article>
  );
}
