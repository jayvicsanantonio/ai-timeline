// Draws the Agentic Era as an agent working in a console, the interface the era made familiar, with each year's progress beside its part of the log.
// The log reads newest first: the year still running comes first, the agent still at work just above its newest step, and the instruction
// the agent was given waits at the bottom. Each year's task traces what the agent wrote up and fetched in parallel, its latest step first,
// landmarks raised as checkpoints.
'use client';

import { Check, ChevronsUpDown, Flag } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/category-icon';
import { RelativeTime } from '@/components/ui/relative-time';
import { MONTHS, eventAnchorId, eventDateTime, eventSource, formatEventDate } from '@/lib/event-format';
import { cn } from '@/lib/utils';
import { groupEventsByYear, latestMonth, type YearGroup } from '@/lib/year-groups';
import { yearSummary } from '@/lib/year-summaries';
import type { TimelineEvent } from '@/types/timeline';
import {
  EventHeading,
  EventSource,
  LANDMARK_LABEL,
  YearColumn,
  countOf,
  eventCardAttributes,
  useBriefListing,
  type EraInterfaceProps,
} from './era-parts';

// The console's own background, which a box's title sits on where it breaks the box's top edge
const CONSOLE_BACKGROUND = 'bg-[#0b0b0e]';

// The prompt mark ahead of each task the agent is given
function TaskMark() {
  return (
    <span aria-hidden="true" className="text-[#e77fb8]">
      ❯
    </span>
  );
}

// Centers a marker on a year's trace line, which is the trace's left border
const TRACE_MARKER_CLASS = 'absolute left-[-0.5px] grid size-3.5 -translate-x-1/2 place-items-center';

// The elbow that folds what came back from a call under the call
function ResultElbow({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('h-2.5 w-2.5 shrink-0 border-b border-l border-[#4a4a55]', className)} />;
}

// A tool the agent calls, such as Fetch(openai.com): the tool's name in bold, and what it was called on
function ToolName({ children }: { children: string }) {
  return <span className="font-bold text-[#f2f2f5]">{children}</span>;
}

// The console's title bar: the agent, the job it is on, and that it runs on its own
function ConsoleTitleBar() {
  return (
    <div
      aria-hidden="true"
      data-console-title=""
      className="flex items-center justify-between gap-4 border-b border-[#2a2a30] px-4 py-2 text-xs text-[#8b8b96] sm:px-6"
    >
      <span>
        <span className="text-[#e77fb8]">◆</span> agent <span className="text-[#4a4a55]">·</span> research-ai
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 bg-[#5fd39b]" />
        autonomous
      </span>
    </div>
  );
}

// The live edge of the timeline, just above its newest event: the agent still at work, watching for what comes after the
// latest event and saying how long ago that was. A log read newest first shows what is happening now at its top, as a
// thread shows someone typing. The shimmer sets its own color, so the muted color sits on the line around it.
function Frontier({ latestEvent }: { latestEvent: TimelineEvent }) {
  return (
    <p data-frontier="" className="relative mt-5 pl-6 text-sm leading-6 text-[#8b8b96]">
      <span aria-hidden="true" className={cn(TRACE_MARKER_CLASS, CONSOLE_BACKGROUND, 'top-[5px]')}>
        <span data-agent-spinner="" className="agent-spinner text-[13px] leading-none text-[#e77fb8]">
          ✻
        </span>
      </span>
      <span data-agent-status="" className="agent-shimmer">
        Watching for what comes after {formatEventDate(latestEvent)}
        <RelativeTime event={latestEvent} before=" · " />
      </span>
    </p>
  );
}

// How far the agent has got through a year, as a bar of its twelve months: all of them once the year is done,
// and up to its latest event's month while it is still running
function YearProgress({ group, running }: { group: YearGroup; running: boolean }) {
  const months = running ? latestMonth(group.events) : MONTHS.length;

  return (
    <div data-year-progress="" className="mt-3 hidden md:block">
      <p className="flex gap-0.5">
        {MONTHS.map((month, index) => (
          <span
            key={month}
            data-month-cell=""
            data-filled={index < months ? '' : undefined}
            className={cn(
              'h-2.5 w-1.5',
              index < months ? (running ? 'bg-[#e77fb8]' : 'bg-[#5fd39b]') : 'bg-[#2a2a30]'
            )}
          />
        ))}
      </p>
      <p data-progress-label="" className="mt-1 text-[11px] text-[#8b8b96]">
        {months}/{MONTHS.length} mo
      </p>
    </div>
  );
}

// The year in the column beside its log, with its count of events, the sites the agent read them on and its landmarks,
// its progress, and whether it is done
function AgentYearLabel({ group, running }: { group: YearGroup; running: boolean }) {
  const landmarks = group.events.filter((event) => event.landmark).length;
  const sites = new Set(group.events.map(eventSource)).size;

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 md:block">
      <p className="text-lg font-bold tracking-tight text-[#f2f2f5] md:text-2xl">{group.year}</p>
      <p className="text-xs text-[#8b8b96] md:mt-1">{countOf(group.events.length, 'event')}</p>
      <p data-year-sites="" className="hidden text-xs text-[#8b8b96] md:mt-1 md:block">
        from {countOf(sites, 'site')}
      </p>
      {landmarks > 0 ? (
        <p className="text-xs text-[#e8c14a] md:mt-1">★ {countOf(landmarks, 'landmark')}</p>
      ) : null}
      <YearProgress group={group} running={running} />
      <p
        className={cn(
          'inline-flex items-center gap-1.5 text-[11px] md:mt-2 md:flex',
          running ? 'text-[#e77fb8]' : 'text-[#5fd39b]'
        )}
      >
        {running ? (
          <span className="size-1.5 bg-current motion-safe:animate-pulse" />
        ) : (
          <Check className="size-3" strokeWidth={3} />
        )}
        {running ? 'running' : 'done'}
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
    <div className="relative pl-6">
      <span aria-hidden="true" className={cn(TRACE_MARKER_CLASS, 'top-[5px] sm:top-[6px]')}>
        <span className="size-2 rounded-full bg-[#e77fb8]" />
      </span>
      <p data-year-summary="" className="min-w-0 text-sm leading-6 text-[#f2f2f5] sm:text-[15px] sm:leading-7">
        {summary}
      </p>
    </div>
  );
}

// A finished year's last step, writing up what the agent found: the year's file, and the events and landmarks it added.
// The log reads newest first, so it opens the year's trace.
function YearWrite({ group }: { group: YearGroup }) {
  const landmarks = group.events.filter((event) => event.landmark).length;

  return (
    <div aria-hidden="true" data-year-write="" className="relative mb-4 pl-6 text-xs leading-5">
      <span className={cn(TRACE_MARKER_CLASS, 'top-[3px]')}>
        <span className="size-2 rounded-full bg-[#e77fb8]" />
      </span>
      <p className="text-[#8b8b96]">
        <ToolName>Write</ToolName>(ai-{group.year}.md)
      </p>
      <p className="mt-1 flex gap-2.5 pl-[3px] text-[#8b8b96]">
        <ResultElbow className="mt-0.5" />
        <span>
          <span className="text-[#5fd39b]">+{countOf(group.events.length, 'event')}</span>
          {landmarks > 0 ? ` · ${countOf(landmarks, 'landmark')}` : null}
        </span>
      </p>
    </div>
  );
}

export function AgentEra({ era, totalEvents }: EraInterfaceProps) {
  // The events come newest first, so the first year is the one still running
  const groups = groupEventsByYear(era.events);
  // While the reader filters, every match shows in full, and the live edge waits for the whole timeline
  const filtering = era.events.length < totalEvents;

  return (
    <div data-era-backdrop="" className="agent-backdrop px-3 pb-16 pt-6 font-mono text-[#c8c8d0] sm:px-6 sm:pb-24 sm:pt-8">
      {/* The console the agent works in: square and framed under its title bar */}
      <div data-console="" className={cn('mx-auto max-w-4xl rounded-[2px] border border-[#2a2a30]', CONSOLE_BACKGROUND)}>
        <ConsoleTitleBar />
        <div className="space-y-16 px-4 py-8 sm:px-6 sm:py-10">
          {groups.map((group, index) => (
            <AgentYear
              key={group.year}
              group={group}
              running={index === 0}
              filtering={filtering}
              frontier={index === 0 && !filtering ? era.events[0] : undefined}
            />
          ))}

          {/* The reader's instruction, the session's first prompt, so the oldest line of a log read newest first, where the
              chat thread below handed the work over. It sits in line with the log, echoed on its own row as consoles echo
              what a person types. */}
          <div className="md:pl-40">
            <p className="flex gap-3 bg-white/[0.05] px-3 py-2 text-sm leading-6 text-[#f2f2f5]">
              <TaskMark />
              <span data-instruction="">
                Take it from here: research AI from {era.range[0]} on, and keep going on your own.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AgentYearProps {
  group: YearGroup;
  running: boolean;
  filtering: boolean;
  // The latest event in the timeline, when this year holds the live edge above it
  frontier?: TimelineEvent;
}

// One year of the log. A busy year collapses its steps to one line each, apart from its landmarks and highlights,
// gathering each run of them under one task that fetches them in parallel, and its Show all button expands every
// collapsed step and back.
function AgentYear({ group, running, filtering, frontier }: AgentYearProps) {
  const { offersShowAll, showAll, toggleShowAll, inBrief } = useBriefListing(group, filtering);

  // How many collapsed steps run on from each one, counted where a run starts
  const runLengths = new Map<TimelineEvent, number>();
  let runStart: TimelineEvent | null = null;
  for (const event of group.events) {
    if (!inBrief(event)) {
      runStart = null;
    } else if (runStart) {
      runLengths.set(runStart, runLengths.get(runStart)! + 1);
    } else {
      runStart = event;
      runLengths.set(event, 1);
    }
  }

  return (
    <div data-year-group={group.year} className="md:grid md:grid-cols-[8rem_minmax(0,1fr)] md:gap-8">
      <YearColumn
        group={group}
        className="mb-6 border-b border-[#2a2a30] pb-2 md:mb-0 md:border-b-0 md:border-r md:pb-0 md:pr-5"
      >
        <AgentYearLabel group={group} running={running} />
      </YearColumn>
      <div className="min-w-0">
        {/* The task the agent takes up, ruled across the log. Its box sits over the trace line below */}
        <p className="relative flex items-center gap-3 pl-[31.5px] text-sm">
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 grid size-3.5 -translate-y-1/2 place-items-center border border-[#e77fb8] bg-[#cf4f9a]/20"
          >
            <span className="size-1.5 bg-[#e77fb8]" />
          </span>
          <span data-year-task="" className="font-bold text-[#f2f2f5]">
            Research {group.year}
          </span>
          <span aria-hidden="true" className="h-px min-w-6 flex-1 bg-[#2a2a30]" />
        </p>

        {/* The year's trace, newest first: what the agent wrote up once the year was done, its report, the live edge while
            the year runs, then its steps, the latest first, each with a node on the line down its left */}
        <div data-trace="" className="ml-[6.5px] border-l border-[#2a2a30] pt-3">
          {running ? null : <YearWrite group={group} />}
          <YearReport year={group.year} />

          {/* Sits in line with the report, like the toggle an agent offers to expand its collapsed steps */}
          {offersShowAll ? (
            <p className="mt-4 pl-6">
              <button
                type="button"
                aria-pressed={showAll}
                onClick={toggleShowAll}
                className={cn(
                  'inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f08cc4]',
                  showAll
                    ? 'border-[#e77fb8] bg-[#cf4f9a]/20 text-[#f2f2f5]'
                    : 'border-[#4a4a55] text-[#c8c8d0] hover:border-[#8b8b96] hover:text-[#f2f2f5]'
                )}
              >
                <ChevronsUpDown aria-hidden="true" className="size-3.5" />
                Show all {group.events.length} in full
              </button>
            </p>
          ) : null}

          {frontier ? <Frontier latestEvent={frontier} /> : null}

          {/* Collapsed steps sit close together, and full steps keep their room */}
          <ol className={frontier ? 'mt-3' : 'mt-5'}>
            {group.events.map((event) => {
              const brief = inBrief(event);
              const runLength = runLengths.get(event);

              return (
                <li
                  key={eventAnchorId(event)}
                  className={cn('relative pl-6 first:mt-0', brief && !runLength ? 'mt-0' : 'mt-3')}
                >
                  {runLength ? <ParallelFetches count={runLength} /> : null}
                  {brief ? null : <TraceNode landmark={Boolean(event.landmark)} />}
                  {brief ? <AgentBrief event={event} /> : <AgentStep event={event} />}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

// A full step's node on its year's trace line, amber for a landmark's checkpoint.
// It sits outside the step's card, so it holds still on the line while the card rises in.
function TraceNode({ landmark }: { landmark: boolean }) {
  return (
    <span
      aria-hidden="true"
      data-trace-node=""
      className={cn(TRACE_MARKER_CLASS, CONSOLE_BACKGROUND, landmark ? 'top-[18px] sm:top-[22px]' : 'top-[14px] sm:top-[18px]')}
    >
      <span className={cn('size-2 rounded-full', landmark ? 'bg-[#e8c14a]' : 'bg-[#e77fb8]')} />
    </span>
  );
}

// The task that heads a run of collapsed steps, fetching them all at once, with its node on the trace line
function ParallelFetches({ count }: { count: number }) {
  return (
    <>
      <span aria-hidden="true" data-trace-node="" className={cn(TRACE_MARKER_CLASS, CONSOLE_BACKGROUND, 'top-[9px]')}>
        <span className="size-2 rounded-full bg-[#5cc8d8]" />
      </span>
      <p aria-hidden="true" className="py-1.5 text-xs leading-5 text-[#8b8b96]">
        <ToolName>Task</ToolName>(<span data-batch="">{count === 1 ? '1 fetch' : `${count} fetches in parallel`}</span>)
      </p>
    </>
  );
}

// A collapsed step of a busy year: a check, then its date, linked title and source on one line, set in under its task.
// On a phone the date sits above the title, and the source follows the title's last word.
function AgentBrief({ event }: { event: TimelineEvent }) {
  return (
    <article
      {...eventCardAttributes(event)}
      data-brief=""
      className="reveal-on-scroll group relative ml-1 flex scroll-mt-[calc(var(--timeline-sticky-offset,0px)+3rem)] items-baseline gap-3 px-3 py-1 transition-colors hover:bg-white/[0.04] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#f08cc4]"
    >
      <span aria-hidden="true" className="shrink-0 text-xs text-[#5fd39b]">
        ✓
      </span>
      <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-3">
        <time dateTime={eventDateTime(event)} className="block text-xs text-[#8b8b96] sm:w-28 sm:shrink-0">
          {formatEventDate(event)}
        </time>
        <EventHeading
          event={event}
          className="inline text-sm font-medium leading-snug text-[#dcdce2] group-hover:text-[#f2f2f5] sm:block sm:min-w-0 sm:flex-1"
        />{' '}
        <EventSource event={event} className="ml-1 text-xs text-[#8b8b96] sm:ml-0 sm:shrink-0" />
      </div>
    </article>
  );
}

// A step in full: the call that fetched its source, then what came back folded under it: its date and category, its title
// and what came of it. A landmark is boxed as a checkpoint, its label set into the top edge of the box, and asks the
// person watching whether to mark it as a turning point.
function AgentStep({ event }: { event: TimelineEvent }) {
  return (
    <article
      {...eventCardAttributes(event)}
      className={cn(
        'reveal-on-scroll group relative -ml-3 scroll-mt-[calc(var(--timeline-sticky-offset,0px)+3rem)] border p-3 transition-colors has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#f08cc4] sm:py-4',
        event.landmark
          ? 'mt-1 border-[#e8c14a]/70 hover:bg-[#e8c14a]/[0.04]'
          : 'border-transparent hover:border-[#2a2a30] hover:bg-white/[0.03]'
      )}
    >
      {event.landmark ? (
        <>
          <span
            className={cn(
              'absolute -top-2.5 left-2 inline-flex items-center gap-1.5 px-1.5 text-xs font-bold leading-5 text-[#e8c14a]',
              CONSOLE_BACKGROUND
            )}
          >
            <Flag aria-hidden="true" className="size-3" />
            <span>{LANDMARK_LABEL}</span>
          </span>
          <span
            aria-hidden="true"
            className={cn('absolute -top-2.5 right-2 px-1.5 text-xs leading-5 text-[#8b8b96]', CONSOLE_BACKGROUND)}
          >
            checkpoint
          </span>
        </>
      ) : null}
      <p className="flex items-center gap-3 text-xs leading-4">
        <span data-tool-call="" className="min-w-0 truncate text-[#8b8b96]">
          <span aria-hidden="true">
            <ToolName>Fetch</ToolName>
          </span>
          <span aria-hidden="true">(</span>
          <span>{eventSource(event)}</span>
          <span aria-hidden="true">)</span>
        </span>
        <span aria-hidden="true" className="ml-auto shrink-0 text-[#8b8b96] transition-colors group-hover:text-[#f08cc4]">
          ↗
        </span>
      </p>
      <div className="mt-2 flex gap-2.5">
        <ResultElbow className="ml-1 mt-px" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#8b8b96]">
            <time dateTime={eventDateTime(event)} className="text-[#c8c8d0]">
              {formatEventDate(event)}
            </time>
            <RelativeTime event={event} before="· " className="text-[#e77fb8]" />
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <CategoryIcon category={event.category} className="size-3.5 text-[#5cc8d8]" />
              <span>{event.category}</span>
            </span>
          </p>
          <EventHeading
            event={event}
            className="mt-1.5 text-[15px] font-bold leading-snug text-[#f2f2f5] sm:text-base"
          />
          <p className="mt-2 text-sm leading-6 text-[#b4b4be]">{event.description}</p>
        </div>
      </div>
      {event.landmark ? (
        <p
          aria-hidden="true"
          data-checkpoint-prompt=""
          className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-dashed border-[#e8c14a]/30 pt-2.5 text-xs"
        >
          <span className="text-[#c8c8d0]">Mark as a turning point?</span>
          <span data-chosen="" className="text-[#e8c14a]">
            ❯ 1. Yes
          </span>
          <span className="text-[#8b8b96]">2. No</span>
        </p>
      ) : null}
    </article>
  );
}
