// Turns raw timeline JSON into typed TimelineEvent objects.
// Throws on an unknown category so bad data fails the build instead of rendering wrong.
import { TIMELINE_CATEGORIES, type TimelineCategory, type TimelineEvent } from "@/types/timeline"

type RawTimelineEvent = Omit<TimelineEvent, "category"> & { category: string }

function isTimelineCategory(value: string): value is TimelineCategory {
  return (TIMELINE_CATEGORIES as readonly string[]).includes(value)
}

export function parseTimelineEvents(rawEvents: RawTimelineEvent[]): TimelineEvent[] {
  return rawEvents.map((event) => {
    const { category } = event
    if (!isTimelineCategory(category)) {
      throw new Error(`Unknown timeline category "${category}" on "${event.title}"`)
    }
    return { ...event, category }
  })
}
