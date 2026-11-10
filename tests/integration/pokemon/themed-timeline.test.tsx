// Integration tests for ThemedTimeline, which shows the classic timeline by default and the Pokémon theme once the reader
// presses Pokémon-ify, with the real timeline data in Chromium. Covers the default, switching both ways, remembering the
// choice, a link asking for a theme, and keeping the reader at the event they were reading.
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

function themeRoot() {
  return document.querySelector<HTMLElement>("[data-theme-root]")!
}

function barSwitch() {
  return document.querySelector<HTMLButtonElement>('[data-theme-switch="bar"]')!
}

afterEach(() => {
  window.localStorage.removeItem(THEME_STORAGE_KEY)
  document.documentElement.removeAttribute(THEME_ATTRIBUTE)
  window.history.replaceState(null, "", initialUrl)
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
})

describe("ThemedTimeline", () => {
  it("shows the classic timeline by default, with a Pokémon-ify button at the top of the page", async () => {
    const { container } = render(<ThemedTimeline events={events} />)

    await waitFor(() => expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "classic"))
    expect(themeRoot().dataset.themeRoot).toBe("classic")
    expect(container.querySelector(".pokemon-theme")).toBeNull()
    expect(container.querySelectorAll("section[data-interface]")).toHaveLength(6)
    expect(container.querySelector("[data-dex-card]")).toBeNull()
    expect(barSwitch()).toHaveAccessibleName("Pokémon-ify")
  })

  it("switches to the Pokémon theme and back, and remembers the reader's choice", async () => {
    const { container } = render(<ThemedTimeline events={events} />)
    await waitFor(() => expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "classic"))

    await userEvent.click(barSwitch())

    await waitFor(() => expect(themeRoot().dataset.themeRoot).toBe("pokemon"))
    expect(themeRoot()).toHaveClass("pokemon-theme")
    expect(getComputedStyle(themeRoot()).backgroundColor).toBe("rgb(11, 13, 26)")
    expect(container.querySelector("section[data-interface]")).toBeNull()
    expect(screen.getAllByRole("article")).toHaveLength(events.length)
    expect(container.querySelector("[data-dex-card]")).not.toBeNull()
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "pokemon")
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("pokemon")
    expect(barSwitch()).toHaveAccessibleName("Back to classic")

    await userEvent.click(barSwitch())

    await waitFor(() => expect(themeRoot().dataset.themeRoot).toBe("classic"))
    expect(container.querySelector(".pokemon-theme")).toBeNull()
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("classic")
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "classic")
  })

  it("opens in the theme the reader picked last time", async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "pokemon")
    render(<ThemedTimeline events={events} />)

    await waitFor(() => expect(themeRoot().dataset.themeRoot).toBe("pokemon"))
  })

  it("opens in the theme a link asks for, over the reader's last pick", async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "pokemon")
    window.history.replaceState(null, "", "?theme=classic")
    render(<ThemedTimeline events={events} />)

    await waitFor(() => expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "classic"))
    expect(themeRoot().dataset.themeRoot).toBe("classic")
  })

  it("keeps the reader at the event they were reading when they switch with the button kept at hand", async () => {
    await page.viewport(1280, 800)
    try {
      render(<ThemedTimeline events={events} />)
      await waitFor(() => expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "classic"))
      const id = eventAnchorId(events.find((event) => event.title === "IBM Deep Blue Defeats Garry Kasparov")!)
      // Puts the event just above the reading line, where the reader is reading it
      document.getElementById(id)!.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior })
      window.scrollBy({ top: -window.innerHeight * 0.2, behavior: "instant" as ScrollBehavior })

      // The button kept at hand shows once the bar at the top has scrolled away
      await waitFor(() => expect(document.querySelector("[data-theme-floating]")).toHaveAttribute("data-theme-floating", "shown"))
      await userEvent.click(document.querySelector<HTMLButtonElement>('[data-theme-switch="floating"]')!)

      await waitFor(() => expect(themeRoot().dataset.themeRoot).toBe("pokemon"))
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
