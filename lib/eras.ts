// Defines the five eras of AI history and the computer interface each one is drawn in.
// Groups timeline events into those eras by year, keeping every era even when none of its events are shown.
import type { TimelineEvent } from '@/types/timeline';

export type EraInterface = 'punch-card' | 'terminal' | 'desktop' | 'notebook' | 'chat';

export interface EraDefinition {
  id: string;
  name: string;
  label: string;
  // The era's first year, and the first year of the next era
  range: [number, number];
  description: string;
  interface: EraInterface;
  interfaceName: string;
  // Marks the era in charts and swatches. The five were validated together as a
  // categorical palette on the dark chrome, so neighboring eras stay distinct.
  color: string;
}

export interface Era extends EraDefinition {
  index: number;
  chapter: string;
  number: string;
  subtitle: string;
  events: TimelineEvent[];
}

export const ERA_DEFINITIONS: EraDefinition[] = [
  {
    id: 'the-foundation-era',
    name: 'The Foundation Era',
    label: 'Foundation Era',
    range: [1940, 1970],
    description:
      'The birth of artificial intelligence as a field of study, where visionary researchers laid the theoretical groundwork and created the first programs that could simulate human reasoning.',
    interface: 'punch-card',
    interfaceName: 'Punch cards',
    color: '#c98500',
  },
  {
    id: 'the-knowledge-era',
    name: 'The Knowledge Era',
    label: 'Knowledge Era',
    range: [1970, 1990],
    description:
      'A period focused on encoding human expertise into computer systems, leading to the development of expert systems and the first commercial AI applications.',
    interface: 'terminal',
    interfaceName: 'Green-screen terminal',
    color: '#199e70',
  },
  {
    id: 'the-learning-era',
    name: 'The Learning Era',
    label: 'Learning Era',
    range: [1990, 2010],
    description:
      'The emergence of machine learning as computers began to learn from data rather than relying solely on programmed rules, setting the stage for modern AI.',
    interface: 'desktop',
    interfaceName: 'Desktop windows',
    color: '#3987e5',
  },
  {
    id: 'the-deep-learning-revolution',
    name: 'The Deep Learning Revolution',
    label: 'Deep Learning Revolution',
    range: [2010, 2020],
    description:
      'A transformative period where neural networks with multiple layers achieved breakthrough performance in vision, speech, and language understanding.',
    interface: 'notebook',
    interfaceName: 'Research notebook',
    color: '#d95926',
  },
  {
    id: 'the-generative-ai-era',
    name: 'The Generative AI Era',
    label: 'Generative AI Era',
    range: [2020, 2030],
    description:
      'The current era where AI systems can create original content, engage in natural conversations, and demonstrate capabilities that approach human-level performance in many domains.',
    interface: 'chat',
    interfaceName: 'Chat thread',
    color: '#9085e9',
  },
];

function formatSubtitle(range: EraDefinition['range'], isCurrentEra: boolean) {
  const firstDecade = `${range[0]}s`;
  if (isCurrentEra) {
    return `${firstDecade} – Present`;
  }

  const lastDecade = `${range[1] - 10}s`;
  return firstDecade === lastDecade ? firstDecade : `${firstDecade} – ${lastDecade}`;
}

export function getEraForYear(year: number) {
  return ERA_DEFINITIONS.find(({ range }) => year >= range[0] && year < range[1]);
}

export function groupEventsByEra(events: TimelineEvent[]): Era[] {
  return ERA_DEFINITIONS.map((era, index) => ({
    ...era,
    index,
    chapter: `Chapter ${index + 1}`,
    number: String(index + 1).padStart(2, '0'),
    subtitle: formatSubtitle(era.range, index === ERA_DEFINITIONS.length - 1),
    events: events.filter((event) => getEraForYear(event.year)?.id === era.id),
  }));
}
