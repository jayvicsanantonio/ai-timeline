// Era navigation, drawn as a small dex: a rail on wide screens with the current year, the party as every line stands at the
// reading position (each creature evolving as the reader scrolls past its evolution), an events-per-year chart and a button
// per era marking the year it began; and a phone bar that names the current era and opens a list of eras with their
// badges and the party. Both follow the page, which runs from 1943 at the top to now, and stay hidden until the timeline
// starts.
'use client';

import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';
import { ActivityChart } from '@/components/timeline/activity-chart';
import { Sprite } from '@/components/pokemon/ui/sprite';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useTimelinePosition } from '@/hooks/use-timeline-position';
import { useDexStory } from '@/components/pokemon/eras/dex-context';
import { badgePath, iconPath, partyAfter, type PartyMember } from '@/lib/dex';
import type { Era } from '@/lib/eras';
import { eventAnchorId } from '@/lib/event-format';
import type { YearActivity } from '@/lib/timeline-activity';
import { scrollToEra, scrollToYear } from '@/lib/timeline-scroll';
import { cn } from '@/lib/utils';

interface TimelineNavigationProps {
  // Every era with all of its events, so the eras keep their counts while filtering, in the page's order, the first first
  eras: Era[];
  activity: YearActivity[];
  // Changes whenever the shown events change, so the reading position is measured again
  contentKey?: unknown;
}

// Visibility flips at once when the navigation appears, so it can be reached right away, but waits
// for the fade to finish when it leaves
const SHOWN =
  'visible opacity-100 [transition:opacity_300ms,translate_300ms,visibility_0s] motion-reduce:transition-none';
const HIDDEN =
  'invisible opacity-0 [transition:opacity_300ms,translate_300ms,visibility_0s_linear_300ms] motion-reduce:transition-none';

interface EraProgressProps {
  progress: number;
  color: string;
  className?: string;
}

// How far the reader has come through the current era. The year chart squeezes the busy 2020s
// into a few rows, so this keeps the navigation moving while the reader scrolls through them.
function EraProgress({ progress, color, className }: EraProgressProps) {
  return (
    <span aria-hidden="true" className={cn('block h-0.5 overflow-hidden rounded-full bg-white/10', className)}>
      <span
        data-era-progress=""
        className="block h-full rounded-full"
        style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: color }}
      />
    </span>
  );
}

export function TimelineNavigation({ eras, activity, contentKey }: TimelineNavigationProps) {
  const reduceMotion = usePrefersReducedMotion();
  const eraIds = useMemo(() => eras.map((era) => era.id), [eras]);
  const position = useTimelinePosition(eraIds, contentKey);
  const [isPhoneListOpen, setIsPhoneListOpen] = useState(false);
  const phoneListId = useId();
  const phoneToggleRef = useRef<HTMLButtonElement>(null);
  const story = useDexStory();
  // At an era's header no event of that era has been read yet, so the party stands as the last era before it left it
  const readingEraIndex = Math.max(eraIds.indexOf(position.eraId), 0);
  const eventBefore = position.inTimeline
    ? eras
        .slice(0, readingEraIndex)
        .flatMap((era) => era.events)
        .at(-1)
    : undefined;
  const partyAnchor = position.eventId ?? (eventBefore ? eventAnchorId(eventBefore) : null);
  const party = useMemo(
    () => (story ? partyAfter(story.dex, story.events, partyAnchor) : []),
    [story, partyAnchor]
  );

  if (eras.length === 0) {
    return null;
  }

  const activeIndex = Math.max(eraIds.indexOf(position.eraId), 0);
  const activeEra = eras[activeIndex];
  const firstYear = activity[0]?.year ?? activeEra.range[0];
  const lastYear = activity.at(-1)?.year ?? firstYear;
  // While an era's header is being read, the clock shows the first year of the era the chart reaches, where its events start
  const year = position.year ?? Math.max(activeEra.range[0], firstYear);
  // The year an era began, or the first year the chart reaches
  const startYear = (era: Era) => Math.max(era.range[0], firstYear);

  // How far down the chart, which runs the first year at the top, the middle of the row for the year an era began sits
  const startShare = (era: Era) => {
    const row = Math.min(Math.max(startYear(era) - firstYear, 0), activity.length - 1);
    return activity.length > 0 ? (row + 0.5) / activity.length : 0;
  };

  const handlePhoneNavigate = (eraId: string) => {
    scrollToEra(eraId);
    setIsPhoneListOpen(false);
    // The picked era's button unmounts with the list, so focus moves back to the toggle
    phoneToggleRef.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <nav
        aria-label="Timeline navigation"
        data-state={position.inTimeline ? 'visible' : 'hidden'}
        className={cn(
          'fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block',
          position.inTimeline ? SHOWN : cn(HIDDEN, 'translate-x-4')
        )}
      >
        <div className="w-[8.75rem] overflow-hidden rounded-2xl border border-white/10 bg-[#11142a]/90 p-3 text-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          {/* The dex's red cap, its lens and lights */}
          <div
            aria-hidden="true"
            className="-mx-3 -mt-3 mb-3 flex items-center gap-1.5 bg-gradient-to-b from-[#e3263b] to-[#b3152b] px-3 py-2.5"
          >
            <span className="size-4 rounded-full bg-[radial-gradient(circle_at_35%_30%,#c8f1ff_0_15%,#34b7f1_16%_50%,#0b5fa8)] ring-2 ring-white/90" />
            <span className="ml-1 size-1.5 rounded-full bg-[#ff9aa6]" />
            <span className="size-1.5 rounded-full bg-[#ffcb05]" />
            <span className="size-1.5 rounded-full bg-[#4ade80]" />
          </div>
          <p className="px-1">
            {/* The month keeps its line even when unknown, so the year never jumps up and down */}
            <span className="block h-4 text-[11px] font-medium uppercase leading-4 tracking-[0.18em] text-[#a7acc8]">
              {position.month}
            </span>
            <span data-rail-year="" className="mt-1 block font-pixel text-xl leading-none tabular-nums">
              {year}
            </span>
            <span className="mt-2.5 flex items-start gap-1.5 text-xs leading-tight text-[#d9dcef]">
              <Sprite src={badgePath(activeEra.badge)} className="size-4 shrink-0 object-contain" />
              <span>
                {activeEra.label}
                <span data-rail-place="" className="mt-0.5 block font-pixel text-[0.4375rem] uppercase leading-3 text-[#f4e3b5]">
                  {activeEra.place}
                </span>
              </span>
            </span>
          </p>
          <EraProgress progress={position.eraProgress} color={activeEra.color} className="mx-1 mt-2" />

          <Party party={party} className="mt-3" />

          <div className="relative mt-4 h-[min(34vh,20rem)]">
            <ActivityChart
              activity={activity}
              orientation="vertical"
              verticalTop="first"
              currentYear={position.year}
              onSelectYear={scrollToYear}
              className="absolute inset-y-0 left-11 right-0"
            />
            {eras.map((era, index) => {
              const isActive = era.id === activeEra.id;

              return (
                <button
                  key={era.id}
                  type="button"
                  aria-label={`${era.label}, ${era.subtitle}`}
                  aria-current={isActive ? 'location' : undefined}
                  onClick={() => scrollToEra(era.id)}
                  className={cn(
                    'group absolute left-0 flex h-7 w-10 items-center justify-center gap-1 rounded-lg border font-mono text-[11px] tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcb05]/60',
                    isActive
                      ? 'border-white/30 bg-white/[0.12] text-white'
                      : 'border-transparent text-[#a7acc8] hover:bg-white/[0.08] hover:text-white'
                  )}
                  // Centered on the row for the year its era began, like a tick on the chart's axis, but never above the
                  // bottom of the button before it, since the short eras of the 2020s take up only a few rows at the top
                  style={{
                    top: `clamp(${index} * 1.75rem, calc(${startShare(era) * 100}% - 0.875rem), calc(100% - ${eras.length - index} * 1.75rem))`,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: era.color }}
                  />
                  {startYear(era)}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md border border-white/10 bg-[#1a1f3a] px-2 py-1 font-sans text-xs text-white shadow-lg group-hover:block group-focus-visible:block"
                  >
                    {era.label} · {era.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-3 px-1 text-[11px] leading-snug text-[#7d84a6]">
            Events per year, {firstYear} to now
          </p>
        </div>
      </nav>

      <nav
        aria-label="Timeline navigation"
        data-state={position.inTimeline ? 'visible' : 'hidden'}
        className={cn(
          'fixed inset-x-0 bottom-3 z-40 px-3 xl:hidden',
          position.inTimeline ? SHOWN : cn(HIDDEN, 'translate-y-4')
        )}
      >
        {/* The toggle comes first in DOM order so Tab moves from it into the open list,
            and flex-col-reverse draws the chart and the list above it */}
        <div className="mx-auto flex max-w-lg flex-col-reverse overflow-hidden rounded-2xl border border-white/10 border-b-[#e3263b] border-b-2 bg-[#11142a]/95 text-white shadow-[0_26px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <button
            ref={phoneToggleRef}
            type="button"
            onClick={() => setIsPhoneListOpen((isOpen) => !isOpen)}
            aria-expanded={isPhoneListOpen}
            aria-controls={isPhoneListOpen ? phoneListId : undefined}
            className="relative flex w-full items-center gap-3 px-4 pb-2.5 pt-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ffcb05]/50"
          >
            <EraProgress
              progress={position.eraProgress}
              color={activeEra.color}
              className="absolute inset-x-4 bottom-1"
            />
            <Sprite src={badgePath(activeEra.badge)} className="size-5 shrink-0 object-contain" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              <span className="sr-only">Current era: </span>
              {activeEra.label}
            </span>
            <span className="font-pixel text-xs tabular-nums">{year}</span>
            <ChevronUp
              aria-hidden="true"
              className={cn(
                'size-4 shrink-0 text-[#a7acc8] motion-safe:transition-transform',
                isPhoneListOpen && 'rotate-180'
              )}
            />
          </button>

          <ActivityChart
            activity={activity}
            orientation="horizontal"
            currentYear={position.year}
            className="mx-4 mt-2 h-1.5"
            barsClassName="gap-px"
          />

          {isPhoneListOpen ? (
            <motion.div
              id={phoneListId}
              className="flex max-h-[calc(100dvh-6rem)] flex-col gap-1 overflow-y-auto border-b border-white/10 p-2"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Party party={party} className="mb-1 rounded-xl bg-white/[0.04] p-2" columns="grid-cols-9" />
              {eras.map((era) => {
                const isActive = era.id === activeEra.id;

                return (
                  <button
                    key={era.id}
                    type="button"
                    onClick={() => handlePhoneNavigate(era.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcb05]/50',
                      isActive ? 'bg-white/[0.1] text-white' : 'text-[#d9dcef] hover:bg-white/[0.06]'
                    )}
                  >
                    <Sprite src={badgePath(era.badge)} className="size-6 shrink-0 object-contain" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{era.label}</span>
                    <span className="shrink-0 text-xs text-[#a7acc8]">{era.subtitle}</span>
                  </button>
                );
              })}
            </motion.div>
          ) : null}
        </div>
      </nav>
    </>
  );
}

// The party at the reading position: each line's creature as it stands there, or an empty slot before the line appears.
// Screen readers hear each line, its creature and level.
function Party({ party, className, columns = 'grid-cols-3' }: { party: PartyMember[]; className?: string; columns?: string }) {
  if (party.length === 0) {
    return null;
  }

  return (
    <ol aria-label="Your party here" data-party="" className={cn('grid gap-1', columns, className)}>
      {party.map((member) => (
        <li
          key={member.line.id}
          data-party-member={member.line.id}
          data-species={member.species?.id}
          className="grid aspect-square place-items-center rounded-lg bg-white/[0.05]"
        >
          {member.species ? (
            <>
              <Sprite src={iconPath(member.species.id)} pixelated className="size-8 object-contain" />
              <span className="sr-only">
                {member.line.name}: {member.species.name}, level {member.level}
              </span>
            </>
          ) : (
            <>
              <span aria-hidden="true" className="size-2 rounded-full bg-white/15" />
              <span className="sr-only">{member.line.name}: not yet appeared</span>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}
