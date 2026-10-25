// Orchestrates the page: the prologue, the five era chapters with their toolbar and navigation, the insights
// and the epilogue. Holds the search and category filters, so every part of the timeline shows the same events.
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PrologueScene } from './prologue-scene';
import { EpilogueScene } from './epilogue-scene';
import { EraChapter } from '@/components/eras/era-chapter';
import { TimelineInsights } from '@/components/interactive/timeline-insights';
import { TimelineControls } from '@/components/timeline/timeline-controls';
import { TimelineNavigation } from '@/components/timeline/timeline-navigation';
import { useTimelineShortcuts } from '@/hooks/use-timeline-shortcuts';
import { groupEventsByEra } from '@/lib/eras';
import { countEventsByYear } from '@/lib/timeline-activity';
import {
  countEventsByCategory,
  filterEvents,
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
          <EraChapter key={era.id} era={era} totalEvents={eras[index].events.length} />
        ))}
      </div>

      <TimelineNavigation eras={eras} activity={shownActivity} contentKey={shownEvents} />

      <TimelineInsights events={events} />

      <EpilogueScene firstEraId={eras[0].id} firstYear={activity[0]?.year ?? eras[0].range[0]} />
    </div>
  );
}
