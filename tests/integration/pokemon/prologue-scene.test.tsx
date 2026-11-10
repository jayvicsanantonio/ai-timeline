// Integration tests for PrologueScene, the opening of the page drawn as a game's title screen, rendered with the real
// timeline data inside the AI Dex. Covers the title and the premise, MEW above the first creature of every line, the start
// menu and the latest entries.
import { render, screen, within } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it } from "vitest"
import { page, userEvent } from "vitest/browser"
import { DexProvider } from "@/components/pokemon/eras/dex-context"
import { PrologueScene } from "@/components/pokemon/storytelling/prologue-scene"
import timelineData from "@/data/timeline-events.json"
import { buildDex, formatDexNumber, LINES } from "@/lib/dex"
import { groupEventsByEra } from "@/lib/eras"
import { eventAnchorId, eventDateTime, formatEventDate } from "@/lib/event-format"
import { latestEvents } from "@/lib/newest-first"
import { countEventsByYear } from "@/lib/timeline-activity"
import { parseTimelineEvents } from "@/lib/timeline-events"

const events = parseTimelineEvents(timelineData)
const eras = groupEventsByEra(events)
const activity = countEventsByYear(events)
const latest = latestEvents(events, 3)
const dex = buildDex(events)

function wrapper({ children }: { children: ReactNode }) {
  return (
    <DexProvider dex={dex} events={events}>
      {children}
    </DexProvider>
  )
}

function renderPrologue() {
  return render(
    <PrologueScene
      eras={eras}
      latest={latest}
      totalEvents={events.length}
      firstYear={activity[0].year}
      lastYear={activity.at(-1)!.year}
    />,
    { wrapper },
  )
}

describe("PrologueScene", () => {
  it("names the timeline in the page's level-1 heading", () => {
    renderPrologue()

    expect(screen.getByRole("heading", { level: 1, name: "The AI Timeline" })).toBeInTheDocument()
  })

  it("tells the story's premise: AI history as branches, each a Pokémon that evolves at its breakthroughs, on a route", () => {
    renderPrologue()

    const first = activity[0].year
    const last = activity.at(-1)!.year
    const intro = screen.getByText(`${last - first} years of artificial intelligence, split into ${LINES.length} branches`, {
      exact: false,
    })
    expect(intro).toHaveTextContent("each played by a Pokémon that evolves at its breakthroughs")
    expect(intro).toHaveTextContent("MAGIKARP")
    expect(intro).toHaveTextContent(`Walk the route from ${first}`)
  })

  it("offers a start menu: a new game in the first era, continuing at the latest entry, and the Pokédex", () => {
    renderPrologue()

    const menu = within(screen.getByRole("navigation", { name: "Start menu" })).getAllByRole("link")
    expect(menu.map((item) => item.textContent)).toEqual([
      `▶New gameStart the journey in ${activity[0].year}`,
      `▶ContinueJump to the latest, ${formatEventDate(events.at(-1)!)}`,
      `▶PokédexMeet the ${LINES.length} branches of AI`,
    ])
    expect(menu.map((item) => item.getAttribute("href"))).toEqual([
      `#${eras[0].id}`,
      `#${eventAnchorId(events.at(-1)!)}`,
      "#party-title",
    ])
    for (const item of menu) {
      expect(item.querySelector(".start-menu-cursor")).toHaveAttribute("aria-hidden", "true")
    }
  })

  it("floats MEW above the first creature of every line, as pictures assistive technology skips", () => {
    const { container } = renderPrologue()

    expect(container.querySelector('img[src="/sprites/modern/151.gif"]')!.closest('[aria-hidden="true"]')).not.toBeNull()
    const lineup = container.querySelector(".title-ledge")!
    expect([...lineup.querySelectorAll("img")].map((sprite) => sprite.getAttribute("src"))).toEqual(
      LINES.map((line) => `/sprites/modern/${line.stages[0].species}.gif`),
    )
  })
})

describe("PrologueScene on a laptop screen", () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  // The journey should follow soon, so the title screen stays within about a screen. The test renders without the
  // page's fonts, whose fallbacks differ from machine to machine, so the bound leaves room for wider ones.
  it("keeps the opening to about a screen", async () => {
    await page.viewport(1280, 800)
    const { container } = renderPrologue()

    const height = container.querySelector("section")!.getBoundingClientRect().height
    expect(height).toBeLessThan(960)
  })
})

describe("the latest events at the top of the page", () => {
  function latestList() {
    return screen.getByRole("list", { name: "Latest sightings" })
  }

  it("heads the newest events, and says how recent the timeline is", () => {
    renderPrologue()

    const heading = screen.getByRole("heading", { level: 2, name: "Latest sightings" })
    const through = heading.parentElement!.querySelector("p")!
    expect(through).toHaveTextContent(`Through ${formatEventDate(events.at(-1)!)}`)
    expect(through.querySelector("time")).toHaveAttribute("datetime", eventDateTime(events.at(-1)!))
  })

  it("lists the newest events, the latest first, each with its number, creature, date, category and title", () => {
    renderPrologue()

    const items = within(latestList()).getAllByRole("link")
    expect(items).toHaveLength(3)
    items.forEach((item, index) => {
      const event = latest[index]
      const entry = dex.get(eventAnchorId(event))!
      expect(item).toHaveTextContent(event.title)
      expect(item).toHaveTextContent(event.category)
      expect(item).toHaveTextContent(formatDexNumber(entry.number))
      expect(item.querySelector("img")).toHaveAttribute("src", entry.sprite)
      expect(item.querySelector("time")).toHaveAttribute("datetime", eventDateTime(event))
    })
    expect(items[0]).toHaveTextContent(events.at(-1)!.title)
  })

  it("follows the start menu, so the latest news is right under the way into the journey", () => {
    renderPrologue()

    const menu = screen.getByRole("navigation", { name: "Start menu" })
    expect(menu.compareDocumentPosition(latestList()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("links each event to its card in the timeline rather than off the site", () => {
    renderPrologue()

    within(latestList())
      .getAllByRole("link")
      .forEach((item, index) => {
        expect(item).toHaveAttribute("href", `#${eventAnchorId(latest[index])}`)
        expect(item).not.toHaveAttribute("target")
      })
  })

  it("jumps to an event's card and focuses its title when the card is on the page", async () => {
    renderPrologue()
    const event = latest[1]
    const { unmount } = render(
      <div style={{ paddingTop: "200vh" }}>
        <article id={eventAnchorId(event)}>
          <h3>
            <a href={event.link} data-event-link="">
              {event.title}
            </a>
          </h3>
        </article>
      </div>,
    )

    await userEvent.click(within(latestList()).getAllByRole("link")[1])

    const title = screen.getByRole("link", { name: event.title })
    expect(title).toHaveFocus()
    await expect
      .poll(() => {
        const box = title.getBoundingClientRect()
        return box.top >= 0 && box.bottom <= window.innerHeight
      })
      .toBe(true)
    unmount()
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  })

  it("leaves out the list when there are no events", () => {
    render(
      <PrologueScene eras={eras} latest={[]} totalEvents={events.length} firstYear={1943} lastYear={2026} />,
      { wrapper },
    )

    expect(screen.queryByRole("heading", { name: "Latest sightings" })).toBeNull()
  })
})

