// Unit tests for grouping an era's events by year and counting a year's events by month.
// The groups keep the events' order, and the month counts run January to December.
import { describe, expect, it } from "vitest"
import { countEventsByMonth, groupEventsByYear, isBusyYear, latestMonth } from "@/lib/year-groups"
import type { TimelineEvent } from "@/types/timeline"

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

const turing = makeEvent(1950, "October", "The Turing Test")
const dartmouth = makeEvent(1956, "June", "Dartmouth AI Conference")
const logicTheorist = makeEvent(1956, "Unknown", "Logic Theorist")
const perceptron = makeEvent(1958, "July", "Rosenblatt's Perceptron")

describe("groupEventsByYear", () => {
  it("groups back-to-back events by year, keeping their order", () => {
    expect(groupEventsByYear([turing, dartmouth, logicTheorist, perceptron])).toEqual([
      { year: 1950, events: [turing] },
      { year: 1956, events: [dartmouth, logicTheorist] },
      { year: 1958, events: [perceptron] },
    ])
  })

  it("has no groups without events", () => {
    expect(groupEventsByYear([])).toEqual([])
  })
})

describe("countEventsByMonth", () => {
  it("counts the events in each month, January first", () => {
    const counts = countEventsByMonth([dartmouth, makeEvent(1956, "June", "Second June Event"), turing])

    expect(counts).toHaveLength(12)
    expect(counts[5]).toBe(2)
    expect(counts[9]).toBe(1)
    expect(counts.reduce((sum, count) => sum + count, 0)).toBe(3)
  })

  it("leaves events whose month is unknown out of every month", () => {
    expect(countEventsByMonth([logicTheorist])).toEqual(Array(12).fill(0))
  })
})

describe("latestMonth", () => {
  it("numbers the latest month the events fall in, January as 1", () => {
    expect(latestMonth([dartmouth, perceptron])).toBe(7)
    expect(latestMonth([turing, dartmouth])).toBe(10)
  })

  it("skips events whose month is unknown, and is 0 when no month is known", () => {
    expect(latestMonth([perceptron, logicTheorist])).toBe(7)
    expect(latestMonth([logicTheorist])).toBe(0)
    expect(latestMonth([])).toBe(0)
  })
})

describe("isBusyYear", () => {
  const eventsOfYear = (count: number) =>
    Array.from({ length: count }, (_, index) => makeEvent(2024, "May", `Event ${index + 1}`))

  it("counts a year as busy once it has more than one event a month", () => {
    expect(isBusyYear(eventsOfYear(13))).toBe(true)
    expect(isBusyYear(eventsOfYear(64))).toBe(true)
  })

  it("leaves a year with a dozen events or fewer at its usual pace", () => {
    expect(isBusyYear(eventsOfYear(12))).toBe(false)
    expect(isBusyYear(eventsOfYear(1))).toBe(false)
  })
})
