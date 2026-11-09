// Orchestrates the page, which rewinds from now: the prologue with the latest events, the six eras from the Agentic Era
// back to the Foundation Era with their toolbar and navigation, the insights and the epilogue where it all began.
// Builds the AI Dex once from every event and holds the search and category filters, so every part of the timeline shows
// the same events under the same numbers and creatures.
'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { PrologueScene } from './prologue-scene';
import { EpilogueScene } from './epilogue-scene';
import { DexProvider } from '@/components/eras/dex-context';
import { EraChapter } from '@/components/eras/era-chapter';
import { TimelineInsights } from '@/components/interactive/timeline-insights';
import { TimelineControls } from '@/components/timeline/timeline-controls';
import { TimelineNavigation } from '@/components/timeline/timeline-navigation';
import { useTimelineShortcuts } from '@/hooks/use-timeline-shortcuts';
import { buildDex } from '@/lib/dex';
import { groupEventsByEra } from '@/lib/eras';
import { erasNewestFirst, latestEvents } from '@/lib/newest-first';
import { describePace, type Pace } from '@/lib/pace';
import { countEventsByYear } from '@/lib/timeline-activity';
import {
  countEventsByCategory,
  filterEvents,
  isFiltering,
  NO_FILTERS,
  type TimelineFilters,
} from '@/lib/timeline-filter';
import type { TimelineEvent } from '@/types/timeline';

interface StoryEngineProps {
  // Every event, oldest first, as the data keeps them
  events: TimelineEvent[];
}

// How many of the newest events the opening lists
const LATEST_COUNT = 3;

export function StoryEngine({ events }: StoryEngineProps) {
  const [filters, setFilters] = useState<TimelineFilters>(NO_FILTERS);
  const timelineRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // The eras in time order, as the opening's chart runs
  const eras = useMemo(() => groupEventsByEra(events), [events]);
  // The eras in the page's order, the latest first, each with its events newest first
  const pageEras = useMemo(() => erasNewestFirst(eras), [eras]);
  // The number keys follow the page, so 1 is the era at the top
  const pageEraIds = useMemo(() => pageEras.map((era) => era.id), [pageEras]);
  const shownEvents = useMemo(() => filterEvents(events, filters), [events, filters]);
  const shownEras = useMemo(() => erasNewestFirst(groupEventsByEra(shownEvents)), [shownEvents]);
  const latest = useMemo(() => latestEvents(events, LATEST_COUNT), [events]);
  const activity = useMemo(() => countEventsByYear(events), [events]);
  const shownActivity = useMemo(
    () => countEventsByYear(events, shownEvents),
    [events, shownEvents]
  );
  const categoryCounts = useMemo(() => countEventsByCategory(events), [events]);
  const pace = useMemo(() => describePace(events, eras[eras.length - 1].range[0]), [events, eras]);
  const dex = useMemo(() => buildDex(events), [events]);

  useTimelineShortcuts({ eraIds: pageEraIds, searchInputRef });

  // Sticky parts of the eras, like the chat's month dividers, sit just below the toolbar
  useEffect(() => {
    const timeline = timelineRef.current;
    const toolbar = toolbarRef.current;
    if (!timeline || !toolbar) {
      return;
    }

    // Measured to the fraction of a pixel, which offsetHeight would round away
    const observer = new ResizeObserver(() => {
      timeline.style.setProperty('--timeline-sticky-offset', `${toolbar.getBoundingClientRect().height}px`);
    });
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, []);

  // Brings the start of the results into view when the reader filters from further down the timeline
  const handleFiltersChange = (nextFilters: TimelineFilters) => {
    setFilters(nextFilters);

    const timelineTop = timelineRef.current?.getBoundingClientRect().top ?? 0;
    if (timelineTop < 0) {
      window.scrollTo({
        top: window.scrollY + timelineTop,
        behavior: 'instant' as ScrollBehavior,
      });
    }
  };

  return (
    <DexProvider dex={dex}>
    <div className="relative">
      <PrologueScene eras={eras} activity={activity} latest={latest} totalEvents={events.length} />

      {/* The offset starts at the toolbar's height in one row, and is measured once the page runs */}
      <div ref={timelineRef} className="relative [--timeline-sticky-offset:66px]">
        <TimelineControls
          ref={toolbarRef}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categoryCounts={categoryCounts}
          shownCount={shownEvents.length}
          totalCount={events.length}
          searchInputRef={searchInputRef}
        />
        {shownEras.map((era, index) => (
          <Fragment key={era.id}>
            <EraChapter era={era} totalEvents={pageEras[index].events.length} />
            {/* The turn out of the latest era says how much faster its events came than those of the years below
                it, ahead of the next era's header, unless the reader is filtering */}
            {index === 0 && pace && !isFiltering(filters) ? <PaceLine pace={pace} /> : null}
          </Fragment>
        ))}
      </div>

      <TimelineNavigation eras={pageEras} activity={shownActivity} contentKey={shownEvents} />

      <TimelineInsights events={events} />

      <EpilogueScene latestEraId={pageEras[0].id} firstEvent={events[0]} latestYear={events[events.length - 1].year} />
    </div>
    </DexProvider>
  );
}

// A message box between two eras, as the games print news, with its numbers picked out. It leads into the header of the
// era below, so it shares that header's box and left edge.
function PaceLine({ pace }: { pace: Pace }) {
  return (
    <div className="bg-background px-4 pt-10 sm:px-6 sm:pt-12">
      <div className="dex-textbox mx-auto max-w-4xl px-5 py-4 sm:px-7 sm:py-5">
        <p className="font-pixel text-[0.5625rem] uppercase text-[#48506b]">Evolution speed</p>
        <p
          data-pace-line=""
          className="mt-2 text-balance text-lg leading-8 sm:text-xl sm:leading-9"
        >
          The last <strong className="font-semibold text-[#c2142e]">{pace.years} years</strong> hold{' '}
          <strong className="font-semibold text-[#c2142e]">{pace.events} events</strong>,{' '}
          <strong className="font-semibold text-[#c2142e]">{pace.multiple} times</strong> the yearly pace of the{' '}
          {pace.yearsBefore} years before them.
          <span aria-hidden="true" className="text-caret ml-1 text-sm text-[#e3263b]">
            ▼
          </span>
        </p>
      </div>
    </div>
  );
}
