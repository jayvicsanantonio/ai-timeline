// Groups an era's events by year, in order, so each year's events can sit beside a column that names the year.
// Also counts a year's events by month, for the row of month squares in the punch-card era's year column.
import { MONTHS } from '@/lib/event-format';
import type { TimelineEvent } from '@/types/timeline';

export interface YearGroup {
  year: number;
  events: TimelineEvent[];
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
