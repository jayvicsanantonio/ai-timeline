// Integration tests for the five era interfaces rendered by EraChapter in real Chromium.
// Every interface must give its events the same accessible structure, plus the details that make it its own.
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
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

  it("sits ahead of the event's card in its list item, where assistive technology reads it too", () => {
    const { section } = renderEra(eraInterface)

    const marker = within(section).getByText(/^\d+ years later$/)
    const card = section.querySelector(`#${eventAnchorId(second)}`)!
    expect(marker.closest("li")).toBe(card.closest("li"))
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

describe("the punch-card era", () => {
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
})

describe("the terminal era", () => {
  it("recalls each event at a command prompt that prints its date", () => {
    const { section } = renderEra("terminal")

    const [mycin, xcon] = within(section).getAllByRole("article")
    expect(mycin).toHaveTextContent("> RECALL 1974")
    expect(xcon).toHaveTextContent("> RECALL March 1980")
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

  it("goes straight to a year's messages when the year has no summary yet", () => {
    const { container } = renderEra("chat", [makeEvent(2027, "January", "A Later Release", "Public Releases")])

    expect(container.querySelector("[data-year-prompt]")).toHaveTextContent("What happened in 2027?")
    expect(container.querySelector("[data-year-summary]")).toBeNull()
  })
})
