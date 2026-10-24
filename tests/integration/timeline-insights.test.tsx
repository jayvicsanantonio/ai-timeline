// Integration tests for TimelineInsights: every stat on its cards is computed from
// the events it is given, so the numbers always match the timeline data.
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { TimelineInsights } from "@/components/interactive/timeline-insights"
import type { TimelineCategory, TimelineEvent } from "@/types/timeline"

function makeEvent(year: number, category: TimelineCategory): TimelineEvent {
  return {
    year,
    month: "Unknown",
    title: `${category} in ${year}`,
    description: "An event for the insight stats.",
    category,
    link: "https://example.com",
  }
}

// 8 events: 6 from 2010 on, 3 in 2024, 3 Companies & Investments, 2 Ethics & Policy.
const events = [
  makeEvent(1998, "Research Breakthroughs"),
  makeEvent(2005, "Research Breakthroughs"),
  makeEvent(2015, "Companies & Investments"),
  makeEvent(2020, "Ethics & Policy"),
  makeEvent(2024, "Companies & Investments"),
  makeEvent(2024, "Ethics & Policy"),
  makeEvent(2024, "Research Breakthroughs"),
  makeEvent(2025, "Companies & Investments"),
]

function labelFor(stat: string) {
  return screen.getByText(stat).nextElementSibling
}

describe("TimelineInsights", () => {
  it("shows one card for each insight in order", () => {
    render(<TimelineInsights events={events} />)

    const titles = screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)
    expect(titles).toEqual(["Accelerating Progress", "Busiest Year", "Industry Momentum", "Societal Impact"])
  })

  it("computes the share of events from 2010 or later", () => {
    render(<TimelineInsights events={events} />)

    expect(labelFor("75%")).toHaveTextContent("of the 8 events happened in 2010 or later")
  })

  it("names the year with the most events", () => {
    render(<TimelineInsights events={events} />)

    expect(labelFor("2024")).toHaveTextContent("3 events, more than any other year")
  })

  it("counts the Companies & Investments and Ethics & Policy events", () => {
    render(<TimelineInsights events={events} />)

    expect(labelFor("3")).toHaveTextContent("Companies & Investments events")
    expect(labelFor("2")).toHaveTextContent("Ethics & Policy events")
  })
})
