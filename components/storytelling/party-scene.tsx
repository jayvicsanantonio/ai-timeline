// The map of the story, right after the opening: the nine lines the journey follows, each with every stage it has
// reached, when it got there and the event that evolved it, and how many entries it holds. A line's first stage links to
// the entry where it appears, and each later stage to the scene where it evolves.
'use client';

import { ChevronRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useDexStory } from '@/components/eras/dex-context';
import { Sprite } from '@/components/ui/sprite';
import { ART, LINES, speciesOf, type LineId } from '@/lib/dex';
import { eventAnchorId } from '@/lib/event-format';

interface StageStop {
  species: number;
  year: number;
  // Where the stage begins: the line's first entry, or the scene where it evolves
  href: string;
  // What the stage began with
  event: string;
}

// Where every stage of every line begins in the timeline
function useStageStops() {
  const story = useDexStory();
  const stops = new Map<LineId, StageStop[]>(LINES.map((line) => [line.id, []]));
  const counts = new Map<LineId, number>(LINES.map((line) => [line.id, 0]));
  if (!story) {
    return { stops, counts };
  }

  for (const event of story.events) {
    const entry = story.dex.get(eventAnchorId(event))!;
    counts.set(entry.line.id, (counts.get(entry.line.id) ?? 0) + 1);
    if (entry.firstOfLine) {
      stops.get(entry.line.id)!.push({
        species: entry.species.id,
        year: event.year,
        href: `#${eventAnchorId(event)}`,
        event: event.title,
      });
    }
    for (const played of entry.scenes) {
      if (played.scene.kind === 'evolution') {
        stops.get(played.scene.line)!.push({
          species: played.scene.to,
          year: event.year,
          href: `#${played.id}`,
          event: event.title,
        });
      }
    }
  }
  return { stops, counts };
}

export function PartyScene() {
  const { stops, counts } = useStageStops();

  return (
    <section aria-labelledby="party-title" className="bg-background px-4 pb-16 pt-6 text-white sm:px-6 sm:pb-20">
      <div className="mx-auto max-w-6xl">
        <p className="font-pixel text-[0.625rem] uppercase text-[#7d84a6]">Your party</p>
        <h2 id="party-title" className="mt-3 scroll-mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          The {LINES.length} lines of AI
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#a7acc8]">
          Every event in the timeline belongs to one line, shown at the stage it had reached by then. Lines evolve at the
          turning points that really changed them. Pick a stage to jump to the moment it evolved.
        </p>

        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LINES.map((line) => {
            const lineStops = stops.get(line.id) ?? [];

            return (
              <li
                key={line.id}
                data-party-line={line.id}
                style={{ '--line-color': line.color } as CSSProperties}
                className="party-card rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold text-white">{line.name}</h3>
                  <p className="shrink-0 text-xs text-[#a7acc8]">{counts.get(line.id)} entries</p>
                </div>
                <p className="mt-1 text-sm leading-6 text-[#a7acc8]">{line.blurb}</p>
                <ol aria-label={`${line.name} stages`} className="mt-4 flex items-end gap-1">
                  {lineStops.map((stop, index) => {
                    const species = speciesOf(stop.species);

                    return (
                      <li key={stop.species} className="flex min-w-0 flex-1 items-end gap-1">
                        {index > 0 ? (
                          <ChevronRight aria-hidden="true" className="mb-10 size-4 shrink-0 text-[var(--line-color)]" />
                        ) : null}
                        <a
                          href={stop.href}
                          title={stop.event}
                          className="group flex min-w-0 flex-1 flex-col items-center rounded-xl px-1 py-2 text-center transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcb05]"
                        >
                          <span aria-hidden="true" className="grid h-16 place-items-end">
                            <Sprite src={ART.lineSprite(stop.species)} className="max-h-16 max-w-16 object-contain" />
                          </span>
                          <span className="mt-1.5 max-w-full truncate font-pixel text-[0.5rem] uppercase leading-4 text-white">
                            {species.name}
                          </span>
                          <span className="text-xs text-[var(--line-color)]">
                            {index === 0 ? 'from' : 'in'} {stop.year}
                          </span>
                          <span className="sr-only">, {index === 0 ? 'appears with' : 'evolves at'} {stop.event}</span>
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
