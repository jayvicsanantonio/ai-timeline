// Unit tests for the one-sentence answers the chat thread gives to "What happened in {year}?".
// They live in the data beside the events, and every year of the Generative AI Era with events needs one.
import { describe, expect, it } from "vitest"
import timelineData from "@/data/timeline-events.json"
import yearSummaryData from "@/data/year-summaries.json"
import { groupEventsByEra } from "@/lib/eras"
import { parseTimelineEvents } from "@/lib/timeline-events"
import { yearSummary } from "@/lib/year-summaries"

const chatEra = groupEventsByEra(parseTimelineEvents(timelineData)).find((era) => era.interface === "chat")!
const chatYears = [...new Set(chatEra.events.map((event) => event.year))]

describe("the year summaries data", () => {
  it("answers every year of the chat thread, and only those, once each and in order", () => {
    expect(yearSummaryData.map(({ year }) => year)).toEqual(chatYears)
  })

  it("answers each year in one short sentence", () => {
    for (const { year, summary } of yearSummaryData) {
      expect(summary, String(year)).toMatch(/\S\.$/)
      expect(summary, String(year)).not.toMatch(/[.!?]\s/)
      expect(summary.length, String(year)).toBeLessThanOrEqual(150)
    }
  })
})

describe("yearSummary", () => {
  it("looks up a year's answer", () => {
    expect(yearSummary(2022)).toBe(yearSummaryData.find(({ year }) => year === 2022)!.summary)
  })

  it("has no answer for a year without a summary", () => {
    expect(yearSummary(1997)).toBeUndefined()
  })
})
