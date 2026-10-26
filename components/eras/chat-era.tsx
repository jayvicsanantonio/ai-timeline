// Draws the Generative AI Era as a chat thread, the interface the era made familiar, with each year's label beside its part of the thread.
// Each year opens with a question and an answer, then its messages under month dividers, a busy year's lesser events in brief. The thread ends still typing.
'use client';

import { ChevronsUpDown, Sparkles } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { CategoryIcon } from '@/components/ui/category-icon';
import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import { cn } from '@/lib/utils';
import { groupEventsByYear, isBusyYear, type YearGroup } from '@/lib/year-groups';
import { yearSummary } from '@/lib/year-summaries';
import type { TimelineEvent } from '@/types/timeline';
import {
  CompactEraText,
  EventHeading,
  EventSource,
  LANDMARK_LABEL,
  YearColumn,
  countOf,
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

// The assistant's avatar, beside the era's introduction and each year's answer
function AssistantAvatar() {
  return (
    <span
      aria-hidden="true"
      className="grid size-9 shrink-0 place-items-center rounded-full bg-[#9085e9] text-[#0c0c10]"
    >
      <Sparkles className="size-4" />
    </span>
  );
}

// The year in the column beside its thread, with its count of events and of landmarks
function ChatYearLabel({ group }: { group: YearGroup }) {
  const landmarks = group.events.filter((event) => event.landmark).length;

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 md:block">
      <p className="text-lg font-semibold tracking-tight text-white md:text-3xl">{group.year}</p>
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#a1a1aa] md:mt-1">
        {countOf(group.events.length, 'event')}
      </p>
      {landmarks > 0 ? (
        <p className="md:mt-2">
          <span className="inline-block rounded-full border border-[#9085e9]/40 bg-[#9085e9]/10 px-2 py-0.5 text-[11px] text-[#b4abf5]">
            ★ {countOf(landmarks, 'landmark')}
          </span>
        </p>
      ) : null}
    </div>
  );
}

// The assistant's one-sentence answer to the year's question, kept in the data beside the events
function YearAnswer({ year }: { year: number }) {
  const summary = yearSummary(year);
  if (!summary) {
    return null;
  }

  return (
    <div className="mt-8 flex gap-3 sm:gap-4">
      <AssistantAvatar />
      <p
        data-year-summary=""
        className="min-w-0 pt-1 text-base leading-7 text-[#d4d4d8] sm:text-lg sm:leading-8"
      >
        {summary}
      </p>
    </div>
  );
}

export function ChatEra({ era, totalEvents }: EraInterfaceProps) {
  if (era.events.length === 0) {
    return (
      <div className="chat-backdrop px-4 py-6 text-[#ececf1] sm:px-6">
        <div className="mx-auto flex max-w-3xl gap-3 sm:gap-4">
          <AssistantAvatar />
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
  // While the reader filters, every match shows in full
  const filtering = era.events.length < totalEvents;

  return (
    <div className="chat-backdrop px-4 py-24 text-[#ececf1] sm:px-6 sm:py-32">
      <div className="mx-auto max-w-4xl">
        {/* The introduction and the closing line sit in line with the thread, past the years' column */}
        <header className="md:pl-40">
          <UserBubble>
            <p className={USER_BUBBLE_CLASS}>What happened to AI after 2020?</p>
          </UserBubble>
          <div className="mt-8 flex gap-3 sm:gap-4">
            <AssistantAvatar />
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

        {groupEventsByYear(era.events).map((group) => (
          <ChatYear key={group.year} group={group} filtering={filtering} />
        ))}

        <p className="mt-12 flex items-center gap-3 text-sm text-[#a1a1aa] md:pl-40">
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

interface ChatYearProps {
  group: YearGroup;
  filtering: boolean;
}

// One year of the thread. A busy year lists its events in brief, apart from its landmarks and highlights,
// and its Show all button turns every brief event into a full message and back.
function ChatYear({ group, filtering }: ChatYearProps) {
  const [showAll, setShowAll] = useState(false);
  const offersShowAll = !filtering && isBusyYear(group.events);
  const inBrief = (event: TimelineEvent) =>
    offersShowAll && !showAll && !event.landmark && !event.highlight;

  return (
    <div data-year-group={group.year} className="mt-16 md:grid md:grid-cols-[8rem_minmax(0,1fr)] md:gap-8">
      <YearColumn
        group={group}
        className="mb-6 border-b border-white/10 pb-2 md:mb-0 md:border-b-0 md:border-r md:pb-0 md:pr-5"
      >
        <ChatYearLabel group={group} />
      </YearColumn>
      <div className="min-w-0">
        {/* Each year starts a new turn of the conversation, a landmark while scrolling */}
        <UserBubble>
          <p data-year-prompt="" className={USER_BUBBLE_CLASS}>
            What happened in <span className="font-semibold text-white">{group.year}</span>?
          </p>
        </UserBubble>
        <YearAnswer year={group.year} />

        {/* Sits in line with the answer, like the suggestions a chat offers under a reply */}
        {offersShowAll ? (
          <p className="mt-4 pl-12 sm:pl-[3.25rem]">
            <button
              type="button"
              aria-pressed={showAll}
              onClick={() => setShowAll((shown) => !shown)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b4abf5]',
                showAll
                  ? 'border-[#9085e9]/70 bg-[#9085e9]/20 text-white'
                  : 'border-white/15 bg-white/[0.04] text-[#d4d4d8] hover:border-white/30 hover:text-white'
              )}
            >
              <ChevronsUpDown aria-hidden="true" className="size-3.5" />
              Show all {group.events.length} in full
            </button>
          </p>
        ) : null}

        {groupEvents(group.events, formatEventDate).map((month) => (
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
            {/* Brief events sit close together, and full messages keep their room */}
            <ol className="mt-5">
              {month.events.map((event) => (
                <li key={eventAnchorId(event)} className={cn('first:mt-0', inBrief(event) ? 'mt-1' : 'mt-4')}>
                  {inBrief(event) ? <ChatBrief event={event} /> : <ChatMessage event={event} />}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

// An event of a busy year in brief: its date, linked title and source on one line beside a small dot.
// On a phone the date sits above the title, and the source follows the title's last word.
function ChatBrief({ event }: { event: TimelineEvent }) {
  return (
    <article
      {...eventCardAttributes(event)}
      data-brief=""
      className="reveal-on-scroll group relative flex scroll-mt-[calc(var(--timeline-sticky-offset,0px)+3rem)] items-center gap-3 rounded-xl has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#b4abf5] sm:gap-4"
    >
      <span aria-hidden="true" className="flex w-9 shrink-0 justify-center">
        <span className="size-1.5 rounded-full bg-[#9085e9]/50 transition-colors group-hover:bg-[#b4abf5]" />
      </span>
      <div className="min-w-0 flex-1 rounded-xl px-3 py-2 transition-colors group-hover:bg-white/[0.05] sm:flex sm:items-baseline sm:gap-3">
        <time dateTime={eventDateTime(event)} className="block text-xs text-[#a1a1aa] sm:w-28 sm:shrink-0">
          {formatEventDate(event)}
        </time>
        <EventHeading
          event={event}
          className="inline text-[15px] font-medium leading-snug text-[#e4e4e7] group-hover:text-white sm:block sm:min-w-0 sm:flex-1"
        />{' '}
        <EventSource event={event} className="ml-1 text-xs text-[#71717a] sm:ml-0 sm:shrink-0" />
      </div>
    </article>
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
