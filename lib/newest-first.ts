// The page reads newest first: the latest era at the top, and in every era its latest year and its latest event first.
// The data keeps the events oldest first, sorted by date, so reversing that order puts them newest first. An event dated
// only by its year, which the data sorts after December, then comes ahead of its year's December events.
import type { Era } from '@/lib/eras';
import type { TimelineEvent } from '@/types/timeline';

export function newestFirst<T>(items: readonly T[]): T[] {
  return [...items].reverse();
}

// The eras in the order the page shows them, each with its events newest first
export function erasNewestFirst(eras: Era[]): Era[] {
  return newestFirst(eras).map((era) => ({ ...era, events: newestFirst(era.events) }));
}

// The most recent events in the timeline, newest first
export function latestEvents(events: TimelineEvent[], count: number) {
  return newestFirst(events.slice(Math.max(events.length - count, 0)));
}
