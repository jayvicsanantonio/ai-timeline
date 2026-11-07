// Integration tests for StoryEngine with the real timeline data in Chromium.
// Covers the six era interfaces, the latest first, searching and filtering across every era, and the keyboard shortcuts.
import { render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
import { NO_MATCHING_EVENTS } from "@/components/eras/era-parts"
import { StoryEngine } from "@/components/storytelling/story-engine"
import timelineData from "@/data/timeline-events.json"
import { ERA_DEFINITIONS, groupEventsByEra } from "@/lib/eras"
import { eventAnchorId } from "@/lib/event-format"
import { newestFirst } from "@/lib/newest-first"
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
  it("draws the eras from the latest to the first, each in its own interface", () => {
    const { container } = render(<StoryEngine events={events} />)

    const sections = [...container.querySelectorAll<HTMLElement>("section[data-interface]")]
    expect(sections.map((section) => section.dataset.interface)).toEqual(["agent", "chat", "notebook", "desktop", "terminal", "punch-card"])
    expect(sections.map((section) => section.id)).toEqual(newestFirst(ERA_DEFINITIONS).map((era) => era.id))
    expect(eventCards()).toHaveLength(events.length)
  })

  it("lists every event newest first, from the latest at the top of the timeline down to the first", () => {
    render(<StoryEngine events={events} />)

    expect(eventCards().map((card) => card.id)).toEqual(newestFirst(events).map(eventAnchorId))
  })

  it("opens with the latest events, each linking to its card", () => {
    render(<StoryEngine events={events} />)

    const latest = within(screen.getByRole("list", { name: "Latest" })).getAllByRole("link")
    expect(latest.map((link) => link.getAttribute("href"))).toEqual(
      newestFirst(events.slice(-3)).map((event) => `#${eventAnchorId(event)}`),
    )
    for (const link of latest) {
      expect(document.getElementById(link.getAttribute("href")!.slice(1))).toBeInstanceOf(HTMLElement)
    }
  })

  it("narrows every era to the events that match a search", async () => {
    render(<StoryEngine events={events} />)

    await userEvent.type(screen.getByRole("searchbox", { name: "Search events" }), "chess")

    const matches = newestFirst(filterEvents(events, { categories: [], query: "chess" }))
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

  it("moves focus to the latest event with J, the first on the page", async () => {
    render(<StoryEngine events={events} />)

    await userEvent.keyboard("j")

    expect(screen.getByRole("link", { name: events.at(-1)!.title })).toHaveFocus()
  })

  it("jumps to an era's title with its chapter number, wherever the era sits on the page", async () => {
    render(<StoryEngine events={events} />)

    await userEvent.keyboard("4")

    expect(screen.getByRole("heading", { level: 2, name: "The Deep Learning Revolution" })).toHaveFocus()
  })

  it("focuses the search box with /", async () => {
    render(<StoryEngine events={events} />)

    await userEvent.keyboard("/")

    expect(screen.getByRole("searchbox", { name: "Search events" })).toHaveFocus()
  })

  it("closes the latest era with how much faster its events came, between it and the era before", () => {
    const { container } = render(<StoryEngine events={events} />)

    const paceLine = container.querySelector("[data-pace-line]")!
    expect(paceLine).toHaveTextContent(
      "The last 2 years hold 80 events, 13 times the yearly pace of the 82 years before them.",
    )
    const agentic = screen.getByRole("region", { name: "The Agentic Era" })
    const generative = screen.getByRole("region", { name: "The Generative AI Era" })
    expect(agentic.compareDocumentPosition(paceLine) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(paceLine.compareDocumentPosition(generative) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("links back up to the latest era from the close of the page", () => {
    render(<StoryEngine events={events} />)

    expect(screen.getByRole("link", { name: "Back to the latest" })).toHaveAttribute("href", "#the-agentic-era")
  })

  it("leaves the pace line out while the reader filters", async () => {
    const { container } = render(<StoryEngine events={events} />)

    await userEvent.type(screen.getByRole("searchbox", { name: "Search events" }), "chess")

    await expect.poll(() => container.querySelector("[data-pace-line]")).toBeNull()
  })
})
