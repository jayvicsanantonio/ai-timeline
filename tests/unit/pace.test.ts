// Unit tests for measuring how much faster events come in the final era than in all the years before it.
// The pace is events per year, and the numbers feed the line that opens the 2020s.
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
  it("compares the final era's events per year with the events per year before it", () => {
    // 2 events in the 10 years from 2010 is 0.2 a year; 6 in 2020 and 2021 is 3 a year
    const pace = describePace(eventsIn(2010, 2015, 2020, 2020, 2020, 2021, 2021, 2021), 2020)

    expect(pace).toEqual({ years: 2, events: 6, yearsBefore: 10, multiple: 15 })
  })

  it("rounds the multiple to a whole number", () => {
    // 3 events in 10 years is 0.3 a year; 8 events in one year is about 26.7 times that
    expect(describePace(eventsIn(2010, 2011, 2012, ...Array(8).fill(2020)), 2020)?.multiple).toBe(27)
  })

  it("has nothing to say unless events come at least twice as fast in the final era", () => {
    // One event a year from 2010 to 2019, then 1.5 a year
    const steady = eventsIn(2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2021)

    expect(describePace(steady, 2020)).toBeNull()
    expect(describePace(eventsIn(2020, 2021), 2020)).toBeNull()
    expect(describePace(eventsIn(2010, 2011), 2020)).toBeNull()
  })

  it("finds 209 events in the 7 years from 2020, 17 times the yearly pace of the 77 years before", () => {
    expect(describePace(parseTimelineEvents(timelineData), 2020)).toEqual({
      years: 7,
      events: 209,
      yearsBefore: 77,
      multiple: 17,
    })
  })
})
