// The end of a region: its gym challenge. A creature from the region asks one question about what the region told, with
// three answers. A wrong answer says so and lets the reader try again; the right one explains itself, links to the entry
// it comes from and awards the region's badge. Below it, the region's recap: every evolution it held.
'use client';

import { Check, X } from 'lucide-react';
import { useId, useState } from 'react';
import { Sprite } from '@/components/pokemon/ui/sprite';
import { badgePath } from '@/lib/dex';
import type { Era } from '@/lib/eras';
import { eventAnchorId } from '@/lib/event-format';
import { challengeSprite, GYM_CHALLENGES, previewRegion } from '@/lib/journey';
import { cn } from '@/lib/utils';
import { useDexStory } from './dex-context';

const LETTERS = ['A', 'B', 'C'] as const;

export function GymChallenge({ era }: { era: Era }) {
  const challenge = GYM_CHALLENGES[era.id];
  const story = useDexStory();
  const [picked, setPicked] = useState<number[]>([]);
  const headingId = useId();
  if (!challenge) {
    return null;
  }

  const solved = picked.includes(challenge.answer);
  const lastPick = picked.at(-1);
  const event = story?.events.find((candidate) => candidate.title === challenge.event);
  const evolutions = story ? previewRegion(era, story.events, story.dex).evolutions : [];

  return (
    <section
      aria-labelledby={headingId}
      data-gym-challenge={era.id}
      className="gym-challenge mx-auto mt-16 max-w-4xl px-4 sm:px-6"
    >
      <div className="gym-card rounded-3xl p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div aria-hidden="true" className="grid size-20 shrink-0 place-items-center rounded-2xl bg-white/[0.06] sm:size-24">
            <Sprite src={challengeSprite(era, challenge)} pixelated={era.generation !== 'modern'} className="size-16 object-contain sm:size-20" />
          </div>
          <div className="min-w-0">
            <p className="font-pixel text-[0.5625rem] uppercase text-[#f4e3b5]">Gym challenge · {era.place}</p>
            <h3 id={headingId} className="mt-2 text-pretty text-lg font-semibold leading-7 text-white">
              {challenge.question}
            </h3>
          </div>
        </div>

        <ol className="mt-5 grid gap-2 sm:grid-cols-3">
          {challenge.choices.map((choice, index) => {
            const wasPicked = picked.includes(index);
            const right = index === challenge.answer;

            return (
              <li key={choice}>
                <button
                  type="button"
                  aria-pressed={wasPicked}
                  // Not disabled, which would drop the keyboard focus the right answer holds; once solved, choices only say so
                  aria-disabled={solved || undefined}
                  onClick={() => {
                    if (!solved) {
                      setPicked((current) => (current.includes(index) ? current : [...current, index]));
                    }
                  }}
                  className={cn(
                    'gym-choice flex h-full w-full items-start gap-3 rounded-xl px-4 py-3 text-left text-sm leading-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcb05]',
                    wasPicked && right && 'is-right',
                    wasPicked && !right && 'is-wrong'
                  )}
                >
                  <span aria-hidden="true" className="gym-choice-letter font-pixel text-[0.625rem] leading-6">
                    {LETTERS[index]}
                  </span>
                  <span className="min-w-0 flex-1">{choice}</span>
                  {wasPicked ? (
                    right ? (
                      <Check aria-hidden="true" className="mt-1 size-4 shrink-0" />
                    ) : (
                      <X aria-hidden="true" className="mt-1 size-4 shrink-0" />
                    )
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>

        <div aria-live="polite" className="mt-5">
          {solved ? (
            <div data-badge-earned="" className="dex-textbox flex items-start gap-4 px-5 py-4">
              <Sprite src={badgePath(era.badge)} className="badge-pop size-12 shrink-0 object-contain" />
              <div className="min-w-0">
                <p className="font-pixel text-[0.6875rem] leading-6">Correct! You earned the {era.place} badge!</p>
                <p className="mt-1 text-[15px] leading-7">{challenge.explanation}</p>
                {event ? (
                  <a
                    href={`#${eventAnchorId(event)}`}
                    className="mt-1 inline-block text-sm font-semibold text-[#2f5bb7] underline underline-offset-4"
                  >
                    Revisit: {event.title}
                  </a>
                ) : null}
              </div>
            </div>
          ) : lastPick !== undefined ? (
            <p className="text-sm text-[#ffb4b4]">Not quite. Try another answer.</p>
          ) : (
            <p className="text-sm text-[#a7acc8]">Answer to earn the {era.place} badge.</p>
          )}
        </div>

        {evolutions.length > 0 ? (
          <div data-region-recap="" className="mt-6 border-t border-white/10 pt-5">
            <h4 className="font-pixel text-[0.5625rem] uppercase text-[#f4e3b5]">Evolutions in {era.place}</h4>
            <ul className="mt-3 flex flex-wrap gap-2">
              {evolutions.map(({ from, to, year, line, sceneId }) => (
                <li key={sceneId}>
                  <a
                    href={`#${sceneId}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-[#e4e6f5] hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcb05]"
                  >
                    <span className="font-pixel text-[0.5625rem] text-[#a7acc8]">{year}</span>
                    {from.name} → {to.name}
                    <span className="hidden text-[#a7acc8] sm:inline">· {line.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
