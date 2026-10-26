// The close of the Turing Archive: an architectural blueprint frame for the uninvented interface of Chapter 6,
// a closing monograph reflection, and a direct return trigger to the start of the timeline.
'use client';

import { ArrowUp, Terminal } from 'lucide-react';

interface EpilogueSceneProps {
  firstEraId: string;
  firstYear: number;
}

export function EpilogueScene({ firstEraId, firstYear }: EpilogueSceneProps) {
  return (
    <section
      aria-labelledby="epilogue-title"
      className="archive-grid-bg relative overflow-hidden border-t border-white/10 bg-[#09090b] px-4 pb-32 pt-24 text-center text-white sm:px-6 sm:pt-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-[radial-gradient(50rem_20rem_at_50%_100%,rgba(144,133,233,0.14),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-3xl">
        <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-white/20 bg-[#111116]/90 px-8 py-10 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
          <div
            aria-hidden="true"
            className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500"
          >
            <span className="flex items-center gap-1.5">
              <Terminal className="size-3.5 text-violet-400" />
              Speculative Substrate
            </span>
            <span>2030+ // Open Slot</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400/90">Chapter 6</p>
          <p className="mt-3 text-xl font-medium text-zinc-100">Interface not yet invented</p>
          <p aria-hidden="true" className="mt-4 font-mono text-sm text-zinc-400">
            &gt; AWAITING_NEXT_PARADIGM <span className="terminal-caret">█</span>
          </p>
        </div>

        <h2 id="epilogue-title" className="mt-16 text-4xl font-semibold tracking-tight sm:text-6xl">
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
          className="mt-14 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/[0.06] px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          Back to {firstYear}
          <ArrowUp aria-hidden="true" className="size-4" />
        </a>

        <p className="mt-20 font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
          Turing Archive // Built with passion for the future of artificial intelligence
        </p>
      </div>
    </section>
  );
}
