// One era of the timeline: its shared header in the page's color, then its entries drawn in its generation's sprites.
// The section is named by the header's title, which the navigation jumps to. An era the filters empty shows only its header.
'use client';

import type { Era } from '@/lib/eras';
import { DexEra } from './dex-era';
import { EraHeader } from './era-header';
import { eraHeadingId } from './era-parts';

interface EraChapterProps {
  // The era with its events newest first
  era: Era;
  totalEvents: number;
}

export function EraChapter({ era, totalEvents }: EraChapterProps) {
  return (
    <section
      id={era.id}
      aria-labelledby={eraHeadingId(era)}
      data-generation={era.generation}
      className="relative scroll-mt-[var(--timeline-sticky-offset,0px)]"
    >
      <EraHeader era={era} totalEvents={totalEvents} />
      {era.events.length > 0 ? <DexEra era={era} totalEvents={totalEvents} /> : null}
    </section>
  );
}
