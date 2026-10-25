// The close of the page: an empty frame for the interface of the next era, a last word, and a way back to the start.
// Every era so far brought a new way to talk to machines, so the next chapter is left open.
'use client';

import { ArrowUp } from 'lucide-react';

interface EpilogueSceneProps {
  firstEraId: string;
  firstYear: number;
}

export function EpilogueScene({ firstEraId, firstYear }: EpilogueSceneProps) {
  return (
    <section
      aria-labelledby="epilogue-title"
      className="bg-[#0a0a0b] px-4 pb-32 pt-24 text-center text-white sm:px-6 sm:pt-32"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto max-w-md rounded-3xl border border-dashed border-white/20 px-8 py-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">Chapter 6</p>
          <p className="mt-3 text-lg text-zinc-200">Interface not yet invented</p>
          <p aria-hidden="true" className="mt-4 font-mono text-sm text-zinc-500">
            &gt; <span className="terminal-caret">█</span>
          </p>
        </div>

        <h2 id="epilogue-title" className="mt-20 text-4xl font-semibold tracking-tight sm:text-6xl">
          The Story Continues
        </h2>
        <div className="mx-auto mt-8 max-w-2xl space-y-5 text-lg leading-8 text-zinc-300">
          <p>
            From punch cards to chat threads, every era of artificial intelligence arrived with a new way for
            people and machines to talk to each other.
          </p>
          <p>
            Each milestone represents not just technological progress, but humanity&apos;s relentless pursuit
            of understanding and augmenting intelligence itself. What happens next depends on us.
          </p>
        </div>
        <p className="mt-10 text-2xl font-light text-white sm:text-3xl">
          The next chapter of this story is ours to write.
        </p>

        <a
          href={`#${firstEraId}`}
          className="mt-14 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          Back to {firstYear}
          <ArrowUp aria-hidden="true" className="size-4" />
        </a>

        <p className="mt-20 text-xs text-zinc-500">
          Built with passion for the future of artificial intelligence
        </p>
      </div>
    </section>
  );
}
