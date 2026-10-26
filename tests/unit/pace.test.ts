// Unit tests for measuring how much faster events come in the final era than in all the years before it.
// The numbers feed the line that opens the 2020s, so they are checked against small cases and the real data.
import { describe, expect, it } from "vitest"
import timelineData from "@/data/timeline-events.json"
import { describePace } from "@/lib/pace"
import { parseTimelineEvents } from "@/lib/timeline-events"
import type { TimelineEvent } from "@/types/timeline"

function eventsIn(...years: number[]): TimelineEvent[] {
  return years.map((year, index) => ({
    year,
    month: "Unknown",
    title: `Event ${index + 1}`,
    description: "An event for the pace tests.",
    category: "Public Releases",
    link: `https://example.com/${index + 1}`,
  }))
}

describe("describePace", () => {
  it("counts the final era's years and events against the years and events before it", () => {
    // 2 events in the 10 years from 2010, then 6 in 2020 and 2021
    const pace = describePace(eventsIn(2010, 2015, 2020, 2020, 2020, 2021, 2021, 2021), 2020)

    expect(pace).toEqual({ years: 2, events: 6, yearsBefore: 10, multiple: 3 })
  })

  it("rounds the multiple to a whole number", () => {
    expect(describePace(eventsIn(2010, 2011, 2012, 2020, 2020, 2020, 2020, 2020, 2020, 2020, 2020), 2020)?.multiple).toBe(3)
  })

  it("has nothing to say unless the final era holds at least twice as many events as all before it", () => {
    expect(describePace(eventsIn(2010, 2011, 2020, 2020, 2020), 2020)).toBeNull()
    expect(describePace(eventsIn(2020, 2021), 2020)).toBeNull()
    expect(describePace(eventsIn(2010, 2011), 2020)).toBeNull()
  })

  it("finds 207 events in the 7 years from 2020, 3 times as many as in the 77 years before", () => {
    expect(describePace(parseTimelineEvents(timelineData), 2020)).toEqual({
      years: 7,
      events: 207,
      yearsBefore: 77,
      multiple: 3,
    })
  })
})
