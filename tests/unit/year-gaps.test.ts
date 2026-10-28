// Unit tests for measuring the quiet stretches between timeline events.
// A stretch counts only when more than a year passes between one event and the next.
import { describe, expect, it } from "vitest"
import { yearsSincePreviousEvent } from "@/lib/year-gaps"

function eventsIn(...years: number[]) {
  return years.map((year) => ({ year }))
}

describe("yearsSincePreviousEvent", () => {
  it("has nothing to measure before the first event", () => {
    expect(yearsSincePreviousEvent(eventsIn(1943, 1950), 0)).toBeNull()
  })

  it("counts the years since the event before, when more than one passed", () => {
    expect(yearsSincePreviousEvent(eventsIn(1943, 1950), 1)).toBe(7)
    expect(yearsSincePreviousEvent(eventsIn(1950, 1956, 1958), 2)).toBe(2)
  })

  it("leaves events in the same year or the next year unmarked", () => {
    expect(yearsSincePreviousEvent(eventsIn(1956, 1956), 1)).toBeNull()
    expect(yearsSincePreviousEvent(eventsIn(1956, 1957), 1)).toBeNull()
  })
})
