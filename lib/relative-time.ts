// Says how recent an event is, to the month, as a newest-first timeline should: "this month", "last month" or "8 months ago".
// Events dated by their year alone, and events a year old or more, get no label, since their date already says enough.
import { MONTHS } from '@/lib/event-format';
import type { TimelineEvent } from '@/types/timeline';

// Months counted from year 0, so two dates subtract to the months between them
export function monthCount(year: number, monthNumber: number) {
  return year * 12 + (monthNumber - 1);
}

export function monthCountOf(date: Date) {
  return monthCount(date.getFullYear(), date.getMonth() + 1);
}

// A year or more ago, a date speaks for itself
const RECENT_MONTHS = 12;

export function relativeMonthLabel(event: Pick<TimelineEvent, 'year' | 'month'>, now: number) {
  const number = MONTHS.indexOf(event.month as (typeof MONTHS)[number]) + 1;
  if (number === 0) {
    return null;
  }

  const monthsAgo = now - monthCount(event.year, number);
  if (monthsAgo < 0 || monthsAgo >= RECENT_MONTHS) {
    return null;
  }
  if (monthsAgo === 0) {
    return 'this month';
  }
  return monthsAgo === 1 ? 'last month' : `${monthsAgo} months ago`;
}
