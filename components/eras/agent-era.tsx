// Draws the Agentic Era as an agent's task log, the interface the era made familiar, with each year's label beside its part of the log.
// A plan checks off the years, each year opens with its task and the agent's report, then its steps, a busy year's lesser ones collapsed. The log ends still working.
'use client';

import { ChevronsUpDown } from 'lucide-react';
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
  YearColumn,
  countOf,
  eraEventCount,
  eraHeadingId,
  eventCardAttributes,
  useBriefListing,
  type EraInterfaceProps,
} from './era-parts';

// The prompt mark ahead of each task the agent is given
function TaskMark() {
  return (
    <span aria-hidden="true" className="font-mono text-[#e77fb8]">
      ❯
    </span>
  );
}

// The agent's to-do list: one step per year, every year but the one still running checked off
function AgentPlan({ groups }: { groups: YearGroup[] }) {
  return (
    <div
      aria-hidden="true"
      className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm"
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#8f8a98]">Plan</p>
      <ul className="mt-2 space-y-1">
        {groups.map((group, index) => {
          const running = index === groups.length - 1;

          return (
            <li key={group.year} className="flex items-baseline gap-2">
              <span className={running ? 'text-[#e77fb8]' : 'text-[#5fd39b]'}>{running ? '◐' : '✓'}</span>
              <span
                data-plan-step={group.year}
                data-status={running ? 'running' : 'done'}
                className={running ? 'text-white' : 'text-[#8f8a98] line-through decoration-white/25'}
              >
                Research {group.year}
              </span>
              <span className="text-[#6f6a78]">{countOf(group.events.length, 'event')}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// The year in the column beside its log, with its count of events and of landmarks, and whether it is done
function AgentYearLabel({ group, running }: { group: YearGroup; running: boolean }) {
  const landmarks = group.events.filter((event) => event.landmark).length;

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 md:block">
      <p className="font-mono text-lg font-semibold tracking-tight text-white md:text-3xl">{group.year}</p>
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#a39fab] md:mt-1">
        {countOf(group.events.length, 'event')}
      </p>
      {landmarks > 0 ? (
        <p className="md:mt-2">
          <span className="inline-block rounded-md border border-[#cf4f9a]/40 bg-[#cf4f9a]/10 px-2 py-0.5 text-[11px] text-[#f08cc4]">
            ★ {countOf(landmarks, 'landmark')}
          </span>
        </p>
      ) : null}
      <p className={cn('font-mono text-[11px] md:mt-2', running ? 'text-[#e77fb8]' : 'text-[#5fd39b]')}>
        {running ? '● running' : '✓ done'}
      </p>
    </div>
  );
}

// The agent's one-sentence report on the year, kept in the data beside the events
function YearReport({ year }: { year: number }) {
  const summary = yearSummary(year);
  if (!summary) {
    return null;
  }

  return (
    <div className="mt-4 flex gap-3">
      <span aria-hidden="true" className="pt-0.5 font-mono text-sm text-[#e77fb8]">
        ●
      </span>
      <p
        data-year-summary=""
        className="min-w-0 text-base leading-7 text-[#d9d6de] sm:text-lg sm:leading-8"
      >
        {summary}
      </p>
    </div>
  );
}

export function AgentEra({ era, totalEvents }: EraInterfaceProps) {
  if (era.events.length === 0) {
    return (
      <div className="agent-backdrop px-4 py-6 text-[#e7e5ea] sm:px-6">
        <div className="mx-auto flex max-w-3xl gap-3 sm:gap-4">
          <TaskMark />
          <div className="min-w-0">
            <CompactEraText
              era={era}
              totalEvents={totalEvents}
              metaClassName="font-mono text-xs text-[#a39fab]"
              headingClassName="mt-0.5 text-xl font-semibold tracking-tight text-white"
              messageClassName="mt-0.5 text-sm text-[#d9d6de]"
            />
          </div>
        </div>
      </div>
    );
  }

  const lastEvent = era.events.at(-1);
  const groups = groupEventsByYear(era.events);
  // While the reader filters, every match shows in full
  const filtering = era.events.length < totalEvents;

  return (
    <div className="agent-backdrop px-4 py-24 text-[#e7e5ea] sm:px-6 sm:py-32">
      <div className="mx-auto max-w-4xl">
        {/* The introduction and the closing line sit in line with the log, past the years' column */}
        <header className="md:pl-40">
          <p className="flex gap-3 font-mono text-sm leading-6 text-[#c9c5cf]">
            <TaskMark />
            <span>Take it from here: research AI from {era.range[0]} on, and keep going on your own.</span>
          </p>
          <p className="mt-8 font-mono text-sm text-[#a39fab]">
            {era.chapter} <span aria-hidden="true">·</span> {era.subtitle}
          </p>
          <h2
            id={eraHeadingId(era)}
            tabIndex={-1}
            className="mt-2 text-3xl font-semibold tracking-tight text-white focus:outline-none sm:text-5xl"
          >
            {era.name}
          </h2>
          <p className="mt-4 text-base leading-7 text-[#d9d6de] sm:text-lg sm:leading-8">{era.description}</p>
          <p className="mt-4 font-mono text-sm text-[#a39fab]">
            {eraEventCount(era, totalEvents)}
            {lastEvent ? ` through ${formatEventDate(lastEvent)}` : null}{' '}
            <span aria-hidden="true">·</span> {era.interfaceName}
          </p>
          <AgentPlan groups={groups} />
        </header>

        {groups.map((group, index) => (
          <AgentYear key={group.year} group={group} running={index === groups.length - 1} filtering={filtering} />
        ))}

        <p className="mt-12 flex items-center gap-3 font-mono text-sm text-[#a39fab] md:pl-40">
          <span aria-hidden="true">
            <span data-agent-spinner="" className="agent-spinner text-[#e77fb8]">
              ✻
            </span>
          </span>
          The story is still being written
        </p>
      </div>
    </div>
  );
}

interface AgentYearProps {
  group: YearGroup;
  running: boolean;
  filtering: boolean;
}

// One year of the log. A busy year collapses its steps to one line each, apart from its landmarks and
// highlights, and its Show all button expands every collapsed step and back.
function AgentYear({ group, running, filtering }: AgentYearProps) {
  const { offersShowAll, showAll, toggleShowAll, inBrief } = useBriefListing(group, filtering);

  return (
    <div data-year-group={group.year} className="mt-16 md:grid md:grid-cols-[8rem_minmax(0,1fr)] md:gap-8">
      <YearColumn
        group={group}
        className="mb-6 border-b border-white/10 pb-2 md:mb-0 md:border-b-0 md:border-r md:pb-0 md:pr-5"
      >
        <AgentYearLabel group={group} running={running} />
      </YearColumn>
      <div className="min-w-0">
        <p className="flex gap-3 font-mono text-sm">
          <TaskMark />
          <span data-year-task="" className="font-semibold text-white">
            Research {group.year}
          </span>
        </p>
        <YearReport year={group.year} />

        {/* Sits in line with the report, like the toggle an agent offers to expand its collapsed steps */}
        {offersShowAll ? (
          <p className="mt-4 pl-6">
            <button
              type="button"
              aria-pressed={showAll}
              onClick={toggleShowAll}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f08cc4]',
                showAll
                  ? 'border-[#cf4f9a]/70 bg-[#cf4f9a]/20 text-white'
                  : 'border-white/15 bg-white/[0.04] text-[#c9c5cf] hover:border-white/30 hover:text-white'
              )}
            >
              <ChevronsUpDown aria-hidden="true" className="size-3.5" />
              Show all {group.events.length} in full
            </button>
          </p>
        ) : null}

        {/* Collapsed steps sit close together, and full steps keep their room */}
        <ol className="mt-6">
          {group.events.map((event) => (
            <li key={eventAnchorId(event)} className={cn('first:mt-0', inBrief(event) ? 'mt-0.5' : 'mt-4')}>
              {inBrief(event) ? <AgentBrief event={event} /> : <AgentStep event={event} />}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// A collapsed step of a busy year: a check, then its date, linked title and source on one line.
// On a phone the date sits above the title, and the source follows the title's last word.
function AgentBrief({ event }: { event: TimelineEvent }) {
  return (
    <article
      {...eventCardAttributes(event)}
      data-brief=""
      className="reveal-on-scroll group relative flex scroll-mt-[calc(var(--timeline-sticky-offset,0px)+3rem)] items-baseline gap-3 rounded-lg px-3 py-1.5 transition-colors sm:px-4 hover:bg-white/[0.04] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#f08cc4]"
    >
      <span aria-hidden="true" className="w-6 shrink-0 text-center font-mono text-xs text-[#5fd39b]">
        ✓
      </span>
      <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-3">
        <time dateTime={eventDateTime(event)} className="block font-mono text-xs text-[#8f8a98] sm:w-28 sm:shrink-0">
          {formatEventDate(event)}
        </time>
        <EventHeading
          event={event}
          className="inline text-[15px] font-medium leading-snug text-[#e7e5ea] group-hover:text-white sm:block sm:min-w-0 sm:flex-1"
        />{' '}
        <EventSource event={event} className="ml-1 font-mono text-xs text-[#6f6a78] sm:ml-0 sm:shrink-0" />
      </div>
    </article>
  );
}

// A step in full: its date and category, its title, and what came of it, set off by a rule like a tool's output
function AgentStep({ event }: { event: TimelineEvent }) {
  return (
    <article
      {...eventCardAttributes(event)}
      className={cn(
        'reveal-on-scroll group relative flex scroll-mt-[calc(var(--timeline-sticky-offset,0px)+3rem)] gap-3 rounded-xl border p-3 transition-colors has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#f08cc4] sm:p-4',
        event.landmark
          ? 'border-[#cf4f9a]/60 bg-[#1b0f18] shadow-[0_20px_60px_-24px_rgba(207,79,154,0.55)]'
          : 'border-transparent hover:border-white/10 hover:bg-white/[0.03]'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border text-[#e77fb8]',
          event.landmark ? 'border-[#cf4f9a] bg-[#cf4f9a]/20' : 'border-white/10 bg-white/[0.04]'
        )}
      >
        <CategoryIcon category={event.category} className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-[#8f8a98]">
          <time dateTime={eventDateTime(event)} className="text-[#c9c5cf]">
            {formatEventDate(event)}
          </time>
          <span aria-hidden="true">·</span>
          <span>{event.category}</span>
          {event.landmark ? (
            <span className="rounded bg-[#cf4f9a] px-1.5 py-px text-[11px] font-semibold text-[#0d0b0f]">
              {LANDMARK_LABEL}
            </span>
          ) : null}
        </p>
        <EventHeading
          event={event}
          className="mt-1.5 text-base font-semibold leading-snug text-white sm:text-[17px]"
        />
        <div
          className={cn(
            'mt-2 border-l-2 pl-4 transition-colors',
            event.landmark ? 'border-[#cf4f9a]/70' : 'border-white/10 group-hover:border-[#cf4f9a]/50'
          )}
        >
          <p className="text-[15px] leading-7 text-[#c9c5cf]">{event.description}</p>
          <p className="mt-2">
            <EventSource event={event} className="max-w-full font-mono text-xs text-[#8f8a98]" />
          </p>
        </div>
      </div>
    </article>
  );
}
