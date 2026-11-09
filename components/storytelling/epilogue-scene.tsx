// The close of the page, below the oldest events, where the rewind ends at the beginning: the eras' colors leading to the
// open slot for the next one, how many years the reader has rewound and to what, and a way back up to now.
'use client';

import { ArrowUp } from 'lucide-react';
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
      className="bg-[#0a0a0b] px-4 pb-32 pt-24 text-center text-white sm:px-6 sm:pt-32"
    >
      <div className="mx-auto max-w-3xl">
        {/* The eras in their colors, from the first to the latest, running on to the open slot for the next one */}
        <div data-era-trail="" aria-hidden="true" className="mx-auto mb-10 flex max-w-sm items-center gap-1.5">
          {ERA_DEFINITIONS.map((era) => (
            <span
              key={era.id}
              data-era-color=""
              className="h-1 flex-1 rounded-full"
              style={{ backgroundColor: era.color }}
            />
          ))}
          <span data-next-era="" className="ml-1 flex-[1.5] border-t-2 border-dashed border-white/30" />
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">{firstEvent.year}</p>
        <h2 id="epilogue-title" className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          Where It Began
        </h2>
        <div className="mx-auto mt-8 max-w-2xl space-y-5 text-lg leading-8 text-zinc-300">
          <p>
            You have rewound {latestYear - firstEvent.year} years, from agents at work back to the {firstEvent.title} in{' '}
            {firstEvent.year}. Every era between them arrived with a new way for people and machines to work together.
          </p>
          <p>The interface of the next era has not been invented yet. What it becomes depends on us.</p>
        </div>

        {/* New events join the timeline at its top */}
        <a
          href={`#${latestEraId}`}
          className="mt-14 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          Back to now
          <ArrowUp aria-hidden="true" className="size-4" />
        </a>

        <p className="mt-20 text-xs text-zinc-500">
          Built with passion for the future of artificial intelligence
        </p>
      </div>
    </section>
  );
}
