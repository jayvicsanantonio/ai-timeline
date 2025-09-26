'use client';

import { useMemo } from 'react';
import { PrologueScene } from './prologue-scene';
import { TimelineStory } from './timeline-story';
import { EpilogueScene } from './epilogue-scene';
import { NarrativeBridge } from './narrative-bridge';
import { TimelineInsights } from '@/components/interactive/timeline-insights';
import type { TimelineEvent } from '@/types/timeline';

interface StoryEngineProps {
  events: TimelineEvent[];
}

interface EraDefinition {
  name: string;
  range: [number, number];
  description: string;
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

export function StoryEngine({ events }: StoryEngineProps) {
  const eras = useMemo(() => {
    const erasWithEvents = ERA_DEFINITIONS.map((era) => ({
      ...era,
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

    return erasWithEvents.filter((era) => era.events.length > 0);
  }, [events]);

  return (
    <div className="relative">
      <div className="relative">
        <PrologueScene />

        {eras.map((era, index) => (
          <div key={era.name} className="relative">
            <NarrativeBridge
              era={`Chapter ${index + 1}`}
              title={era.name}
              subtitle={`${era.range[0]}s - ${era.range[1]}s`}
              description={era.description}
              className="bg-gradient-to-b from-background/50 to-muted/10 -mt-32 pt-32"
            />
            <TimelineStory events={era.events} />
          </div>
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
