// Unit tests for the newest-first order the page reads in: the latest era at the top, and the latest event first
// in every era and year, from data that keeps its events oldest first.
import { describe, expect, it } from "vitest"
import timelineData from "@/data/timeline-events.json"
import { groupEventsByEra } from "@/lib/eras"
import { erasNewestFirst, latestEvents, newestFirst } from "@/lib/newest-first"
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

describe("erasNewestFirst", () => {
  const dartmouth = makeEvent(1956, "June", "Dartmouth AI Conference")
  const perceptron = makeEvent(1958, "July", "Rosenblatt's Perceptron")
  const gpt4 = makeEvent(2023, "March", "OpenAI Releases GPT-4")
  const gpt4o = makeEvent(2024, "May", "OpenAI Releases GPT-4o")

  it("puts the latest era first and each era's latest event first", () => {
    const eras = erasNewestFirst(groupEventsByEra([dartmouth, perceptron, gpt4, gpt4o]))

    expect(eras.map((era) => era.label)).toEqual([
      "Agentic Era",
      "Generative AI Era",
      "Deep Learning Revolution",
      "Learning Era",
      "Knowledge Era",
      "Foundation Era",
    ])
    expect(eras[1].events).toEqual([gpt4o, gpt4])
    expect(eras[5].events).toEqual([perceptron, dartmouth])
  })

  it("orders every era of the real data from its latest event to its first, the latest month of each year first", () => {
    const eras = erasNewestFirst(groupEventsByEra(events))

    expect(eras[0].events[0]).toEqual(events.at(-1))
    expect(eras.at(-1)!.events.at(-1)).toEqual(events[0])
    for (const era of eras) {
      const years = era.events.map((event) => event.year)
      expect(years, era.name).toEqual([...years].sort((a, b) => b - a))
      for (const group of groupEventsByYear(era.events)) {
        // Events dated by their year alone, which the data sorts after December, come ahead of December
        const ranks = group.events.map((event) =>
          event.month === "Unknown" ? MONTH_ORDER.length : MONTH_ORDER.indexOf(event.month),
        )
        expect(ranks, `${group.year}`).toEqual([...ranks].sort((a, b) => b - a))
      }
    }
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
