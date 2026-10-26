// Integration tests for TimelineInsights: every stat on its tiles is computed from
// the events it is given, so the numbers always match the timeline data.
import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { page } from "vitest/browser"
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

// 9 events: 2 in the Learning Era, 1 in the Deep Learning Revolution and 6 in the Generative AI Era;
// 4 Research Breakthroughs, 3 Companies & Investments and 2 Ethics & Policy.
const events = [
  makeEvent(1998, "Research Breakthroughs"),
  makeEvent(2005, "Research Breakthroughs"),
  makeEvent(2015, "Companies & Investments"),
  makeEvent(2020, "Ethics & Policy"),
  makeEvent(2024, "Companies & Investments"),
  makeEvent(2024, "Ethics & Policy"),
  makeEvent(2024, "Research Breakthroughs"),
  makeEvent(2025, "Research Breakthroughs"),
  makeEvent(2026, "Companies & Investments"),
]

function labelFor(stat: string) {
  return screen.getByText(stat).nextElementSibling
}

describe("TimelineInsights", () => {
  it("shows one tile for each insight in order", () => {
    render(<TimelineInsights events={events} />)

    const titles = screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)
    expect(titles).toEqual(["Era Over Era", "Most Common Milestone", "Industry Momentum", "Societal Impact"])
  })

  it("compares the latest era's events with the era before it", () => {
    render(<TimelineInsights events={events} />)

    expect(labelFor("6×")).toHaveTextContent("6 events in the Generative AI Era, against 1 in the Deep Learning Revolution")
  })

  it("rounds the era multiple to one decimal place", () => {
    const deepLearning = [2012, 2015, 2018].map((year) => makeEvent(year, "Research Breakthroughs"))
    const generative = [2020, 2021, 2022, 2023, 2024, 2025, 2026].map((year) => makeEvent(year, "Public Releases"))
    render(<TimelineInsights events={[...deepLearning, ...generative]} />)

    expect(labelFor("2.3×")).toHaveTextContent("7 events in the Generative AI Era, against 3 in the Deep Learning Revolution")
  })

  it("shows a dash instead of a multiple when the era before the latest has no events", () => {
    render(<TimelineInsights events={[makeEvent(2024, "Agents")]} />)

    expect(labelFor("—")).toHaveTextContent("1 event in the Generative AI Era, against 0 in the Deep Learning Revolution")
  })

  it("names the most common kind of milestone", () => {
    render(<TimelineInsights events={events} />)

    expect(labelFor("4")).toHaveTextContent("Research Breakthroughs events")
    expect(screen.getByText("More of the timeline is Research Breakthroughs than any other kind of milestone.")).toBeInTheDocument()
  })

  it("counts the Companies & Investments and Ethics & Policy events", () => {
    render(<TimelineInsights events={events} />)

    expect(labelFor("3")).toHaveTextContent("Companies & Investments events")
    expect(labelFor("2")).toHaveTextContent("Ethics & Policy events")
  })

  describe("on a wide screen", () => {
    beforeEach(async () => {
      await page.viewport(1280, 800)
    })

    afterEach(async () => {
      await page.viewport(414, 896)
    })

    // Labels of different lengths would otherwise push each tile's title to its own height
    it("lines up the tiles' titles and descriptions across the row", () => {
      render(<TimelineInsights events={events} />)

      const titles = screen.getAllByRole("heading", { level: 3 })
      const tops = (elements: Element[]) => new Set(elements.map((element) => Math.round(element.getBoundingClientRect().top)))
      expect(tops(titles).size).toBe(1)
      expect(tops(titles.map((title) => title.nextElementSibling!)).size).toBe(1)
    })
  })
})
