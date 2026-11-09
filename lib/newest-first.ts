// The opening's latest sightings run newest first, though the timeline itself runs from the first event forward. The data
// keeps the events oldest first, sorted by date, so reversing that order puts them newest first. An event dated only by its
// year, which the data sorts after December, then comes ahead of its year's December events.
import type { TimelineEvent } from '@/types/timeline';

export function newestFirst<T>(items: readonly T[]): T[] {
  return [...items].reverse();
}

// The most recent events in the timeline, newest first
export function latestEvents(events: TimelineEvent[], count: number) {
  return newestFirst(events.slice(Math.max(events.length - count, 0)));
}
