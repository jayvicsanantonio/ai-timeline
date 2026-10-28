// Unit tests for the one-sentence summaries of each year, which the chat thread gives to "What happened in {year}?"
// and the agent reports for each year it researches. Every year of those two eras with events needs one.
import { describe, expect, it } from "vitest"
import timelineData from "@/data/timeline-events.json"
import yearSummaryData from "@/data/year-summaries.json"
import { groupEventsByEra } from "@/lib/eras"
import { parseTimelineEvents } from "@/lib/timeline-events"
import { yearSummary } from "@/lib/year-summaries"

const summarizedYears = [
  ...new Set(
    groupEventsByEra(parseTimelineEvents(timelineData))
      .filter((era) => era.interface === "chat" || era.interface === "agent")
      .flatMap((era) => era.events.map((event) => event.year)),
  ),
]

describe("the year summaries data", () => {
  it("sums up every year of the chat thread and the agent's task log, and only those, once each and in order", () => {
    expect(summarizedYears).toEqual([2020, 2021, 2022, 2023, 2024, 2025, 2026])
    expect(yearSummaryData.map(({ year }) => year)).toEqual(summarizedYears)
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
