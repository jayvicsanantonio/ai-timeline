"use client"

import timelineData from "@/data/timeline-events.json"
import type { TimelineEvent } from "@/types/timeline"
import { jsonLd, websiteStructuredData } from "@/lib/site"
import { parseTimelineEvents } from "@/lib/timeline-events"
import { ThemedTimeline } from "@/components/theme/themed-timeline"

const events: TimelineEvent[] = parseTimelineEvents(timelineData)

export default function AITimelinePage() {
  return (
    <div className="relative bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(websiteStructuredData(events)) }}
      />
      <ThemedTimeline events={events} />
    </div>
  )
}
