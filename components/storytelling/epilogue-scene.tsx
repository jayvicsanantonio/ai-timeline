// The close of the page, below the oldest events, where the rewind ends at the beginning: Mew, said to be the ancestor of
// every Pokémon, over the first entry; the badges of the eras leading to an egg for the next one; how many years the reader
// has rewound and to what; a way back up to now; and the credits for the sprites.
'use client';

import { ArrowUp } from 'lucide-react';
import { Sprite } from '@/components/ui/sprite';
import { ART, badgePath, formatDexNumber } from '@/lib/dex';
import { ERA_DEFINITIONS } from '@/lib/eras';
import type { TimelineEvent } from '@/types/timeline';

interface EpilogueSceneProps {
  // The era at the top of the timeline
  latestEraId: string;
  // The first event of the timeline, where the rewind ends, and the year of its latest
  firstEvent: TimelineEvent;
  latestYear: number;
}

export function EpilogueScene({ latestEraId, firstEvent, latestYear }: EpilogueSceneProps) {
  return (
    <section
      aria-labelledby="epilogue-title"
      className="relative overflow-hidden bg-background px-4 pb-24 pt-24 text-center text-white sm:px-6 sm:pt-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[56rem] max-w-[200%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(249,85,135,0.16),transparent)]"
      />
      <div className="relative mx-auto max-w-3xl">
        <div aria-hidden="true" className="mx-auto grid h-36 w-36 place-items-center">
          <span className="sprite-bob">
            <Sprite src={ART.ancestor.sprite} className="h-28 w-28 object-contain drop-shadow-[0_14px_14px_rgba(0,0,0,0.5)]" />
          </span>
        </div>

        <p className="mt-4 font-pixel text-[0.625rem] uppercase text-[#a7acc8]">
          {formatDexNumber(1)} <span aria-hidden="true">·</span> {firstEvent.year}
        </p>
        <h2 id="epilogue-title" className="dex-wordmark mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
          Where It Began
        </h2>
        <div className="mx-auto mt-8 max-w-2xl space-y-5 text-lg leading-8 text-[#d9dcef]">
          <p>
            You have rewound {latestYear - firstEvent.year} years, from agents at work back to the {firstEvent.title} in{' '}
            {firstEvent.year}. {ART.ancestor.species.name} is said to carry the genes of every Pokémon; this first model of
            a neuron carries the idea behind every network since.
          </p>
          <p>The next era hasn&rsquo;t hatched yet. What it becomes depends on us.</p>
        </div>

        {/* The eras' badges, from the first to the latest, running on to an egg for the next one */}
        <ol data-era-trail="" aria-label="Badges earned" className="mx-auto mt-12 flex max-w-md items-center justify-center gap-2 sm:gap-3">
          {ERA_DEFINITIONS.map((era) => (
            <li key={era.id} data-era-badge="" className="grid size-10 place-items-center rounded-full bg-white/[0.05] sm:size-12">
              <Sprite src={badgePath(era.badge)} alt={`${era.label} badge`} className="size-7 object-contain sm:size-8" />
            </li>
          ))}
          <li
            data-next-era=""
            className="grid size-10 place-items-center rounded-full border-2 border-dashed border-white/25 sm:size-12"
          >
            <Sprite src={ART.mysteryEgg} alt="The next era, not hatched yet" pixelated className="size-7 sm:size-8" />
          </li>
        </ol>

        {/* New events join the timeline at its top */}
        <a
          href={`#${latestEraId}`}
          className="mt-12 inline-flex items-center gap-2 rounded-full bg-[#ffcb05] px-5 py-2.5 text-sm font-semibold text-[#14161f] shadow-[0_6px_0_#b38f00] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        >
          Back to now
          <ArrowUp aria-hidden="true" className="size-4" />
        </a>

        <p className="mx-auto mt-20 max-w-xl text-xs leading-5 text-[#7d84a6]">
          Built with passion for the future of artificial intelligence. Sprites from{' '}
          <a
            href="https://github.com/jayvicsanantonio/sprites"
            className="underline underline-offset-2 hover:text-white"
          >
            a fork of PokéAPI&rsquo;s sprite collection
          </a>
          . Pokémon and its characters are trademarks of Nintendo, Creatures Inc. and GAME FREAK inc.; this is an
          unofficial fan project, not affiliated with them.
        </p>
      </div>
    </section>
  );
}
