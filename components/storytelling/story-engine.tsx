// Orchestrates the page, which reads newest first: the prologue with the latest events, the six era chapters from the
// Agentic Era back to the Foundation Era with their toolbar and navigation, the insights and the epilogue.
// Holds the search and category filters, so every part of the timeline shows the same events.
'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { PrologueScene } from './prologue-scene';
import { EpilogueScene } from './epilogue-scene';
import { EraChapter } from '@/components/eras/era-chapter';
import { TimelineInsights } from '@/components/interactive/timeline-insights';
import { TimelineControls } from '@/components/timeline/timeline-controls';
import { TimelineNavigation } from '@/components/timeline/timeline-navigation';
import { useTimelineShortcuts } from '@/hooks/use-timeline-shortcuts';
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

  // The eras in time order, as the opening's chart and the chapter numbers run
  const eras = useMemo(() => groupEventsByEra(events), [events]);
  // The number keys pick chapters by number, so 1 stays the Foundation Era wherever it sits on the page
  const chapterIds = useMemo(() => eras.map((era) => era.id), [eras]);
  // The eras in the page's order, the latest first, each with its events newest first
  const pageEras = useMemo(() => erasNewestFirst(eras), [eras]);
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

  useTimelineShortcuts({ eraIds: chapterIds, searchInputRef });

  // Sticky parts of the eras, like the chat's month dividers, sit just below the toolbar
  useEffect(() => {
    const timeline = timelineRef.current;
    const toolbar = toolbarRef.current;
    if (!timeline || !toolbar) {
      return;
    }

    const observer = new ResizeObserver(() => {
      timeline.style.setProperty('--timeline-sticky-offset', `${toolbar.offsetHeight}px`);
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
    <div className="relative">
      <PrologueScene eras={eras} activity={activity} latest={latest} totalEvents={events.length} />

      {/* The offset starts at the toolbar's height in one row, and is measured once the page runs */}
      <div ref={timelineRef} className="relative [--timeline-sticky-offset:65px]">
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
                it, unless the reader is filtering */}
            {index === 0 && pace && !isFiltering(filters) ? <PaceLine pace={pace} /> : null}
          </Fragment>
        ))}
      </div>

      <TimelineNavigation eras={pageEras} activity={shownActivity} contentKey={shownEvents} />

      <TimelineInsights events={events} />

      <EpilogueScene latestEraId={pageEras[0].id} />
    </div>
  );
}

// A line in the black between two eras, like a film's intertitle, with its numbers picked out in white
function PaceLine({ pace }: { pace: Pace }) {
  return (
    <div className="bg-[#0a0a0b] px-4 py-14 sm:px-6 sm:py-16">
      <p
        data-pace-line=""
        className="mx-auto max-w-2xl text-balance text-center text-xl font-light leading-9 text-zinc-400 sm:text-2xl sm:leading-10"
      >
        The last <span className="font-medium text-white">{pace.years} years</span> hold{' '}
        <span className="font-medium text-white">{pace.events} events</span>,{' '}
        <span className="font-medium text-white">{pace.multiple} times</span> the yearly pace of the{' '}
        {pace.yearsBefore} years before them.
      </p>
    </div>
  );
}
