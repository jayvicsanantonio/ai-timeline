"use client"

import { PrologueScene } from "./prologue-scene"
import { TimelineStory } from "./timeline-story"
import { EpilogueScene } from "./epilogue-scene"
import { NarrativeBridge } from "./narrative-bridge"
import { ScrollProgress } from "@/components/ui/scroll-progress"
import { TimelineInsights } from "@/components/interactive/timeline-insights"
import type { TimelineEvent } from "@/types/timeline"

interface StoryEngineProps {
  events: TimelineEvent[]
}

export function StoryEngine({ events }: StoryEngineProps) {
  const groupEventsByEra = (events: TimelineEvent[]) => {
    const eras = [
      { name: "The Foundation Era", range: [1940, 1970], events: [] as TimelineEvent[] },
      { name: "The Knowledge Era", range: [1970, 1990], events: [] as TimelineEvent[] },
      { name: "The Learning Era", range: [1990, 2010], events: [] as TimelineEvent[] },
      { name: "The Deep Learning Revolution", range: [2010, 2020], events: [] as TimelineEvent[] },
      { name: "The Generative AI Era", range: [2020, 2030], events: [] as TimelineEvent[] },
    ]

    events.forEach((event) => {
      const era = eras.find((era) => event.year >= era.range[0] && event.year < era.range[1])
      if (era) {
        era.events.push(event)
      }
    })

    return eras.filter((era) => era.events.length > 0)
  }

  const eras = groupEventsByEra(events)

  return (
    <div className="relative">
      <ScrollProgress />

      <div className="relative">
        <PrologueScene />

        {eras.map((era, index) => (
          <div key={era.name} className="relative">
            {index > 0 && (
              <NarrativeBridge
                era={`Chapter ${index + 1}`}
                title={era.name}
                subtitle={`${era.range[0]}s - ${era.range[1]}s`}
                description={getEraDescription(era.name)}
                className="bg-gradient-to-b from-background/50 to-muted/10 -mt-32 pt-32"
              />
            )}
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
  )
}

function getEraDescription(eraName: string): string {
  const descriptions = {
    "The Foundation Era":
      "The birth of artificial intelligence as a field of study, where visionary researchers laid the theoretical groundwork and created the first programs that could simulate human reasoning.",
    "The Knowledge Era":
      "A period focused on encoding human expertise into computer systems, leading to the development of expert systems and the first commercial AI applications.",
    "The Learning Era":
      "The emergence of machine learning as computers began to learn from data rather than relying solely on programmed rules, setting the stage for modern AI.",
    "The Deep Learning Revolution":
      "A transformative period where neural networks with multiple layers achieved breakthrough performance in vision, speech, and language understanding.",
    "The Generative AI Era":
      "The current era where AI systems can create original content, engage in natural conversations, and demonstrate capabilities that approach human-level performance in many domains.",
  }

  return descriptions[eraName as keyof typeof descriptions] || ""
}
