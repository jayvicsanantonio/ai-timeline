// Integration tests for EpilogueScene, the close of the page below the oldest events, in real Chromium.
// The rewind ends where the timeline began: a level-2 heading, how far the reader has come, the eras' colors and a way back up to now.
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { EpilogueScene } from "@/components/storytelling/epilogue-scene"
import timelineData from "@/data/timeline-events.json"
import { ERA_DEFINITIONS } from "@/lib/eras"
import { parseTimelineEvents } from "@/lib/timeline-events"

const events = parseTimelineEvents(timelineData)

// The rgb() a computed style reports for a #rrggbb color
function rgb(hex: string) {
  const [red, green, blue] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16))
  return `rgb(${red}, ${green}, ${blue})`
}

function renderEpilogue() {
  return render(<EpilogueScene latestEraId="the-agentic-era" firstEvent={events[0]} latestYear={events.at(-1)!.year} />)
}

describe("EpilogueScene", () => {
  it("ends the rewind where the timeline began, under a level-2 heading and the first event's year", () => {
    renderEpilogue()

    expect(screen.getByRole("heading", { level: 2, name: "Where It Began" })).toBeInTheDocument()
    expect(screen.getByText(String(events[0].year))).toBeInTheDocument()
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

  it("leaves the next era's interface uninvented", () => {
    renderEpilogue()

    expect(screen.getByText(/The interface of the next era has not been invented yet\./)).toBeInTheDocument()
  })

  it("traces every era's color in order up to the open slot for the next one", () => {
    const { container } = renderEpilogue()

    const trail = container.querySelector("[data-era-trail]")!
    expect(trail).toHaveAttribute("aria-hidden", "true")
    const segments = [...trail.querySelectorAll("[data-era-color]")]
    expect(segments.map((segment) => getComputedStyle(segment).backgroundColor)).toEqual(
      ERA_DEFINITIONS.map((era) => rgb(era.color)),
    )
    const openSlot = trail.querySelector("[data-next-era]")!
    expect(getComputedStyle(openSlot).borderTopStyle).toBe("dashed")
    expect(segments.at(-1)!.compareDocumentPosition(openSlot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("links back up to now, the latest era at the top of the timeline", () => {
    renderEpilogue()

    expect(screen.getByRole("link", { name: "Back to now" })).toHaveAttribute("href", "#the-agentic-era")
  })
})
