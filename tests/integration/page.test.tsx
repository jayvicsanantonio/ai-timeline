// Integration tests for the AI Timeline page composition: landmarks, era headings,
// and event links rendered from the real timeline data.
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import timelineData from "@/data/timeline-events.json"
import AITimelinePage from "@/app/page"

const ERA_TITLES = [
  "The Foundation Era",
  "The Knowledge Era",
  "The Learning Era",
  "The Deep Learning Revolution",
  "The Generative AI Era",
]

describe("AITimelinePage", () => {
  it("does not render its own main landmark because the root layout provides it", () => {
    const { container } = render(<AITimelinePage />)

    expect(container.querySelector("main")).toBeNull()
  })

  it("renders every era title as a level-2 heading", () => {
    render(<AITimelinePage />)

    ERA_TITLES.forEach((title) => {
      expect(screen.getByRole("heading", { level: 2, name: title })).toBeInTheDocument()
    })
  })

  it("renders a source link for every timeline event", () => {
    const { container } = render(<AITimelinePage />)

    expect(container.querySelectorAll('h3 a[target="_blank"]')).toHaveLength(timelineData.length)
  })
})
