// One era of the timeline: its shared header in the page's black, then its events drawn in the computer interface of its day.
// The section is named by the header's title, which the navigation jumps to. An era the filters empty shows only its header.
'use client';

import type { ComponentType } from 'react';
import type { Era, EraInterface } from '@/lib/eras';
import { AgentEra } from './agent-era';
import { ChatEra } from './chat-era';
import { DesktopEra } from './desktop-era';
import { EraHeader } from './era-header';
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
  agent: AgentEra,
};

interface EraChapterProps {
  // The era with its events newest first
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
      <EraHeader era={era} totalEvents={totalEvents} />
      {era.events.length > 0 ? <EraInterfaceComponent era={era} totalEvents={totalEvents} /> : null}
    </section>
  );
}
