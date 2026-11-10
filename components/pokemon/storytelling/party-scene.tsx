// The professor's briefing before the journey: how to read it, from an entry's number to the badges at each region's end,
// then the nine lines it follows, each with every stage it has reached, when it got there and the event that evolved it,
// and how many entries it holds. A line's first stage links to the entry where it appears, and each later stage to the
// scene where it evolves.
'use client';

import { ChevronRight } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useDexStory } from '@/components/pokemon/eras/dex-context';
import { Sprite } from '@/components/pokemon/ui/sprite';
import { ART, badgePath, iconPath, LINES, speciesOf, type LineId } from '@/lib/dex';
import { ERA_DEFINITIONS } from '@/lib/eras';
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
    <section aria-labelledby="party-title" className="bg-background px-4 pb-16 pt-14 text-white sm:px-6 sm:pb-20">
      <div className="mx-auto max-w-6xl">
        <Briefing />

        <p className="mt-14 font-pixel text-[0.625rem] uppercase text-[#7d84a6]">Your Pokédex</p>
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

// The professor's welcome and how to read the journey, each rule beside a small piece of the page it explains
function Briefing() {
  const first = LINES[0];

  return (
    <div data-briefing="">
      <div className="dex-textbox max-w-3xl px-5 py-4 sm:px-6 sm:py-5">
        <p className="font-pixel text-[0.5625rem] uppercase text-[#48506b]">Professor</p>
        <p className="mt-2 text-[15px] leading-7">
          Welcome to the world of artificial intelligence! People have been raising it since 1943. Your job is to walk the
          route from the beginning to today and record every milestone in your Pokédex. Here is how to read it.
        </p>
      </div>

      <ul aria-label="How to read the journey" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Tip visual={<span className="font-pixel text-[0.625rem] text-white">No. 001</span>}>
          Every event is a numbered entry, in the order it happened.
        </Tip>
        <Tip
          visual={
            <span className="flex items-center gap-1.5">
              <Sprite src={iconPath(first.stages[0].species)} pixelated className="size-8 object-contain" />
              <span className="font-pixel text-[0.5625rem] uppercase text-[#4f8fe6]">Lv.12</span>
            </span>
          }
        >
          Each branch of AI is an evolution line. Its creature shows how far the branch had come; its level counts its
          milestones.
        </Tip>
        <Tip
          visual={
            <span className="flex items-center gap-1">
              <Sprite src={iconPath(first.stages[0].species)} pixelated className="size-8 object-contain" />
              <span className="text-xs text-[#a7acc8]">▶</span>
              <Sprite src={iconPath(first.stages[1].species)} pixelated className="size-8 object-contain" />
            </span>
          }
        >
          Lines evolve at the real turning points. Scroll through an evolution to watch it happen.
        </Tip>
        <Tip
          visual={
            <span className="block w-20">
              <span className="hp-track block">
                <span className="hp-fill" style={{ width: '58%', backgroundColor: '#3ecf6e', transform: 'none' }} />
              </span>
            </span>
          }
        >
          Human-versus-machine matches are battles, and the HP bars show the final score.
        </Tip>
        <Tip visual={<span className="frz-badge static font-pixel">FRZ</span>}>
          In the AI winters the money froze, and so does every line until the thaw.
        </Tip>
        <Tip visual={<Sprite src={badgePath(ERA_DEFINITIONS[0].badge)} className="size-8 object-contain" />}>
          Each region ends in a gym challenge. Answer it to earn the region&rsquo;s badge.
        </Tip>
      </ul>
    </div>
  );
}

function Tip({ visual, children }: { visual: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <span aria-hidden="true" className="grid h-10 w-20 shrink-0 place-items-center">
        {visual}
      </span>
      <span className="text-sm leading-6 text-[#d9dcef]">{children}</span>
    </li>
  );
}
