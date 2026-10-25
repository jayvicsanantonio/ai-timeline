// Unit tests for how a timeline event's date is shown and machine-read, and for its anchor id.
// Undated months show only the year, and every real event gets its own anchor id.
import { describe, expect, it } from "vitest"
import timelineData from "@/data/timeline-events.json"
import { eventAnchorId, eventDateTime, formatEventDate, MONTHS } from "@/lib/event-format"
import type { TimelineEvent } from "@/types/timeline"

const dated: TimelineEvent = {
  year: 1956,
  month: "June",
  title: "Dartmouth AI Conference",
  description: "The birth of AI as a field.",
  category: "Research Breakthroughs",
  link: "https://example.com/dartmouth",
}

const undated: TimelineEvent = { ...dated, year: 1951, month: "Unknown", title: "First AI Programs" }

describe("MONTHS", () => {
  it("lists the twelve full month names in calendar order", () => {
    expect(MONTHS).toEqual([
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ])
  })
})

describe("formatEventDate", () => {
  it("shows the month and year", () => {
    expect(formatEventDate(dated)).toBe("June 1956")
  })

  it("shows only the year when the month is unknown", () => {
    expect(formatEventDate(undated)).toBe("1951")
  })
})

describe("eventDateTime", () => {
  it("gives a year-month string for a dated event", () => {
    expect(eventDateTime(dated)).toBe("1956-06")
    expect(eventDateTime({ ...dated, month: "December" })).toBe("1956-12")
  })

  it("gives only the year for an undated event", () => {
    expect(eventDateTime(undated)).toBe("1951")
  })
})

describe("eventAnchorId", () => {
  it("joins the year and a slug of the title", () => {
    expect(eventAnchorId(dated)).toBe("event-1956-dartmouth-ai-conference")
  })

  it("drops accents and punctuation from the slug", () => {
    expect(eventAnchorId({ ...dated, year: 2024, title: "Gödel's Proof — Re-checked!" })).toBe(
      "event-2024-godel-s-proof-re-checked",
    )
  })

  it("gives every event in data/timeline-events.json its own id", () => {
    const ids = timelineData.map((event) => eventAnchorId(event as TimelineEvent))
    expect(new Set(ids).size).toBe(ids.length)
  })
})
