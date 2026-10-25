// Integration tests for TimelineStory event cards: each source link must be a real,
// keyboard-reachable anchor named after its event, and each card shows its date.
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
import timelineData from "@/data/timeline-events.json"
import type { TimelineEvent } from "@/types/timeline"
import { TimelineStory } from "@/components/storytelling/timeline-story"

const events = (timelineData as TimelineEvent[]).slice(0, 3)

describe("TimelineStory", () => {
  it("renders each event source as a link that opens safely in a new tab", () => {
    render(<TimelineStory events={events} />)

    const links = screen.getAllByRole("link")
    expect(links).toHaveLength(events.length)

    events.forEach((event, index) => {
      expect(links[index]).toHaveAttribute("href", event.link)
      expect(links[index]).toHaveAttribute("target", "_blank")
      expect(links[index]).toHaveAttribute("rel", "noopener noreferrer")
    })
  })

  it("names each link after its event and says it opens in a new tab", () => {
    render(<TimelineStory events={events} />)

    events.forEach((event) => {
      expect(screen.getByRole("link", { name: event.title })).toHaveAccessibleDescription("Opens in a new tab")
    })
  })

  it("keeps each event title a level-3 heading named only by the title", () => {
    render(<TimelineStory events={events} />)

    events.forEach((event) => {
      const heading = screen.getByRole("heading", { level: 3, name: event.title })
      expect(within(heading).getByRole("link", { name: event.title })).toBeInTheDocument()
    })
  })

  it("lets keyboard users tab to every event link in order", async () => {
    render(<TimelineStory events={events} />)

    for (const event of events) {
      await userEvent.tab()
      expect(document.activeElement).toBe(screen.getByRole("link", { name: event.title }))
    }
  })

  it("shows the month and year, or only the year when the month is unknown", () => {
    const datedEvents: TimelineEvent[] = [
      { ...events[0], year: 1995, month: "Unknown", title: "Undated event" },
      { ...events[0], year: 2017, month: "June", title: "Dated event" },
    ]
    render(<TimelineStory events={datedEvents} />)

    expect(screen.getByText("1995")).toBeInTheDocument()
    expect(screen.getByText("June 2017")).toBeInTheDocument()
    expect(screen.queryByText(/Unknown/)).not.toBeInTheDocument()
  })
})
