// Integration tests for the six eras of the AI Dex rendered by EraChapter in real Chromium.
// Every era opens with the same header in the page's color, and draws its events from the first forward, as the journey
// runs, as dex entries showing each event's line in the sprites of the era's generation, followed by the scenes they set
// off. Each must give its entries the same accessible structure, plus the details that make its generation its own.
import { render, screen, within } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { page, userEvent } from "vitest/browser"
import { DexProvider } from "@/components/eras/dex-context"
import { EraChapter } from "@/components/eras/era-chapter"
import { NO_MATCHING_EVENTS } from "@/components/eras/era-parts"
import { buildDex, CATEGORY_ITEMS, formatDexNumber } from "@/lib/dex"
import { ERA_DEFINITIONS, groupEventsByEra, isCurrentEra, type GenerationId } from "@/lib/eras"
import { eventAnchorId, eventDateTime, eventSource, formatEventDate } from "@/lib/event-format"
import { monthCountOf, relativeMonthLabel } from "@/lib/relative-time"
import { yearSummary } from "@/lib/year-summaries"
import type { TimelineCategory, TimelineEvent } from "@/types/timeline"

function makeEvent(
  year: number,
  month: string,
  title: string,
  category: TimelineCategory,
  landmark = false,
): TimelineEvent {
  return {
    year,
    month,
    title,
    description: `What happened with ${title}.`,
    category,
    link: `https://www.example.com/${encodeURIComponent(title)}`,
    ...(landmark ? { landmark } : {}),
  }
}

// Each era's events oldest first, as the data keeps them
const eventsByGeneration: Record<GenerationId, TimelineEvent[]> = {
  "gen-1": [
    makeEvent(1951, "Unknown", "First AI Programs", "Models & Architectures"),
    makeEvent(1956, "June", "Dartmouth AI Conference", "Research Breakthroughs", true),
  ],
  "gen-2": [
    makeEvent(1974, "Unknown", "MYCIN Medical Expert System", "Models & Architectures"),
    makeEvent(1980, "March", "XCON Brings Expert Systems to Business", "AI Tools", true),
  ],
  "gen-3": [
    makeEvent(1997, "May", "IBM Deep Blue Defeats Garry Kasparov", "Hardware Advances"),
    makeEvent(2006, "July", "Deep Belief Networks", "Research Breakthroughs", true),
  ],
  "gen-4": [
    makeEvent(2012, "October", "ImageNet Breakthrough", "Research Breakthroughs"),
    makeEvent(2017, "June", "Attention Is All You Need", "Research Breakthroughs", true),
  ],
  "gen-5": [
    makeEvent(2023, "March", "OpenAI Releases GPT-4", "Public Releases", true),
    // A landmark without a legend picked for it yet
    makeEvent(2023, "March", "Italy Temporarily Bans ChatGPT", "Ethics & Policy", true),
    makeEvent(2024, "May", "OpenAI Releases GPT-4o", "Public Releases"),
  ],
  modern: [
    makeEvent(2025, "February", "Anthropic Releases Claude Code in Research Preview", "AI Tools"),
    makeEvent(2025, "July", "AI Reaches Gold-Medal Level at the Math Olympiad", "Research Breakthroughs", true),
    makeEvent(2026, "September", "Meta Launches Muse, a Personal AI Agent", "Agents"),
  ],
}

const GENERATIONS = ERA_DEFINITIONS.map((era) => era.generation)

// Renders the era as the page does, with its events oldest first, inside a dex built from every event given
function renderEra(
  generation: GenerationId,
  events = eventsByGeneration[generation],
  totalEvents = events.length,
  dexEvents: TimelineEvent[] = events,
) {
  const dex = buildDex(dexEvents)
  const era = groupEventsByEra(events).find((candidate) => candidate.generation === generation)!
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DexProvider dex={dex} events={dexEvents}>
      {children}
    </DexProvider>
  )
  const view = render(<EraChapter era={era} totalEvents={totalEvents} />, { wrapper })
  const section = screen.getByRole("region", { name: era.name })
  return { era, section, dex, ...view }
}

describe.each(GENERATIONS)("the %s era", (generation) => {
  const events = eventsByGeneration[generation]
  // The order the era draws them in
  const shown = events

  it("is a section named by its era title, a level-2 heading that can take focus", () => {
    const { era, section } = renderEra(generation)

    expect(section).toHaveAttribute("id", era.id)
    expect(section).toHaveAttribute("data-generation", generation)
    const heading = within(section).getByRole("heading", { level: 2, name: era.name })
    expect(heading).toHaveAttribute("tabindex", "-1")
  })

  it("introduces the era with its years, description, sprites and badge, in a header ahead of its entries", () => {
    const { era, section } = renderEra(generation)

    const header = section.querySelector<HTMLElement>("[data-era-header]")!
    expect(header).toHaveTextContent(era.subtitle)
    expect(header).toHaveTextContent(era.description)
    expect(header).toHaveTextContent(era.generationName)
    expect(header).toContainElement(within(section).getByRole("heading", { level: 2, name: era.name }))
    const badge = header.querySelector("[data-era-badge]")!
    expect(badge).toHaveAttribute("aria-hidden", "true")
    expect(badge.querySelector("img")).toHaveAttribute("src", `/sprites/badges/${era.badge}.png`)
    const backdrop = section.querySelector("[data-era-backdrop]")!
    expect(header.compareDocumentPosition(backdrop) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(header.contains(backdrop)).toBe(false)
  })

  // The journey runs forward, so each header says how far along it the era is
  it("marks its place in the journey, and the current era as now", () => {
    const { era, section } = renderEra(generation)

    const marker = section.querySelector("[data-era-marker]")!
    expect(marker.textContent).toBe(`Era ${era.index + 1} of ${ERA_DEFINITIONS.length}${isCurrentEra(era) ? " · Now" : ""}`)
  })

  it("says how recent its latest event is only while the era is still under way", () => {
    const { era, section } = renderEra(generation)

    const header = section.querySelector("[data-era-header]")!
    if (isCurrentEra(era)) {
      expect(header).toHaveTextContent(`${events.length} events through ${formatEventDate(shown.at(-1)!)}`)
    } else {
      expect(header.textContent).not.toMatch(/\bthrough\b/)
    }
  })

  it("names no chapter, since the page rewinds rather than counting forward", () => {
    const { section } = renderEra(generation)

    expect(section.textContent).not.toMatch(/chapter/i)
  })

  it("counts the era's events, and how many match while filtering", () => {
    const { section, unmount } = renderEra(generation)
    expect(section).toHaveTextContent(`${events.length} events`)
    unmount()

    const { section: filteredSection } = renderEra(generation, events.slice(0, 1), events.length, events)
    expect(filteredSection).toHaveTextContent(`1 of ${events.length} events`)
  })

  it("draws its entries in its generation's screens", () => {
    const { section } = renderEra(generation)

    expect(section.querySelector(".dex-era")).toHaveAttribute("data-gen", generation)
  })

  it("renders every event as an article whose level-3 title links to its source in a new tab, the first first", () => {
    const { section } = renderEra(generation)

    const articles = within(section).getAllByRole("article")
    expect(articles).toHaveLength(events.length)
    shown.forEach((event, index) => {
      const heading = within(articles[index]).getByRole("heading", { level: 3, name: event.title })
      const link = within(heading).getByRole("link", { name: event.title })
      expect(link).toHaveAttribute("href", event.link)
      expect(link).toHaveAttribute("target", "_blank")
      expect(link).toHaveAttribute("rel", "noopener noreferrer")
      expect(link).toHaveAccessibleDescription("Opens in a new tab")
    })
  })

  // Hidden text that aria-describedby points at still counts toward an ancestor's name, so a hint
  // inside the heading would make browsers announce every title with "Opens in a new tab"
  it("keeps each link's new-tab hint outside its title heading", () => {
    const { section } = renderEra(generation)

    within(section)
      .getAllByRole("article")
      .map((article) => within(article).getByRole("heading", { level: 3 }))
      .forEach((heading) => {
        const hint = document.getElementById(within(heading).getByRole("link").getAttribute("aria-describedby")!)
        expect(hint).toHaveTextContent("Opens in a new tab")
        expect(heading).not.toContainElement(hint)
      })
  })

  it("shows each event's date in a time element, and only the year when the month is unknown", () => {
    const { section } = renderEra(generation)

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        const date = within(article).getByText(formatEventDate(shown[index]))
        expect(date.tagName).toBe("TIME")
        expect(date).toHaveAttribute("datetime", eventDateTime(shown[index]))
      })
    expect(within(section).queryByText(/Unknown/)).not.toBeInTheDocument()
  })

  it("names each event's category beside its item from the bag, and describes what happened", () => {
    const { section } = renderEra(generation)

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        const event = shown[index]
        expect(article.querySelector("[data-category]")).toHaveTextContent(event.category)
        expect(within(article).getByText(event.description)).toBeInTheDocument()
        const item = article.querySelector(`[data-category-item="${CATEGORY_ITEMS[event.category].item}"]`)!
        expect(item).toHaveAttribute("aria-hidden", "true")
        expect(item.querySelector("img")).toHaveAttribute("src", `/sprites/items/${CATEGORY_ITEMS[event.category].item}.png`)
      })
  })

  it("numbers each entry in the order the events happened, and names its line, creature and level", () => {
    const { section, dex } = renderEra(generation)

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        const entry = dex.get(eventAnchorId(shown[index]))!
        expect(article).toHaveTextContent(formatDexNumber(entry.number))
        expect(article).toHaveAttribute("data-line", entry.line.id)
        expect(article.querySelector(".line-chip")).toHaveTextContent(
          `${entry.species.name}, level ${entry.level}, of the ${entry.line.name} line`,
        )
      })
    expect(within(section).getAllByRole("article").map((article) => article.textContent!.match(/No\. (\d{3})/)![1])).toEqual(
      shown.map((event) => String(events.indexOf(event) + 1).padStart(3, "0")),
    )
  })

  it("draws each creature in its generation's sprite, as a picture that assistive technology skips", () => {
    const { section, dex } = renderEra(generation)

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        const entry = dex.get(eventAnchorId(shown[index]))!
        const sprite = article.querySelector<HTMLImageElement>(".dex-stage img")!
        expect(sprite.getAttribute("src")).toBe(entry.sprite)
        expect(sprite.getAttribute("src")).toMatch(new RegExp(`^/sprites/${generation}/`))
        expect(sprite).toHaveAttribute("alt", "")
        expect(sprite).toHaveAttribute("loading", "lazy")
        expect(sprite.closest('[aria-hidden="true"]')).not.toBeNull()
      })
  })

  it("anchors each event by id, year and month so navigation can jump to it and read it out", () => {
    const { section } = renderEra(generation)

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        expect(article).toHaveAttribute("id", eventAnchorId(shown[index]))
        expect(article).toHaveAttribute("data-year", String(shown[index].year))
        expect(article).toHaveAttribute("data-month", shown[index].month)
      })
  })

  it("puts each event's date ahead of its title, so the dates line up for scanning", () => {
    const { section } = renderEra(generation)

    within(section)
      .getAllByRole("article")
      .forEach((article) => {
        const date = article.querySelector("time")!
        const heading = within(article).getByRole("heading", { level: 3 })
        expect(date.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      })
  })

  it("names the site each event's link opens", () => {
    const { section } = renderEra(generation)

    within(section)
      .getAllByRole("article")
      .forEach((article) => {
        expect(within(article).getByText(eventSource(events[0]))).toBeInTheDocument()
      })
  })

  it("marks landmarks, and only those", () => {
    const { section } = renderEra(generation)

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        if (shown[index].landmark) {
          expect(article).toHaveAttribute("data-landmark")
          expect(within(article).getByText("★ Landmark")).toBeInTheDocument()
        } else {
          expect(article).not.toHaveAttribute("data-landmark")
          expect(within(article).queryByText(/Landmark/)).not.toBeInTheDocument()
        }
      })
  })

  it("plays each entry's scenes right after it, in the screen of the era's generation", () => {
    const { section, dex } = renderEra(generation)

    for (const event of shown) {
      const entry = dex.get(eventAnchorId(event))!
      const card = section.querySelector(`#${eventAnchorId(event)}`)!
      const scenes = entry.scenes.map((played) => section.querySelector(`#${played.id}`)!)
      scenes.forEach((scene, index) => {
        expect(scene).toHaveAttribute("data-scene", entry.scenes[index].scene.kind)
        expect(card.compareDocumentPosition(scene) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(scene.closest("li")).toBe(card.closest("li"))
        expect(scene.querySelector('[aria-hidden="true"]')).not.toBeNull()
        expect([...scene.querySelectorAll("[data-scene-line]")].map((line) => line.textContent)).toEqual(
          entry.scenes[index].lines,
        )
      })
    }
  })

  it("exposes no decorative controls as buttons, only its gym challenge's answers", () => {
    const { section } = renderEra(generation)

    const challenge = section.querySelector("[data-gym-challenge]")!
    const buttons = within(section).queryAllByRole("button")
    expect(buttons).toHaveLength(3)
    for (const button of buttons) {
      expect(challenge).toContainElement(button)
    }
  })

  it("lets keyboard users tab to every event link in the order shown, the first first", async () => {
    const { section } = renderEra(generation)
    const eventLinks = shown.map((event) => screen.getByRole("link", { name: event.title }))
    const focusable = section.querySelectorAll("a, button").length

    const reached: Element[] = []
    for (let step = 0; step < focusable; step += 1) {
      await userEvent.tab()
      if (document.activeElement && eventLinks.includes(document.activeElement as HTMLAnchorElement)) {
        reached.push(document.activeElement)
      }
    }
    expect(reached).toEqual(eventLinks)
  })

  it("says so in its header when none of the era's events match the filters", () => {
    const { era, section } = renderEra(generation, [], 12, events)

    expect(within(section).getByRole("heading", { level: 2, name: era.name })).toHaveAttribute("tabindex", "-1")
    expect(section).toHaveTextContent("0 of 12 events")
    expect(within(section).getByText(NO_MATCHING_EVENTS)).toBeInTheDocument()
    expect(within(section).queryAllByRole("article")).toEqual([])
  })

  // One era's backdrop meets the next in the page's color, so moving between eras dissolves instead of cutting
  it("fades its backdrop into the page's color at the top and bottom", () => {
    // The seam comes first, whether other layers follow it or it is the only one
    const seam = /^linear-gradient\(rgb\(11, 13, 26\), .*?, rgb\(11, 13, 26\)\)(, |$)/

    const { section } = renderEra(generation)
    expect(getComputedStyle(section.querySelector("[data-era-backdrop]")!).backgroundImage).toMatch(seam)
  })

  // Filtering can empty several eras at once, and their full entries would push the results far down. On a phone the
  // header's details and note wrap onto as many lines as the fonts need, so the bound leaves room for that.
  it("shrinks to its header alone when none of its events match the filters", () => {
    const { section } = renderEra(generation, [], 12, events)

    expect(section.querySelector("[data-era-backdrop]")).toBeNull()
    expect(section.getBoundingClientRect().height).toBeLessThan(320)
  })
})

// The eras whose events come years apart mark the quiet stretches between their years
describe.each(["gen-1", "gen-2", "gen-3", "gen-4"] as const)("the %s era's year gaps", (generation) => {
  const [earlier, later] = eventsByGeneration[generation]

  it("says how many years later a year came than the one above it, when more than one year lies between", () => {
    const { section } = renderEra(generation)

    const markers = within(section).getAllByText(/^\d+ years later$/)
    expect(markers.map((marker) => marker.textContent)).toEqual([`${later.year - earlier.year} years later`])
  })

  it("sits ahead of the later year, outside its entries, where assistive technology reads it too", () => {
    const { section } = renderEra(generation)

    const marker = within(section).getByText(/^\d+ years later$/)
    const column = section.querySelector(`[data-year-column="${later.year}"]`)!
    expect(marker.compareDocumentPosition(column) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(marker.closest("article")).toBeNull()
    expect(marker.closest('[aria-hidden="true"]')).toBeNull()
  })

  it("leaves events a year apart unmarked", () => {
    const { section } = renderEra(generation, [earlier, makeEvent(earlier.year + 1, "June", "The Next Year", "AI Tools")])

    expect(within(section).queryByText(/years later/)).toBeNull()
  })
})

function yearColumns(section: HTMLElement) {
  return [...section.querySelectorAll<HTMLElement>("[data-year-column]")]
}

// The era's own drawing of a year in its column, which assistive technology skips
function drawnYear(column: HTMLElement) {
  return column.querySelector<HTMLElement>('[aria-hidden="true"]')!
}

// Every era groups its events by year, beside a column that names the year in the era's own style
describe.each(GENERATIONS)("the %s era's year column", (generation) => {
  const events = eventsByGeneration[generation]
  const shown = events
  const years = [...new Set(shown.map((event) => event.year))]

  it("names each year ahead of its events, the first year first, in plain words for assistive technology", () => {
    const { section } = renderEra(generation)

    const columns = yearColumns(section)
    expect(columns.map((column) => Number(column.dataset.yearColumn))).toEqual(years)
    columns.forEach((column, index) => {
      const year = years[index]
      const count = events.filter((event) => event.year === year).length
      expect(within(column).getByText(`${year}, ${count} ${count === 1 ? "event" : "events"}`)).toHaveClass("sr-only")
      expect(drawnYear(column)).toHaveTextContent(String(year))
      expect(drawnYear(column)).toHaveTextContent(`${count} ${count === 1 ? "entry" : "entries"}`)
      const firstOfYear = section.querySelector(`#${eventAnchorId(shown.find((event) => event.year === year)!)}`)!
      expect(column.compareDocumentPosition(firstOfYear) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
  })

  it("counts the landmarks of each year that has them", () => {
    const { section } = renderEra(generation)

    yearColumns(section).forEach((column) => {
      const landmarks = events.filter((event) => event.year === Number(column.dataset.yearColumn) && event.landmark).length
      if (landmarks > 0) {
        expect(drawnYear(column)).toHaveTextContent(`★ ${landmarks} landmark`)
      } else {
        expect(drawnYear(column)).not.toHaveTextContent("landmark")
      }
    })
  })

  it("puts the year on one short line above its events on a phone", () => {
    const { section } = renderEra(generation)

    const [column] = yearColumns(section)
    const firstCard = within(section).getAllByRole("article")[0]
    expect(column.getBoundingClientRect().height).toBeLessThan(48)
    expect(column.getBoundingClientRect().bottom).toBeLessThanOrEqual(firstCard.getBoundingClientRect().top)
  })

  it("rules the year off from its events with a line under it on a phone", () => {
    const { section } = renderEra(generation)

    const style = getComputedStyle(yearColumns(section)[0])
    expect(style.borderBottomStyle).not.toBe("none")
    expect(parseFloat(style.borderBottomWidth)).toBeGreaterThan(0)
  })

  describe("on a wide screen", () => {
    beforeEach(async () => {
      await page.viewport(1280, 800)
    })

    afterEach(async () => {
      await page.viewport(414, 896)
    })

    it("keeps the year in view beside its events while they scroll past", () => {
      const { section } = renderEra(generation)

      const [column] = yearColumns(section)
      const firstCard = within(section).getAllByRole("article")[0]
      expect(getComputedStyle(column.firstElementChild!).position).toBe("sticky")
      expect(column.getBoundingClientRect().right).toBeLessThanOrEqual(firstCard.getBoundingClientRect().left)
    })

    it("rules the year off from its events with a line between them", () => {
      const { section } = renderEra(generation)

      const style = getComputedStyle(yearColumns(section)[0])
      expect(style.borderRightStyle).not.toBe("none")
      expect(parseFloat(style.borderRightWidth)).toBeGreaterThan(0)
      expect(parseFloat(style.borderBottomWidth)).toBe(0)
    })

    // The navigation rail sits to the right of the timeline on a 1280px screen
    it("keeps its entries within the timeline's column", () => {
      const { section } = renderEra(generation)

      for (const article of within(section).getAllByRole("article")) {
        expect(article.getBoundingClientRect().right).toBeLessThanOrEqual(1280 - 160)
      }
    })
  })
})

describe("the Generation I era", () => {
  it("maps its gray sprites onto the four greens of its screen", () => {
    const { section } = renderEra("gen-1")

    expect(section.querySelector("filter#dmg-palette")).not.toBeNull()
    for (const sprite of section.querySelectorAll(".dex-stage img")) {
      expect(getComputedStyle(sprite).filter).toContain("#dmg-palette")
    }
  })

  it("prints its titles in the pixel font of its screen", () => {
    const { section } = renderEra("gen-1")

    for (const article of within(section).getAllByRole("article")) {
      expect(getComputedStyle(within(article).getByRole("heading", { level: 3 })).fontFamily).toContain("Press Start")
    }
  })
})

describe("the Generation IV era", () => {
  it("shows each creature on the top screen, above its entry on the bottom one", () => {
    const { section } = renderEra("gen-4")

    for (const article of within(section).getAllByRole("article")) {
      const stage = article.querySelector(".dex-stage")!.getBoundingClientRect()
      const body = article.querySelector(".dex-body")!.getBoundingClientRect()
      expect(stage.bottom).toBeLessThanOrEqual(body.top)
    }
  })
})

describe("the eras drawn with animated landmarks", () => {
  it.each([
    ["gen-2", /^\/sprites\/gen-2\/animated\/\d+\.gif$/],
    ["gen-3", /^\/sprites\/gen-3\/animated\/\d+\.png$/],
    ["gen-4", /^\/sprites\/gen-4\/animated\/\d+\.png$/],
  ] as const)("moves the %s era's legendary creatures", (generation, animated) => {
    const { section } = renderEra(generation)

    const landmark = section.querySelector("article[data-landmark] .dex-stage img")!
    expect(landmark.getAttribute("src")).toMatch(animated)
  })
})

describe("the current era", () => {
  it("ends on a Poké Ball watching for what comes after its latest event", () => {
    const { container } = renderEra("modern")

    const frontier = container.querySelector("[data-frontier]")!
    expect(frontier).toHaveTextContent("Watching for what comes after September 2026")
    expect(frontier.querySelector("img")).toHaveAttribute("src", "/sprites/items/poke-ball.png")
    const cards = container.querySelectorAll("article")
    expect(cards[cards.length - 1].compareDocumentPosition(frontier) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("says how long ago the latest event was, while it is under a year old", () => {
    const { container } = renderEra("modern")

    // Computed from today's date, as the page computes it
    const expected = relativeMonthLabel({ year: 2026, month: "September" }, monthCountOf(new Date()))
    const label = container.querySelector("[data-frontier] [data-relative-time]")
    if (expected) {
      expect(label).toHaveTextContent(expected)
    } else {
      expect(label).toBeNull()
    }
  })

  it("leaves the frontier out while the reader filters, since the newest match need not be the newest event", () => {
    const { container } = renderEra("modern", eventsByGeneration.modern, 10)

    expect(container.querySelector("[data-frontier]")).toBeNull()
  })

  it("says how long ago each entry in full happened, after its date, while it is under a year old", () => {
    const { section } = renderEra("modern")
    const now = monthCountOf(new Date())

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        const expected = relativeMonthLabel(eventsByGeneration.modern[index], now)
        const label = article.querySelector("[data-relative-time]")
        if (expected) {
          expect(label).toHaveTextContent(expected)
          expect(article.querySelector("time")!.compareDocumentPosition(label!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        } else {
          expect(label).toBeNull()
        }
      })
  })

  it("leaves the other eras without a frontier", () => {
    const { container } = renderEra("gen-5")

    expect(container.querySelector("[data-frontier]")).toBeNull()
  })
})

describe.each(["gen-5", "modern"] as const)("the %s era's field notes", (generation) => {
  const events = eventsByGeneration[generation]
  const years = [...new Set(events.map((event) => event.year))]

  it("opens each year with its summary, ahead of its first entry, for every reader", () => {
    const { container } = renderEra(generation)

    const notes = [...container.querySelectorAll<HTMLElement>("[data-year-summary]")]
    expect(notes).toHaveLength(years.length)
    notes.forEach((note, index) => {
      const year = years[index]
      expect(note).toHaveTextContent(`Field notes · ${year}`)
      expect(note).toHaveTextContent(yearSummary(year)!)
      expect(note.closest('[aria-hidden="true"]')).toBeNull()
      const firstOfYear = container.querySelector(`article[data-year="${year}"]`)!
      expect(note.compareDocumentPosition(firstOfYear) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
  })

  it("leaves the notes out while the reader filters, since they speak for the whole year", () => {
    const { container } = renderEra(generation, events, 40)

    expect(container.querySelector("[data-year-summary]")).toBeNull()
  })
})

it("goes straight to a year's entries when the year has no field notes yet", () => {
  const { container } = renderEra("modern", [makeEvent(2027, "January", "A Later Release", "Public Releases")])

  expect(container.querySelector("[data-year-summary]")).toBeNull()
  expect(container.querySelector("article")).not.toBeNull()
})

const MONTHS_IN_ORDER = ["January", "February", "March", "April", "May", "June", "July"]

// Fourteen events in a year, two a month, with a landmark first and a highlight fourth
function busyYearIn(year: number): TimelineEvent[] {
  return Array.from({ length: 14 }, (_, index) => ({
    ...makeEvent(year, MONTHS_IN_ORDER[Math.floor(index / 2)], `Release ${index + 1}`, "Public Releases", index === 0),
    ...(index === 3 ? { highlight: true } : {}),
  }))
}

function briefCardsIn(section: HTMLElement) {
  return within(section)
    .getAllByRole("article")
    .filter((card) => card.hasAttribute("data-brief"))
}

// A busy year has more than one event a month. Its landmarks and highlights stay in full, and the rest are listed one
// line each until the reader asks to see them all in full.
describe.each([
  ["gen-5", 2024],
  ["modern", 2025],
] as const)("the %s era's busy years", (generation, year) => {
  const busyYear = busyYearIn(year)
  // Oldest first
  const fullSizeTitles = ["Release 1", "Release 4"]

  function cards(section: HTMLElement) {
    return within(section).getAllByRole("article")
  }

  function showAllButton(section: HTMLElement) {
    return within(section).getByRole("button", { name: "Show all 14 in full" })
  }

  it("keeps the landmarks and highlights in full and lists every other event in brief", () => {
    const { section } = renderEra(generation, busyYear)

    expect(cards(section)).toHaveLength(14)
    const full = cards(section).filter((card) => !card.hasAttribute("data-brief"))
    expect(full.map((card) => within(card).getByRole("link").textContent)).toEqual(fullSizeTitles)
    for (const card of full) {
      expect(card).toHaveTextContent(`What happened with ${within(card).getByRole("link").textContent}.`)
    }
    expect(briefCardsIn(section)).toHaveLength(12)
  })

  it("gives each brief entry its creature's icon, its number and date, its linked title and its source, but not its description", () => {
    const { section, dex } = renderEra(generation, busyYear)

    for (const card of briefCardsIn(section)) {
      const event = busyYear.find((candidate) => candidate.title === within(card).getByRole("link").textContent)!
      const entry = dex.get(eventAnchorId(event))!
      const time = card.querySelector("time")!
      const heading = within(card).getByRole("heading", { level: 3, name: event.title })
      expect(time).toHaveAttribute("datetime", eventDateTime(event))
      expect(time.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(card).toHaveTextContent(formatDexNumber(entry.number))
      expect(card.querySelector("img")).toHaveAttribute("src", entry.icon)
      expect(card.querySelector("img")).toHaveAttribute("alt", "")
      expect(within(card).getByRole("link")).toHaveAttribute("href", event.link)
      expect(card).toHaveTextContent(eventSource(event))
      expect(card).not.toHaveTextContent(event.description)
    }
  })

  it("shows the whole year in full from its Show all button, and lists it in brief again on a second press", async () => {
    const { section } = renderEra(generation, busyYear)
    const button = showAllButton(section)
    expect(button).toHaveAttribute("aria-pressed", "false")

    await userEvent.click(button)

    expect(button).toHaveAttribute("aria-pressed", "true")
    expect(briefCardsIn(section)).toEqual([])
    for (const event of busyYear) {
      expect(section).toHaveTextContent(event.description)
    }

    await userEvent.click(button)

    expect(button).toHaveAttribute("aria-pressed", "false")
    expect(briefCardsIn(section)).toHaveLength(12)
  })

  it("offers the Show all button right after the year's field notes, before its first entry", () => {
    const { section } = renderEra(generation, busyYear)

    const summary = section.querySelector("[data-year-summary]")!
    const button = showAllButton(section)
    const firstCard = cards(section)[0]
    expect(summary.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(button.compareDocumentPosition(firstCard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("shows every match in full while the reader filters, without a Show all button", () => {
    const { section } = renderEra(generation, busyYear, 40)

    expect(briefCardsIn(section)).toEqual([])
    expect(within(section).queryByRole("button", { name: /^Show all/ })).toBeNull()
  })

  it("keeps a year with a dozen events or fewer in full, without a Show all button", () => {
    const { section } = renderEra(generation, busyYear.slice(0, 12))

    expect(briefCardsIn(section)).toEqual([])
    expect(within(section).queryByRole("button", { name: /^Show all/ })).toBeNull()
  })

  it("shows each brief entry's date ahead of its title on a phone", () => {
    const { section } = renderEra(generation, busyYear)

    for (const card of briefCardsIn(section)) {
      const date = card.querySelector("time")!.getBoundingClientRect()
      expect(date.width).toBeGreaterThan(1)
      expect(date.bottom).toBeLessThanOrEqual(within(card).getByRole("heading", { level: 3 }).getBoundingClientRect().top + 1)
    }
  })

  describe("on a wide screen", () => {
    beforeEach(async () => {
      await page.viewport(1280, 800)
    })

    afterEach(async () => {
      await page.viewport(414, 896)
    })

    it("fits each brief entry on one short line", () => {
      const { section } = renderEra(generation, busyYear)

      expect(briefCardsIn(section)).toHaveLength(12)
      for (const card of briefCardsIn(section)) {
        expect(card.getBoundingClientRect().height).toBeLessThan(48)
      }
    })

    it("shows each brief entry's date before its title on the same line", () => {
      const { section } = renderEra(generation, busyYear)

      for (const card of briefCardsIn(section)) {
        const date = card.querySelector("time")!.getBoundingClientRect()
        expect(date.width).toBeGreaterThan(1)
        expect(date.right).toBeLessThanOrEqual(within(card).getByRole("heading", { level: 3 }).getBoundingClientRect().left)
      }
    })
  })
})

describe("the story told through the entries", () => {
  it("announces the first entry of each line as the line's arrival", () => {
    const { section, dex } = renderEra("gen-2")

    for (const article of within(section).getAllByRole("article")) {
      const entry = dex.get(article.id)!
      const tag = article.querySelector("[data-new-line]")
      if (entry.firstOfLine) {
        expect(tag).toHaveTextContent(`The ${entry.line.name.toLowerCase()} line begins with ${entry.species.name}`)
      } else {
        expect(tag).toBeNull()
      }
    }
  })

  it("freezes the entries of an AI winter, and says so to screen readers", () => {
    const { section } = renderEra("gen-2")

    const mycin = section.querySelector(`#${eventAnchorId(eventsByGeneration["gen-2"][0])}`)!
    const xcon = section.querySelector(`#${eventAnchorId(eventsByGeneration["gen-2"][1])}`)!
    expect(mycin).toHaveAttribute("data-frozen")
    expect(mycin.querySelector(".frz-badge")).toHaveTextContent("FRZ")
    expect(mycin).toHaveTextContent("during an AI winter")
    expect(xcon).not.toHaveAttribute("data-frozen")
  })

  it("thaws the field with clear weather when the first winter ends", () => {
    const { section } = renderEra("gen-2")

    const weather = section.querySelector('[data-scene="weather"]')!
    expect(weather).toHaveTextContent("The hail stopped.")
  })

  it("plays a human-versus-machine match as a battle, with each side's HP bar at its share of the match", () => {
    const { section } = renderEra("gen-3")

    const battle = section.querySelector('[data-scene="battle"]')!
    expect(battle).toHaveTextContent("World chess champion GARRY KASPAROV wants to battle!")
    expect(battle.querySelector('[data-battle-side="ai"] [data-hp]')).toHaveAttribute("data-hp", (3.5 / 6).toFixed(2))
    expect(battle.querySelector('[data-battle-side="foe"] [data-hp]')).toHaveAttribute("data-hp", (2.5 / 6).toFixed(2))
    expect(battle.querySelector(".battle-back")!.getAttribute("src")).toMatch(/^\/sprites\/gen-3\/back\/\d+\.png$/)
  })

  it("evolves a line in its own scene, saying why the evolution fits", () => {
    const { section } = renderEra("gen-3")

    const evolution = section.querySelector('[data-scene="evolution"]')!
    expect(evolution).toHaveTextContent("is evolving!")
    expect(evolution).toHaveTextContent("evolved into ALAKAZAM!")
    expect(evolution.querySelector("[data-evolution-why]")).toHaveTextContent("Deep Blue was the supercomputer.")
    expect(evolution.querySelectorAll("img")).toHaveLength(2)
  })

  it("keeps an event's scenes in full however busy its year, and leaves them out while filtering", () => {
    const busy = busyYearIn(2025).map((event, index) => (index === 6 ? { ...event, title: "OpenAI Rolls Back a Sycophantic GPT-4o" } : event))
    const { section, unmount } = renderEra("modern", busy)

    const sceneCard = section.querySelector(`#${eventAnchorId(busy[6])}`)!
    expect(sceneCard).not.toHaveAttribute("data-brief")
    expect(section.querySelector('[data-scene="move"]')).toHaveTextContent("used CHARM!")
    unmount()

    const { section: filtered } = renderEra("modern", busy, 40)
    expect(filtered.querySelector("[data-scene]")).toBeNull()
  })
})

describe("the region the era is drawn as", () => {
  it("opens on a signpost naming its route and place, and draws its stretch of the route in its biome", () => {
    const { era, section } = renderEra("gen-2")

    const header = section.querySelector("[data-era-header]")!
    expect(header.querySelector(".signpost")).toHaveTextContent(`Route ${era.index + 1}${era.place}`)
    expect(header.querySelector(".signpost")).toHaveAttribute("aria-hidden", "true")
    expect(header.querySelector("[data-era-place]")).toHaveTextContent(era.place)
    const backdrop = section.querySelector("[data-era-backdrop]")!
    expect(backdrop).toHaveAttribute("data-biome", era.biome)
    expect(backdrop).toHaveClass(`biome-${era.biome}`)
  })

  it("previews the lines the reader meets there and its turning points, each linking to its entry", () => {
    const { section, dex } = renderEra("gen-2")

    const ahead = section.querySelector<HTMLElement>("[data-region-ahead]")!
    const firsts = eventsByGeneration["gen-2"].filter((event) => dex.get(eventAnchorId(event))!.firstOfLine)
    const landmarks = eventsByGeneration["gen-2"].filter((event) => event.landmark)
    const links = within(ahead).getAllByRole("link")
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      ...firsts.map((event) => `#${eventAnchorId(event)}`),
      ...landmarks.map((event) => `#${eventAnchorId(event)}`),
    ])
    for (const event of landmarks) {
      expect(ahead).toHaveTextContent(event.title)
    }
  })

  it("leaves the preview and the gym challenge out while the reader filters", () => {
    const { section } = renderEra("gen-2", eventsByGeneration["gen-2"].slice(0, 1), 10)

    expect(section.querySelector("[data-region-ahead]")).toBeNull()
    expect(section.querySelector("[data-gym-challenge]")).toBeNull()
  })

  it("marks a stop on the route beside every entry", () => {
    const { section } = renderEra("gen-3")

    for (const article of within(section).getAllByRole("article")) {
      expect(article.closest("li")).toHaveClass("dex-route-stop")
    }
  })
})

describe("the gym challenge at a region's end", () => {
  function challengeOf(section: HTMLElement) {
    return section.querySelector<HTMLElement>("[data-gym-challenge]")!
  }

  it("asks one question with three answers, after the region's entries", () => {
    const { era, section } = renderEra("gen-4")

    const challenge = challengeOf(section)
    expect(challenge).toHaveAttribute("data-gym-challenge", era.id)
    expect(within(challenge).getByRole("heading", { level: 3 })).toHaveTextContent(
      "After fifty years of SPLASH, what finally evolved MAGIKARP into GYARADOS in 2012?",
    )
    expect(within(challenge).getAllByRole("button")).toHaveLength(3)
    const cards = section.querySelectorAll("article")
    expect(cards[cards.length - 1].compareDocumentPosition(challenge) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("says a wrong answer is wrong and lets the reader try again", async () => {
    const { section } = renderEra("gen-4")

    const challenge = challengeOf(section)
    const wrong = within(challenge).getByRole("button", { name: /AlphaGo beating Lee Sedol/ })
    await userEvent.click(wrong)

    expect(wrong).toHaveAttribute("aria-pressed", "true")
    expect(challenge).toHaveTextContent("Not quite. Try another answer.")
    expect(within(challenge).getByRole("button", { name: /AlexNet/ })).toBeEnabled()
    expect(challenge.querySelector("[data-badge-earned]")).toBeNull()
  })

  it("awards the region's badge for the right answer, explains it and links to its entry", async () => {
    const { era, section } = renderEra("gen-4")

    const challenge = challengeOf(section)
    await userEvent.click(within(challenge).getByRole("button", { name: /AlexNet winning the ImageNet competition/ }))

    const earned = challenge.querySelector<HTMLElement>("[data-badge-earned]")!
    expect(earned).toHaveTextContent(`Correct! You earned the ${era.place} badge!`)
    expect(earned).toHaveTextContent("AlexNet won ImageNet")
    expect(earned.querySelector("img")).toHaveAttribute("src", `/sprites/badges/${era.badge}.png`)
    expect(within(earned).getByRole("link", { name: "Revisit: ImageNet Breakthrough" })).toHaveAttribute(
      "href",
      "#event-2012-imagenet-breakthrough",
    )
    for (const button of within(challenge).getAllByRole("button")) {
      expect(button).toBeDisabled()
    }
    expect(earned.closest("[aria-live]")).not.toBeNull()
  })

  it("recaps the evolutions the region held, each linking to its scene", () => {
    const { section, dex } = renderEra("gen-4")

    const recap = challengeOf(section).querySelector<HTMLElement>("[data-region-recap]")!
    const evolutions = eventsByGeneration["gen-4"].flatMap((event) =>
      dex.get(eventAnchorId(event))!.scenes.filter((played) => played.scene.kind === "evolution"),
    )
    expect(within(recap).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(
      evolutions.map((played) => `#${played.id}`),
    )
  })
})
