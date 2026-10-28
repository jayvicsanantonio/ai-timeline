// One era of the timeline, drawn in the computer interface of its day.
// Wraps the interface in a section named by the era's title, which the chapter navigation jumps to.
'use client';

import type { ComponentType } from 'react';
import type { Era, EraInterface } from '@/lib/eras';
import { ChatEra } from './chat-era';
import { DesktopEra } from './desktop-era';
import { eraHeadingId, type EraInterfaceProps } from './era-parts';
import { NotebookEra } from './notebook-era';
import { PunchCardEra } from './punch-card-era';
import { TerminalEra } from './terminal-era';

const ERA_INTERFACE_COMPONENTS: Record<EraInterface, ComponentType<EraInterfaceProps>> = {
  'punch-card': PunchCardEra,
  terminal: TerminalEra,
  desktop: DesktopEra,
  notebook: NotebookEra,
  chat: ChatEra,
};

interface EraChapterProps {
  era: Era;
  totalEvents: number;
}

export function EraChapter({ era, totalEvents }: EraChapterProps) {
  const EraInterfaceComponent = ERA_INTERFACE_COMPONENTS[era.interface];

  return (
    <section
      id={era.id}
      aria-labelledby={eraHeadingId(era)}
      data-interface={era.interface}
      className="relative scroll-mt-[var(--timeline-sticky-offset,0px)]"
    >
      <EraInterfaceComponent era={era} totalEvents={totalEvents} />
    </section>
  );
}
