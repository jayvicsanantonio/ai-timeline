// Unit tests for the quiet stretches between events, which the early eras mark as tall grass between their years.
// The timeline reads from the first event forward, so a stretch says how many years later the next event came.
import { describe, expect, it } from "vitest"
import { yearsLaterThanPrevious } from "@/lib/year-gaps"

function eventsIn(...years: number[]) {
  return years.map((year) => ({ year }))
}

describe("yearsLaterThanPrevious", () => {
  it("has nothing to say about the first event", () => {
    expect(yearsLaterThanPrevious(eventsIn(1943, 1950), 0)).toBeNull()
  })

  it("counts the years since the event above", () => {
    expect(yearsLaterThanPrevious(eventsIn(1943, 1950), 1)).toBe(7)
    expect(yearsLaterThanPrevious(eventsIn(1943, 1950, 1956), 2)).toBe(6)
  })

  it("leaves events in the same year or a year apart unmarked", () => {
    expect(yearsLaterThanPrevious(eventsIn(1956, 1956), 1)).toBeNull()
    expect(yearsLaterThanPrevious(eventsIn(1956, 1957), 1)).toBeNull()
  })
})
