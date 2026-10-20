"use client"

import timelineData from "@/data/timeline-events.json"
import type { TimelineEvent } from "@/types/timeline"
import { parseTimelineEvents } from "@/lib/timeline-events"
import { StoryEngine } from "@/components/storytelling/story-engine"

const events: TimelineEvent[] = parseTimelineEvents(timelineData)

export default function AITimelinePage() {
  return (
    <div className="relative bg-background text-foreground">
      <StoryEngine events={events} />
    </div>
  )
}
