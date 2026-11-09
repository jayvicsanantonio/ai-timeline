// Unit tests for the newest-first order the page reads in: the latest era at the top, and the latest event first
// in every era and year, from data that keeps its events oldest first.
import { describe, expect, it } from "vitest"
import timelineData from "@/data/timeline-events.json"
import { groupEventsByEra } from "@/lib/eras"
import { latestEvents, newestFirst } from "@/lib/newest-first"
import { parseTimelineEvents } from "@/lib/timeline-events"
import { groupEventsByYear } from "@/lib/year-groups"
import type { TimelineEvent } from "@/types/timeline"

const MONTH_ORDER = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function makeEvent(year: number, month: string, title: string): TimelineEvent {
  return {
    year,
    month,
    title,
    description: `What happened with ${title}.`,
    category: "Research Breakthroughs",
    link: `https://example.com/${encodeURIComponent(title)}`,
  }
}

const events = parseTimelineEvents(timelineData)

describe("newestFirst", () => {
  it("reverses a list without changing it", () => {
    const years = [1943, 1956, 2026]

    expect(newestFirst(years)).toEqual([2026, 1956, 1943])
    expect(years).toEqual([1943, 1956, 2026])
  })
})


describe("latestEvents", () => {
  it("lists the most recent events of the timeline, newest first", () => {
    expect(latestEvents(events, 3)).toEqual(events.slice(-3).reverse())
  })

  it("lists every event when there are fewer than asked for, and none when none are asked for", () => {
    const two = [makeEvent(2025, "May", "First"), makeEvent(2026, "June", "Second")]

    expect(latestEvents(two, 3)).toEqual([two[1], two[0]])
    expect(latestEvents(two, 0)).toEqual([])
  })

  it("never lists an event dated only by its year, so the latest news has a month", () => {
    expect(latestEvents(events, 3).every((event) => event.month !== "Unknown")).toBe(true)
  })
})
