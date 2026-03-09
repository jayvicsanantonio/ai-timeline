'use client';

import { useMemo } from 'react';
import { PrologueScene } from './prologue-scene';
import { TimelineStory } from './timeline-story';
import { EpilogueScene } from './epilogue-scene';
import { NarrativeBridge } from './narrative-bridge';
import { TimelineInsights } from '@/components/interactive/timeline-insights';
import { TimelineNavigation } from '@/components/timeline/timeline-navigation';
import type { TimelineEvent } from '@/types/timeline';

interface StoryEngineProps {
  events: TimelineEvent[];
}

interface EraDefinition {
  name: string;
  range: [number, number];
  description: string;
}

interface EraSection extends EraDefinition {
  id: string;
  chapter: string;
  subtitle: string;
  events: TimelineEvent[];
}

const ERA_DEFINITIONS: EraDefinition[] = [
  {
    name: 'The Foundation Era',
    range: [1940, 1970],
    description:
      'The birth of artificial intelligence as a field of study, where visionary researchers laid the theoretical groundwork and created the first programs that could simulate human reasoning.',
  },
  {
    name: 'The Knowledge Era',
    range: [1970, 1990],
    description:
      'A period focused on encoding human expertise into computer systems, leading to the development of expert systems and the first commercial AI applications.',
  },
  {
    name: 'The Learning Era',
    range: [1990, 2010],
    description:
      'The emergence of machine learning as computers began to learn from data rather than relying solely on programmed rules, setting the stage for modern AI.',
  },
  {
    name: 'The Deep Learning Revolution',
    range: [2010, 2020],
    description:
      'A transformative period where neural networks with multiple layers achieved breakthrough performance in vision, speech, and language understanding.',
  },
  {
    name: 'The Generative AI Era',
    range: [2020, 2030],
    description:
      'The current era where AI systems can create original content, engage in natural conversations, and demonstrate capabilities that approach human-level performance in many domains.',
  },
];

function createSectionId(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function createEraSubtitle(
  range: EraDefinition['range'],
  isCurrentEra: boolean
) {
  if (isCurrentEra) {
    return `${range[0]}s - Present`;
  }

  return `${range[0]}s - ${(range[1] - 10).toString()}s`;
}

export function StoryEngine({ events }: StoryEngineProps) {
  const eras = useMemo(() => {
    const erasWithEvents = ERA_DEFINITIONS.map((era, index) => ({
      ...era,
      id: createSectionId(era.name),
      chapter: `Chapter ${index + 1}`,
      subtitle: createEraSubtitle(
        era.range,
        index === ERA_DEFINITIONS.length - 1
      ),
      events: [] as TimelineEvent[],
    }));

    events.forEach((event) => {
      const era = erasWithEvents.find(
        ({ range }) => event.year >= range[0] && event.year < range[1]
      );

      if (era) {
        era.events.push(event);
      }
    });

    return erasWithEvents.filter(
      (era): era is EraSection => era.events.length > 0
    );
  }, [events]);

  const navigationSections = useMemo(
    () =>
      eras.map((era) => ({
        id: era.id,
        label: era.name.replace(/^The\s+/i, ''),
        subtitle: era.subtitle,
        chapter: era.chapter,
      })),
    [eras]
  );

  return (
    <div className="relative">
      <div className="relative">
        <TimelineNavigation sections={navigationSections} />

        <PrologueScene />

        {eras.map((era) => (
          <section
            key={era.name}
            id={era.id}
            className="relative scroll-mt-24"
            aria-label={era.name}
          >
            <NarrativeBridge
              era={era.chapter}
              title={era.name}
              subtitle={era.subtitle}
              description={era.description}
              className="bg-gradient-to-b from-background/50 to-muted/10 -mt-32 pt-32"
            />
            <TimelineStory events={era.events} />
          </section>
        ))}

        <div className="relative -mt-64 pt-32">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/90 h-64 z-10" />
          <NarrativeBridge
            era="Reflection"
            title="Patterns of Progress"
            subtitle="Understanding the journey through data and insights"
            description="As we reflect on decades of AI development, certain patterns emerge that help us understand not just where we've been, but where we might be heading."
            className="bg-gradient-to-b from-transparent to-background/50 pt-32 relative z-20"
          />
        </div>

        <div className="-mt-16">
          <TimelineInsights events={events} />
        </div>

        <EpilogueScene />
      </div>
    </div>
  );
}
