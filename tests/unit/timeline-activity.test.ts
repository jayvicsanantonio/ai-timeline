// Unit tests for counting timeline events per year for the activity charts.
// Covers zero-filled years, counts of events and landmarks that pass the filters, era assignment and the real dataset.
import { describe, expect, it } from "vitest"
import timelineData from "@/data/timeline-events.json"
import { countEventsByYear } from "@/lib/timeline-activity"
import { parseTimelineEvents } from "@/lib/timeline-events"
import type { TimelineEvent } from "@/types/timeline"

function makeEvent(year: number, title: string): TimelineEvent {
  return {
    year,
    month: "Unknown",
    title,
    description: "An event for the activity tests.",
    category: "Public Releases",
    link: `https://example.com/${encodeURIComponent(title)}`,
  }
}

const first = makeEvent(1967, "First")
const second = makeEvent(1970, "Second")
const third = makeEvent(1970, "Third")

describe("countEventsByYear", () => {
  it("lists every year from the first event to the last, counting years without events as zero", () => {
    expect(countEventsByYear([first, second, third]).map(({ year, total }) => [year, total])).toEqual([
      [1967, 1],
      [1968, 0],
      [1969, 0],
      [1970, 2],
    ])
  })

  it("counts all of a year's events as matching when no subset is given", () => {
    expect(countEventsByYear([first, second, third]).map(({ matching }) => matching)).toEqual([1, 0, 0, 2])
  })

  it("counts how many of each year's events are in the matching subset", () => {
    expect(countEventsByYear([first, second, third], [third]).map(({ matching }) => matching)).toEqual([0, 0, 0, 1])
  })

  it("counts the landmarks among each year's matching events", () => {
    const landmark = { ...makeEvent(1970, "Landmark"), landmark: true }

    expect(countEventsByYear([first, second, landmark]).map(({ landmarks }) => landmarks)).toEqual([0, 0, 0, 1])
    expect(countEventsByYear([first, second, landmark], [second]).map(({ landmarks }) => landmarks)).toEqual([0, 0, 0, 0])
  })

  it("names the era each year belongs to", () => {
    expect(countEventsByYear([first, second, third]).map(({ eraId }) => eraId)).toEqual([
      "the-foundation-era",
      "the-foundation-era",
      "the-foundation-era",
      "the-knowledge-era",
    ])
  })

  it("returns no years when there are no events", () => {
    expect(countEventsByYear([])).toEqual([])
  })

  it("covers 1943 to 2026 for the real dataset and counts every event once", () => {
    const events = parseTimelineEvents(timelineData)

    const years = countEventsByYear(events)

    expect(years[0].year).toBe(1943)
    expect(years.at(-1)!.year).toBe(2026)
    expect(years).toHaveLength(2026 - 1943 + 1)
    expect(years.reduce((sum, { total }) => sum + total, 0)).toBe(events.length)
  })
})
