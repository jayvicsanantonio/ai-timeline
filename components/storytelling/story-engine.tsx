// Orchestrates the page: the prologue, the five era chapters with their toolbar and navigation, the insights
// and the epilogue. Holds the search and category filters, so every part of the timeline shows the same events.
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
  events: TimelineEvent[];
}

export function StoryEngine({ events }: StoryEngineProps) {
  const [filters, setFilters] = useState<TimelineFilters>(NO_FILTERS);
  const timelineRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const eras = useMemo(() => groupEventsByEra(events), [events]);
  const eraIds = useMemo(() => eras.map((era) => era.id), [eras]);
  const shownEvents = useMemo(() => filterEvents(events, filters), [events, filters]);
  const shownEras = useMemo(() => groupEventsByEra(shownEvents), [shownEvents]);
  const activity = useMemo(() => countEventsByYear(events), [events]);
  const shownActivity = useMemo(
    () => countEventsByYear(events, shownEvents),
    [events, shownEvents]
  );
  const categoryCounts = useMemo(() => countEventsByCategory(events), [events]);
  const pace = useMemo(() => describePace(events, eras[eras.length - 1].range[0]), [events, eras]);

  useTimelineShortcuts({ eraIds, searchInputRef });

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
      <PrologueScene eras={eras} activity={activity} totalEvents={events.length} />

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
            {/* The turn into the final era says how much faster its events come, unless the reader is filtering */}
            {index === shownEras.length - 1 && pace && !isFiltering(filters) ? <PaceLine pace={pace} /> : null}
            <EraChapter era={era} totalEvents={eras[index].events.length} />
          </Fragment>
        ))}
      </div>

      <TimelineNavigation eras={eras} activity={shownActivity} contentKey={shownEvents} />

      <TimelineInsights events={events} />

      <EpilogueScene firstEraId={eras[0].id} firstYear={activity[0]?.year ?? eras[0].range[0]} />
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
        The next <span className="font-medium text-white">{pace.years} years</span> hold{' '}
        <span className="font-medium text-white">{pace.events} events</span>,{' '}
        <span className="font-medium text-white">{pace.multiple} times</span> as many as the{' '}
        {pace.yearsBefore} years before them.
      </p>
    </div>
  );
}
