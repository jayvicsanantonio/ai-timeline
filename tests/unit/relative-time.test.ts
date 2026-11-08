// Unit tests for saying how recent an event is, to the month, as the newest-first timeline shows beside its latest events.
// Counts months between dates, labels the last year's events, and leaves older events and year-only dates alone.
import { describe, expect, it } from "vitest"
import { monthCount, monthCountOf, relativeMonthLabel } from "@/lib/relative-time"

// November 2026
const now = monthCount(2026, 11)

describe("monthCount", () => {
  it("counts months so that two dates subtract to the months between them", () => {
    expect(monthCount(2026, 11) - monthCount(2026, 10)).toBe(1)
    expect(monthCount(2026, 1) - monthCount(2025, 12)).toBe(1)
    expect(monthCount(2026, 11) - monthCount(2025, 11)).toBe(12)
  })

  it("reads the month of a date from the reader's clock", () => {
    expect(monthCountOf(new Date(2026, 10, 8))).toBe(monthCount(2026, 11))
    expect(monthCountOf(new Date(2026, 0, 1))).toBe(monthCount(2026, 1))
  })
})

describe("relativeMonthLabel", () => {
  it("says this month, last month, or how many months ago an event of the last year happened", () => {
    expect(relativeMonthLabel({ year: 2026, month: "November" }, now)).toBe("this month")
    expect(relativeMonthLabel({ year: 2026, month: "October" }, now)).toBe("last month")
    expect(relativeMonthLabel({ year: 2026, month: "March" }, now)).toBe("8 months ago")
    expect(relativeMonthLabel({ year: 2025, month: "December" }, now)).toBe("11 months ago")
  })

  it("leaves events a year old or more to their dates", () => {
    expect(relativeMonthLabel({ year: 2025, month: "November" }, now)).toBeNull()
    expect(relativeMonthLabel({ year: 1956, month: "June" }, now)).toBeNull()
  })

  it("has nothing to say about an event dated by its year alone, or dated after the reader's clock", () => {
    expect(relativeMonthLabel({ year: 2026, month: "Unknown" }, now)).toBeNull()
    expect(relativeMonthLabel({ year: 2026, month: "December" }, now)).toBeNull()
  })
})
