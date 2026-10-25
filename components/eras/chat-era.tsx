// Draws the Generative AI Era as a chat thread, the interface the era made familiar.
// Each year opens with the reader's question, its events answer as messages under month dividers, and the thread ends still typing.
'use client';

import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { CategoryIcon } from '@/components/ui/category-icon';
import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/types/timeline';
import {
  CompactEraText,
  EventHeading,
  EventSource,
  LANDMARK_LABEL,
  eraEventCount,
  eraHeadingId,
  eventCardAttributes,
  type EraInterfaceProps,
} from './era-parts';

interface EventGroup<Key> {
  key: Key;
  events: TimelineEvent[];
}

// Groups back-to-back events that share a key, which the sorted data keeps together
function groupEvents<Key>(events: TimelineEvent[], keyOf: (event: TimelineEvent) => Key) {
  const groups: EventGroup<Key>[] = [];
  for (const event of events) {
    const key = keyOf(event);
    const lastGroup = groups.at(-1);
    if (lastGroup?.key === key) {
      lastGroup.events.push(event);
    } else {
      groups.push({ key, events: [event] });
    }
  }
  return groups;
}

function UserBubble({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex justify-end', className)}>
      {children}
    </div>
  );
}

const USER_BUBBLE_CLASS =
  'max-w-md rounded-3xl rounded-br-lg bg-[#2a2a33] px-5 py-3 text-[15px] leading-7 text-[#ececf1]';

export function ChatEra({ era, totalEvents }: EraInterfaceProps) {
  if (era.events.length === 0) {
    return (
      <div className="chat-backdrop px-4 py-6 text-[#ececf1] sm:px-6">
        <div className="mx-auto flex max-w-3xl gap-3 sm:gap-4">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-[#9085e9] text-[#0c0c10]"
          >
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0">
            <CompactEraText
              era={era}
              totalEvents={totalEvents}
              metaClassName="text-xs text-[#a1a1aa]"
              headingClassName="mt-0.5 text-xl font-semibold tracking-tight text-white"
              messageClassName="mt-0.5 text-sm text-[#d4d4d8]"
            />
          </div>
        </div>
      </div>
    );
  }

  const lastEvent = era.events.at(-1);

  return (
    <div className="chat-backdrop px-4 py-24 text-[#ececf1] sm:px-6 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <header>
          <UserBubble>
            <p className={USER_BUBBLE_CLASS}>What happened to AI after 2020?</p>
          </UserBubble>
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

        {groupEvents(era.events, (event) => event.year).map((year) => (
          <div key={year.key} data-year-group={year.key}>
            {/* Each year starts a new turn of the conversation, a landmark while scrolling */}
            <UserBubble className="mt-16">
              <p data-year-prompt="" className={USER_BUBBLE_CLASS}>
                What happened in <span className="font-semibold text-white">{year.key}</span>?
              </p>
            </UserBubble>

            {groupEvents(year.events, formatEventDate).map((month) => (
              <div key={month.key} data-month={month.key} className="relative mt-10">
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
                    {month.key}
                  </span>
                </div>
                <ol className="mt-5 space-y-4">
                  {month.events.map((event) => (
                    <li key={eventAnchorId(event)}>
                      <ChatMessage event={event} />
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        ))}

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
      {...eventCardAttributes(event)}
      className="reveal-on-scroll group relative flex scroll-mt-[calc(var(--timeline-sticky-offset,0px)+3rem)] gap-3 rounded-2xl has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-[#b4abf5] sm:gap-4"
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-full border text-[#b4abf5]',
          event.landmark ? 'border-[#9085e9] bg-[#2a2547]' : 'border-white/10 bg-[#1f1f27]'
        )}
      >
        <CategoryIcon category={event.category} className="size-4" />
      </span>
      <div
        className={cn(
          'min-w-0 flex-1 rounded-2xl rounded-tl-md border px-4 py-3.5 transition-colors group-hover:border-[#9085e9]/60 sm:px-5 sm:py-4',
          event.landmark
            ? 'border-[#9085e9]/60 bg-[#1c1930] shadow-[0_20px_60px_-24px_rgba(144,133,233,0.6)]'
            : 'border-white/[0.08] bg-[#16161c]'
        )}
      >
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#a1a1aa]">
          <time dateTime={eventDateTime(event)} className="font-medium text-[#d4d4d8]">
            {formatEventDate(event)}
          </time>
          <span aria-hidden="true">·</span>
          <span>{event.category}</span>
          {event.landmark ? (
            <span className="rounded-full bg-[#9085e9] px-2 py-px text-[11px] font-semibold text-[#0c0c10]">
              {LANDMARK_LABEL}
            </span>
          ) : null}
        </p>
        <EventHeading
          event={event}
          className="mt-1.5 text-base font-semibold leading-snug text-white sm:text-[17px]"
        />
        <p className="mt-1.5 text-[15px] leading-7 text-[#c9c9d1]">{event.description}</p>
        <p className="mt-3">
          <EventSource
            event={event}
            className="max-w-full rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-[#a1a1aa]"
          />
        </p>
      </div>
    </article>
  );
}
