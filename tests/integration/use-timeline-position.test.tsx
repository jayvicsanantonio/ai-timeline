// Integration tests for useTimelinePosition with real scrolling in Chromium.
// It reports the era and the event year at the reading line, and whether the reader is inside the timeline.
import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { useTimelinePosition } from "@/hooks/use-timeline-position"

const ERA_IDS = ["era-one", "era-two"]

function PositionProbe() {
  const position = useTimelinePosition(ERA_IDS)
  return <output data-testid="position">{JSON.stringify(position)}</output>
}

function renderTimeline() {
  render(
    <>
      <PositionProbe />
      <div style={{ height: "150vh" }} />
      <section id="era-one">
        <div style={{ height: "50vh" }} />
        <article data-year="1956" data-month="June" style={{ height: "60vh" }} />
        <article data-year="1958" data-month="Unknown" style={{ height: "60vh" }} />
      </section>
      <section id="era-two">
        <div style={{ height: "50vh" }} />
        <article data-year="1997" data-month="May" style={{ height: "60vh" }} />
      </section>
      <div style={{ height: "200vh" }} />
    </>,
  )
}

function position() {
  return JSON.parse(screen.getByTestId("position").textContent!)
}

// Scrolls until the element's top sits at the given share of the viewport's height.
function scrollTopTo(element: Element, share: number) {
  window.scrollTo({
    top: window.scrollY + element.getBoundingClientRect().top - window.innerHeight * share,
    behavior: "instant" as ScrollBehavior,
  })
}

afterEach(() => {
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
})

describe("useTimelinePosition", () => {
  it("reports the reader as outside the timeline while above the first era", async () => {
    renderTimeline()

    await expect.poll(position).toEqual({ eraId: "era-one", year: null, month: null, inTimeline: false, eraProgress: 0 })
  })

  it("follows the era and the year of the event at the reading line", async () => {
    renderTimeline()

    scrollTopTo(document.querySelector('[data-year="1956"]')!, 0.2)
    await expect.poll(position).toMatchObject({ eraId: "era-one", year: 1956, month: "June", inTimeline: true })

    scrollTopTo(document.querySelector('[data-year="1958"]')!, 0.2)
    await expect.poll(position).toMatchObject({ eraId: "era-one", year: 1958, month: null, inTimeline: true })

    scrollTopTo(document.querySelector('[data-year="1997"]')!, 0.2)
    await expect.poll(position).toMatchObject({ eraId: "era-two", year: 1997, month: "May", inTimeline: true })
  })

  // Keyboard steps and year jumps center the event they land on, so a centered event must read as current
  it("counts an event centered on screen as the one being read", async () => {
    render(
      <>
        <PositionProbe />
        <div style={{ height: "150vh" }} />
        <section id="era-one">
          <article data-year="1956" style={{ height: "20vh" }} />
          <article data-year="1958" style={{ height: "20vh" }} />
        </section>
        <section id="era-two" style={{ height: "200vh" }} />
      </>,
    )

    document
      .querySelector('[data-year="1958"]')!
      .scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior })

    await expect.poll(position).toMatchObject({ eraId: "era-one", year: 1958, inTimeline: true })
  })

  it("reports no year while an era's introduction is at the reading line", async () => {
    renderTimeline()

    scrollTopTo(document.getElementById("era-two")!, 0.2)

    await expect.poll(position).toMatchObject({ eraId: "era-two", year: null, month: null, inTimeline: true })
  })

  it("reports the reader as outside the timeline after the last era", async () => {
    renderTimeline()

    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" as ScrollBehavior })

    await expect.poll(position).toMatchObject({ eraId: "era-two", year: 1997, inTimeline: false })
  })

  // The 2020s fill most of the page but few rows of the year chart, so the rail also shows this progress
  it("measures how far through the current era the reading line has come", async () => {
    render(
      <>
        <PositionProbe />
        <div style={{ height: "150vh" }} />
        <section id="era-one" style={{ height: "300vh" }} />
        <section id="era-two" style={{ height: "300vh" }} />
      </>,
    )
    const eraOne = document.getElementById("era-one")!

    scrollTopTo(eraOne, 0.5)
    await expect.poll(() => position().eraProgress).toBe(0)

    // Puts the era's middle on the reading line, which sits halfway down the viewport
    window.scrollTo({
      top: window.scrollY + eraOne.getBoundingClientRect().top + eraOne.offsetHeight / 2 - window.innerHeight / 2,
      behavior: "instant" as ScrollBehavior,
    })
    await expect.poll(() => position().eraProgress).toBeCloseTo(0.5, 1)
  })
})
