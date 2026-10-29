// Counts timeline events per year for the activity charts, from the first event's year to the last.
// Each year also counts how many of its events pass the current filters, and names the era it belongs to.
import type { TimelineEvent } from '@/types/timeline';
import { getEraForYear } from '@/lib/eras';

export interface YearActivity {
  year: number;
  total: number;
  matching: number;
  eraId: string | null;
}

export function countEventsByYear(
  events: TimelineEvent[],
  matchingEvents: TimelineEvent[] = events
): YearActivity[] {
  if (events.length === 0) {
    return [];
  }

  const years = events.map((event) => event.year);
  const firstYear = Math.min(...years);
  const lastYear = Math.max(...years);
  const matching = new Set(matchingEvents);

  const activity: YearActivity[] = [];
  for (let year = firstYear; year <= lastYear; year += 1) {
    activity.push({ year, total: 0, matching: 0, eraId: getEraForYear(year)?.id ?? null });
  }

  for (const event of events) {
    const entry = activity[event.year - firstYear];
    entry.total += 1;
    if (matching.has(event)) {
      entry.matching += 1;
    }
  }

  return activity;
}
