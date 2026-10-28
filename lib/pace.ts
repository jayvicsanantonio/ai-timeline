// Measures how much faster events come in the final era than in all the years before it, for the line that opens it.
// Compares events per year: from the era's start through its latest event, against the years since the first event.
import type { TimelineEvent } from '@/types/timeline';

export interface Pace {
  // Years from the era's start through its latest event, and the events in them
  years: number;
  events: number;
  // Years from the first event to the era's start
  yearsBefore: number;
  // How many times as many events a year the era holds as the years before it, rounded
  multiple: number;
}

// Says nothing unless events come at least twice as fast in the era as in the years before it
export function describePace(events: TimelineEvent[], eraStartYear: number): Pace | null {
  const before = events.filter((event) => event.year < eraStartYear);
  const during = events.filter((event) => event.year >= eraStartYear);
  if (before.length === 0 || during.length === 0) {
    return null;
  }

  const years = Math.max(...during.map((event) => event.year)) - eraStartYear + 1;
  const yearsBefore = eraStartYear - Math.min(...before.map((event) => event.year));
  const ratio = during.length / years / (before.length / yearsBefore);
  if (ratio < 2) {
    return null;
  }

  return { years, events: during.length, yearsBefore, multiple: Math.round(ratio) };
}
