// Measures how much faster events come in the final era than in all the years before it, for the line that opens it.
// Counts the years from the first event to the era's start, and from the era's start through its latest event.
import type { TimelineEvent } from '@/types/timeline';

export interface Pace {
  // Years from the era's start through its latest event, and the events in them
  years: number;
  events: number;
  // Years from the first event to the era's start
  yearsBefore: number;
  // How many times as many events the era holds as all the years before it, rounded
  multiple: number;
}

// Says nothing unless the era holds at least twice as many events as all the years before it
export function describePace(events: TimelineEvent[], eraStartYear: number): Pace | null {
  const before = events.filter((event) => event.year < eraStartYear);
  const during = events.filter((event) => event.year >= eraStartYear);
  if (before.length === 0 || during.length < before.length * 2) {
    return null;
  }

  const firstYear = Math.min(...before.map((event) => event.year));
  const latestYear = Math.max(...during.map((event) => event.year));

  return {
    years: latestYear - eraStartYear + 1,
    events: during.length,
    yearsBefore: eraStartYear - firstYear,
    multiple: Math.round(during.length / before.length),
  };
}
