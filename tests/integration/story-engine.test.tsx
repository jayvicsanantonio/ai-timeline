// Integration tests for StoryEngine with the real timeline data in Chromium.
// Covers the map of the nine lines, the six eras of the AI Dex from the first forward, searching and filtering across every
// era, the keyboard shortcuts and the close of the journey.
import { render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
import { NO_MATCHING_EVENTS } from "@/components/eras/era-parts"
import { StoryEngine } from "@/components/storytelling/story-engine"
import timelineData from "@/data/timeline-events.json"
import { ERA_DEFINITIONS, groupEventsByEra } from "@/lib/eras"
import { eventAnchorId } from "@/lib/event-format"
import { LINES } from "@/lib/dex"
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
  it("draws the eras from the first to the latest, each in its own generation's sprites", () => {
    const { container } = render(<StoryEngine events={events} />)

    const sections = [...container.querySelectorAll<HTMLElement>("section[data-generation]")]
    expect(sections.map((section) => section.dataset.generation)).toEqual(["gen-1", "gen-2", "gen-3", "gen-4", "gen-5", "modern"])
    expect(sections.map((section) => section.id)).toEqual(ERA_DEFINITIONS.map((era) => era.id))
    expect(eventCards()).toHaveLength(events.length)
  })

  it("lists every event in the order it happened, from the first at the top of the timeline to the latest", () => {
    render(<StoryEngine events={events} />)

    expect(eventCards().map((card) => card.id)).toEqual(events.map(eventAnchorId))
  })

  it("maps the nine lines before the journey starts, each stage linking to where it appears or evolves", () => {
    render(<StoryEngine events={events} />)

    const party = screen.getByRole("region", { name: `The ${LINES.length} lines of AI` })
    for (const line of LINES) {
      const stages = within(within(party).getByRole("list", { name: `${line.name} stages` })).getAllByRole("link")
      expect(stages, line.name).toHaveLength(line.stages.length)
      for (const stage of stages) {
        expect(document.getElementById(stage.getAttribute("href")!.slice(1)), line.name).toBeInstanceOf(HTMLElement)
      }
    }
    const party_ = party.compareDocumentPosition(screen.getByRole("region", { name: "The Foundation Era" }))
    expect(party_ & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("opens with the latest events, each linking to its card", () => {
    render(<StoryEngine events={events} />)

    const latest = within(screen.getByRole("list", { name: "Latest sightings" })).getAllByRole("link")
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

  it("moves focus to the first event with J, the first on the page", async () => {
    render(<StoryEngine events={events} />)

    await userEvent.keyboard("j")

    expect(screen.getByRole("link", { name: events[0].title })).toHaveFocus()
  })

  it("jumps to an era's title with its number key, counting down the page from the era at the top", async () => {
    render(<StoryEngine events={events} />)

    await userEvent.keyboard("1")
    expect(screen.getByRole("heading", { level: 2, name: "The Foundation Era" })).toHaveFocus()

    await userEvent.keyboard("4")
    expect(screen.getByRole("heading", { level: 2, name: "The Deep Learning Revolution" })).toHaveFocus()
  })

  it("focuses the search box with /", async () => {
    render(<StoryEngine events={events} />)

    await userEvent.keyboard("/")

    expect(screen.getByRole("searchbox", { name: "Search events" })).toHaveFocus()
  })

  it("leads into the latest era with how much faster its events came, between it and the era before", () => {
    const { container } = render(<StoryEngine events={events} />)

    const paceLine = container.querySelector("[data-pace-line]")!
    expect(paceLine).toHaveTextContent(
      "The last 2 years hold 80 events, 13 times the yearly pace of the 82 years before them.",
    )
    const agentic = screen.getByRole("region", { name: "The Agentic Era" })
    const generative = screen.getByRole("region", { name: "The Generative AI Era" })
    expect(generative.compareDocumentPosition(paceLine) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(paceLine.compareDocumentPosition(agentic) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("ends the page with the journey so far, and links back to the start", () => {
    render(<StoryEngine events={events} />)

    expect(screen.getByRole("heading", { level: 2, name: "The Journey So Far" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: `Start again from ${events[0].year}` })).toHaveAttribute(
      "href",
      "#the-foundation-era",
    )
  })

  it("marks every era with its place in the journey, and the current one as now", () => {
    const { container } = render(<StoryEngine events={events} />)

    expect([...container.querySelectorAll("[data-era-marker]")].map((marker) => marker.textContent)).toEqual([
      "Era 1 of 6",
      "Era 2 of 6",
      "Era 3 of 6",
      "Era 4 of 6",
      "Era 5 of 6",
      "Era 6 of 6 · Now",
    ])
  })

  it("leaves the pace line out while the reader filters", async () => {
    const { container } = render(<StoryEngine events={events} />)

    await userEvent.type(screen.getByRole("searchbox", { name: "Search events" }), "chess")

    await expect.poll(() => container.querySelector("[data-pace-line]")).toBeNull()
  })
})
