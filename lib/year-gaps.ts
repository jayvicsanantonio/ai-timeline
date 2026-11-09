// Measures the quiet stretches in the timeline, which reads newest first: how many years earlier an event came than the
// event shown above it. A stretch counts only when it is longer than a year, so back-to-back years stay unmarked.
import type { TimelineEvent } from '@/types/timeline';

export function yearsEarlierThanPrevious(events: Pick<TimelineEvent, 'year'>[], index: number) {
  const previous = events[index - 1];
  if (!previous) {
    return null;
  }

  const years = previous.year - events[index].year;
  return years > 1 ? years : null;
}
