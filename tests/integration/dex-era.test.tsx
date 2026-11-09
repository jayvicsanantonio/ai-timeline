// Integration tests for the six eras of the AI Dex rendered by EraChapter in real Chromium.
// Every era opens with the same header in the page's color, and draws its events newest first, as the page rewinds, as dex
// entries in the sprites of its generation. Each must give its entries the same accessible structure, plus the details
// that make its generation its own.
import { render, screen, within } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { page, userEvent } from "vitest/browser"
import { DexProvider } from "@/components/eras/dex-context"
import { EraChapter } from "@/components/eras/era-chapter"
import { NO_MATCHING_EVENTS } from "@/components/eras/era-parts"
import { buildDex, CATEGORY_TYPES, formatDexNumber, LEGENDS } from "@/lib/dex"
import { ERA_DEFINITIONS, groupEventsByEra, isCurrentEra, type GenerationId } from "@/lib/eras"
import { eventAnchorId, eventDateTime, eventSource, formatEventDate } from "@/lib/event-format"
import { erasNewestFirst, newestFirst } from "@/lib/newest-first"
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

// Renders the era as the page does, with its events newest first, inside a dex built from every event given
function renderEra(
  generation: GenerationId,
  events = eventsByGeneration[generation],
  totalEvents = events.length,
  dexEvents: TimelineEvent[] = events,
) {
  const dex = buildDex(dexEvents)
  const era = erasNewestFirst(groupEventsByEra(events)).find((candidate) => candidate.generation === generation)!
  const wrapper = ({ children }: { children: ReactNode }) => <DexProvider dex={dex}>{children}</DexProvider>
  const view = render(<EraChapter era={era} totalEvents={totalEvents} />, { wrapper })
  const section = screen.getByRole("region", { name: era.name })
  return { era, section, dex, ...view }
}

describe.each(GENERATIONS)("the %s era", (generation) => {
  const events = eventsByGeneration[generation]
  // The order the era draws them in
  const shown = newestFirst(events)

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

  // The timeline rewinds from now, so each header says where the reader has got to
  it("marks the current era as now, and any other as before the year the era above it began", () => {
    const { era, section } = renderEra(generation)

    const marker = section.querySelector("[data-era-marker]")!
    expect(marker.textContent).toBe(isCurrentEra(era) ? "Now" : `Before ${era.range[1]}`)
  })

  it("says how recent its latest event is only while the era is still under way", () => {
    const { era, section } = renderEra(generation)

    const header = section.querySelector("[data-era-header]")!
    if (isCurrentEra(era)) {
      expect(header).toHaveTextContent(`${events.length} events through ${formatEventDate(shown[0])}`)
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

  it("renders every event as an article whose level-3 title links to its source in a new tab, the latest first", () => {
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
      .getAllByRole("heading", { level: 3 })
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

  it("names each event's category beside its type, and describes what happened", () => {
    const { section } = renderEra(generation)

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        const event = shown[index]
        expect(within(article).getByText(event.category)).toBeInTheDocument()
        expect(within(article).getByText(event.description)).toBeInTheDocument()
        const chip = article.querySelector(`[data-type-chip="${CATEGORY_TYPES[event.category].name}"]`)!
        expect(chip).toHaveAttribute("aria-hidden", "true")
        expect(chip.querySelector("img")).toHaveAttribute("src", `/sprites/types/${CATEGORY_TYPES[event.category].id}.png`)
      })
  })

  it("numbers each entry in the order the events happened, and names the creature it was spotted as", () => {
    const { section, dex } = renderEra(generation)

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        const entry = dex.get(eventAnchorId(shown[index]))!
        expect(article).toHaveTextContent(formatDexNumber(entry.number))
        expect(article.querySelector("[data-species]")).toHaveTextContent(`Spotted as ${entry.species.name}`)
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

  it("marks landmarks as legendary encounters with their lore, and only those", () => {
    const { section } = renderEra(generation)

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        const event = shown[index]
        if (event.landmark) {
          expect(article).toHaveAttribute("data-landmark")
          expect(within(article).getByText("★ Landmark")).toBeInTheDocument()
          const legend = LEGENDS[event.title]
          if (legend) {
            expect(article.querySelector("[data-legend-lore]")).toHaveTextContent(legend.lore)
          } else {
            expect(article.querySelector("[data-legend-lore]")).toBeNull()
          }
        } else {
          expect(article).not.toHaveAttribute("data-landmark")
          expect(within(article).queryByText(/Landmark/)).not.toBeInTheDocument()
          expect(article.querySelector("[data-legend-lore]")).toBeNull()
        }
      })
  })

  it("exposes no decorative controls as buttons", () => {
    const { section } = renderEra(generation)

    expect(within(section).queryAllByRole("button")).toEqual([])
  })

  it("lets keyboard users tab to every event link in the order shown, the latest first", async () => {
    renderEra(generation)

    for (const event of shown) {
      await userEvent.tab()
      expect(document.activeElement).toBe(screen.getByRole("link", { name: event.title }))
    }
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

  it("says how many years earlier a year came than the one above it, when more than one year lies between", () => {
    const { section } = renderEra(generation)

    const markers = within(section).getAllByText(/^\d+ years earlier$/)
    expect(markers.map((marker) => marker.textContent)).toEqual([`${later.year - earlier.year} years earlier`])
  })

  it("sits ahead of the earlier year, outside its entries, where assistive technology reads it too", () => {
    const { section } = renderEra(generation)

    const marker = within(section).getByText(/^\d+ years earlier$/)
    const column = section.querySelector(`[data-year-column="${earlier.year}"]`)!
    expect(marker.compareDocumentPosition(column) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(marker.closest("article")).toBeNull()
    expect(marker.closest('[aria-hidden="true"]')).toBeNull()
  })

  it("leaves events a year apart unmarked", () => {
    const { section } = renderEra(generation, [earlier, makeEvent(earlier.year + 1, "June", "The Next Year", "AI Tools")])

    expect(within(section).queryByText(/years earlier/)).toBeNull()
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
  const shown = newestFirst(events)
  const years = [...new Set(shown.map((event) => event.year))]

  it("names each year ahead of its events, the latest year first, in plain words for assistive technology", () => {
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

  it("counts the legends of each year that has them", () => {
    const { section } = renderEra(generation)

    yearColumns(section).forEach((column) => {
      const landmarks = events.filter((event) => event.year === Number(column.dataset.yearColumn) && event.landmark).length
      if (landmarks > 0) {
        expect(drawnYear(column)).toHaveTextContent(`★ ${landmarks} legend`)
      } else {
        expect(drawnYear(column)).not.toHaveTextContent("legend")
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

    for (const heading of within(section).getAllByRole("heading", { level: 3 })) {
      expect(getComputedStyle(heading).fontFamily).toContain("Press Start")
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
  it("opens on a Poké Ball watching for what comes after its latest event", () => {
    const { container } = renderEra("modern")

    const frontier = container.querySelector("[data-frontier]")!
    expect(frontier).toHaveTextContent("Watching for what comes after September 2026")
    expect(frontier.querySelector("img")).toHaveAttribute("src", "/sprites/items/poke-ball.png")
    const firstCard = container.querySelector("article")!
    expect(frontier.compareDocumentPosition(firstCard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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
        const expected = relativeMonthLabel(newestFirst(eventsByGeneration.modern)[index], now)
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
  const years = [...new Set(newestFirst(events).map((event) => event.year))]

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
  // Newest first
  const fullSizeTitles = ["Release 4", "Release 1"]

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
