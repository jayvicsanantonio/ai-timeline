// Unit tests for the era definitions and for grouping timeline events into eras by year.
// Covers era order, interfaces, ids, subtitles and colors, and which era each event lands in.
import { describe, expect, it } from "vitest"
import timelineData from "@/data/timeline-events.json"
import { ERA_DEFINITIONS, getEraForYear, groupEventsByEra } from "@/lib/eras"
import { parseTimelineEvents } from "@/lib/timeline-events"
import type { TimelineEvent } from "@/types/timeline"

function makeEvent(year: number, title = `Event in ${year}`): TimelineEvent {
  return {
    year,
    month: "Unknown",
    title,
    description: "An event for the era tests.",
    category: "Research Breakthroughs",
    link: `https://example.com/${encodeURIComponent(title)}`,
  }
}

describe("ERA_DEFINITIONS", () => {
  it("lists the five eras in order, each drawn in the computer interface of its day", () => {
    expect(ERA_DEFINITIONS.map((era) => [era.name, era.interface, era.interfaceName])).toEqual([
      ["The Foundation Era", "punch-card", "Punch cards"],
      ["The Knowledge Era", "terminal", "Green-screen terminal"],
      ["The Learning Era", "desktop", "Desktop windows"],
      ["The Deep Learning Revolution", "notebook", "Research notebook"],
      ["The Generative AI Era", "chat", "Chat thread"],
    ])
  })

  it("covers back-to-back year ranges with no gaps between eras", () => {
    ERA_DEFINITIONS.slice(1).forEach((era, index) => {
      expect(era.range[0]).toBe(ERA_DEFINITIONS[index].range[1])
    })
  })

  it("gives every era its own color", () => {
    const colors = ERA_DEFINITIONS.map((era) => era.color)
    expect(new Set(colors).size).toBe(ERA_DEFINITIONS.length)
    colors.forEach((color) => expect(color).toMatch(/^#[0-9a-f]{6}$/))
  })
})

describe("getEraForYear", () => {
  it("finds the era whose years contain the year, counting the first year in and the last out", () => {
    expect(getEraForYear(1943)?.name).toBe("The Foundation Era")
    expect(getEraForYear(1969)?.name).toBe("The Foundation Era")
    expect(getEraForYear(1970)?.name).toBe("The Knowledge Era")
    expect(getEraForYear(2019)?.name).toBe("The Deep Learning Revolution")
    expect(getEraForYear(2026)?.name).toBe("The Generative AI Era")
  })

  it("returns undefined for a year outside every era", () => {
    expect(getEraForYear(1939)).toBeUndefined()
    expect(getEraForYear(2030)).toBeUndefined()
  })
})

describe("groupEventsByEra", () => {
  it("puts each event in the era whose years contain it, keeping the events' order", () => {
    const events = [1969, 1970, 1989, 1990, 2009, 2010, 2019, 2020, 2026].map((year) => makeEvent(year))

    const eras = groupEventsByEra(events)

    expect(eras.map((era) => era.events.map((event) => event.year))).toEqual([
      [1969],
      [1970, 1989],
      [1990, 2009],
      [2010, 2019],
      [2020, 2026],
    ])
  })

  it("keeps every era, even one with no events", () => {
    const eras = groupEventsByEra([makeEvent(2024)])

    expect(eras).toHaveLength(5)
    expect(eras.map((era) => era.events.length)).toEqual([0, 0, 0, 0, 1])
  })

  it("numbers the chapters and gives each era a section id, short label and decade subtitle", () => {
    const eras = groupEventsByEra([])

    expect(eras.map((era) => [era.id, era.label, era.chapter, era.number, era.subtitle])).toEqual([
      ["the-foundation-era", "Foundation Era", "Chapter 1", "01", "1940s – 1960s"],
      ["the-knowledge-era", "Knowledge Era", "Chapter 2", "02", "1970s – 1980s"],
      ["the-learning-era", "Learning Era", "Chapter 3", "03", "1990s – 2000s"],
      ["the-deep-learning-revolution", "Deep Learning Revolution", "Chapter 4", "04", "2010s"],
      ["the-generative-ai-era", "Generative AI Era", "Chapter 5", "05", "2020s – Present"],
    ])
  })

  it("places every event in data/timeline-events.json in an era", () => {
    const events = parseTimelineEvents(timelineData)

    const eras = groupEventsByEra(events)

    expect(eras.flatMap((era) => era.events)).toEqual(events)
  })
})
