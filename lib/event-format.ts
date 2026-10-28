// Formats a timeline event's date for display and for <time> elements, names its source site, and gives it an anchor id.
// Events whose month is unknown show and machine-read as their year alone.
import type { TimelineEvent } from '@/types/timeline';

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

type EventDate = Pick<TimelineEvent, 'year' | 'month'>;

function monthNumber(month: string) {
  return MONTHS.indexOf(month as (typeof MONTHS)[number]) + 1;
}

export function formatEventDate({ year, month }: EventDate) {
  return monthNumber(month) ? `${month} ${year}` : String(year);
}

// A valid HTML date string: "1956-06", or "1951" when the month is unknown
export function eventDateTime({ year, month }: EventDate) {
  const number = monthNumber(month);
  return number ? `${year}-${String(number).padStart(2, '0')}` : String(year);
}

// Lowercase ASCII words joined by hyphens, with accents dropped
export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function eventAnchorId(event: Pick<TimelineEvent, 'year' | 'title'>) {
  return `event-${event.year}-${slugify(event.title)}`;
}

// The site an event's link opens, such as "arxiv.org" or "en.wikipedia.org"
export function eventSource(event: Pick<TimelineEvent, 'link'>) {
  return new URL(event.link).hostname.replace(/^www\./, '');
}
