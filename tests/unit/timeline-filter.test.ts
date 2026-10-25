// Unit tests for narrowing the timeline by category and search words.
// Covers the unfiltered default, category picks, word matching across an event's fields, and both together.
import { describe, expect, it } from "vitest"
import { countEventsByCategory, filterEvents, isFiltering, matchesFilters, NO_FILTERS } from "@/lib/timeline-filter"
import { TIMELINE_CATEGORIES, type TimelineCategory, type TimelineEvent } from "@/types/timeline"

function makeEvent(overrides: Partial<TimelineEvent> & { title: string }): TimelineEvent {
  return {
    year: 2017,
    month: "June",
    description: "An event for the filter tests.",
    category: "Research Breakthroughs",
    link: `https://example.com/${encodeURIComponent(overrides.title)}`,
    ...overrides,
  }
}

const transformer = makeEvent({
  title: "Attention Is All You Need",
  description: "Google researchers introduce the Transformer architecture.",
  category: "Research Breakthroughs",
  year: 2017,
  month: "June",
})
const alphaGo = makeEvent({
  title: "AlphaGo Defeats Lee Sedol",
  description: "DeepMind's Go program beats one of the world's best players.",
  category: "Models & Architectures",
  year: 2016,
  month: "March",
})
const euAct = makeEvent({
  title: "EU AI Act Enters Into Force",
  description: "The European Union's risk-based AI law takes effect.",
  category: "Ethics & Policy",
  year: 2024,
  month: "August",
})
const godel = makeEvent({
  title: "A Proof Assistant Checks Gödel's Theorem",
  description: "An undated milestone.",
  category: "AI Tools",
  year: 1986,
  month: "Unknown",
})

const events = [alphaGo, transformer, euAct, godel]

function only(categories: TimelineCategory[], query = "") {
  return { categories, query }
}

describe("isFiltering", () => {
  it("is false with no categories picked and a blank query", () => {
    expect(isFiltering(NO_FILTERS)).toBe(false)
    expect(isFiltering(only([], "   "))).toBe(false)
  })

  it("is true once a category is picked or a word is typed", () => {
    expect(isFiltering(only(["Agents"]))).toBe(true)
    expect(isFiltering(only([], "go"))).toBe(true)
  })
})

describe("filterEvents", () => {
  it("returns every event, in order, when nothing is filtered", () => {
    expect(filterEvents(events, NO_FILTERS)).toEqual(events)
  })

  it("keeps only the picked categories", () => {
    expect(filterEvents(events, only(["Ethics & Policy"]))).toEqual([euAct])
    expect(filterEvents(events, only(["Ethics & Policy", "Models & Architectures"]))).toEqual([alphaGo, euAct])
  })

  it("matches words in the title or description, ignoring case and extra spaces", () => {
    expect(filterEvents(events, only([], "  TRANSFORMER "))).toEqual([transformer])
    expect(filterEvents(events, only([], "deepmind"))).toEqual([alphaGo])
  })

  it("needs every word to match somewhere in the event", () => {
    expect(filterEvents(events, only([], "attention google"))).toEqual([transformer])
    expect(filterEvents(events, only([], "attention deepmind"))).toEqual([])
  })

  it("matches the year, the month and the category name too", () => {
    expect(filterEvents(events, only([], "2024"))).toEqual([euAct])
    expect(filterEvents(events, only([], "march"))).toEqual([alphaGo])
    expect(filterEvents(events, only([], "policy"))).toEqual([euAct])
  })

  it("does not match the placeholder month of undated events", () => {
    expect(filterEvents(events, only([], "unknown"))).toEqual([])
  })

  it("ignores accents, so plain letters find accented names", () => {
    expect(filterEvents(events, only([], "godel"))).toEqual([godel])
  })

  it("applies the categories and the words together", () => {
    expect(filterEvents(events, only(["Research Breakthroughs", "Ethics & Policy"], "law"))).toEqual([euAct])
    expect(filterEvents(events, only(["Research Breakthroughs"], "law"))).toEqual([])
  })
})

describe("matchesFilters", () => {
  it("agrees with filterEvents for a single event", () => {
    expect(matchesFilters(alphaGo, only(["Models & Architectures"], "sedol"))).toBe(true)
    expect(matchesFilters(alphaGo, only(["Agents"], "sedol"))).toBe(false)
  })
})

describe("countEventsByCategory", () => {
  it("counts the events in every category, including categories with none", () => {
    const counts = countEventsByCategory(events)

    expect(Object.keys(counts)).toEqual([...TIMELINE_CATEGORIES])
    expect(counts["Research Breakthroughs"]).toBe(1)
    expect(counts["Models & Architectures"]).toBe(1)
    expect(counts["Ethics & Policy"]).toBe(1)
    expect(counts["AI Tools"]).toBe(1)
    expect(counts.Agents).toBe(0)
  })
})
