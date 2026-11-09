// Integration tests for TimelineNavigation in real Chromium: the wide-screen rail with a button per era at the year it began,
// its year readout and activity chart, and the phone bar that names the current era and opens a list of eras. Both follow the
// page, which reads newest first, the latest era at the top.
import { render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { page, userEvent } from "vitest/browser"
import { TimelineNavigation } from "@/components/timeline/timeline-navigation"
import { groupEventsByEra } from "@/lib/eras"
import { eventAnchorId } from "@/lib/event-format"
import { erasNewestFirst } from "@/lib/newest-first"
import { countEventsByYear } from "@/lib/timeline-activity"
import type { TimelineEvent } from "@/types/timeline"

function makeEvent(year: number, title: string, month = "Unknown"): TimelineEvent {
  return {
    year,
    month,
    title,
    description: `What happened with ${title}.`,
    category: "Research Breakthroughs",
    link: `https://example.com/${encodeURIComponent(title)}`,
  }
}

const events = [
  makeEvent(1956, "Dartmouth AI Conference"),
  makeEvent(1958, "Rosenblatt's Perceptron"),
  makeEvent(1980, "XCON Brings Expert Systems to Business"),
  makeEvent(1997, "IBM Deep Blue Defeats Garry Kasparov", "May"),
  makeEvent(2012, "ImageNet Breakthrough"),
  makeEvent(2023, "OpenAI Releases GPT-4"),
]
// In the page's order, the latest era first, each with its events newest first
const eras = erasNewestFirst(groupEventsByEra(events))
const activity = countEventsByYear(events)

function eraOf(generation: string) {
  return eras.find((era) => era.generation === generation)!
}

function renderNavigation({ spacerBefore = false } = {}) {
  render(
    <>
      <TimelineNavigation eras={eras} activity={activity} />
      {spacerBefore ? <div style={{ height: "150vh" }} /> : null}
      {eras.map((era) => (
        <section key={era.id} id={era.id} style={{ minHeight: "160vh" }}>
          <h2 tabIndex={-1}>{era.name}</h2>
          {era.events.map((event) => (
            <article
              key={event.title}
              id={eventAnchorId(event)}
              data-year={event.year}
              data-month={event.month}
              style={{ height: "50vh" }}
            >
              <h3>
                <a href={event.link} data-event-link="">
                  {event.title}
                </a>
              </h3>
            </article>
          ))}
        </section>
      ))}
    </>,
  )
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
}

afterEach(scrollToTop)

describe("TimelineNavigation on a wide screen", () => {
  beforeEach(async () => {
    await page.viewport(1280, 800)
  })

  afterEach(async () => {
    await page.viewport(414, 896)
  })

  function rail() {
    return screen.getByRole("navigation", { name: "Timeline navigation" })
  }

  function eraButtons() {
    return within(rail()).getAllByRole("button", { name: / Era|Revolution/ })
  }

  it("shows a button for every era in the page's order, the latest first, named by its years, and marks the current one", () => {
    renderNavigation()

    const buttons = eraButtons()
    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
      "Agentic Era, 2025 – now",
      "Generative AI Era, 2020 – 2024",
      "Deep Learning Revolution, 2010s",
      "Learning Era, 1990s – 2000s",
      "Knowledge Era, 1970s – 1980s",
      "Foundation Era, 1940s – 1960s",
    ])
    expect(buttons[0]).toHaveAttribute("aria-current", "location")
  })

  // Each button is a tick on the chart's axis: the year its era began, or the first year the chart reaches
  it("labels each era's button with the year it began, beside that year's row of the chart", () => {
    renderNavigation()

    const buttons = eraButtons()
    expect(buttons.map((button) => button.textContent!.slice(0, 4))).toEqual(["2025", "2020", "2010", "1990", "1970", "1956"])
    const learning = buttons[3].getBoundingClientRect()
    const row1990 = rail().querySelector('[data-year-bar][data-year="1990"]')!.getBoundingClientRect()
    expect(Math.abs((learning.top + learning.bottom) / 2 - (row1990.top + row1990.bottom) / 2)).toBeLessThan(4)
  })

  it("runs its chart from the latest year at the top down to the first, as the page does", () => {
    renderNavigation()

    const top = (year: number) =>
      rail().querySelector(`[data-year-bar][data-year="${year}"]`)!.getBoundingClientRect().top
    expect(top(2023)).toBeLessThan(top(1997))
    expect(top(1997)).toBeLessThan(top(1956))
    expect(rail()).toHaveTextContent("Events per year, now back to 1956")
  })

  // The short eras of the 2020s take up only a few rows at the top of the chart
  it("stacks the era buttons down the chart without letting them overlap", () => {
    renderNavigation()

    const boxes = eraButtons().map((button) => button.getBoundingClientRect())
    boxes.slice(1).forEach((box, index) => {
      expect(box.top).toBeGreaterThanOrEqual(boxes[index].bottom - 0.5)
    })
  })

  it("shows the era's latest year while its introduction is being read", async () => {
    renderNavigation()

    const learningEra = document.getElementById(eraOf("gen-3").id)!
    window.scrollTo({
      top: window.scrollY + learningEra.getBoundingClientRect().top - window.innerHeight / 2 + 4,
      behavior: "instant" as ScrollBehavior,
    })

    await expect
      .poll(() => within(rail()).getByRole("button", { name: "Learning Era, 1990s – 2000s" }).getAttribute("aria-current"))
      .toBe("location")
    expect(within(rail()).getByText("2009")).toBeVisible()
  })

  it("jumps to an era and moves focus to its title", async () => {
    renderNavigation()

    await userEvent.click(within(rail()).getByRole("button", { name: "Learning Era, 1990s – 2000s" }))

    const title = screen.getByRole("heading", { level: 2, name: "The Learning Era" })
    expect(title).toHaveFocus()
    await expect.poll(() => Math.abs(title.getBoundingClientRect().top)).toBeLessThan(50)
    await expect
      .poll(() => within(rail()).getByRole("button", { name: "Learning Era, 1990s – 2000s" }).getAttribute("aria-current"))
      .toBe("location")
  })

  it("reads out the month and year of the event at the reading line", async () => {
    renderNavigation()

    document.getElementById(eventAnchorId(events[3]))!.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior })

    await expect.poll(() => within(rail()).queryByText("1997")).not.toBeNull()
    expect(within(rail()).getByText("May")).toBeVisible()
  })

  it("shows how far through the current era the reader has come", async () => {
    renderNavigation()
    const progress = () => parseFloat(rail().querySelector<HTMLElement>("[data-era-progress]")!.style.width)

    const learningEra = document.getElementById(eraOf("gen-3").id)!
    window.scrollTo({
      top: window.scrollY + learningEra.getBoundingClientRect().top + learningEra.offsetHeight / 2 - window.innerHeight / 2,
      behavior: "instant" as ScrollBehavior,
    })

    await expect.poll(progress).toBeGreaterThan(35)
    expect(progress()).toBeLessThan(65)
  })

  it("jumps to the first event of a year picked on the activity chart", async () => {
    renderNavigation()

    await userEvent.click(rail().querySelector<HTMLElement>('[data-year-bar][data-year="1980"]')!)

    const link = screen.getByRole("link", { name: events[2].title })
    expect(link).toHaveFocus()
    await expect
      .poll(() => {
        const box = link.getBoundingClientRect()
        return box.top >= 0 && box.bottom <= window.innerHeight
      })
      .toBe(true)
  })
})

describe("TimelineNavigation on a phone", () => {
  function toggle() {
    return screen.getByRole("button", { name: /current era/i })
  }

  function eraListOf(button: HTMLElement) {
    return document.getElementById(button.getAttribute("aria-controls") ?? "")
  }

  it("collapses to a bar that names the current era and its position", () => {
    renderNavigation()

    const phoneNav = toggle().closest("nav")!
    expect(toggle()).toHaveAttribute("aria-expanded", "false")
    expect(toggle()).toHaveTextContent("Agentic Era")
    expect(toggle().textContent).not.toMatch(/\d+ \/ \d+/)
    expect(within(phoneNav).getAllByRole("button")).toEqual([toggle()])
  })

  it("opens the list of eras on a tap and closes it on a second tap", async () => {
    renderNavigation()

    await userEvent.click(toggle())
    expect(toggle()).toHaveAttribute("aria-expanded", "true")
    const eraList = eraListOf(toggle())!
    const items = within(eraList).getAllByRole("button")
    expect(items).toHaveLength(eras.length)
    expect(items.map((item) => item.textContent)).toEqual(eras.map((era) => `${era.label}${era.subtitle}`))
    expect(items[0]).toHaveAttribute("aria-current", "location")

    await userEvent.click(toggle())
    expect(toggle()).toHaveAttribute("aria-expanded", "false")
    expect(eraList).not.toBeInTheDocument()
  })

  it("jumps to the picked era and closes the list", async () => {
    renderNavigation()

    await userEvent.click(toggle())
    await userEvent.click(within(eraListOf(toggle())!).getByRole("button", { name: /Learning Era/ }))

    expect(toggle()).toHaveAttribute("aria-expanded", "false")
    expect(eraListOf(toggle())).toBeNull()
    await expect.poll(() => toggle().textContent).toContain("Learning Era")
  })

  it("lets the Tab key move from the bar into the opened list of eras", async () => {
    renderNavigation()

    toggle().focus()
    await userEvent.keyboard("{Enter}")
    await userEvent.tab()

    expect(within(eraListOf(toggle())!).getAllByRole("button")[0]).toHaveFocus()
  })

  it("returns focus to the bar when an era picked from the keyboard closes the list", async () => {
    renderNavigation()

    toggle().focus()
    await userEvent.keyboard("{Enter}")
    within(eraListOf(toggle())!).getByRole("button", { name: /Learning Era/ }).focus()
    await userEvent.keyboard("{Enter}")

    expect(eraListOf(toggle())).toBeNull()
    expect(toggle()).toHaveFocus()
  })

  it("stays out of the way until the reader reaches the timeline", async () => {
    renderNavigation({ spacerBefore: true })

    // A hidden element has no accessible name, so the bar is found by its expanded state instead
    const bar = document.querySelector<HTMLElement>("nav button[aria-expanded]")!
    await expect.poll(() => bar).not.toBeVisible()

    document.getElementById(eras[0].id)!.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior })

    await expect.poll(() => bar).toBeVisible()
  })
})
