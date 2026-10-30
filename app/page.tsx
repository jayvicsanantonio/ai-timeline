"use client"

import timelineData from "@/data/timeline-events.json"
import type { TimelineEvent } from "@/types/timeline"
import { jsonLd, websiteStructuredData } from "@/lib/site"
import { parseTimelineEvents } from "@/lib/timeline-events"
import { StoryEngine } from "@/components/storytelling/story-engine"

const events: TimelineEvent[] = parseTimelineEvents(timelineData)

export default function AITimelinePage() {
  return (
    <div className="relative bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(websiteStructuredData(events)) }}
      />
      <StoryEngine events={events} />
    </div>
  )
}
