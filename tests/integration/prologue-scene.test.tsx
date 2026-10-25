// Integration tests for PrologueScene, the opening of the page, rendered with the real timeline data.
// Covers the page title, the events-per-year chart with its summary and table, and the five era tiles.
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
import { PrologueScene } from "@/components/storytelling/prologue-scene"
import timelineData from "@/data/timeline-events.json"
import { groupEventsByEra } from "@/lib/eras"
import { countEventsByYear } from "@/lib/timeline-activity"
import { parseTimelineEvents } from "@/lib/timeline-events"

const events = parseTimelineEvents(timelineData)
const eras = groupEventsByEra(events)
const activity = countEventsByYear(events)

function renderPrologue() {
  return render(<PrologueScene eras={eras} activity={activity} totalEvents={events.length} />)
}

describe("PrologueScene", () => {
  it("names the timeline in the page's level-1 heading", () => {
    renderPrologue()

    expect(screen.getByRole("heading", { level: 1, name: "The AI Timeline" })).toBeInTheDocument()
  })

  it("links to every era from a tile naming its chapter, years, interface and event count", () => {
    renderPrologue()

    const tiles = within(screen.getByRole("list", { name: "Eras" })).getAllByRole("link")
    expect(tiles).toHaveLength(eras.length)
    eras.forEach((era, index) => {
      expect(tiles[index]).toHaveAttribute("href", `#${era.id}`)
      expect(tiles[index]).toHaveTextContent(era.chapter)
      expect(tiles[index]).toHaveTextContent(era.name)
      expect(tiles[index]).toHaveTextContent(era.subtitle)
      expect(tiles[index]).toHaveTextContent(era.interfaceName)
      expect(tiles[index]).toHaveTextContent(`${era.events.length} events`)
    })
  })

  it("sums up how many events fall in the latest era under the chart", () => {
    renderPrologue()

    const latest = eras.at(-1)!
    expect(screen.getByRole("figure")).toHaveTextContent(
      `${latest.events.length} of the ${events.length} events happened in the 2020s`,
    )
  })

  it("offers the chart's numbers as a table of every year that has events", async () => {
    renderPrologue()

    await userEvent.click(screen.getByText("Show the numbers"))

    const table = screen.getByRole("table", { name: "Events per year" })
    const rows = within(table).getAllByRole("row").slice(1)
    const yearsWithEvents = activity.filter((year) => year.total > 0)
    expect(rows).toHaveLength(yearsWithEvents.length)
    expect(rows[0]).toHaveTextContent(`${yearsWithEvents[0].year}${yearsWithEvents[0].total}`)
  })

  it("starts the story at the first era", () => {
    renderPrologue()

    expect(screen.getByRole("link", { name: `Begin in ${activity[0].year}` })).toHaveAttribute(
      "href",
      `#${eras[0].id}`,
    )
  })
})
