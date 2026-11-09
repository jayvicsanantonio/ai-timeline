// Hands every part of the page the AI Dex, built once from all the events, so an entry keeps its number, line and scenes
// however the reader filters, and the navigation can tell where every line stands at the reading position.
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { DexEntry } from '@/lib/dex';
import { eventAnchorId } from '@/lib/event-format';
import type { TimelineEvent } from '@/types/timeline';

interface DexStory {
  dex: Map<string, DexEntry>;
  // Every event, oldest first
  events: TimelineEvent[];
}

const DexContext = createContext<DexStory | null>(null);

export function DexProvider({ dex, events, children }: DexStory & { children: ReactNode }) {
  return <DexContext.Provider value={{ dex, events }}>{children}</DexContext.Provider>;
}

export function useDexStory(): DexStory | null {
  return useContext(DexContext);
}

export function useDexEntry(event: TimelineEvent): DexEntry {
  const entry = useContext(DexContext)?.dex.get(eventAnchorId(event));
  if (!entry) {
    throw new Error(`No dex entry for "${event.title}"; render it inside a DexProvider built from every event`);
  }
  return entry;
}
