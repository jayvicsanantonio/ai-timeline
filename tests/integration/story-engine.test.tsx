// Integration tests for StoryEngine with the real timeline data in Chromium.
// Covers the five era interfaces in order, searching and filtering across every era, and the keyboard shortcuts.
import { render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
import { NO_MATCHING_EVENTS } from "@/components/eras/era-parts"
import { StoryEngine } from "@/components/storytelling/story-engine"
import timelineData from "@/data/timeline-events.json"
import { ERA_DEFINITIONS, groupEventsByEra } from "@/lib/eras"
import { filterEvents } from "@/lib/timeline-filter"
import { parseTimelineEvents } from "@/lib/timeline-events"

const events = parseTimelineEvents(timelineData)

function eventCards() {
  return screen.queryAllByRole("article")
}

afterEach(() => {
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
})

describe("StoryEngine", () => {
  it("draws the eras in order, each in its own interface", () => {
    render(<StoryEngine events={events} />)

    const interfaces = ERA_DEFINITIONS.map(
      (era) => screen.getByRole("region", { name: era.name }).dataset.interface,
    )
    expect(interfaces).toEqual(["punch-card", "terminal", "desktop", "notebook", "chat"])
    expect(eventCards()).toHaveLength(events.length)
  })

  it("narrows every era to the events that match a search", async () => {
    render(<StoryEngine events={events} />)

    await userEvent.type(screen.getByRole("searchbox", { name: "Search events" }), "chess")

    const matches = filterEvents(events, { categories: [], query: "chess" })
    expect(matches.length).toBeGreaterThan(0)
    await expect.poll(() => eventCards().length).toBe(matches.length)
    expect(eventCards().map((card) => within(card).getByRole("link").textContent)).toEqual(
      matches.map((event) => event.title),
    )
    expect(screen.getByRole("status")).toHaveTextContent(`Showing ${matches.length} of ${events.length} events`)
  })

  it("shows only a picked category and tells each era without one", async () => {
    render(<StoryEngine events={events} />)

    await userEvent.click(screen.getByRole("button", { name: /^Categories/ }))
    await userEvent.click(screen.getByRole("button", { name: /^Agents/ }))

    const agents = events.filter((event) => event.category === "Agents")
    expect(eventCards()).toHaveLength(agents.length)
    for (const era of groupEventsByEra(agents)) {
      const section = screen.getByRole("region", { name: era.name })
      if (era.events.length === 0) {
        expect(within(section).getByText(NO_MATCHING_EVENTS)).toBeInTheDocument()
      } else {
        expect(within(section).queryByText(NO_MATCHING_EVENTS)).not.toBeInTheDocument()
      }
    }
  })

  it("moves focus to the first event with J", async () => {
    render(<StoryEngine events={events} />)

    await userEvent.keyboard("j")

    expect(screen.getByRole("link", { name: events[0].title })).toHaveFocus()
  })

  it("jumps to an era's title with its number key", async () => {
    render(<StoryEngine events={events} />)

    await userEvent.keyboard("4")

    expect(screen.getByRole("heading", { level: 2, name: "The Deep Learning Revolution" })).toHaveFocus()
  })

  it("focuses the search box with /", async () => {
    render(<StoryEngine events={events} />)

    await userEvent.keyboard("/")

    expect(screen.getByRole("searchbox", { name: "Search events" })).toHaveFocus()
  })

  it("opens the final era with how much faster its events come, between it and the era before", () => {
    const { container } = render(<StoryEngine events={events} />)

    const paceLine = container.querySelector("[data-pace-line]")!
    expect(paceLine).toHaveTextContent(
      "The next 7 years hold 207 events, 23 times the yearly pace of the 77 years before them.",
    )
    const deepLearning = screen.getByRole("region", { name: "The Deep Learning Revolution" })
    const generative = screen.getByRole("region", { name: "The Generative AI Era" })
    expect(deepLearning.compareDocumentPosition(paceLine) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(paceLine.compareDocumentPosition(generative) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("leaves the pace line out while the reader filters", async () => {
    const { container } = render(<StoryEngine events={events} />)

    await userEvent.type(screen.getByRole("searchbox", { name: "Search events" }), "chess")

    await expect.poll(() => container.querySelector("[data-pace-line]")).toBeNull()
  })
})
