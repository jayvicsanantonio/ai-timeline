// Measures the quiet stretches in the timeline, which reads from the first event forward: how many years later an event
// came than the event shown above it. A stretch counts only when it is longer than a year, so back-to-back years stay
// unmarked.
import type { TimelineEvent } from '@/types/timeline';

export function yearsLaterThanPrevious(events: Pick<TimelineEvent, 'year'>[], index: number) {
  const previous = events[index - 1];
  if (!previous) {
    return null;
  }

  const years = events[index].year - previous.year;
  return years > 1 ? years : null;
}
