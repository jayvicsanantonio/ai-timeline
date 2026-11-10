// Integration tests for WorldMap, the six regions of the journey along one route and the events-per-year chart beneath
// them, rendered with the real timeline data. Covers the links to the regions, the chart's summary, hint and table, and
// its era axis.
import { render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { page, userEvent } from "vitest/browser"
import { WorldMap } from "@/components/pokemon/storytelling/world-map"
import timelineData from "@/data/timeline-events.json"
import { groupEventsByEra } from "@/lib/eras"
import { countEventsByYear } from "@/lib/timeline-activity"
import { parseTimelineEvents } from "@/lib/timeline-events"

const events = parseTimelineEvents(timelineData)
const eras = groupEventsByEra(events)
const activity = countEventsByYear(events)

function chartFigure() {
  return screen.getAllByRole("figure").find((figure) => figure.querySelector("[data-era-axis]"))!
}

function renderPrologue() {
  return render(<WorldMap eras={eras} activity={activity} totalEvents={events.length} />)
}

describe("WorldMap", () => {
  it("heads the map with a level-2 heading", () => {
    renderPrologue()

    expect(screen.getByRole("heading", { level: 2, name: `${eras.length} regions, one route` })).toBeInTheDocument()
  })

  it("links to every region by its route, place, era and years, the first first, as the page runs", () => {
    renderPrologue()

    const links = within(screen.getByRole("list", { name: "Eras" })).getAllByRole("link")
    expect(links).toHaveLength(eras.length)
    eras.forEach((era, index) => {
      expect(links[index]).toHaveAttribute("href", `#${era.id}`)
      expect(links[index]).toHaveTextContent(
        `Route ${index + 1}${era.place}${era.label}${era.subtitle}${era.events.length} entries`,
      )
      expect(links[index].querySelector("img")).toHaveAttribute("src", `/sprites/badges/${era.badge}.png`)
      expect(links[index].querySelector("img")).toHaveAttribute("alt", "")
    })
  })

  it("sums up how many events fall in the latest era under the chart", () => {
    renderPrologue()

    const latest = eras.at(-1)!
    expect(chartFigure()).toHaveTextContent(
      `${latest.events.length} of the ${events.length} events happened since ${latest.range[0]}`,
    )
  })

  it("tells pointer users that a bar in the chart jumps to its year", () => {
    renderPrologue()

    const hint = within(chartFigure()).getByText("Click a bar to jump to that year.")
    // The bars answer only the pointer, so assistive technology skips the hint along with the chart
    expect(hint).toHaveAttribute("aria-hidden", "true")
  })

  it("offers the chart's numbers as a table of every year that has events, the first year first", async () => {
    renderPrologue()

    await userEvent.click(screen.getByText("Show the numbers"))

    const table = screen.getByRole("table", { name: "Events per year" })
    const rows = within(table).getAllByRole("row").slice(1)
    const yearsWithEvents = activity.filter((year) => year.total > 0)
    expect(rows).toHaveLength(yearsWithEvents.length)
    expect(rows[0]).toHaveTextContent(`${yearsWithEvents[0].year}${yearsWithEvents[0].total}`)
    expect(rows.at(-1)).toHaveTextContent(`${yearsWithEvents.at(-1)!.year}${yearsWithEvents.at(-1)!.total}`)
  })
})

// The axis under the chart names each era at its first year, and the short eras of the 2020s leave little room
describe.each([
  [375, 812],
  [768, 1024],
  [1024, 768],
  [1280, 800],
])("the era axis at %ipx wide", (width, height) => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it("keeps the years and era names under the chart from running into each other", async () => {
    await page.viewport(width, height)
    const { container } = renderPrologue()

    const labels = [...container.querySelectorAll<HTMLElement>("[data-era-axis] span")]
      .filter((label) => label.textContent && label.getBoundingClientRect().width > 0)
      .map((label) => ({ text: label.textContent, box: label.getBoundingClientRect() }))
      .sort((a, b) => a.box.left - b.box.left)
    expect(labels.map((label) => label.text)).toContain("2026")
    labels.slice(1).forEach((label, index) => {
      expect(label.box.left, `${labels[index].text} / ${label.text}`).toBeGreaterThanOrEqual(labels[index].box.right)
    })
  })
})
