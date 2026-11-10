// The header every era shares: the signpost at the entrance to its region of the journey. A wooden sign names the route
// and the place, beside the badge the reader earns there; the era's marker gives its place in the journey ("Now" for the
// current one); then the era's name, its years, its count and its sprites, a sentence on what it was, and what the region
// holds: the lines the reader meets there for the first time and its turning points, each linking to its entry.
'use client';

import { Sprite } from '@/components/pokemon/ui/sprite';
import { badgePath, iconPath } from '@/lib/dex';
import { formatEventDate } from '@/lib/event-format';
import { ERA_DEFINITIONS, isCurrentEra, type Era } from '@/lib/eras';
import { previewRegion } from '@/lib/journey';
import { cn } from '@/lib/utils';
import { useDexStory } from './dex-context';
import { NO_MATCHING_EVENTS, eraEventCount, eraHeadingId } from './era-parts';

interface EraHeaderProps {
  // The era with its events oldest first
  era: Era;
  // How many events the era has before filters are applied
  totalEvents: number;
}

export function EraHeader({ era, totalEvents }: EraHeaderProps) {
  const current = isCurrentEra(era);
  const empty = era.events.length === 0;
  const filtering = era.events.length < totalEvents;
  // Only the era still under way says how recent its latest event is
  const latestEvent = current ? era.events[era.events.length - 1] : undefined;

  return (
    <header
      data-era-header=""
      className={cn('mx-auto max-w-4xl px-4 sm:px-6', empty ? 'pb-8 pt-10' : 'pb-4 pt-12 sm:pt-16')}
    >
      {/* An era the filters empty stays a short row, so the results start near the top */}
      <div className={cn('flex items-end gap-4 sm:gap-6', empty && 'hidden')}>
        <div aria-hidden="true" className="signpost">
          <p className="signpost-board">
            <span className="block font-pixel text-[0.5rem] uppercase tracking-wider opacity-80">Route {era.index + 1}</span>
            <span className="mt-1.5 block font-pixel text-[0.6875rem] uppercase leading-4 sm:text-xs">{era.place}</span>
          </p>
          <span className="signpost-post" />
        </div>
        <div
          aria-hidden="true"
          data-era-badge=""
          className="mb-2 grid size-14 shrink-0 place-items-center rounded-full border-2 border-dashed border-[#f4c542]/50 bg-white/[0.04] sm:size-16"
        >
          <Sprite src={badgePath(era.badge)} className="size-10 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] sm:size-12" />
        </div>
      </div>

      <p
        data-era-marker=""
        className={cn(
          'flex items-center gap-2 font-pixel text-[0.625rem] uppercase leading-none text-[#c9cde6]',
          !empty && 'mt-6'
        )}
      >
        <span
          aria-hidden="true"
          className={cn('size-2 rounded-full', current && 'motion-safe:animate-pulse')}
          style={{ backgroundColor: era.color }}
        />
        Era {era.index + 1} of {ERA_DEFINITIONS.length}
        {current ? ' · Now' : null}
      </p>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2
          id={eraHeadingId(era)}
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight text-white focus:outline-none sm:text-3xl"
        >
          {era.name}
        </h2>
        <p className="text-sm text-[#a7acc8]">
          <span data-era-place="">{era.place}</span> <span aria-hidden="true">·</span> {era.subtitle}{' '}
          <span aria-hidden="true">·</span> {eraEventCount(era, totalEvents)}
          {latestEvent ? ` through ${formatEventDate(latestEvent)}` : null} <span aria-hidden="true">·</span>{' '}
          Drawn in {drawnIn(era.generationName)}
        </p>
      </div>
      {empty ? (
        <p className="mt-2 text-sm text-[#d9dcef]">{NO_MATCHING_EVENTS}</p>
      ) : (
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-[#a7acc8] sm:text-[15px]">{era.description}</p>
      )}
      {!empty && !filtering ? <RegionAhead era={era} /> : null}
    </header>
  );
}

// "Generation I sprites" keeps its capital after "Drawn in", and "Animated 3D sprites" drops it
function drawnIn(generationName: string) {
  return generationName.startsWith('Generation') ? generationName : generationName[0].toLowerCase() + generationName.slice(1);
}

// What the region holds, before the reader walks into it: the lines met here for the first time and its turning points
function RegionAhead({ era }: { era: Era }) {
  const story = useDexStory();
  if (!story) {
    return null;
  }
  const { newLines, turningPoints } = previewRegion(era, story.events, story.dex);
  if (newLines.length === 0 && turningPoints.length === 0) {
    return null;
  }

  return (
    <div data-region-ahead="" className="region-ahead mt-6 grid gap-5 rounded-2xl p-4 sm:grid-cols-2 sm:p-5">
      {newLines.length > 0 ? (
        <div>
          <h3 className="font-pixel text-[0.5625rem] uppercase text-[#f4e3b5]">New branches you’ll meet</h3>
          <ul className="mt-3 grid gap-2">
            {newLines.map(({ line, species, anchorId }) => (
              <li key={line.id}>
                <a
                  href={`#${anchorId}`}
                  className="flex items-center gap-2 rounded-lg text-sm text-[#e4e6f5] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcb05]"
                >
                  <Sprite src={iconPath(species.id)} pixelated className="size-8 shrink-0 object-contain" />
                  <span>
                    <span className="font-semibold text-white">{species.name}</span>{' '}
                    <span className="text-[#a7acc8]">· {line.name}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {turningPoints.length > 0 ? (
        <div>
          <h3 className="font-pixel text-[0.5625rem] uppercase text-[#f4e3b5]">Turning points ahead</h3>
          <ul className="mt-3 grid gap-2">
            {turningPoints.map(({ title, year, anchorId }) => (
              <li key={anchorId}>
                <a
                  href={`#${anchorId}`}
                  className="flex items-baseline gap-2 rounded-lg text-sm text-[#e4e6f5] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcb05]"
                >
                  <span aria-hidden="true" className="text-[var(--legend-gold)]">★</span>
                  <span className="font-pixel text-[0.5625rem] text-[#a7acc8]">{year}</span>
                  <span>{title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
