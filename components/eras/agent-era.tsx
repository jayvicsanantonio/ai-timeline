// Draws the Agentic Era as an agent's task log, the interface the era made familiar, with each year's label beside its part of the log.
// A plan checks off the years; each year's task traces what the agent read and fetched, landmarks boxed as checkpoints. The log ends still working.
'use client';

import { Check, ChevronsUpDown, Flag, Globe } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/category-icon';
import { eventAnchorId, eventDateTime, eventSource, formatEventDate } from '@/lib/event-format';
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

// Centers a marker on a year's trace line, which is the trace's left border
const TRACE_MARKER_CLASS = 'absolute left-[-0.5px] grid size-3.5 -translate-x-1/2 place-items-center rounded-full';

// The elbow that folds what came back from a call under the call
function ResultElbow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('h-2.5 w-2.5 shrink-0 rounded-bl-[3px] border-b border-l border-white/25', className)}
    />
  );
}

// The agent's to-do list, folded under its call: one box per year, every year but the one still running checked off
function AgentPlan({ groups }: { groups: YearGroup[] }) {
  return (
    <div aria-hidden="true" className="mt-8 font-mono text-sm">
      <p className="flex items-center gap-3 font-semibold text-white">
        <span className="size-2 rounded-full bg-[#e77fb8]" />
        Plan
      </p>
      <div className="mt-1.5 flex gap-2.5 pl-[3px]">
        <ResultElbow className="mt-0.5" />
        <ul className="space-y-1.5">
          {groups.map((group, index) => {
            const running = index === groups.length - 1;

            return (
              <li key={group.year} className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'grid size-3.5 shrink-0 place-items-center rounded-[3px] border',
                    running ? 'border-[#e77fb8]' : 'border-[#5fd39b]/60 bg-[#5fd39b]/15 text-[#5fd39b]'
                  )}
                >
                  {running ? (
                    <span className="size-1.5 rounded-[1px] bg-[#e77fb8] motion-safe:animate-pulse" />
                  ) : (
                    <Check className="size-2.5" strokeWidth={3} />
                  )}
                </span>
                <span
                  data-plan-step={group.year}
                  data-status={running ? 'running' : 'done'}
                  className={running ? 'text-white' : 'text-[#8f8a98] line-through decoration-white/25'}
                >
                  Research {group.year}
                </span>
                <span className="text-[#8f8a98]">{countOf(group.events.length, 'event')}</span>
              </li>
            );
          })}
        </ul>
      </div>
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
      <p
        className={cn(
          'inline-flex items-center gap-1.5 font-mono text-[11px] md:mt-2 md:flex',
          running ? 'text-[#e77fb8]' : 'text-[#5fd39b]'
        )}
      >
        {running ? (
          <span className="size-1.5 rounded-full bg-current motion-safe:animate-pulse" />
        ) : (
          <Check className="size-3" strokeWidth={3} />
        )}
        {running ? 'running' : 'done'}
      </p>
    </div>
  );
}

// What the agent read for the year, as its research tools tally it: one page per event, from the sites those pages are on
function YearActivity({ group }: { group: YearGroup }) {
  const sites = new Set(group.events.map(eventSource)).size;

  return (
    <p aria-hidden="true" className="relative pl-6 font-mono text-xs leading-5 text-[#a39fab]">
      <span className={cn(TRACE_MARKER_CLASS, 'top-[3px] border border-white/20 bg-[#0d0b0f]')}>
        <Globe className="size-2.5" />
      </span>
      <span data-year-activity="">
        Read {countOf(group.events.length, 'page')} from {countOf(sites, 'site')}
      </span>
    </p>
  );
}

// The agent's one-sentence report on the year, kept in the data beside the events
function YearReport({ year }: { year: number }) {
  const summary = yearSummary(year);
  if (!summary) {
    return null;
  }

  return (
    <div className="relative mt-4 pl-6">
      <span aria-hidden="true" className={cn(TRACE_MARKER_CLASS, 'top-[7px] sm:top-[9px]')}>
        <span className="size-2 rounded-full bg-[#e77fb8] shadow-[0_0_10px_rgba(231,127,184,0.7)]" />
      </span>
      <p
        data-year-summary=""
        className="min-w-0 text-base leading-7 text-[#e7e5ea] sm:text-lg sm:leading-8"
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
          {/* The reader's instruction, in the box where a person hands an agent its task */}
          <p className="flex gap-3 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 font-mono text-sm leading-6 text-[#e7e5ea]">
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

        {/* The agent's status line, its spinner in line with the trace and its words with the tasks. The shimmer sets
            its own color, so the muted color sits on the line around it */}
        <div className="mt-12 md:pl-40">
          <p className="relative pl-[31.5px] font-mono text-sm text-[#a39fab]">
            <span aria-hidden="true" className="absolute left-0 top-0 w-3.5 text-center">
              <span data-agent-spinner="" className="agent-spinner text-[#e77fb8]">
                ✻
              </span>
            </span>
            <span data-agent-status="" className="agent-shimmer">
              The story is still being written
            </span>
          </p>
        </div>
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
        {/* The task the agent takes up from its plan, ruled across the log. Its box sits over the trace line below */}
        <p className="relative flex items-center gap-3 pl-[31.5px] font-mono text-sm">
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 grid size-3.5 -translate-y-1/2 place-items-center rounded-[3px] border border-[#e77fb8] bg-[#cf4f9a]/20"
          >
            <span className="size-1.5 rounded-[1px] bg-[#e77fb8]" />
          </span>
          <span data-year-task="" className="font-semibold text-white">
            Research {group.year}
          </span>
          <span aria-hidden="true" className="h-px min-w-6 flex-1 bg-white/10" />
        </p>

        {/* The year's trace: what the agent read, its report, then its steps, each with a node on the line down its left */}
        <div data-trace="" className="ml-[6.5px] border-l border-white/15 pt-3">
          <YearActivity group={group} />
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
          <ol className="mt-5">
            {group.events.map((event) => (
              <li
                key={eventAnchorId(event)}
                className={cn('relative pl-6 first:mt-0', inBrief(event) ? 'mt-0.5' : 'mt-3')}
              >
                <TraceNode event={event} brief={inBrief(event)} />
                {inBrief(event) ? <AgentBrief event={event} /> : <AgentStep event={event} />}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// A step's node on its year's trace line: a check for a collapsed step, a dot for a step in full, and a lit dot for a landmark.
// It sits outside the step's card, so it holds still on the line while the card rises in.
function TraceNode({ event, brief }: { event: TimelineEvent; brief: boolean }) {
  return (
    <span
      aria-hidden="true"
      data-trace-node=""
      className={cn(
        TRACE_MARKER_CLASS,
        'border bg-[#0d0b0f]',
        brief ? 'top-[7px] border-[#5fd39b]/50 text-[#5fd39b] sm:top-[9px]' : 'top-[14px] border-[#e77fb8] sm:top-[18px]',
        event.landmark && 'border-[#f08cc4] bg-[#cf4f9a] shadow-[0_0_14px_rgba(207,79,154,0.75)]'
      )}
    >
      {brief ? (
        <Check className="size-2.5" strokeWidth={3} />
      ) : (
        <span className={cn('size-1.5 rounded-full', event.landmark ? 'bg-[#0d0b0f]' : 'bg-[#e77fb8]')} />
      )}
    </span>
  );
}

// A collapsed step of a busy year: its date, linked title and source on one line, its check on the trace line beside it.
// On a phone the date sits above the title, and the source follows the title's last word. The card reaches back under
// its own padding, so its text lines up with the year's task.
function AgentBrief({ event }: { event: TimelineEvent }) {
  return (
    <article
      {...eventCardAttributes(event)}
      data-brief=""
      className="reveal-on-scroll group relative -ml-3 flex scroll-mt-[calc(var(--timeline-sticky-offset,0px)+3rem)] items-baseline gap-3 rounded-lg px-3 py-1.5 transition-colors hover:bg-white/[0.04] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#f08cc4]"
    >
      <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-3">
        <time dateTime={eventDateTime(event)} className="block font-mono text-xs text-[#8f8a98] sm:w-28 sm:shrink-0">
          {formatEventDate(event)}
        </time>
        <EventHeading
          event={event}
          className="inline text-[15px] font-medium leading-snug text-[#e7e5ea] group-hover:text-white sm:block sm:min-w-0 sm:flex-1"
        />{' '}
        <EventSource event={event} className="ml-1 font-mono text-xs text-[#8f8a98] sm:ml-0 sm:shrink-0" />
      </div>
    </article>
  );
}

// A step in full: the call that fetched its source, then what came back folded under it: its date and category, its title
// and what came of it. A landmark is boxed as a checkpoint, its label set into the top edge of the box.
function AgentStep({ event }: { event: TimelineEvent }) {
  return (
    <article
      {...eventCardAttributes(event)}
      className={cn(
        'reveal-on-scroll group relative -ml-3 scroll-mt-[calc(var(--timeline-sticky-offset,0px)+3rem)] rounded-xl border p-3 transition-colors has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#f08cc4] sm:py-4',
        event.landmark
          ? 'border-[#cf4f9a]/60 bg-[#1b0f18] shadow-[0_20px_60px_-24px_rgba(207,79,154,0.55)]'
          : 'border-transparent hover:border-white/10 hover:bg-white/[0.03]'
      )}
    >
      {event.landmark ? (
        <span className="absolute -top-2.5 left-3 inline-flex items-center gap-1 rounded bg-[#cf4f9a] px-1.5 py-px font-mono text-[11px] font-semibold leading-4 text-[#0d0b0f]">
          <Flag aria-hidden="true" className="size-3" />
          {LANDMARK_LABEL}
        </span>
      ) : null}
      <p className="flex items-center gap-3 font-mono text-xs leading-4">
        <span data-tool-call="" className="min-w-0 truncate text-[#a39fab]">
          <span aria-hidden="true" className="font-semibold text-white">
            Fetch
          </span>
          <span aria-hidden="true">(</span>
          <span>{eventSource(event)}</span>
          <span aria-hidden="true">)</span>
        </span>
        <span aria-hidden="true" className="ml-auto shrink-0 text-[#8f8a98] transition-colors group-hover:text-[#f08cc4]">
          ↗
        </span>
      </p>
      <div className="mt-2 flex gap-2.5">
        <ResultElbow className="ml-1 mt-px" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-[#8f8a98]">
            <time dateTime={eventDateTime(event)} className="text-[#c9c5cf]">
              {formatEventDate(event)}
            </time>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <CategoryIcon category={event.category} className="size-3.5 text-[#e77fb8]" />
              <span>{event.category}</span>
            </span>
          </p>
          <EventHeading
            event={event}
            className="mt-1.5 text-base font-semibold leading-snug text-white sm:text-[17px]"
          />
          <p className="mt-2 text-[15px] leading-7 text-[#c9c5cf]">{event.description}</p>
        </div>
      </div>
    </article>
  );
}
