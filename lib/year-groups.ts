// Groups an era's events by year, in order, so each year's events can sit beside a column that names the year.
// Also counts a year's events by month, finds its latest month, and tells a busy year, which has more than one event a month, from the rest.
import { MONTHS } from '@/lib/event-format';
import type { TimelineEvent } from '@/types/timeline';

export interface YearGroup {
  year: number;
  events: TimelineEvent[];
}

// More events than months in a year. A busy year keeps only its landmarks and highlights in full.
const BUSY_YEAR_EVENTS = 12;

export function isBusyYear(events: TimelineEvent[]) {
  return events.length > BUSY_YEAR_EVENTS;
}

// The events arrive sorted by date, so each year's events are already back to back
export function groupEventsByYear(events: TimelineEvent[]): YearGroup[] {
  const groups: YearGroup[] = [];
  for (const event of events) {
    const lastGroup = groups.at(-1);
    if (lastGroup?.year === event.year) {
      lastGroup.events.push(event);
    } else {
      groups.push({ year: event.year, events: [event] });
    }
  }
  return groups;
}

// How many of the events fall in each month, January first. An event whose month is unknown counts in none.
export function countEventsByMonth(events: Pick<TimelineEvent, 'month'>[]) {
  return MONTHS.map((month) => events.filter((event) => event.month === month).length);
}

// The number of the latest month any of the events fall in, January as 1, or 0 when no event's month is known
export function latestMonth(events: Pick<TimelineEvent, 'month'>[]) {
  return countEventsByMonth(events).reduce((latest, count, index) => (count > 0 ? index + 1 : latest), 0);
}
