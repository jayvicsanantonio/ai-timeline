// Integration tests for EpilogueScene, the close of the page below the oldest events, in real Chromium.
// The rewind ends where the timeline began: Mew over a level-2 heading, how far the reader has come, the eras' badges up to
// an egg for the next one, a way back up to now and the credits for the sprites.
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { EpilogueScene } from "@/components/storytelling/epilogue-scene"
import timelineData from "@/data/timeline-events.json"
import { ERA_DEFINITIONS } from "@/lib/eras"
import { parseTimelineEvents } from "@/lib/timeline-events"

const events = parseTimelineEvents(timelineData)

function renderEpilogue() {
  return render(<EpilogueScene latestEraId="the-agentic-era" firstEvent={events[0]} latestYear={events.at(-1)!.year} />)
}

describe("EpilogueScene", () => {
  it("ends the rewind where the timeline began, under a level-2 heading and the first event's year", () => {
    renderEpilogue()

    expect(screen.getByRole("heading", { level: 2, name: "Where It Began" })).toBeInTheDocument()
    expect(screen.getByText(/^No\. 001/)).toHaveTextContent(`No. 001 · ${events[0].year}`)
  })

  it("floats Mew, the ancestor of every Pokémon, over the first entry, as a picture assistive technology skips", () => {
    const { container } = renderEpilogue()

    const mew = container.querySelector('img[src="/sprites/modern/151.gif"]')!
    expect(mew).toHaveAttribute("alt", "")
    expect(mew.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(screen.getByText(/Mew is said to carry the genes of every Pokémon/)).toBeInTheDocument()
  })

  it("says how many years the reader has rewound, and to which event", () => {
    renderEpilogue()

    expect(
      screen.getByText(
        `You have rewound ${events.at(-1)!.year - events[0].year} years, from agents at work back to the ${events[0].title} in ${events[0].year}.`,
        { exact: false },
      ),
    ).toBeInTheDocument()
  })

  it("leaves the next era unhatched", () => {
    renderEpilogue()

    expect(screen.getByText(/The next era hasn’t hatched yet\./)).toBeInTheDocument()
  })

  it("lines up every era's badge in order, up to an egg in the open slot for the next one", () => {
    renderEpilogue()

    const trail = screen.getByRole("list", { name: "Badges earned" })
    const badges = within(trail).getAllByRole("img")
    expect(badges.map((badge) => badge.getAttribute("alt"))).toEqual([
      ...ERA_DEFINITIONS.map((era) => `${era.label} badge`),
      "The next era, not hatched yet",
    ])
    const openSlot = trail.querySelector("[data-next-era]")!
    expect(getComputedStyle(openSlot).borderTopStyle).toBe("dashed")
    expect(openSlot.querySelector("img")).toHaveAttribute("src", "/sprites/items/mystery-egg.png")
  })

  it("credits the sprites and says the site is an unofficial fan project", () => {
    renderEpilogue()

    expect(screen.getByRole("link", { name: /PokéAPI’s sprite collection/ })).toHaveAttribute(
      "href",
      "https://github.com/jayvicsanantonio/sprites",
    )
    expect(screen.getByText(/unofficial fan project/)).toBeInTheDocument()
  })

  it("links back up to now, the latest era at the top of the timeline", () => {
    renderEpilogue()

    expect(screen.getByRole("link", { name: "Back to now" })).toHaveAttribute("href", "#the-agentic-era")
  })
})
