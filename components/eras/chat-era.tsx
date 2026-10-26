// Draws the Generative AI Era as a multi-turn transformer conversation organized into annual chapters (2020–2026),
// with right-aligned user prompts per year, sticky month dividers, keystone breakthrough elevation, and source provenance.
'use client';

import { MessageSquare, Sparkles } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/category-icon';
import { eventAnchorId, eventDateTime, formatEventDate } from '@/lib/event-format';
import {
  GENERATIVE_ERA_YEAR_PROMPTS,
  groupEventsByYear,
  isLandmarkEvent,
} from '@/lib/landmarks';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/types/timeline';
import {
  CollapsedEraBanner,
  EventHeading,
  KeystoneBadge,
  SourceDomainBadge,
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
  if (era.events.length === 0) {
    return (
      <div className="chat-backdrop border-b border-white/10 px-4 py-6 text-[#ececf1] sm:px-6">
        <CollapsedEraBanner era={era} totalEvents={totalEvents} />
      </div>
    );
  }

  const lastEvent = era.events.at(-1);
  const yearClusters = groupEventsByYear(era.events);

  return (
    <div className="chat-backdrop border-b border-white/10 px-4 py-20 text-[#ececf1] sm:px-6 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <header className="mx-auto max-w-3xl">
          <div className="flex justify-end">
            <p className="max-w-md rounded-3xl rounded-br-lg border border-white/10 bg-[#262631] px-5 py-3 text-[15px] leading-7 text-[#ececf1] shadow-lg">
              What happened to AI after 2020?
            </p>
          </div>
          <div className="mt-8 flex gap-3 sm:gap-4">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-[#9085e9] text-[#0c0c10] shadow-[0_0_20px_rgba(144,133,233,0.45)]"
            >
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#a1a1aa]">
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
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-[#a1a1aa]">
                {eraEventCount(era, totalEvents)}
                {lastEvent ? ` through ${formatEventDate(lastEvent)}` : null}{' '}
                <span aria-hidden="true">·</span> {era.interfaceName}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-14 space-y-14 sm:mt-20">
          {yearClusters.map((cluster) => {
            const yearTurn = GENERATIVE_ERA_YEAR_PROMPTS[cluster.year];
            const monthGroups = groupByMonth(cluster.events);

            return (
              <div
                key={cluster.year}
                className="border-t border-white/[0.08] pt-10 first:border-t-0 first:pt-0"
              >
                {/* Conversational Turn Header: Right-aligned User Prompt per Year */}
                <div aria-hidden="true" className="mb-8 flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-violet-300/80">
                    <MessageSquare className="size-3.5" />
                    <span>
                      Prompt // {cluster.year} ({cluster.events.length}{' '}
                      {cluster.events.length === 1 ? 'milestone' : 'milestones'})
                    </span>
                  </div>
                  <div className="max-w-xl rounded-3xl rounded-br-md border border-violet-400/25 bg-[#201f2d] px-5 py-3 text-right text-sm leading-6 text-zinc-100 shadow-md sm:text-[15px]">
                    <p className="font-medium">
                      {yearTurn?.prompt ?? `What were the defining breakthroughs of ${cluster.year}?`}
                    </p>
                    {yearTurn?.summary ? (
                      <p className="mt-1 font-mono text-xs text-violet-300/75">{yearTurn.summary}</p>
                    ) : null}
                  </div>
                </div>

                <div className="md:grid md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-8">
                  {/* Left Sticky Year Spine */}
                  <div
                    aria-hidden="true"
                    className="mb-4 flex items-baseline justify-between border-b border-white/10 pb-2 md:mb-0 md:block md:border-b-0 md:border-r md:pr-5 md:pb-0"
                  >
                    <div className="md:sticky md:top-[calc(var(--timeline-sticky-offset,0px)+1.5rem)]">
                      <span className="block font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {cluster.year}
                      </span>
                      <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400">
                        {cluster.events.length} events
                      </span>
                      {cluster.landmarkCount > 0 ? (
                        <span className="mt-2 inline-block rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] text-violet-300">
                          ★ {cluster.landmarkCount} keystone
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Right Month-Grouped Assistant Thread */}
                  <div className="space-y-8">
                    {monthGroups.map((group) => (
                      <div key={group.label} data-month={group.label} className="relative">
                        {/* The rule stays where the month begins. Only the date pins below the toolbar,
                            and it lets clicks through to the messages scrolling under it. */}
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 top-[0.8125rem] h-px bg-white/10"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none sticky top-[calc(var(--timeline-sticky-offset,0px)+0.5rem)] z-20 flex justify-center"
                        >
                          <span
                            data-month-divider=""
                            className="rounded-full border border-white/15 bg-[#1b1b24] px-3.5 py-1 font-mono text-xs font-medium text-[#d4d4dc] shadow-[0_6px_16px_-6px_rgba(0,0,0,0.9)]"
                          >
                            {group.label}
                          </span>
                        </div>
                        <ol className="mt-5 space-y-3.5">
                          {group.events.map((event) => (
                            <li key={eventAnchorId(event)}>
                              <ChatMessage event={event} />
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-14 flex max-w-3xl items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[#a1a1aa]">
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
  const landmark = isLandmarkEvent(event);

  return (
    <article
      id={eventAnchorId(event)}
      data-year={event.year}
      className="reveal-on-scroll group relative flex scroll-mt-[calc(var(--timeline-sticky-offset,0px)+3rem)] gap-3 rounded-2xl has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-[#b4abf5] sm:gap-4"
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-full border text-[#b4abf5]',
          landmark
            ? 'border-violet-400/50 bg-violet-500/20 text-violet-200 shadow-[0_0_16px_rgba(144,133,233,0.35)]'
            : 'border-white/10 bg-[#1f1f27]'
        )}
      >
        <CategoryIcon category={event.category} className="size-4" />
      </span>
      <div
        className={cn(
          'min-w-0 flex-1 rounded-2xl rounded-tl-md border px-4 py-3.5 transition-colors sm:px-5 sm:py-4',
          landmark
            ? 'border-violet-400/40 bg-gradient-to-br from-[#1c1b29] to-[#15151e] group-hover:border-violet-300/70'
            : 'border-white/[0.08] bg-[#15151b] group-hover:border-[#9085e9]/60'
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#a1a1aa]">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium text-zinc-300">{event.category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={eventDateTime(event)} className="font-mono text-zinc-400">
              {formatEventDate(event)}
            </time>
            <KeystoneBadge
              event={event}
              className="rounded-full border border-violet-400/40 bg-violet-500/15 px-2 py-0.5 text-violet-200"
            />
          </p>
          <SourceDomainBadge link={event.link} className="text-zinc-400" />
        </div>
        <EventHeading
          event={event}
          className={cn(
            'mt-1.5 font-semibold leading-snug text-white',
            landmark ? 'text-lg sm:text-[19px]' : 'text-base sm:text-[17px]'
          )}
        />
        <p className="mt-1.5 text-[15px] leading-7 text-[#c9c9d1]">{event.description}</p>
      </div>
    </article>
  );
}
