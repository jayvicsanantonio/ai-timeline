// Orchestrates the Pokémon theme, an adventure forward through AI history: the title screen with the latest news, the world
// map of the six regions, the professor's briefing on the nine lines the story follows, the six eras from the Foundation Era
// to the Agentic Era with their toolbar and navigation, the trainer card and the Hall of Fame with the party as it stands
// today. Builds the AI Dex once from every event and holds the search and category filters, so every part of the timeline
// shows the same events under the same numbers, lines and scenes. The theme's styles come with this module, which the page
// downloads only when the reader asks for the theme (components/theme/load-pokemon-theme.ts).
'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import '@/app/pokemon.css';
import { PartyScene } from './party-scene';
import { PrologueScene } from './prologue-scene';
import { WorldMap } from './world-map';
import { EpilogueScene } from './epilogue-scene';
import { DexProvider } from '@/components/pokemon/eras/dex-context';
import { EraChapter } from '@/components/pokemon/eras/era-chapter';
import { TimelineInsights } from '@/components/pokemon/interactive/timeline-insights';
import { TimelineControls } from '@/components/pokemon/timeline/timeline-controls';
import { TimelineNavigation } from '@/components/pokemon/timeline/timeline-navigation';
import { useTimelineShortcuts } from '@/hooks/use-timeline-shortcuts';
import { buildDex } from '@/lib/dex';
import { groupEventsByEra } from '@/lib/eras';
import { latestEvents } from '@/lib/newest-first';
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

export function PokemonStoryEngine({ events }: StoryEngineProps) {
  const [filters, setFilters] = useState<TimelineFilters>(NO_FILTERS);
  const timelineRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // The eras in time order, as the page runs, each with its events oldest first
  const eras = useMemo(() => groupEventsByEra(events), [events]);
  // The number keys follow the page, so 1 is the Foundation Era at the top
  const eraIds = useMemo(() => eras.map((era) => era.id), [eras]);
  const shownEvents = useMemo(() => filterEvents(events, filters), [events, filters]);
  const shownEras = useMemo(() => groupEventsByEra(shownEvents), [shownEvents]);
  const latest = useMemo(() => latestEvents(events, LATEST_COUNT), [events]);
  const activity = useMemo(() => countEventsByYear(events), [events]);
  const shownActivity = useMemo(
    () => countEventsByYear(events, shownEvents),
    [events, shownEvents]
  );
  const categoryCounts = useMemo(() => countEventsByCategory(events), [events]);
  const pace = useMemo(() => describePace(events, eras[eras.length - 1].range[0]), [events, eras]);
  const dex = useMemo(() => buildDex(events), [events]);

  useTimelineShortcuts({ eraIds, searchInputRef });

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
    <DexProvider dex={dex} events={events}>
    <div className="relative">
      <PrologueScene
        eras={eras}
        latest={latest}
        totalEvents={events.length}
        firstYear={events[0].year}
        lastYear={events[events.length - 1].year}
      />

      <WorldMap eras={eras} activity={activity} totalEvents={events.length} />

      <PartyScene />

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
            {/* The turn into the latest era says how much faster its events came than those of all the years before
                it, ahead of its header, unless the reader is filtering */}
            {index === shownEras.length - 1 && pace && !isFiltering(filters) ? <PaceLine pace={pace} /> : null}
            <EraChapter era={era} totalEvents={eras[index].events.length} />
          </Fragment>
        ))}
      </div>

      <TimelineNavigation eras={eras} activity={shownActivity} contentKey={shownEvents} />

      <TimelineInsights events={events} />

      <EpilogueScene firstEraId={eras[0].id} firstEvent={events[0]} latestEvent={events[events.length - 1]} />
    </div>
    </DexProvider>
  );
}

// A message box between the last two eras, as the games print news, with its numbers picked out. It leads into the header
// of the latest era, so it shares that header's box and left edge.
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
