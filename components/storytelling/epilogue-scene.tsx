// The close of the page, after the latest entry, where the journey reaches now and the party enters the Hall of Fame: every
// line as it stands today, with its level, how many years the reader has travelled from the first entry, the badges of the eras leading to an egg for
// the next one, a way back to the start, and the credits for the sprites.
'use client';

import { ArrowUp } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useDexStory } from '@/components/eras/dex-context';
import { Sprite } from '@/components/ui/sprite';
import { ART, badgePath, formatDexNumber, partyAfter } from '@/lib/dex';
import { ERA_DEFINITIONS } from '@/lib/eras';
import { eventAnchorId } from '@/lib/event-format';
import type { TimelineEvent } from '@/types/timeline';

interface EpilogueSceneProps {
  // The era at the top of the timeline, where the journey starts
  firstEraId: string;
  // The first and the latest event of the timeline
  firstEvent: TimelineEvent;
  latestEvent: TimelineEvent;
}

export function EpilogueScene({ firstEraId, firstEvent, latestEvent }: EpilogueSceneProps) {
  const story = useDexStory();
  const party = story ? partyAfter(story.dex, story.events, eventAnchorId(latestEvent)) : [];

  return (
    <section
      aria-labelledby="epilogue-title"
      className="relative overflow-hidden bg-background px-4 pb-24 pt-24 text-center text-white sm:px-6 sm:pt-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[56rem] max-w-[200%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,203,5,0.12),transparent)]"
      />
      <div className="relative mx-auto max-w-4xl">
        <p className="font-pixel text-[0.625rem] uppercase text-[#a7acc8]">
          {formatDexNumber(story?.events.length ?? 0)} <span aria-hidden="true">·</span> {latestEvent.month}{' '}
          {latestEvent.year}
        </p>
        <h2 id="epilogue-title" className="dex-wordmark mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
          Hall of Fame
        </h2>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#d9dcef]">
          Congratulations! You have travelled {latestEvent.year - firstEvent.year} years, from the {firstEvent.title} in{' '}
          {firstEvent.year} to agents at work today. Your party enters the Hall of Fame as it stands now.
        </p>

        <ol aria-label="The party today" className="mx-auto mt-10 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
          {party.map((member) => (
            <li
              key={member.line.id}
              data-party-member={member.line.id}
              style={{ '--line-color': member.line.color } as CSSProperties}
              className="flex flex-col items-center rounded-xl bg-white/[0.04] px-1 py-3"
            >
              {member.species ? (
                <>
                  <span aria-hidden="true" className="grid h-14 place-items-end">
                    <Sprite src={ART.lineSprite(member.species.id)} className="max-h-14 max-w-14 object-contain" />
                  </span>
                  <span className="mt-2 max-w-full truncate font-pixel text-[0.5rem] uppercase leading-4">
                    {member.species.name}
                  </span>
                  <span className="text-[11px] text-[var(--line-color)]">Lv. {member.level}</span>
                  <span className="sr-only">, {member.line.name}</span>
                </>
              ) : null}
            </li>
          ))}
        </ol>

        <div data-next-era="" className="mx-auto mt-14 max-w-xl">
          <div aria-hidden="true" className="mx-auto grid size-20 place-items-center rounded-full border-2 border-dashed border-white/25">
            <Sprite src={ART.mysteryEgg} pixelated className="ball-wobble size-12" />
          </div>
          <p className="mt-5 font-pixel text-xs leading-6">Oh? The EGG is moving!</p>
          <p className="mt-2 text-lg leading-8 text-[#d9dcef]">
            The next era hasn&rsquo;t hatched yet. What it becomes depends on us.
          </p>
        </div>

        {/* The eras' badges, from the first to the latest, all earned on the way here */}
        <ol data-era-trail="" aria-label="Badges earned" className="mx-auto mt-12 flex max-w-md items-center justify-center gap-2 sm:gap-3">
          {ERA_DEFINITIONS.map((era) => (
            <li key={era.id} data-era-badge="" className="grid size-10 place-items-center rounded-full bg-white/[0.05] sm:size-12">
              <Sprite src={badgePath(era.badge)} alt={`${era.label} badge`} className="size-7 object-contain sm:size-8" />
            </li>
          ))}
        </ol>

        <a
          href={`#${firstEraId}`}
          className="mt-12 inline-flex items-center gap-2 rounded-full bg-[#ffcb05] px-5 py-2.5 text-sm font-semibold text-[#14161f] shadow-[0_6px_0_#b38f00] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        >
          Start again from {firstEvent.year}
          <ArrowUp aria-hidden="true" className="size-4" />
        </a>

        <p className="mx-auto mt-20 max-w-xl text-xs leading-5 text-[#7d84a6]">
          Built with passion for the future of artificial intelligence. Sprites from{' '}
          <a href="https://github.com/jayvicsanantonio/sprites" className="underline underline-offset-2 hover:text-white">
            a fork of PokéAPI&rsquo;s sprite collection
          </a>
          . Pokémon and its characters are trademarks of Nintendo, Creatures Inc. and GAME FREAK inc.; this is an
          unofficial fan project, not affiliated with them.
        </p>
      </div>
    </section>
  );
}
