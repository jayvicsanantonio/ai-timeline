// Integration tests for ThemedTimeline, which shows the classic timeline by default and the Pokémon theme once the reader
// presses Pokémon-ify, with the real timeline data in Chromium. Covers the default, the Poké Ball that fills the screen
// while the Pokémon theme downloads, switching both ways, remembering the choice, a link asking for a theme, and keeping
// the reader at the event they were reading.
import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { page, userEvent } from "vitest/browser"
import { ThemedTimeline } from "@/components/theme/themed-timeline"
import timelineData from "@/data/timeline-events.json"
import { eventAnchorId } from "@/lib/event-format"
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@/lib/theme"
import { parseTimelineEvents } from "@/lib/timeline-events"

const events = parseTimelineEvents(timelineData)
const initialUrl = window.location.href
// The ball shuts, holds at least a moment and opens, and the theme downloads in between
const CATCH_TIMEOUT = { timeout: 10_000 }

function themeRoot() {
  return document.querySelector<HTMLElement>("[data-theme-root]")!
}

function ball() {
  return document.querySelector<HTMLElement>("[data-pokeball-overlay]")!
}

function barSwitch() {
  return document.querySelector<HTMLButtonElement>('[data-theme-switch="bar"]')!
}

// The status line that tells screen readers what the ball shows
function status() {
  return document.querySelector<HTMLElement>("[data-theme-status]")!
}

// Waits until the page has settled on a theme with the ball out of the way
async function settledOn(theme: "classic" | "pokemon") {
  await waitFor(() => {
    expect(ball().dataset.phase).toBe("idle")
    expect(themeRoot().dataset.themeRoot).toBe(theme)
  }, CATCH_TIMEOUT)
}

afterEach(() => {
  window.localStorage.removeItem(THEME_STORAGE_KEY)
  document.documentElement.removeAttribute(THEME_ATTRIBUTE)
  window.history.replaceState(null, "", initialUrl)
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
})

describe("ThemedTimeline", () => {
  it("shows the classic timeline by default, with a Pokémon-ify button at the top of the page and no ball", async () => {
    const { container } = render(<ThemedTimeline events={events} />)

    await settledOn("classic")
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "classic")
    expect(getComputedStyle(ball()).display).toBe("none")
    expect(container.querySelector(".pokemon-theme")).toBeNull()
    expect(container.querySelectorAll("section[data-interface]")).toHaveLength(6)
    expect(container.querySelector("[data-dex-card]")).toBeNull()
    expect(barSwitch()).toHaveAccessibleName("Pokémon-ify")
  })

  it("shuts a Poké Ball over the screen on Pokémon-ify, holds it while the theme downloads, and opens it onto the theme", async () => {
    const { container } = render(<ThemedTimeline events={events} />)
    await settledOn("classic")

    await userEvent.click(barSwitch())

    // The ball shuts at once, over the whole screen, and says what it is doing
    expect(["closing", "loading"]).toContain(ball().dataset.phase)
    const cover = ball().getBoundingClientRect()
    expect(getComputedStyle(ball()).display).toBe("block")
    expect([cover.top, cover.left, cover.width, cover.height]).toEqual([0, 0, window.innerWidth, window.innerHeight])
    expect(status()).toHaveTextContent("Loading the Pokémon edition…")

    // Shut, it keeps the page behind it out of reach
    await waitFor(() => expect(ball().dataset.phase).toBe("loading"), CATCH_TIMEOUT)
    expect(themeRoot().inert).toBe(true)

    await waitFor(() => expect(ball().dataset.phase).toBe("opening"), CATCH_TIMEOUT)
    expect(themeRoot().dataset.themeRoot).toBe("pokemon")
    expect(themeRoot().inert).toBe(false)

    await settledOn("pokemon")
    expect(getComputedStyle(ball()).display).toBe("none")
    expect(status()).toHaveTextContent("The Pokémon edition is ready.")
    expect(themeRoot()).toHaveClass("pokemon-theme")
    expect(getComputedStyle(themeRoot()).backgroundColor).toBe("rgb(11, 13, 26)")
    expect(container.querySelector("section[data-interface]")).toBeNull()
    expect(screen.getAllByRole("article")).toHaveLength(events.length)
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "pokemon")
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("pokemon")
    expect(barSwitch()).toHaveAccessibleName("Back to classic")
  })

  it("goes back to classic at once, with no ball, and remembers that too", async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "pokemon")
    const { container } = render(<ThemedTimeline events={events} />)
    await settledOn("pokemon")

    await userEvent.click(barSwitch())

    expect(themeRoot().dataset.themeRoot).toBe("classic")
    expect(ball().dataset.phase).toBe("idle")
    expect(container.querySelector(".pokemon-theme")).toBeNull()
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("classic")
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "classic")
    expect(status()).toHaveTextContent("Back to the classic timeline.")
  })

  it("opens in the theme the reader picked last time, behind a ball that is already shut", async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "pokemon")
    render(<ThemedTimeline events={events} />)

    await waitFor(() => expect(ball().dataset.phase).toBe("loading"))
    await settledOn("pokemon")
  })

  it("opens in the theme a link asks for, over the reader's last pick", async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "pokemon")
    window.history.replaceState(null, "", "?theme=classic")
    render(<ThemedTimeline events={events} />)

    await settledOn("classic")
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "classic")
  })

  it("keeps the reader at the event they were reading when they switch with the button kept at hand", async () => {
    await page.viewport(1280, 800)
    try {
      render(<ThemedTimeline events={events} />)
      await settledOn("classic")
      const id = eventAnchorId(events.find((event) => event.title === "IBM Deep Blue Defeats Garry Kasparov")!)
      // Puts the event just above the reading line, where the reader is reading it
      document.getElementById(id)!.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior })
      window.scrollBy({ top: -window.innerHeight * 0.2, behavior: "instant" as ScrollBehavior })

      // Presses the button kept at hand. Whether it shows only once the bar has scrolled away is for the end-to-end tests:
      // the observer that decides it is throttled in a test frame running in the background.
      document.querySelector<HTMLButtonElement>('[data-theme-switch="floating"]')!.click()

      await settledOn("pokemon")
      const card = document.getElementById(id)!
      expect(card).toHaveAttribute("data-dex-card")
      const { top, bottom } = card.getBoundingClientRect()
      expect(top).toBeGreaterThanOrEqual(0)
      expect(bottom).toBeLessThanOrEqual(window.innerHeight)
    } finally {
      await page.viewport(414, 896)
    }
  })
})
