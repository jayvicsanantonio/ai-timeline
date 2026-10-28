// Integration tests for the six era interfaces rendered by EraChapter in real Chromium.
// Every interface must give its events the same accessible structure, plus the details that make it its own.
import { render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { page, userEvent } from "vitest/browser"
import { EraChapter } from "@/components/eras/era-chapter"
import { NO_MATCHING_EVENTS } from "@/components/eras/era-parts"
import { ERA_DEFINITIONS, groupEventsByEra, type EraInterface } from "@/lib/eras"
import { eventAnchorId, eventDateTime, eventSource, formatEventDate } from "@/lib/event-format"
import { encodeHollerith } from "@/lib/hollerith"
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

const eventsByInterface: Record<EraInterface, TimelineEvent[]> = {
  "punch-card": [
    makeEvent(1951, "Unknown", "First AI Programs", "Models & Architectures"),
    makeEvent(1956, "June", "Dartmouth AI Conference", "Research Breakthroughs", true),
  ],
  terminal: [
    makeEvent(1974, "Unknown", "MYCIN Medical Expert System", "Models & Architectures"),
    makeEvent(1980, "March", "XCON Brings Expert Systems to Business", "AI Tools", true),
  ],
  desktop: [
    makeEvent(1997, "May", "IBM Deep Blue Defeats Garry Kasparov", "Hardware Advances"),
    makeEvent(2006, "July", "Deep Belief Networks", "Research Breakthroughs", true),
  ],
  notebook: [
    makeEvent(2012, "October", "ImageNet Breakthrough", "Research Breakthroughs"),
    makeEvent(2017, "June", "Attention Is All You Need", "Research Breakthroughs", true),
  ],
  chat: [
    makeEvent(2023, "March", "OpenAI Releases GPT-4", "Public Releases"),
    makeEvent(2023, "March", "Italy Temporarily Bans ChatGPT", "Ethics & Policy", true),
    makeEvent(2024, "May", "OpenAI Releases GPT-4o", "Public Releases"),
  ],
  agent: [
    makeEvent(2025, "February", "Anthropic Releases Claude Code in Research Preview", "AI Tools"),
    makeEvent(2025, "July", "AI Reaches Gold-Medal Level at the Math Olympiad", "Research Breakthroughs", true),
    makeEvent(2026, "September", "Meta Launches Muse, a Personal AI Agent", "Agents"),
  ],
}

const INTERFACES = ERA_DEFINITIONS.map((era) => era.interface)

function renderEra(eraInterface: EraInterface, events = eventsByInterface[eraInterface], totalEvents = events.length) {
  const era = groupEventsByEra(events).find((candidate) => candidate.interface === eraInterface)!
  const view = render(<EraChapter era={era} totalEvents={totalEvents} />)
  const section = screen.getByRole("region", { name: era.name })
  return { era, section, ...view }
}

describe.each(INTERFACES)("the %s era", (eraInterface) => {
  const events = eventsByInterface[eraInterface]

  it("is a section named by its era title, a level-2 heading that can take focus", () => {
    const { era, section } = renderEra(eraInterface)

    expect(section).toHaveAttribute("id", era.id)
    expect(section).toHaveAttribute("data-interface", eraInterface)
    const heading = within(section).getByRole("heading", { level: 2, name: era.name })
    expect(heading).toHaveAttribute("tabindex", "-1")
  })

  it("introduces the era with its chapter, years, description and interface", () => {
    const { era, section } = renderEra(eraInterface)

    expect(section).toHaveTextContent(era.chapter)
    expect(section).toHaveTextContent(era.subtitle)
    expect(section).toHaveTextContent(era.description)
    expect(section).toHaveTextContent(era.interfaceName)
  })

  it("counts the era's events, and how many match while filtering", () => {
    const { section, unmount } = renderEra(eraInterface)
    expect(section).toHaveTextContent(`${events.length} events`)
    unmount()

    const { section: filteredSection } = renderEra(eraInterface, events.slice(0, 1), events.length)
    expect(filteredSection).toHaveTextContent(`1 of ${events.length} events`)
  })

  it("renders every event as an article whose level-3 title links to its source in a new tab", () => {
    const { section } = renderEra(eraInterface)

    const articles = within(section).getAllByRole("article")
    expect(articles).toHaveLength(events.length)
    events.forEach((event, index) => {
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
    const { section } = renderEra(eraInterface)

    within(section)
      .getAllByRole("heading", { level: 3 })
      .forEach((heading) => {
        const hint = document.getElementById(within(heading).getByRole("link").getAttribute("aria-describedby")!)
        expect(hint).toHaveTextContent("Opens in a new tab")
        expect(heading).not.toContainElement(hint)
      })
  })

  it("shows each event's date in a time element, and only the year when the month is unknown", () => {
    const { section } = renderEra(eraInterface)

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        const date = within(article).getByText(formatEventDate(events[index]))
        expect(date.tagName).toBe("TIME")
        expect(date).toHaveAttribute("datetime", eventDateTime(events[index]))
      })
    expect(within(section).queryByText(/Unknown/)).not.toBeInTheDocument()
  })

  it("names each event's category and describes what happened", () => {
    const { section } = renderEra(eraInterface)

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        expect(within(article).getByText(events[index].category)).toBeInTheDocument()
        expect(within(article).getByText(events[index].description)).toBeInTheDocument()
      })
  })

  it("anchors each event by id, year and month so navigation can jump to it and read it out", () => {
    const { section } = renderEra(eraInterface)

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        expect(article).toHaveAttribute("id", eventAnchorId(events[index]))
        expect(article).toHaveAttribute("data-year", String(events[index].year))
        expect(article).toHaveAttribute("data-month", events[index].month)
      })
  })

  it("puts each event's date ahead of its title, so the dates line up for scanning", () => {
    const { section } = renderEra(eraInterface)

    within(section)
      .getAllByRole("article")
      .forEach((article) => {
        const date = article.querySelector("time")!
        const heading = within(article).getByRole("heading", { level: 3 })
        expect(date.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      })
  })

  it("names the site each event's link opens", () => {
    const { section } = renderEra(eraInterface)

    within(section)
      .getAllByRole("article")
      .forEach((article) => {
        expect(within(article).getByText(eventSource(events[0]))).toBeInTheDocument()
      })
  })

  it("labels landmark events, and only those", () => {
    const { section } = renderEra(eraInterface)

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        if (events[index].landmark) {
          expect(article).toHaveAttribute("data-landmark")
          expect(within(article).getByText("Landmark")).toBeInTheDocument()
        } else {
          expect(article).not.toHaveAttribute("data-landmark")
          expect(within(article).queryByText("Landmark")).not.toBeInTheDocument()
        }
      })
  })

  it("exposes no decorative controls as buttons", () => {
    const { section } = renderEra(eraInterface)

    expect(within(section).queryAllByRole("button")).toEqual([])
  })

  it("lets keyboard users tab to every event link in order", async () => {
    renderEra(eraInterface)

    for (const event of events) {
      await userEvent.tab()
      expect(document.activeElement).toBe(screen.getByRole("link", { name: event.title }))
    }
  })

  it("says so when none of the era's events match the filters", () => {
    const { era, section } = renderEra(eraInterface, [], 12)

    expect(within(section).getByRole("heading", { level: 2, name: era.name })).toBeInTheDocument()
    expect(within(section).getByRole("heading", { level: 2, name: era.name })).toHaveAttribute("tabindex", "-1")
    expect(section).toHaveTextContent("0 of 12 events")
    expect(within(section).getByText(NO_MATCHING_EVENTS)).toBeInTheDocument()
    expect(within(section).queryAllByRole("article")).toEqual([])
  })

  // One era's backdrop meets the next in the page's black, so moving between eras dissolves instead of cutting
  it("fades its backdrop into the page's black at the top and bottom, with or without matches", () => {
    const seam = /^linear-gradient\(rgb\(10, 10, 11\), .*?, rgb\(10, 10, 11\)\), /

    const full = renderEra(eraInterface)
    expect(getComputedStyle(full.section.firstElementChild!).backgroundImage).toMatch(seam)
    full.unmount()

    const empty = renderEra(eraInterface, [], 12)
    expect(getComputedStyle(empty.section.firstElementChild!).backgroundImage).toMatch(seam)
  })

  // Filtering can empty several eras at once, and their full introductions would push the results far down
  it("shrinks to a short row when none of its events match the filters", () => {
    const { section } = renderEra(eraInterface, [], 12)

    expect(section.getBoundingClientRect().height).toBeLessThan(300)
  })
})

// The eras whose events come years apart mark the quiet stretches between their cards
describe.each(["punch-card", "terminal", "desktop"] as const)("the %s era's year gaps", (eraInterface) => {
  const [first, second] = eventsByInterface[eraInterface]

  it("says how many years passed before an event, when more than one did", () => {
    const { section } = renderEra(eraInterface)

    const markers = within(section).getAllByText(/^\d+ years later$/)
    expect(markers.map((marker) => marker.textContent)).toEqual([`${second.year - first.year} years later`])
  })

  it("sits ahead of the year's first card in its list item, where assistive technology reads it too", () => {
    const { section } = renderEra(eraInterface)

    const marker = within(section).getByText(/^\d+ years later$/)
    const card = section.querySelector(`#${eventAnchorId(second)}`)!
    expect(marker.closest("li")!.contains(card)).toBe(true)
    expect(marker.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(marker.closest("article")).toBeNull()
    expect(marker.closest('[aria-hidden="true"]')).toBeNull()
  })

  it("leaves events a year apart unmarked", () => {
    const { section } = renderEra(eraInterface, [
      first,
      makeEvent(first.year + 1, "June", "The Next Year", "AI Tools"),
    ])

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
describe.each(INTERFACES)("the %s era's year column", (eraInterface) => {
  const events = eventsByInterface[eraInterface]
  const years = [...new Set(events.map((event) => event.year))]

  it("names each year ahead of its events, in plain words for assistive technology", () => {
    const { section } = renderEra(eraInterface)

    const columns = yearColumns(section)
    expect(columns.map((column) => Number(column.dataset.yearColumn))).toEqual(years)
    columns.forEach((column, index) => {
      const year = years[index]
      const count = events.filter((event) => event.year === year).length
      expect(within(column).getByText(`${year}, ${count} ${count === 1 ? "event" : "events"}`)).toHaveClass("sr-only")
      expect(drawnYear(column)).toHaveTextContent(String(year))
      const firstOfYear = section.querySelector(`#${eventAnchorId(events.find((event) => event.year === year)!)}`)!
      expect(column.compareDocumentPosition(firstOfYear) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
  })

  it("puts the year on one short line above its events on a phone", () => {
    const { section } = renderEra(eraInterface)

    const [column] = yearColumns(section)
    const firstCard = within(section).getAllByRole("article")[0]
    expect(column.getBoundingClientRect().height).toBeLessThan(48)
    expect(column.getBoundingClientRect().bottom).toBeLessThanOrEqual(firstCard.getBoundingClientRect().top)
  })

  it("rules the year off from its events with a line under it on a phone", () => {
    const { section } = renderEra(eraInterface)

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
      const { section } = renderEra(eraInterface)

      const [column] = yearColumns(section)
      const firstCard = within(section).getAllByRole("article")[0]
      expect(getComputedStyle(column.firstElementChild!).position).toBe("sticky")
      expect(column.getBoundingClientRect().right).toBeLessThanOrEqual(firstCard.getBoundingClientRect().left)
    })

    it("rules the year off from its events with a line between them", () => {
      const { section } = renderEra(eraInterface)

      const style = getComputedStyle(yearColumns(section)[0])
      expect(style.borderRightStyle).not.toBe("none")
      expect(parseFloat(style.borderRightWidth)).toBeGreaterThan(0)
      expect(parseFloat(style.borderBottomWidth)).toBe(0)
    })
  })
})

describe("the punch-card era", () => {
  it("counts each year's cards as records and lights the months they fall in", () => {
    const { section } = renderEra("punch-card")

    const [year1951, year1956] = yearColumns(section)
    const litMonths = (column: HTMLElement) =>
      [...column.querySelectorAll<HTMLElement>("[data-month-square]")]
        .filter((square) => square.dataset.count !== "0")
        .map((square) => square.dataset.monthSquare)
    expect(drawnYear(year1956)).toHaveTextContent("1 record")
    expect(year1956.querySelectorAll("[data-month-square]")).toHaveLength(12)
    expect(litMonths(year1956)).toEqual(["June"])
    expect(litMonths(year1951)).toEqual([])
  })

  it("signs off the deck with an end-of-job line, as the printouts did", () => {
    const { section } = renderEra("punch-card")

    const signOff = within(section).getByText("END OF JOB")
    const lastCard = within(section).getAllByRole("article").at(-1)!
    expect(lastCard.compareDocumentPosition(signOff) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(signOff.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it("keeps the punched strip shallow, so it reads as a strip rather than a block", () => {
    const { section } = renderEra("punch-card")

    const strip = within(section).getAllByRole("article")[0].querySelector("svg")!
    const { width, height } = strip.viewBox.baseVal
    expect(height / width).toBeLessThan(0.16)
  })

  it("punches each card with its event title in Hollerith code", () => {
    const { section } = renderEra("punch-card")

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        const expectedHoles = encodeHollerith(eventsByInterface["punch-card"][index].title).flat().length
        expect(article.querySelectorAll("svg [data-hole]")).toHaveLength(expectedHoles)
        expect(article.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
      })
  })

  // The category and source a card prints, which sit after its description on a narrow card
  function cardFields(card: HTMLElement, event: TimelineEvent) {
    return [within(card).getByText(event.category), within(card).getByText(eventSource(event))]
  }

  it("ends each card with its category and source, after its description, on a phone", () => {
    const { section } = renderEra("punch-card")

    within(section)
      .getAllByRole("article")
      .forEach((card, index) => {
        const event = eventsByInterface["punch-card"][index]
        const description = within(card).getByText(event.description).getBoundingClientRect()
        for (const field of cardFields(card, event)) {
          expect(field.getBoundingClientRect().top).toBeGreaterThanOrEqual(description.bottom)
        }
      })
  })

  describe("from 1024px wide", () => {
    beforeEach(async () => {
      await page.viewport(1280, 800)
    })

    afterEach(async () => {
      await page.viewport(414, 896)
    })

    it("stamps each card's category and source beside its date and title, so its description ends the card", () => {
      const { section } = renderEra("punch-card")

      within(section)
        .getAllByRole("article")
        .forEach((card, index) => {
          const event = eventsByInterface["punch-card"][index]
          const title = within(card).getByRole("heading", { level: 3 }).getBoundingClientRect()
          const holes = card.querySelector("svg")!.getBoundingClientRect()
          for (const field of cardFields(card, event)) {
            const box = field.getBoundingClientRect()
            expect(box.left).toBeGreaterThan(title.right)
            expect(box.bottom).toBeLessThanOrEqual(holes.top)
          }
          expect(within(card).getByText(event.description).getBoundingClientRect().top).toBeGreaterThanOrEqual(
            holes.bottom,
          )
        })
    })

    it("wraps a long title into lines of even length", () => {
      const { section } = renderEra("punch-card")

      for (const title of within(section).getAllByRole("heading", { level: 3 })) {
        expect(getComputedStyle(title).getPropertyValue("text-wrap-style")).toBe("balance")
      }
    })
  })
})

describe("the terminal era", () => {
  it("recalls each event at a command prompt that prints its date", () => {
    const { section } = renderEra("terminal")

    const [mycin, xcon] = within(section).getAllByRole("article")
    expect(mycin).toHaveTextContent("> RECALL 1974")
    expect(xcon).toHaveTextContent("> RECALL March 1980")
  })

  it("prints each year in hex beside its count of records, as the terminal would", () => {
    const { section } = renderEra("terminal")

    const [year1974] = yearColumns(section)
    expect(drawnYear(year1974)).toHaveTextContent("0X7B6 · 1 REC")
  })
})

describe("the desktop era", () => {
  it("files each year in a folder named for it, as the desktop would", () => {
    const { section } = renderEra("desktop")

    const [year1997] = yearColumns(section)
    expect(drawnYear(year1997)).toHaveTextContent("C:\\AI\\1997 (1)")
    expect(drawnYear(year1997).querySelector("svg")).not.toBeNull()
  })

  it("shuts down at the end of the era, as the desktops of the day did", () => {
    const { section } = renderEra("desktop")

    const signOff = within(section).getByText("It's now safe to turn off your computer.")
    const lastWindow = within(section).getAllByRole("article").at(-1)!
    expect(lastWindow.compareDocumentPosition(signOff) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(signOff.closest('[aria-hidden="true"]')).not.toBeNull()
  })
})

// Relative luminance of a computed rgb() color, from 0 for black to 1 for white
function luminance(color: string) {
  const [red, green, blue] = color.match(/\d+(\.\d+)?/g)!.slice(0, 3).map((channel) => {
    const value = Number(channel) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

describe("the notebook era", () => {
  it("sets the white notebook on a dark desk, so it does not flash between the dark eras", () => {
    const { section } = renderEra("notebook")

    const desk = section.firstElementChild!
    const page = desk.firstElementChild!
    expect(luminance(getComputedStyle(desk).backgroundColor)).toBeLessThan(0.02)
    expect(getComputedStyle(page).backgroundColor).toBe("rgb(255, 255, 255)")
  })

  it("prints each event's date once, in words", () => {
    const { section } = renderEra("notebook")

    within(section)
      .getAllByRole("article")
      .forEach((cell, index) => {
        const event = eventsByInterface.notebook[index]
        expect(cell.textContent!.split(formatEventDate(event))).toHaveLength(2)
        expect(cell).not.toHaveTextContent(eventDateTime(event))
      })
  })

  it("numbers the event cells in run order after the introduction's cell", () => {
    const { section } = renderEra("notebook")

    const cells = within(section).getAllByRole("article")
    expect(cells[0]).toHaveTextContent("In [2]:")
    expect(cells[1]).toHaveTextContent("In [3]:")
  })

  it("heads each year like a markdown cell, with its count of cells", () => {
    const { section } = renderEra("notebook")

    const [year2012] = yearColumns(section)
    expect(drawnYear(year2012)).toHaveTextContent("# 2012")
    expect(drawnYear(year2012)).toHaveTextContent("1 cell")
  })

  // The display rule rather than visibility, because a cell's scroll reveal fades it in from transparent
  function shown(prompt: HTMLElement) {
    return getComputedStyle(prompt).display !== "none"
  }

  it("follows each code cell with its output on a phone, keeping only the In [n]: prompt", () => {
    const { section } = renderEra("notebook")

    within(section)
      .getAllByRole("article")
      .forEach((cell, index) => {
        const run = index + 2
        expect(shown(within(cell).getByText(`In [${run}]:`))).toBe(true)
        expect(shown(within(cell).getByText(`Out[${run}]:`))).toBe(false)
      })
    expect(shown(within(section).getByText("Out[1]:"))).toBe(false)
  })

  describe("on a wide screen", () => {
    beforeEach(async () => {
      await page.viewport(1280, 800)
    })

    afterEach(async () => {
      await page.viewport(414, 896)
    })

    it("prompts each code cell and its output beside them, with In [n]: and Out[n]:", () => {
      const { section } = renderEra("notebook")

      within(section)
        .getAllByRole("article")
        .forEach((cell, index) => {
          const run = index + 2
          for (const prompt of [within(cell).getByText(`In [${run}]:`), within(cell).getByText(`Out[${run}]:`)]) {
            expect(shown(prompt)).toBe(true)
            expect(prompt.getBoundingClientRect().right).toBeLessThanOrEqual(
              prompt.nextElementSibling!.getBoundingClientRect().left,
            )
          }
        })
    })
  })
})

describe("the chat era", () => {
  it("groups the messages under one divider per month, in order", () => {
    const { container } = renderEra("chat")

    const dividers = [...container.querySelectorAll("[data-month-divider]")]
    expect(dividers.map((divider) => divider.textContent)).toEqual(["March 2023", "May 2024"])
    expect(dividers[0].closest("[data-month]")!.querySelectorAll("article")).toHaveLength(2)
  })

  it("asks about each new year before that year's first message", () => {
    const { container } = renderEra("chat")

    const prompts = [...container.querySelectorAll("[data-year-prompt]")]
    expect(prompts.map((prompt) => prompt.textContent)).toEqual(["What happened in 2023?", "What happened in 2024?"])
    const firstOf2024 = container.querySelector('article[data-year="2024"]')!
    expect(prompts[1].compareDocumentPosition(firstOf2024) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(prompts[0].compareDocumentPosition(firstOf2024) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("answers each year's question with that year's summary, ahead of its first message", () => {
    const { container } = renderEra("chat")

    const answers = [...container.querySelectorAll("[data-year-summary]")]
    expect(answers.map((answer) => answer.textContent)).toEqual([yearSummary(2023), yearSummary(2024)])
    const prompt2024 = container.querySelectorAll("[data-year-prompt]")[1]
    const firstOf2024 = container.querySelector('article[data-year="2024"]')!
    expect(prompt2024.compareDocumentPosition(answers[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(answers[1].compareDocumentPosition(firstOf2024) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(answers[1].closest('[aria-hidden="true"]')).toBeNull()
  })

  it("counts each year's events and landmarks beside them", () => {
    const { section } = renderEra("chat")

    const [year2023, year2024] = yearColumns(section)
    expect(drawnYear(year2023)).toHaveTextContent("2 events")
    expect(drawnYear(year2023)).toHaveTextContent("★ 1 landmark")
    expect(drawnYear(year2024)).toHaveTextContent("1 event")
    expect(drawnYear(year2024)).not.toHaveTextContent("landmark")
  })

  it("ends the thread handing the work to an agent", () => {
    const { section } = renderEra("chat")

    expect(section.textContent).toMatch(/Handing the work to an agent$/)
  })

  // Measured on the list items, which hold still while their messages' scroll reveal moves them
  it("keeps each month's divider close to its messages, 24px below what comes before and 12px above its first one", () => {
    const { container } = renderEra("chat")

    const months = [...container.querySelectorAll<HTMLElement>("div[data-month]")]
    expect(months).toHaveLength(2)
    for (const month of months) {
      const divider = month.querySelector("[data-month-divider]")!.parentElement!.getBoundingClientRect()
      const firstMessage = month.querySelector("li")!.getBoundingClientRect()
      expect(getComputedStyle(month).marginTop).toBe("24px")
      expect(firstMessage.top - divider.bottom).toBeCloseTo(12, 0)
    }
  })
})

describe("the agent era", () => {
  it("opens with a plan of one step per year, checking off every year but the one still running", () => {
    const { container } = renderEra("agent")

    const steps = [...container.querySelectorAll<HTMLElement>("[data-plan-step]")]
    expect(steps.map((step) => [step.textContent, step.dataset.status])).toEqual([
      ["Research 2025", "done"],
      ["Research 2026", "running"],
    ])
    expect(steps[0].closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it("starts each year with its task before that year's first step", () => {
    const { container } = renderEra("agent")

    const tasks = [...container.querySelectorAll("[data-year-task]")]
    expect(tasks.map((task) => task.textContent)).toEqual(["Research 2025", "Research 2026"])
    const firstOf2026 = container.querySelector('article[data-year="2026"]')!
    expect(tasks[1].compareDocumentPosition(firstOf2026) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(tasks[0].compareDocumentPosition(firstOf2026) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("reports each year's summary after its task, ahead of its first step", () => {
    const { container } = renderEra("agent")

    const reports = [...container.querySelectorAll("[data-year-summary]")]
    expect(reports.map((report) => report.textContent)).toEqual([yearSummary(2025), yearSummary(2026)])
    const task2026 = container.querySelectorAll("[data-year-task]")[1]
    const firstOf2026 = container.querySelector('article[data-year="2026"]')!
    expect(task2026.compareDocumentPosition(reports[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(reports[1].compareDocumentPosition(firstOf2026) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(reports[1].closest('[aria-hidden="true"]')).toBeNull()
  })

  it("counts each year's events and landmarks beside them", () => {
    const { section } = renderEra("agent")

    const [year2025, year2026] = yearColumns(section)
    expect(drawnYear(year2025)).toHaveTextContent("2 events")
    expect(drawnYear(year2025)).toHaveTextContent("★ 1 landmark")
    expect(drawnYear(year2026)).toHaveTextContent("1 event")
    expect(drawnYear(year2026)).not.toHaveTextContent("landmark")
  })

  it("goes straight to a year's steps when the year has no summary yet", () => {
    const { container } = renderEra("agent", [makeEvent(2027, "January", "A Later Release", "Public Releases")])

    expect(container.querySelector("[data-year-task]")).toHaveTextContent("Research 2027")
    expect(container.querySelector("[data-year-summary]")).toBeNull()
  })

  it("notes how many pages it read for each year and from how many sites, after the year's task", () => {
    const { container } = renderEra("agent", [
      { ...makeEvent(2025, "March", "First Step", "AI Tools"), link: "https://www.openai.com/first" },
      { ...makeEvent(2025, "April", "Second Step", "AI Tools"), link: "https://openai.com/second" },
      { ...makeEvent(2025, "May", "Third Step", "Agents"), link: "https://arxiv.org/third" },
      makeEvent(2026, "January", "Fourth Step", "Agents"),
    ])

    const notes = [...container.querySelectorAll("[data-year-activity]")]
    expect(notes.map((note) => note.textContent)).toEqual(["Read 3 pages from 2 sites", "Read 1 page from 1 site"])
    const task2026 = container.querySelectorAll("[data-year-task]")[1]
    const firstOf2026 = container.querySelector('article[data-year="2026"]')!
    expect(task2026.compareDocumentPosition(notes[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(notes[1].compareDocumentPosition(firstOf2026) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(notes[0].closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it("draws each step in full as a call that fetches its source, ahead of the step's date", () => {
    const { section } = renderEra("agent")

    for (const article of within(section).getAllByRole("article")) {
      const call = article.querySelector("[data-tool-call]")!
      expect(call).toHaveTextContent("Fetch(example.com)")
      expect(call.compareDocumentPosition(article.querySelector("time")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
  })

  it("boxes each landmark as a checkpoint, with its label set into the top edge of the box", () => {
    const { section } = renderEra("agent")

    const landmark = section.querySelector<HTMLElement>("article[data-landmark]")!
    const box = landmark.getBoundingClientRect()
    const label = within(landmark).getByText("Landmark").getBoundingClientRect()
    expect(label.top).toBeLessThan(box.top)
    expect(label.bottom).toBeGreaterThan(box.top)
  })

  // Measured on the list items' nodes, which hold still while their steps' scroll reveal moves them
  it("strings each year's steps on one trace line, with a node on the line beside every step", () => {
    const { section } = renderEra("agent", busyYearIn(2025))

    const traces = [...section.querySelectorAll<HTMLElement>("[data-trace]")]
    expect(traces).toHaveLength(1)
    for (const trace of traces) {
      const line = trace.getBoundingClientRect().left + parseFloat(getComputedStyle(trace).borderLeftWidth) / 2
      const nodes = [...trace.querySelectorAll("[data-trace-node]")]
      expect(nodes).toHaveLength(trace.querySelectorAll("article").length)
      for (const node of nodes) {
        const drawn = node.getBoundingClientRect()
        expect(drawn.width).toBeGreaterThan(1)
        expect((drawn.left + drawn.right) / 2).toBeCloseTo(line, 0)
        expect(node.closest('[aria-hidden="true"]')).not.toBeNull()
      }
    }
  })

  it("ends the log still working on the story", () => {
    const { section } = renderEra("agent")

    expect(section.textContent).toMatch(/The story is still being written$/)
    expect(section.querySelector("[data-agent-spinner]")!.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it("shimmers its closing status while motion is allowed, as agents do while they work", () => {
    const { section } = renderEra("agent")

    const status = section.querySelector("[data-agent-status]")!
    expect(status).toHaveTextContent("The story is still being written")
    expect(getComputedStyle(status).animationName).toBe("agent-shimmer")
  })
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

// A busy year has more than one event a month. Its landmarks and highlights stay in full, and the rest
// are listed one line each, as brief chat messages or collapsed steps of the agent's log, until the
// reader asks to see them all in full.
describe.each([
  ["chat", 2024],
  ["agent", 2025],
] as const)("the %s era's busy years", (eraInterface, year) => {
  const busyYear = busyYearIn(year)
  const fullSizeTitles = ["Release 1", "Release 4"]

  function cards(section: HTMLElement) {
    return within(section).getAllByRole("article")
  }

  function briefCards(section: HTMLElement) {
    return briefCardsIn(section)
  }

  function showAllButton(section: HTMLElement) {
    return within(section).getByRole("button", { name: "Show all 14 in full" })
  }

  it("keeps the landmarks and highlights in full and lists every other event in brief", () => {
    const { section } = renderEra(eraInterface, busyYear)

    expect(cards(section)).toHaveLength(14)
    const full = cards(section).filter((card) => !card.hasAttribute("data-brief"))
    expect(full.map((card) => within(card).getByRole("link").textContent)).toEqual(fullSizeTitles)
    for (const card of full) {
      expect(card).toHaveTextContent(`What happened with ${within(card).getByRole("link").textContent}.`)
    }
    expect(briefCards(section)).toHaveLength(12)
  })

  it("gives each brief event its date, its linked title and its source, but not its description", () => {
    const { section } = renderEra(eraInterface, busyYear)

    expect(briefCards(section)).toHaveLength(12)
    for (const card of briefCards(section)) {
      const event = busyYear.find((candidate) => candidate.title === within(card).getByRole("link").textContent)!
      const time = card.querySelector("time")!
      const heading = within(card).getByRole("heading", { level: 3, name: event.title })
      expect(time).toHaveAttribute("datetime", eventDateTime(event))
      expect(time.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(within(card).getByRole("link")).toHaveAttribute("href", event.link)
      expect(card).toHaveTextContent(eventSource(event))
      expect(card).not.toHaveTextContent(event.description)
    }
  })

  it("shows the whole year in full from its Show all button, and lists it in brief again on a second press", async () => {
    const { section } = renderEra(eraInterface, busyYear)
    const button = showAllButton(section)
    expect(button).toHaveAttribute("aria-pressed", "false")

    await userEvent.click(button)

    expect(button).toHaveAttribute("aria-pressed", "true")
    expect(briefCards(section)).toEqual([])
    for (const event of busyYear) {
      expect(section).toHaveTextContent(event.description)
    }

    await userEvent.click(button)

    expect(button).toHaveAttribute("aria-pressed", "false")
    expect(briefCards(section)).toHaveLength(12)
  })

  it("offers the Show all button right after the year's summary, before its first event", () => {
    const { section } = renderEra(eraInterface, busyYear)

    const summary = section.querySelector("[data-year-summary]")!
    const button = showAllButton(section)
    const firstCard = cards(section)[0]
    expect(summary.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(button.compareDocumentPosition(firstCard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("shows every match in full while the reader filters, without a Show all button", () => {
    const { section } = renderEra(eraInterface, busyYear, 40)

    expect(briefCards(section)).toEqual([])
    expect(within(section).queryByRole("button", { name: /^Show all/ })).toBeNull()
  })

  it("keeps a year with a dozen events or fewer in full, without a Show all button", () => {
    const { section } = renderEra(eraInterface, busyYear.slice(0, 12))

    expect(briefCards(section)).toEqual([])
    expect(within(section).queryByRole("button", { name: /^Show all/ })).toBeNull()
  })

  describe("on a wide screen", () => {
    beforeEach(async () => {
      await page.viewport(1280, 800)
    })

    afterEach(async () => {
      await page.viewport(414, 896)
    })

    it("fits each brief event on one short line", () => {
      const { section } = renderEra(eraInterface, busyYear)

      expect(briefCards(section)).toHaveLength(12)
      for (const card of briefCards(section)) {
        expect(card.getBoundingClientRect().height).toBeLessThan(48)
      }
    })

    it("shows each brief event's date before its title", () => {
      const { section } = renderEra(eraInterface, busyYear)

      for (const card of briefCards(section)) {
        const date = card.querySelector("time")!.getBoundingClientRect()
        expect(date.width).toBeGreaterThan(1)
        expect(date.right).toBeLessThanOrEqual(within(card).getByRole("heading", { level: 3 }).getBoundingClientRect().left)
      }
    })
  })
})

describe("the chat era's busy years on a phone", () => {
  it("leaves each brief event's date to its month's divider, still in the text screen readers hear", () => {
    const { section } = renderEra("chat", busyYearIn(2024))

    expect(briefCardsIn(section)).toHaveLength(12)
    for (const card of briefCardsIn(section)) {
      const time = card.querySelector("time")!
      const divider = card.closest("div[data-month]")!.querySelector("[data-month-divider]")!
      const drawn = time.getBoundingClientRect()
      expect(time.textContent).toBe(divider.textContent)
      expect(drawn.width).toBeLessThanOrEqual(1)
      expect(drawn.height).toBeLessThanOrEqual(1)
      expect(getComputedStyle(time).display).not.toBe("none")
      expect(getComputedStyle(time).visibility).toBe("visible")
      expect(time.closest('[aria-hidden="true"]')).toBeNull()
    }
  })
})

describe("the agent era's busy years on a phone", () => {
  it("shows each collapsed step's date ahead of its title", () => {
    const { section } = renderEra("agent", busyYearIn(2025))

    expect(briefCardsIn(section)).toHaveLength(12)
    for (const card of briefCardsIn(section)) {
      const date = card.querySelector("time")!.getBoundingClientRect()
      const heading = within(card).getByRole("heading", { level: 3 }).getBoundingClientRect()
      expect(date.width).toBeGreaterThan(1)
      expect(date.top).toBeLessThanOrEqual(heading.top)
    }
  })
})
