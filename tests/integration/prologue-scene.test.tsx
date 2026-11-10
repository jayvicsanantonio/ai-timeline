// Integration tests for PrologueScene, the opening of the page, rendered with the real timeline data.
// Covers the page title, the latest events, the links to the eras, and the events-per-year chart with its era axis, summary and table.
import { render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { page, userEvent } from "vitest/browser"
import { PrologueScene } from "@/components/storytelling/prologue-scene"
import timelineData from "@/data/timeline-events.json"
import { groupEventsByEra } from "@/lib/eras"
import { eventAnchorId, eventDateTime, formatEventDate } from "@/lib/event-format"
import { latestEvents, newestFirst } from "@/lib/newest-first"
import { countEventsByYear } from "@/lib/timeline-activity"
import { parseTimelineEvents } from "@/lib/timeline-events"

const events = parseTimelineEvents(timelineData)
const eras = groupEventsByEra(events)
const activity = countEventsByYear(events)
const latest = latestEvents(events, 3)

function renderPrologue() {
  return render(<PrologueScene eras={eras} activity={activity} latest={latest} totalEvents={events.length} />)
}

describe("PrologueScene", () => {
  it("names the timeline in the page's level-1 heading", () => {
    renderPrologue()

    expect(screen.getByRole("heading", { level: 1, name: "The AI Timeline" })).toBeInTheDocument()
  })

  it("links to every era by its name and years, the latest era first, as the page runs", () => {
    renderPrologue()

    const links = within(screen.getByRole("list", { name: "Eras" })).getAllByRole("link")
    expect(links).toHaveLength(eras.length)
    newestFirst(eras).forEach((era, index) => {
      expect(links[index]).toHaveAttribute("href", `#${era.id}`)
      expect(links[index]).toHaveTextContent(`${era.label}${era.subtitle}`)
      expect(getComputedStyle(links[index]).whiteSpace).toBe("nowrap")
    })
  })


  it("sums up how many events fall in the latest era under the chart", () => {
    renderPrologue()

    const latest = eras.at(-1)!
    expect(screen.getByRole("figure")).toHaveTextContent(
      `${latest.events.length} of the ${events.length} events happened since ${latest.range[0]}`,
    )
  })

  it("tells pointer users that a bar in the chart jumps to its year", () => {
    renderPrologue()

    const hint = within(screen.getByRole("figure")).getByText("Click a bar to jump to that year.")
    // The bars answer only the pointer, so assistive technology skips the hint along with the chart
    expect(hint).toHaveAttribute("aria-hidden", "true")
  })

  it("offers the chart's numbers as a table of every year that has events, the latest year first", async () => {
    renderPrologue()

    await userEvent.click(screen.getByText("Show the numbers"))

    const table = screen.getByRole("table", { name: "Events per year" })
    const rows = within(table).getAllByRole("row").slice(1)
    const yearsWithEvents = activity.filter((year) => year.total > 0)
    expect(rows).toHaveLength(yearsWithEvents.length)
    expect(rows[0]).toHaveTextContent(`${yearsWithEvents.at(-1)!.year}${yearsWithEvents.at(-1)!.total}`)
    expect(rows.at(-1)).toHaveTextContent(`${yearsWithEvents[0].year}${yearsWithEvents[0].total}`)
  })

  it("tells the reader that the timeline rewinds from the latest news to its first year", () => {
    renderPrologue()

    const first = activity[0].year
    const last = activity.at(-1)!.year
    expect(
      screen.getByText(`${last - first} years of artificial intelligence, from the latest news back to ${first}`, { exact: false }),
    ).toHaveTextContent("Scroll to rewind.")
  })
})

describe("PrologueScene on a laptop screen", () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  // The timeline should follow soon, so the opening stays within about a screen
  it("keeps the opening to about a screen", async () => {
    await page.viewport(1280, 800)
    const { container } = renderPrologue()

    expect(container.querySelector("section")!.getBoundingClientRect().height).toBeLessThan(960)
  })
})

describe("the latest events at the top of the page", () => {
  function latestList() {
    return screen.getByRole("list", { name: "Latest" })
  }

  it("heads the newest events, and says how recent the timeline is", () => {
    renderPrologue()

    const heading = screen.getByRole("heading", { level: 2, name: "Latest" })
    const through = heading.parentElement!.querySelector("p")!
    expect(through).toHaveTextContent(`Through ${formatEventDate(events.at(-1)!)}`)
    expect(through.querySelector("time")).toHaveAttribute("datetime", eventDateTime(events.at(-1)!))
  })

  it("lists the newest events, the latest first, each with its date, category and title", () => {
    renderPrologue()

    const items = within(latestList()).getAllByRole("link")
    expect(items).toHaveLength(3)
    items.forEach((item, index) => {
      const event = latest[index]
      expect(item).toHaveTextContent(event.title)
      expect(item).toHaveTextContent(event.category)
      expect(item.querySelector("time")).toHaveAttribute("datetime", eventDateTime(event))
    })
    expect(items[0]).toHaveTextContent(events.at(-1)!.title)
  })

  it("comes before the chart, so the latest news is the first thing under the title", () => {
    renderPrologue()

    expect(latestList().compareDocumentPosition(screen.getByRole("figure")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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
    render(<PrologueScene eras={eras} activity={activity} latest={[]} totalEvents={events.length} />)

    expect(screen.queryByRole("heading", { name: "Latest" })).toBeNull()
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
