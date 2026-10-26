// Formats a timeline event's date for display and for <time> elements, extracts source provenance domains,
// and gives each event a deterministic anchor id.
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
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function eventAnchorId(event: Pick<TimelineEvent, 'year' | 'title'>) {
  return `event-${event.year}-${slugify(event.title)}`;
}

// Extracts a concise, human-readable provenance domain (e.g. "arxiv.org", "nature.com") from an event URL
export function eventSourceDomain(link: string): string {
  try {
    const hostname = new URL(link).hostname.toLowerCase();
    return hostname.replace(/^(www|en)\./, '');
  } catch {
    return 'source';
  }
}
