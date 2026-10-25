// Narrows the timeline to the categories and search words a reader picks.
// No picked categories means every category, and every typed word must appear somewhere in an event.
import { TIMELINE_CATEGORIES, type TimelineCategory, type TimelineEvent } from '@/types/timeline';
import { formatEventDate } from '@/lib/event-format';

export interface TimelineFilters {
  categories: TimelineCategory[];
  query: string;
}

export const NO_FILTERS: TimelineFilters = { categories: [], query: '' };

// Lowercases and drops accents, so "godel" finds "Gödel"
function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function queryWords(query: string) {
  return normalize(query).split(/\s+/).filter(Boolean);
}

export function isFiltering(filters: TimelineFilters) {
  return filters.categories.length > 0 || queryWords(filters.query).length > 0;
}

function searchableText(event: TimelineEvent) {
  return normalize(
    [event.title, event.description, event.category, formatEventDate(event)].join(' ')
  );
}

export function matchesFilters(event: TimelineEvent, filters: TimelineFilters) {
  if (filters.categories.length > 0 && !filters.categories.includes(event.category)) {
    return false;
  }

  const words = queryWords(filters.query);
  if (words.length === 0) {
    return true;
  }

  const text = searchableText(event);
  return words.every((word) => text.includes(word));
}

export function filterEvents(events: TimelineEvent[], filters: TimelineFilters) {
  if (!isFiltering(filters)) {
    return events;
  }

  return events.filter((event) => matchesFilters(event, filters));
}

export function countEventsByCategory(events: TimelineEvent[]) {
  const counts = Object.fromEntries(TIMELINE_CATEGORIES.map((category) => [category, 0])) as Record<
    TimelineCategory,
    number
  >;
  for (const event of events) {
    counts[event.category] += 1;
  }
  return counts;
}
