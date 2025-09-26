"use client"

import timelineData from "@/data/timeline-events.json"
import type { TimelineEvent } from "@/types/timeline"
import { StoryEngine } from "@/components/storytelling/story-engine"

const events: TimelineEvent[] = timelineData as TimelineEvent[]

export default function AITimelinePage() {
  return (
    <main className="relative bg-background text-foreground">
      <StoryEngine events={events} />
    </main>
  )
}
