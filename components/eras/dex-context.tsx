// Hands every part of the page the AI Dex, built once from all the events, so an entry keeps its number and creature
// however the reader filters.
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { DexEntry } from '@/lib/dex';
import { eventAnchorId } from '@/lib/event-format';
import type { TimelineEvent } from '@/types/timeline';

const DexContext = createContext<Map<string, DexEntry> | null>(null);

export function DexProvider({ dex, children }: { dex: Map<string, DexEntry>; children: ReactNode }) {
  return <DexContext.Provider value={dex}>{children}</DexContext.Provider>;
}

export function useDexEntry(event: TimelineEvent): DexEntry {
  const dex = useContext(DexContext);
  const entry = dex?.get(eventAnchorId(event));
  if (!entry) {
    throw new Error(`No dex entry for "${event.title}"; render it inside a DexProvider built from every event`);
  }
  return entry;
}
