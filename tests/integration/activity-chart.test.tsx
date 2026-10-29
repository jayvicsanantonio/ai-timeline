// Integration tests for ActivityChart, the events-per-year "seismograph" used by the hero and the navigation.
// Covers bar scaling, era colors, filtered-out ghosts, the current year, landmark dots, hover readouts and picking a year.
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
import { ActivityChart } from "@/components/timeline/activity-chart"
import { ERA_DEFINITIONS } from "@/lib/eras"
import type { YearActivity } from "@/lib/timeline-activity"

const activity: YearActivity[] = [
  { year: 1968, total: 2, matching: 2, landmarks: 0, eraId: "the-foundation-era" },
  { year: 1969, total: 0, matching: 0, landmarks: 0, eraId: "the-foundation-era" },
  { year: 1970, total: 4, matching: 1, landmarks: 0, eraId: "the-knowledge-era" },
  { year: 1971, total: 1, matching: 0, landmarks: 0, eraId: "the-knowledge-era" },
]

// The same years, with a landmark in 1968 and in 1970, the busiest year
const withLandmarks: YearActivity[] = [
  { year: 1968, total: 2, matching: 2, landmarks: 1, eraId: "the-foundation-era" },
  { year: 1969, total: 0, matching: 0, landmarks: 0, eraId: "the-foundation-era" },
  { year: 1970, total: 4, matching: 4, landmarks: 2, eraId: "the-knowledge-era" },
  { year: 1971, total: 1, matching: 1, landmarks: 0, eraId: "the-knowledge-era" },
]

// Resolves a hex color to the rgb() form that computed styles report.
function rgb(hex: string) {
  const probe = document.createElement("div")
  probe.style.color = hex
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function bars(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>("[data-year-bar]")]
}

function part(bar: HTMLElement, name: "total" | "matching") {
  return bar.querySelector<HTMLElement>(`[data-part="${name}"]`)!
}

function landmarkDot(bar: HTMLElement) {
  return bar.querySelector<HTMLElement>('[data-part="landmark"]')
}

describe.each(["horizontal", "vertical"] as const)("ActivityChart drawn %s", (orientation) => {
  const length = orientation === "horizontal" ? "height" : "width"

  it("draws one bar per year, in order", () => {
    const { container } = render(<ActivityChart activity={activity} orientation={orientation} />)

    expect(bars(container).map((bar) => bar.dataset.year)).toEqual(["1968", "1969", "1970", "1971"])
  })

  it("scales each year against the busiest one", () => {
    const { container } = render(<ActivityChart activity={activity} orientation={orientation} />)

    expect(bars(container).map((bar) => part(bar, "total").style[length])).toEqual(["50%", "0%", "100%", "25%"])
  })

  it("draws the events that pass the filters over a ghost of the year's total", () => {
    const { container } = render(<ActivityChart activity={activity} orientation={orientation} />)

    expect(bars(container).map((bar) => part(bar, "matching").style[length])).toEqual(["50%", "0%", "25%", "0%"])
  })

  it("colors each year by its era", () => {
    const { container } = render(<ActivityChart activity={activity} orientation={orientation} />)

    const [foundation, , knowledge] = bars(container)
    expect(getComputedStyle(part(foundation, "matching")).backgroundColor).toBe(rgb(ERA_DEFINITIONS[0].color))
    expect(getComputedStyle(part(knowledge, "matching")).backgroundColor).toBe(rgb(ERA_DEFINITIONS[1].color))
  })

  it("marks the current year", () => {
    const { container } = render(<ActivityChart activity={activity} orientation={orientation} currentYear={1970} />)

    expect(bars(container).map((bar) => bar.dataset.current)).toEqual(["false", "false", "true", "false"])
  })

  it("marks the years with a landmark by a dot, only when asked to", () => {
    const marked = render(<ActivityChart activity={withLandmarks} orientation={orientation} marksLandmarks />)
    expect(bars(marked.container).map((bar) => landmarkDot(bar) !== null)).toEqual([true, false, true, false])
    marked.unmount()

    const unmarked = render(<ActivityChart activity={withLandmarks} orientation={orientation} />)
    expect(unmarked.container.querySelectorAll('[data-part="landmark"]')).toHaveLength(0)
  })

  it("sets each landmark's dot just past the end of its bar, and inside the chart beside the busiest year", () => {
    const { container } = render(
      <ActivityChart activity={withLandmarks} orientation={orientation} marksLandmarks className="h-40 w-40" />,
    )
    const [first, , busiest] = bars(container)
    const chart = container.firstElementChild!.getBoundingClientRect()
    const box = (element: HTMLElement) => element.getBoundingClientRect()

    if (orientation === "horizontal") {
      expect(box(landmarkDot(first)!).bottom).toBeLessThanOrEqual(box(part(first, "matching")).top)
      expect(box(landmarkDot(busiest)!).top).toBeGreaterThanOrEqual(chart.top)
    } else {
      expect(box(landmarkDot(first)!).left).toBeGreaterThanOrEqual(box(part(first, "matching")).right)
      expect(box(landmarkDot(busiest)!).right).toBeLessThanOrEqual(chart.right)
    }
  })

  it("is hidden from assistive technology, which reaches the same places through the chapter buttons", () => {
    const { container } = render(<ActivityChart activity={activity} orientation={orientation} />)

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
  })
})

describe("ActivityChart at small sizes", () => {
  const sparse: YearActivity[] = [
    { year: 2000, total: 1, matching: 1, landmarks: 0, eraId: "the-learning-era" },
    { year: 2001, total: 0, matching: 0, landmarks: 0, eraId: "the-learning-era" },
    { year: 2002, total: 64, matching: 64, landmarks: 0, eraId: "the-learning-era" },
    { year: 2003, total: 2, matching: 0, landmarks: 0, eraId: "the-learning-era" },
  ]

  it.each([
    ["horizontal", "h-2 w-60", "height"],
    ["vertical", "h-60 w-8", "width"],
  ] as const)("keeps every year with events visible when drawn %s and tiny", (orientation, size, length) => {
    const { container } = render(<ActivityChart activity={sparse} orientation={orientation} className={size} />)
    const [oneEvent, noEvents, , filteredOut] = bars(container)
    const sizeOf = (element: HTMLElement) => element.getBoundingClientRect()[length]

    expect(sizeOf(part(oneEvent, "total"))).toBeGreaterThanOrEqual(2)
    expect(sizeOf(part(oneEvent, "matching"))).toBeGreaterThanOrEqual(2)
    expect(sizeOf(part(noEvents, "total"))).toBe(0)
    expect(sizeOf(part(filteredOut, "total"))).toBeGreaterThanOrEqual(2)
    expect(sizeOf(part(filteredOut, "matching"))).toBe(0)
  })
})

describe("ActivityChart interaction", () => {
  it("reads out a year's events while the pointer is over it", async () => {
    const { container, getByText } = render(<ActivityChart activity={activity} orientation="horizontal" className="h-40 w-80" />)

    await userEvent.hover(bars(container)[0])
    expect(getByText("1968 · 2 events")).toBeVisible()

    await userEvent.hover(bars(container)[2])
    expect(getByText("1970 · 1 of 4 events")).toBeVisible()
  })

  it("counts a year's landmarks in its readout", async () => {
    const { container, getByText } = render(
      <ActivityChart activity={withLandmarks} orientation="horizontal" className="h-40 w-80" />,
    )

    await userEvent.hover(bars(container)[0])
    expect(getByText("1968 · 2 events · ★ 1 landmark")).toBeVisible()

    await userEvent.hover(bars(container)[2])
    expect(getByText("1970 · 4 events · ★ 2 landmarks")).toBeVisible()
  })

  it("picks a year that has events to show", async () => {
    const pickedYears: number[] = []
    const { container } = render(
      <ActivityChart
        activity={activity}
        orientation="vertical"
        onSelectYear={(year) => pickedYears.push(year)}
        className="h-80 w-40"
      />,
    )

    await userEvent.click(bars(container)[2])

    expect(pickedYears).toEqual([1970])
  })

  it("ignores years whose events are all filtered out or that have none", async () => {
    const pickedYears: number[] = []
    const { container } = render(
      <ActivityChart
        activity={activity}
        orientation="vertical"
        onSelectYear={(year) => pickedYears.push(year)}
        className="h-80 w-40"
      />,
    )

    await userEvent.click(bars(container)[1])
    await userEvent.click(bars(container)[3])

    expect(pickedYears).toEqual([])
  })
})
