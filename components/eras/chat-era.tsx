// Draws the Generative AI Era as a chat thread, the interface the era made familiar, with each year's label beside its part of the thread.
// Each year's question gets one reply: its summary, then its events written out as points under month headings. The thread ends at the message box.
'use client';

import { ArrowUp, ChevronDown, ChevronsUpDown, Copy, RefreshCw, Sparkles, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { CategoryIcon } from '@/components/ui/category-icon';
import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import { cn } from '@/lib/utils';
import { groupEventsByYear, type YearGroup } from '@/lib/year-groups';
import { yearSummary } from '@/lib/year-summaries';
import type { TimelineEvent } from '@/types/timeline';
import {
  CompactEraText,
  EventHeading,
  EventSource,
  LANDMARK_LABEL,
  TurningPoints,
  YearColumn,
  countOf,
  eraEventCount,
  eraHeadingId,
  eventCardAttributes,
  useBriefListing,
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

// The model picker a chat opens under, drawn rather than offered, since the thread has no model to switch
function ModelPicker() {
  return (
    <p
      aria-hidden="true"
      data-model-picker=""
      className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-lg font-medium text-[#ececf1] hover:bg-white/[0.05]"
    >
      Assistant
      <ChevronDown className="size-4 text-[#a1a1aa]" />
    </p>
  );
}

// The year in the column beside its thread, like the conversation open in a chat's history, with its count of events and of landmarks
function ChatYearLabel({ group }: { group: YearGroup }) {
  const landmarks = group.events.filter((event) => event.landmark).length;

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 md:block md:rounded-2xl md:bg-white/[0.06] md:px-3 md:py-3">
      <p className="text-lg font-semibold tracking-tight text-white md:text-2xl">{group.year}</p>
      <p className="text-xs text-[#a1a1aa] md:mt-0.5">{countOf(group.events.length, 'event')}</p>
      {landmarks > 0 ? (
        <p className="whitespace-nowrap text-xs text-[#c4bdf7] md:mt-1.5">★ {countOf(landmarks, 'landmark')}</p>
      ) : null}
    </div>
  );
}

// The assistant's one-sentence answer to the year's question, kept in the data beside the events, which opens its reply
function YearAnswer({ year }: { year: number }) {
  const summary = yearSummary(year);
  if (!summary) {
    return null;
  }

  return (
    <p data-year-summary="" className="pt-1 text-base leading-7 text-[#ececf1] sm:text-lg sm:leading-8">
      {summary}
    </p>
  );
}

// What a chat offers under every reply: copy it, rate it up or down, or ask again. Drawn, since none of them would do anything here.
function ReplyActions() {
  return (
    <p aria-hidden="true" data-reply-actions="" className="mt-6 flex items-center gap-4 text-[#8e8e9a]">
      <Copy className="size-4" />
      <ThumbsUp className="size-4" />
      <ThumbsDown className="size-4" />
      <RefreshCw className="size-4" />
    </p>
  );
}

// The message box the thread ends at, with the reader typing the task the next era's agent opens with, under the
// reminder chat apps print below it
function Composer({ nextEraStart }: { nextEraStart: number }) {
  return (
    <div aria-hidden="true" data-composer="" className="mt-16 md:pl-40">
      <div className="flex items-end gap-3 rounded-[1.75rem] border border-white/10 bg-[#1d1c27] py-3 pl-5 pr-3 shadow-[0_16px_48px_-20px_rgba(0,0,0,0.9)]">
        <p className="min-w-0 flex-1 py-1 text-base leading-7 text-[#ececf1]">
          <span data-composer-message="">
            Take it from here: research AI from {nextEraStart} on, and keep going on your own.
          </span>
        </p>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#ececf1] text-[#0c0c10]">
          <ArrowUp className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-center text-xs text-[#a1a1aa]">AI can make mistakes. Check important info.</p>
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
          <ModelPicker />
          <UserBubble className="mt-6">
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
              {/* Offered as chips under the answer, as chats suggest where to go next */}
              <TurningPoints
                era={era}
                className="mt-6"
                labelClassName="flex items-center gap-1.5 text-sm text-[#c4bdf7]"
                marker={<Star className="size-3.5" />}
                listClassName="mt-3 flex flex-wrap gap-2"
                linkClassName="inline-flex items-baseline gap-1.5 rounded-full border border-[#9085e9]/45 bg-[#9085e9]/10 px-3 py-1.5 text-sm text-[#e4e1ff] transition-colors hover:border-[#9085e9] hover:bg-[#9085e9]/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b4abf5]"
                yearClassName="text-xs text-[#b4abf5]"
              />
            </div>
          </div>
        </header>

        {groupEventsByYear(era.events).map((group) => (
          <ChatYear key={group.year} group={group} filtering={filtering} />
        ))}

        <Composer nextEraStart={era.range[1]} />

        <p className="mt-10 flex items-center gap-3 text-sm text-[#a1a1aa] md:pl-40">
          <span aria-hidden="true" className="chat-typing flex gap-1">
            <span />
            <span />
            <span />
          </span>
          Handing the work to an agent
        </p>
      </div>
    </div>
  );
}

interface ChatYearProps {
  group: YearGroup;
  filtering: boolean;
}

// One year of the thread: the reader's question, then the assistant's reply. A busy year lists its events in brief,
// apart from its landmarks and highlights, and its Show all button writes every brief event out in full and back.
function ChatYear({ group, filtering }: ChatYearProps) {
  const { offersShowAll, showAll, toggleShowAll, inBrief } = useBriefListing(group, filtering);

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

        {/* The reply is written out beside the assistant's avatar, without a bubble, as chats set their answers */}
        <div data-year-reply={group.year} className="mt-8 flex gap-3 sm:gap-4">
          <AssistantAvatar />
          <div className="min-w-0 flex-1">
            <YearAnswer year={group.year} />

            {/* Sits in line with the answer, like the suggestions a chat offers under a reply */}
            {offersShowAll ? (
              <p className="mt-4">
                <button
                  type="button"
                  aria-pressed={showAll}
                  onClick={toggleShowAll}
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
              <div key={month.key} data-month={month.key} className="relative mt-6">
                {/* The month heads its points like a heading in the reply. It pins below the toolbar while its
                    points scroll by, and lets clicks through to them. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none sticky top-[calc(var(--timeline-sticky-offset,0px)+0.5rem)] z-20 flex"
                >
                  <span
                    data-month-divider=""
                    className="-ml-3 rounded-full bg-[#14131b]/95 px-3 py-1 text-[15px] font-semibold text-white shadow-[0_6px_16px_-8px_rgba(0,0,0,0.9)]"
                  >
                    {month.key}
                  </span>
                </div>
                {/* Brief points sit close together, and full ones keep their room */}
                <ul className="mt-3">
                  {month.events.map((event) => (
                    <li key={eventAnchorId(event)} className={cn('first:mt-0', inBrief(event) ? 'mt-1' : 'mt-5')}>
                      {inBrief(event) ? <ChatBrief event={event} /> : <ReplyPoint event={event} />}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <ReplyActions />
          </div>
        </div>
      </div>
    </div>
  );
}

// A bullet ahead of an event written into the reply
function ReplyBullet({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full bg-[#c9c9d1]', className)} />;
}

// An event of a busy year in brief: a bullet, then its date, linked title and source on one line.
// On a phone the date is left to the month's heading above and only screen readers hear it on the row,
// and the source follows the title's last word.
function ChatBrief({ event }: { event: TimelineEvent }) {
  return (
    <article
      {...eventCardAttributes(event)}
      data-brief=""
      className="reveal-on-scroll group relative -ml-3 flex scroll-mt-[calc(var(--timeline-sticky-offset,0px)+3rem)] items-baseline gap-3 rounded-xl px-3 py-1.5 transition-colors hover:bg-white/[0.05] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#b4abf5]"
    >
      <ReplyBullet className="translate-y-[-2px] bg-[#9085e9]/70 group-hover:bg-[#b4abf5]" />
      <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-3">
        <time dateTime={eventDateTime(event)} className="block text-xs text-[#a1a1aa] max-sm:sr-only sm:w-28 sm:shrink-0">
          {formatEventDate(event)}
        </time>
        <EventHeading
          event={event}
          className="inline text-[15px] font-medium leading-snug text-[#e4e4e7] group-hover:text-white sm:block sm:min-w-0 sm:flex-1"
        />{' '}
        <EventSource event={event} className="ml-1 text-xs text-[#a1a1aa] sm:ml-0 sm:shrink-0" />
      </div>
    </article>
  );
}

// An event written into the reply as a point of its own: its date and category, its bold title, and what came of
// it with its source cited at the end, as chats cite theirs. A landmark is set apart in a panel, like the documents
// chats open beside a reply.
function ReplyPoint({ event }: { event: TimelineEvent }) {
  return (
    <article
      {...eventCardAttributes(event)}
      className={cn(
        'reveal-on-scroll group relative flex scroll-mt-[calc(var(--timeline-sticky-offset,0px)+3rem)] gap-3 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-[#b4abf5]',
        event.landmark &&
          'rounded-2xl border border-[#9085e9]/55 bg-[#1c1930] p-4 shadow-[0_24px_64px_-28px_rgba(144,133,233,0.65)] sm:p-5'
      )}
    >
      {event.landmark ? null : <ReplyBullet className="mt-[0.4rem]" />}
      <div className="min-w-0 flex-1">
        {event.landmark ? (
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#c4bdf7]">
            <Star aria-hidden="true" className="size-3.5" />
            <span>{LANDMARK_LABEL}</span>
          </p>
        ) : null}
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#a1a1aa]">
          <time dateTime={eventDateTime(event)} className="font-medium text-[#d4d4d8]">
            {formatEventDate(event)}
          </time>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5">
            <CategoryIcon category={event.category} className="size-3.5 text-[#b4abf5]" />
            <span>{event.category}</span>
          </span>
        </p>
        <EventHeading
          event={event}
          className="mt-1 text-[17px] font-semibold leading-snug text-white group-hover:text-[#dcd7ff]"
        />
        <p className="mt-1 text-base leading-7 text-[#d4d4d8]">
          {event.description}{' '}
          <EventSource
            event={event}
            className="max-w-full translate-y-[-1px] rounded-full bg-white/[0.08] px-2 py-px align-middle text-xs text-[#c4c4cc] group-hover:bg-[#9085e9]/25"
          />
        </p>
      </div>
    </article>
  );
}
