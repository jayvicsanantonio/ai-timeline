// Defines the six eras of AI history and the computer interface each one is drawn in, and, for the Pokémon theme, the
// generation of sprites each is drawn in, the badge it awards and the place and biome it is on the journey's route.
// Groups timeline events into those eras by year, keeping every era even when none of its events are shown.
import type { TimelineEvent } from '@/types/timeline';

export type EraInterface = 'punch-card' | 'terminal' | 'desktop' | 'notebook' | 'chat' | 'agent';

// The Pokémon theme's generation of sprites for an era
export type GenerationId = 'gen-1' | 'gen-2' | 'gen-3' | 'gen-4' | 'gen-5' | 'modern';

// The scenery an era's stretch of the Pokémon theme's route runs through
export type Biome = 'meadow' | 'snow' | 'forest' | 'cave' | 'city' | 'summit';

export interface EraDefinition {
  id: string;
  name: string;
  label: string;
  // The era's first year, and the first year of the next era
  range: [number, number];
  description: string;
  interface: EraInterface;
  interfaceName: string;
  // The Pokémon theme: the generation of sprites the era is drawn in and how its header names it, the gym badge the
  // reader earns for it, by its number in public/sprites/badges, and the place and biome it is on the journey's route
  generation: GenerationId;
  generationName: string;
  badge: number;
  place: string;
  biome: Biome;
  // Marks the era in charts and swatches. The six were validated together as a
  // categorical palette on the dark chrome, so neighboring eras stay distinct.
  color: string;
}

export interface Era extends EraDefinition {
  index: number;
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
    generation: 'gen-1',
    generationName: 'Generation I sprites',
    badge: 1,
    place: 'Origin Meadow',
    biome: 'meadow',
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
    generation: 'gen-2',
    generationName: 'Generation II sprites',
    badge: 9,
    place: 'Frostbite Pass',
    biome: 'snow',
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
    generation: 'gen-3',
    generationName: 'Generation III sprites',
    badge: 17,
    place: 'Learning Woods',
    biome: 'forest',
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
    generation: 'gen-4',
    generationName: 'Generation IV sprites',
    badge: 25,
    place: 'Deep Cavern',
    biome: 'cave',
    color: '#d95926',
  },
  {
    id: 'the-generative-ai-era',
    name: 'The Generative AI Era',
    label: 'Generative AI Era',
    range: [2020, 2025],
    description:
      'The era in which AI systems learned to create original text, images and video and to hold natural conversations, putting AI in the hands of hundreds of millions of people.',
    interface: 'chat',
    interfaceName: 'Chat thread',
    generation: 'gen-5',
    generationName: 'Generation V animated sprites',
    badge: 33,
    place: 'Prompt City',
    biome: 'city',
    color: '#9085e9',
  },
  {
    id: 'the-agentic-era',
    name: 'The Agentic Era',
    label: 'Agentic Era',
    range: [2025, 2030],
    description:
      'The current era, in which AI systems reason before they answer and work on their own as agents, writing code, doing research and operating computers on our behalf.',
    interface: 'agent',
    interfaceName: 'Agent task log',
    generation: 'modern',
    generationName: 'Animated 3D sprites',
    badge: 70,
    place: 'Frontier Peak',
    biome: 'summit',
    color: '#cf4f9a',
  },
];

// An era of whole decades is named by its decades, and one that starts or ends mid-decade by its years.
// The current era runs to now, the top of the timeline.
function formatSubtitle(range: EraDefinition['range'], isCurrentEra: boolean) {
  const [start, end] = range;
  if (start % 10 !== 0 || end % 10 !== 0) {
    return `${start} – ${isCurrentEra ? 'now' : end - 1}`;
  }

  const firstDecade = `${start}s`;
  if (isCurrentEra) {
    return `${firstDecade} – now`;
  }

  const lastDecade = `${end - 10}s`;
  return firstDecade === lastDecade ? firstDecade : `${firstDecade} – ${lastDecade}`;
}

// The era still under way, which the timeline opens with
export function isCurrentEra(era: Pick<EraDefinition, 'id'>) {
  return era.id === ERA_DEFINITIONS[ERA_DEFINITIONS.length - 1].id;
}

export function getEraForYear(year: number) {
  return ERA_DEFINITIONS.find(({ range }) => year >= range[0] && year < range[1]);
}

export function groupEventsByEra(events: TimelineEvent[]): Era[] {
  return ERA_DEFINITIONS.map((era, index) => ({
    ...era,
    index,
    subtitle: formatSubtitle(era.range, index === ERA_DEFINITIONS.length - 1),
    events: events.filter((event) => getEraForYear(event.year)?.id === era.id),
  }));
}
