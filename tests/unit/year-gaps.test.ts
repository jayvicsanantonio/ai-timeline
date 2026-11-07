// Unit tests for measuring the quiet stretches between timeline events, which the page lists newest first.
// A stretch counts only when more than a year lies between an event and the one shown above it.
import { describe, expect, it } from "vitest"
import { yearsEarlierThanPrevious } from "@/lib/year-gaps"

function eventsIn(...years: number[]) {
  return years.map((year) => ({ year }))
}

describe("yearsEarlierThanPrevious", () => {
  it("has nothing to measure for the first event", () => {
    expect(yearsEarlierThanPrevious(eventsIn(1950, 1943), 0)).toBeNull()
  })

  it("counts how many years earlier an event came than the one above it, when more than one lies between", () => {
    expect(yearsEarlierThanPrevious(eventsIn(1950, 1943), 1)).toBe(7)
    expect(yearsEarlierThanPrevious(eventsIn(1958, 1956, 1950), 2)).toBe(6)
  })

  it("leaves events in the same year or the year before unmarked", () => {
    expect(yearsEarlierThanPrevious(eventsIn(1956, 1956), 1)).toBeNull()
    expect(yearsEarlierThanPrevious(eventsIn(1957, 1956), 1)).toBeNull()
  })
})
