// Integration tests for TimelineNavigation in real Chromium: the wide-screen rail with its chapter buttons,
// year readout and activity chart, and the phone bar that names the current era and opens a chapter list.
import { render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { page, userEvent } from "vitest/browser"
import { TimelineNavigation } from "@/components/timeline/timeline-navigation"
import { groupEventsByEra } from "@/lib/eras"
import { eventAnchorId } from "@/lib/event-format"
import { countEventsByYear } from "@/lib/timeline-activity"
import type { TimelineEvent } from "@/types/timeline"

function makeEvent(year: number, title: string): TimelineEvent {
  return {
    year,
    month: "Unknown",
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
  makeEvent(1997, "IBM Deep Blue Defeats Garry Kasparov"),
  makeEvent(2012, "ImageNet Breakthrough"),
  makeEvent(2023, "OpenAI Releases GPT-4"),
]
const eras = groupEventsByEra(events)
const activity = countEventsByYear(events)

function renderNavigation({ spacerBefore = false } = {}) {
  render(
    <>
      <TimelineNavigation eras={eras} activity={activity} />
      {spacerBefore ? <div style={{ height: "150vh" }} /> : null}
      {eras.map((era) => (
        <section key={era.id} id={era.id} style={{ minHeight: "160vh" }}>
          <h2 tabIndex={-1}>{era.name}</h2>
          {era.events.map((event) => (
            <article key={event.title} id={eventAnchorId(event)} data-year={event.year} style={{ height: "50vh" }}>
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
    return screen.getByRole("navigation", { name: "Timeline chapter navigation" })
  }

  it("shows a button for every chapter and marks the current one", () => {
    renderNavigation()

    const buttons = within(rail()).getAllByRole("button", { name: /^Chapter \d/ })
    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
      "Chapter 1: Foundation Era",
      "Chapter 2: Knowledge Era",
      "Chapter 3: Learning Era",
      "Chapter 4: Deep Learning Revolution",
      "Chapter 5: Generative AI Era",
    ])
    expect(buttons[0]).toHaveAttribute("aria-current", "location")
  })

  it("jumps to a chapter and moves focus to its title", async () => {
    renderNavigation()

    await userEvent.click(within(rail()).getByRole("button", { name: "Chapter 3: Learning Era" }))

    const title = screen.getByRole("heading", { level: 2, name: "The Learning Era" })
    expect(title).toHaveFocus()
    await expect.poll(() => Math.abs(title.getBoundingClientRect().top)).toBeLessThan(50)
    await expect
      .poll(() => within(rail()).getByRole("button", { name: "Chapter 3: Learning Era" }).getAttribute("aria-current"))
      .toBe("location")
  })

  it("reads out the year of the event at the reading line", async () => {
    renderNavigation()

    document.getElementById(eventAnchorId(events[3]))!.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior })

    await expect.poll(() => within(rail()).queryByText("1997")).not.toBeNull()
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

  function chapterListOf(button: HTMLElement) {
    return document.getElementById(button.getAttribute("aria-controls") ?? "")
  }

  it("collapses to a bar that names the current era and its position", () => {
    renderNavigation()

    const phoneNav = toggle().closest("nav")!
    expect(toggle()).toHaveAttribute("aria-expanded", "false")
    expect(toggle()).toHaveTextContent("Foundation Era")
    expect(toggle()).toHaveTextContent("01 / 05")
    expect(within(phoneNav).getAllByRole("button")).toEqual([toggle()])
  })

  it("opens the chapter list on a tap and closes it on a second tap", async () => {
    renderNavigation()

    await userEvent.click(toggle())
    expect(toggle()).toHaveAttribute("aria-expanded", "true")
    const chapterList = chapterListOf(toggle())!
    const chapters = within(chapterList).getAllByRole("button")
    expect(chapters).toHaveLength(eras.length)
    expect(chapters[0]).toHaveAttribute("aria-current", "location")

    await userEvent.click(toggle())
    expect(toggle()).toHaveAttribute("aria-expanded", "false")
    expect(chapterList).not.toBeInTheDocument()
  })

  it("jumps to the picked chapter and closes the list", async () => {
    renderNavigation()

    await userEvent.click(toggle())
    await userEvent.click(within(chapterListOf(toggle())!).getByRole("button", { name: /Learning Era/ }))

    expect(toggle()).toHaveAttribute("aria-expanded", "false")
    expect(chapterListOf(toggle())).toBeNull()
    await expect.poll(() => toggle().textContent).toContain("Learning Era")
    await expect.poll(() => toggle().textContent).toContain("03 / 05")
  })

  it("lets the Tab key move from the bar into the opened chapter list", async () => {
    renderNavigation()

    toggle().focus()
    await userEvent.keyboard("{Enter}")
    await userEvent.tab()

    expect(within(chapterListOf(toggle())!).getAllByRole("button")[0]).toHaveFocus()
  })

  it("returns focus to the bar when a chapter picked from the keyboard closes the list", async () => {
    renderNavigation()

    toggle().focus()
    await userEvent.keyboard("{Enter}")
    within(chapterListOf(toggle())!).getByRole("button", { name: /Learning Era/ }).focus()
    await userEvent.keyboard("{Enter}")

    expect(chapterListOf(toggle())).toBeNull()
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
