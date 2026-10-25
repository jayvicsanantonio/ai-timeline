// Integration tests for the timeline's keyboard shortcuts in real Chromium.
// J and K step between events, number keys jump to an era, / focuses search, and typing in a field is left alone.
import { render, screen } from "@testing-library/react"
import { useRef } from "react"
import { afterEach, describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
import { useTimelineShortcuts } from "@/hooks/use-timeline-shortcuts"

const TITLES = ["First event", "Second event", "Third event"]

function ShortcutHarness() {
  const searchInputRef = useRef<HTMLInputElement>(null)
  useTimelineShortcuts({ eraIds: ["era-one", "era-two"], searchInputRef })

  const event = (title: string) => (
    <article key={title} style={{ height: "70vh" }}>
      <h3>
        <a href={`#${title}`} data-event-link="">
          {title}
        </a>
      </h3>
    </article>
  )

  return (
    <>
      <input ref={searchInputRef} type="search" aria-label="Search events" />
      {/* Stands in for the era introduction that comes before the first event */}
      <div style={{ height: "100vh" }} />
      <section id="era-one">
        <h2 tabIndex={-1}>Era one</h2>
        {TITLES.slice(0, 2).map(event)}
      </section>
      <section id="era-two">
        <h2 tabIndex={-1}>Era two</h2>
        {TITLES.slice(2).map(event)}
      </section>
      <div style={{ height: "150vh" }} />
    </>
  )
}

function link(title: string) {
  return screen.getByRole("link", { name: title })
}

function isOnScreen(element: Element) {
  const box = element.getBoundingClientRect()
  return box.bottom > 0 && box.top < window.innerHeight
}

afterEach(() => {
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
})

describe("useTimelineShortcuts", () => {
  it("steps forward through the events with J, focusing each and scrolling it into view", async () => {
    render(<ShortcutHarness />)

    for (const title of TITLES) {
      await userEvent.keyboard("j")
      expect(link(title)).toHaveFocus()
      await expect.poll(() => isOnScreen(link(title))).toBe(true)
    }

    await userEvent.keyboard("j")
    expect(link("Third event")).toHaveFocus()
  })

  it("steps back through the events with K", async () => {
    render(<ShortcutHarness />)
    await userEvent.keyboard("jjj")

    await userEvent.keyboard("k")
    expect(link("Second event")).toHaveFocus()

    await userEvent.keyboard("kk")
    expect(link("First event")).toHaveFocus()
  })

  it("steps from the event at the reading line when no event has focus", async () => {
    render(<ShortcutHarness />)
    const second = link("Second event").closest("article")!
    window.scrollTo({
      top: window.scrollY + second.getBoundingClientRect().top - 10,
      behavior: "instant" as ScrollBehavior,
    })

    await userEvent.keyboard("j")
    expect(link("Third event")).toHaveFocus()

    second.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior })
    ;(document.activeElement as HTMLElement).blur()
    await userEvent.keyboard("k")
    expect(link("First event")).toHaveFocus()
  })

  it("jumps to an era's title with the era's number key", async () => {
    render(<ShortcutHarness />)

    await userEvent.keyboard("2")

    const title = screen.getByRole("heading", { name: "Era two" })
    expect(title).toHaveFocus()
    await expect.poll(() => Math.round(title.getBoundingClientRect().top)).toBeLessThan(100)
  })

  it("ignores number keys past the last era", async () => {
    render(<ShortcutHarness />)

    await userEvent.keyboard("9")

    expect(document.body).toHaveFocus()
  })

  it("focuses the search box with / without typing the slash into it", async () => {
    render(<ShortcutHarness />)

    await userEvent.keyboard("/")

    const search = screen.getByRole("searchbox", { name: "Search events" })
    expect(search).toHaveFocus()
    expect(search).toHaveValue("")
  })

  it("leaves the keys alone while the reader types in a field", async () => {
    render(<ShortcutHarness />)
    const search = screen.getByRole("searchbox", { name: "Search events" })

    await userEvent.type(search, "jk2/")

    expect(search).toHaveFocus()
    expect(search).toHaveValue("jk2/")
  })

  it("leaves the keys alone while a modifier key is held", async () => {
    render(<ShortcutHarness />)

    await userEvent.keyboard("{Control>}j{/Control}")

    expect(document.body).toHaveFocus()
  })
})
