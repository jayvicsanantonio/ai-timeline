// Writes the Markdown that AI agents and language models read instead of the page: llms.txt summarizes the site and its eras,
// and llms-full.txt lists every event by era and year with its date, category and source, at a fraction of the page's size.
import { groupEventsByEra } from '@/lib/eras';
import { formatEventDate } from '@/lib/event-format';
import { SITE_NAME, SITE_URL, siteDescription } from '@/lib/site';
import { groupEventsByYear } from '@/lib/year-groups';
import { TIMELINE_CATEGORIES, type TimelineEvent } from '@/types/timeline';

// The site's name and description, the opening that both files share
function header(events: TimelineEvent[]) {
  return [`# ${SITE_NAME}`, '', `> ${siteDescription(events)}`];
}

export function llmsTxt(events: TimelineEvent[]) {
  const eras = groupEventsByEra(events);

  return [
    ...header(events),
    '',
    `The timeline is a single page of ${events.length} events, each with its date, category, description and source. It groups them into ${eras.length} eras:`,
    '',
    ...eras.map((era) => `- ${era.name} (${era.subtitle}, ${era.events.length} events): ${era.description}`),
    '',
    `Categories: ${TIMELINE_CATEGORIES.join(', ')}.`,
    '',
    '## Timeline',
    '',
    `- [Every event in Markdown](${SITE_URL}/llms-full.txt): all ${events.length} events by era and year, with their dates, categories, descriptions and sources`,
    `- [The interactive timeline](${SITE_URL}/): the same events, each era drawn in the computer interface of its day`,
    '',
  ].join('\n');
}

// One list item per event: its title, date, category and whether it is a landmark, then its description and source
function eventEntry(event: TimelineEvent) {
  const details = [formatEventDate(event), event.category, ...(event.landmark ? ['landmark'] : [])];

  return [`- ${event.title} (${details.join(', ')})`, `  ${event.description}`, `  Source: ${event.link}`];
}

export function llmsFullTxt(events: TimelineEvent[]) {
  return [
    ...header(events),
    '',
    `Every event of the timeline, by era and year, with its date, category and source. Landmarks are its turning points. The interactive timeline is at ${SITE_URL}/.`,
    ...groupEventsByEra(events).flatMap((era) => [
      '',
      `## ${era.name} (${era.subtitle})`,
      '',
      era.description,
      ...groupEventsByYear(era.events).flatMap(({ year, events: yearEvents }) => [
        '',
        `### ${year}`,
        '',
        ...yearEvents.flatMap(eventEntry),
      ]),
    ]),
    '',
  ].join('\n');
}
