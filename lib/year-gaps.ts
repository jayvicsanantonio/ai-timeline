// Measures the quiet stretches in the timeline: how many years passed before an event since the event shown before it.
// A stretch counts only when it is longer than a year, so back-to-back years stay unmarked.
import type { TimelineEvent } from '@/types/timeline';

export function yearsSincePreviousEvent(events: Pick<TimelineEvent, 'year'>[], index: number) {
  const previous = events[index - 1];
  if (!previous) {
    return null;
  }

  const years = events[index].year - previous.year;
  return years > 1 ? years : null;
}
