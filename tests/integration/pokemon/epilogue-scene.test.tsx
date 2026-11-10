// Integration tests for EpilogueScene, the close of the page after the latest entry, in real Chromium.
// The journey reaches now: the party as every line stands today, how far the reader has travelled, an egg for the next era,
// the badges of every era, a way back to the start and the credits for the sprites.
import { render, screen, within } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { DexProvider } from "@/components/pokemon/eras/dex-context"
import { EpilogueScene } from "@/components/pokemon/storytelling/epilogue-scene"
import timelineData from "@/data/timeline-events.json"
import { buildDex, LINES, speciesOf } from "@/lib/dex"
import { ERA_DEFINITIONS } from "@/lib/eras"
import { parseTimelineEvents } from "@/lib/timeline-events"

const events = parseTimelineEvents(timelineData)
const dex = buildDex(events)

function wrapper({ children }: { children: ReactNode }) {
  return (
    <DexProvider dex={dex} events={events}>
      {children}
    </DexProvider>
  )
}

function renderEpilogue() {
  return render(<EpilogueScene firstEraId="the-foundation-era" firstEvent={events[0]} latestEvent={events.at(-1)!} />, {
    wrapper,
  })
}

describe("EpilogueScene", () => {
  it("reaches now under a level-2 heading, numbered as the latest entry", () => {
    renderEpilogue()

    expect(screen.getByRole("heading", { level: 2, name: "Hall of Fame" })).toBeInTheDocument()
    const latest = events.at(-1)!
    expect(screen.getByText(/^No\. \d{3}/)).toHaveTextContent(`No. ${events.length} · ${latest.month} ${latest.year}`)
  })

  it("says how far the reader has travelled, from the first event to now", () => {
    renderEpilogue()

    expect(
      screen.getByText(`You have travelled ${events.at(-1)!.year - events[0].year} years, from the ${events[0].title} in ${events[0].year}`, {
        exact: false,
      }),
    ).toBeInTheDocument()
  })

  it("shows the party today, every line at its latest stage with its level", () => {
    renderEpilogue()

    const party = within(screen.getByRole("list", { name: "The party today" })).getAllByRole("listitem")
    expect(party).toHaveLength(LINES.length)
    party.forEach((member, index) => {
      const line = LINES[index]
      expect(member).toHaveTextContent(speciesOf(line.stages.at(-1)!.species).name)
      expect(member).toHaveTextContent(line.name)
      expect(member.textContent).toMatch(/Lv\. \d+/)
    })
  })

  it("leaves the next era an egg that has not hatched yet", () => {
    const { container } = renderEpilogue()

    expect(screen.getByText("Oh? The EGG is moving!")).toBeInTheDocument()
    expect(screen.getByText(/The next era hasn’t hatched yet\./)).toBeInTheDocument()
    expect(container.querySelector('[data-next-era] img[src="/sprites/items/mystery-egg.png"]')).not.toBeNull()
  })

  it("lines up every era's badge in order", () => {
    renderEpilogue()

    const badges = within(screen.getByRole("list", { name: "Badges earned" })).getAllByRole("img")
    expect(badges.map((badge) => badge.getAttribute("alt"))).toEqual(ERA_DEFINITIONS.map((era) => `${era.label} badge`))
  })

  it("links back to the start of the journey", () => {
    renderEpilogue()

    expect(screen.getByRole("link", { name: `Start again from ${events[0].year}` })).toHaveAttribute(
      "href",
      "#the-foundation-era",
    )
  })

  it("credits the sprites and says the site is an unofficial fan project", () => {
    renderEpilogue()

    expect(screen.getByRole("link", { name: /PokéAPI’s sprite collection/ })).toHaveAttribute(
      "href",
      "https://github.com/jayvicsanantonio/sprites",
    )
    expect(screen.getByText(/unofficial fan project/)).toBeInTheDocument()
  })
})
