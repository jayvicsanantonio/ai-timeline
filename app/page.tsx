"use client"

import { useState } from "react"
import timelineData from "@/data/timeline-events.json"
import type { TimelineEvent } from "@/types/timeline"
import { StoryEngine } from "@/components/storytelling/story-engine"

export default function AITimelinePage() {
  const [events] = useState<TimelineEvent[]>(timelineData as TimelineEvent[])

  return (
    <main className="relative bg-background text-foreground">
      <StoryEngine events={events} />
    </main>
  )
}
