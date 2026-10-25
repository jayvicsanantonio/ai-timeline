// Integration tests for the five era interfaces rendered by EraChapter in real Chromium.
// Every interface must give its events the same accessible structure, plus the details that make it its own.
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
import { EraChapter } from "@/components/eras/era-chapter"
import { NO_MATCHING_EVENTS } from "@/components/eras/era-parts"
import { ERA_DEFINITIONS, groupEventsByEra, type EraInterface } from "@/lib/eras"
import { eventAnchorId, eventDateTime, formatEventDate } from "@/lib/event-format"
import { encodeHollerith } from "@/lib/hollerith"
import type { TimelineCategory, TimelineEvent } from "@/types/timeline"

function makeEvent(year: number, month: string, title: string, category: TimelineCategory): TimelineEvent {
  return {
    year,
    month,
    title,
    description: `What happened with ${title}.`,
    category,
    link: `https://example.com/${encodeURIComponent(title)}`,
  }
}

const eventsByInterface: Record<EraInterface, TimelineEvent[]> = {
  "punch-card": [
    makeEvent(1951, "Unknown", "First AI Programs", "Models & Architectures"),
    makeEvent(1956, "June", "Dartmouth AI Conference", "Research Breakthroughs"),
  ],
  terminal: [
    makeEvent(1974, "Unknown", "MYCIN Medical Expert System", "Models & Architectures"),
    makeEvent(1980, "March", "XCON Brings Expert Systems to Business", "AI Tools"),
  ],
  desktop: [
    makeEvent(1997, "May", "IBM Deep Blue Defeats Garry Kasparov", "Hardware Advances"),
    makeEvent(2006, "July", "Deep Belief Networks", "Research Breakthroughs"),
  ],
  notebook: [
    makeEvent(2012, "October", "ImageNet Breakthrough", "Research Breakthroughs"),
    makeEvent(2017, "June", "Attention Is All You Need", "Research Breakthroughs"),
  ],
  chat: [
    makeEvent(2023, "March", "OpenAI Releases GPT-4", "Public Releases"),
    makeEvent(2023, "March", "Italy Temporarily Bans ChatGPT", "Ethics & Policy"),
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

  it("anchors each event by id and year so navigation can jump to it", () => {
    const { section } = renderEra(eraInterface)

    within(section)
      .getAllByRole("article")
      .forEach((article, index) => {
        expect(article).toHaveAttribute("id", eventAnchorId(events[index]))
        expect(article).toHaveAttribute("data-year", String(events[index].year))
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
    expect(section).toHaveTextContent("0 of 12 events")
    expect(within(section).getByText(NO_MATCHING_EVENTS)).toBeInTheDocument()
    expect(within(section).queryAllByRole("article")).toEqual([])
  })
})

describe("the punch-card era", () => {
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

describe("the notebook era", () => {
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
})
