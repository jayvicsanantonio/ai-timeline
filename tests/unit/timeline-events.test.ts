// Unit tests for turning the raw timeline JSON into typed TimelineEvent objects.
// Covers the category list, the real dataset and its ordering, and rejection of unknown categories.
import { describe, expect, test } from "vitest"
import timelineData from "@/data/timeline-events.json"
import { groupEventsByEra } from "@/lib/eras"
import { parseTimelineEvents } from "@/lib/timeline-events"
import { groupEventsByYear, isBusyYear } from "@/lib/year-groups"
import { TIMELINE_CATEGORIES } from "@/types/timeline"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

// Unknown months sort after December, so they come last within their year.
function monthRank(month: string) {
  return month === "Unknown" ? MONTHS.length : MONTHS.indexOf(month)
}

const validEvent = {
  year: 2017,
  month: "June",
  title: "Attention Is All You Need",
  description: "The Transformer architecture is introduced.",
  category: "Models & Architectures",
  link: "https://arxiv.org/abs/1706.03762",
}

describe("TIMELINE_CATEGORIES", () => {
  test("lists every category used by the timeline", () => {
    expect(TIMELINE_CATEGORIES).toEqual([
      "Models & Architectures",
      "Research Breakthroughs",
      "Public Releases",
      "Ethics & Policy",
      "Hardware Advances",
      "Companies & Investments",
      "AI Tools",
      "Bombshell News",
      "Agents",
    ])
  })
})

describe("parseTimelineEvents", () => {
  test("accepts every event in data/timeline-events.json unchanged", () => {
    expect(parseTimelineEvents(timelineData)).toEqual(timelineData)
  })

  test("accepts each known category", () => {
    for (const category of TIMELINE_CATEGORIES) {
      expect(parseTimelineEvents([{ ...validEvent, category }])).toEqual([{ ...validEvent, category }])
    }
  })

  test("throws on an unknown category and names the event", () => {
    expect(() => parseTimelineEvents([{ ...validEvent, category: "Gossip" }])).toThrow(
      'Unknown timeline category "Gossip" on "Attention Is All You Need"',
    )
  })
})

describe("data/timeline-events.json", () => {
  test("uses a full month name or Unknown for every event", () => {
    const badMonths = timelineData
      .filter((event) => event.month !== "Unknown" && !MONTHS.includes(event.month))
      .map((event) => `${event.month} on "${event.title}"`)
    expect(badMonths).toEqual([])
  })

  test("is sorted by year, then by month, with Unknown months last within a year", () => {
    const outOfOrder = timelineData.slice(1).flatMap((event, index) => {
      const previous = timelineData[index]
      const inOrder =
        previous.year < event.year ||
        (previous.year === event.year && monthRank(previous.month) <= monthRank(event.month))
      return inOrder
        ? []
        : [`"${previous.title}" (${previous.month} ${previous.year}) comes before "${event.title}" (${event.month} ${event.year})`]
    })
    expect(outOfOrder).toEqual([])
  })

  // The 2020s hold most events by far, so the earlier eras keep enough of their own to read as chapters
  test("gives every era before the 2020s at least 20 events", () => {
    const eras = groupEventsByEra(parseTimelineEvents(timelineData))

    const thinEras = eras
      .slice(0, -1)
      .filter((era) => era.events.length < 20)
      .map((era) => `${era.name} has ${era.events.length}`)
    expect(thinEras).toEqual([])
  })

  test("gives every event its own link", () => {
    const titlesByLink = new Map<string, string[]>()
    for (const event of timelineData) {
      titlesByLink.set(event.link, [...(titlesByLink.get(event.link) ?? []), event.title])
    }
    const sharedLinks = [...titlesByLink].filter(([, titles]) => titles.length > 1)
    expect(sharedLinks).toEqual([])
  })

  test("gives every event its own title", () => {
    const titles = timelineData.map((event) => event.title.toLowerCase())
    expect(titles.filter((title, index) => titles.indexOf(title) !== index)).toEqual([])
  })

  // The same story added twice under a new title and link, like a second "Hebb" or "SNARC" card, passes the
  // tests above. Before 2020 an era holds a few events a year, so two events at most a year apart whose
  // titles alone share a name are one story told twice, unless approved here. From 2020 on, sequels such as
  // DALL-E 2 or Sora 2 share names with their first versions all the time, so the check stops there.
  test("tells no story twice before 2020", () => {
    const earlyEvents = timelineData.filter((event) => event.year < 2020)
    const words = (title: string) =>
      new Set(
        (title.toLowerCase().match(/[a-z0-9][a-z0-9.-]*[a-z0-9]/g) ?? []).filter(
          (word) => word.length >= 4 && word !== "breakthrough",
        ),
      )
    const titleCounts = new Map<string, number>()
    for (const event of timelineData) {
      for (const word of words(event.title)) {
        titleCounts.set(word, (titleCounts.get(word) ?? 0) + 1)
      }
    }

    const sameStory = earlyEvents.flatMap((event, index) =>
      earlyEvents
        .slice(index + 1)
        .filter(
          (other) =>
            Math.abs(other.year - event.year) <= 1 &&
            [...words(event.title)].some((word) => words(other.title).has(word) && titleCounts.get(word) === 2),
        )
        .map((other) => `${event.title} / ${other.title}`),
    )
    expect(sameStory).toEqual(["AlphaGo Defeats Lee Sedol / AlphaGo Zero"])
  })

  test("marks the approved turning points as landmarks, and nothing else", () => {
    const landmarks = timelineData.filter((event) => "landmark" in event)

    expect(landmarks.map((event) => event.title)).toEqual([
      "McCulloch-Pitts Neuron",
      "The Turing Test",
      "Dartmouth AI Conference",
      "Rosenblatt's Perceptron",
      "The First AI Winter Begins",
      "Backpropagation Popularized",
      "The Second AI Winter Begins",
      "IBM Deep Blue Defeats Garry Kasparov",
      "ImageNet Database Created",
      "ImageNet Breakthrough",
      "AlphaGo Defeats Lee Sedol",
      "Attention Is All You Need",
      "Reinforcement Learning From Human Feedback",
      "Scaling Laws for Language Models",
      "OpenAI Releases GPT-3",
      "DeepMind's AlphaFold 2 Solves Protein Folding",
      "ChatGPT Takes the World by Storm",
      "OpenAI Releases GPT-4",
      "EU AI Act Takes Effect",
      "OpenAI Releases o1",
      "Hopfield and Hinton Win the Nobel Prize in Physics",
      "DeepSeek-R1 Shakes the AI Industry",
      "AI Reaches Gold-Medal Level at the Math Olympiad",
    ])
    expect(landmarks.every((event) => (event as { landmark?: unknown }).landmark === true)).toBe(true)
  })

  test("marks the approved highlights of the busy years, and nothing else", () => {
    const highlights = timelineData.filter((event) => "highlight" in event)

    expect(highlights.map((event) => event.title)).toEqual([
      "OpenAI's InstructGPT Learns to Follow Instructions",
      "OpenAI Releases DALL-E 2",
      "Stable Diffusion Public Release",
      "U.S. Restricts AI Chip Exports to China",
      "Anthropic Releases Claude",
      "Meta Releases Llama 2",
      "President Biden's Executive Order on AI",
      "Google Launches Gemini 1.0",
      "OpenAI Releases GPT-4o",
      "DeepMind Researchers Win Nobel Prize",
      "Anthropic Releases Claude Code in Research Preview",
      "OpenAI Releases GPT-5",
      "Google Releases Gemini 3",
      "Anthropic Launches Project Glasswing with Claude Mythos Preview",
      "Google Unveils Gemini 3.5 at I/O",
      "OpenAI's AI Agents Breach Hugging Face During an Evaluation",
      "Anthropic Releases Claude Opus 5",
      "OpenAI Releases GPT-6 Astra",
    ])
    expect(highlights.every((event) => (event as { highlight?: unknown }).highlight === true)).toBe(true)
    expect(highlights.filter((event) => "landmark" in event)).toEqual([])
  })

  // A highlight only matters where the rest of the year is listed in brief
  test("keeps five events at full size in every busy year, and highlights nothing in the others", () => {
    const fullSizeByBusyYear = groupEventsByYear(parseTimelineEvents(timelineData)).flatMap((group) => {
      const fullSize = group.events.filter((event) => event.landmark || event.highlight)
      if (!isBusyYear(group.events)) {
        expect(group.events.filter((event) => event.highlight), String(group.year)).toEqual([])
        return []
      }
      return [[group.year, fullSize.length]]
    })

    expect(fullSizeByBusyYear).toEqual([
      [2022, 5],
      [2023, 5],
      [2024, 5],
      [2025, 5],
      [2026, 5],
    ])
  })
})
