// Unit tests for turning the raw timeline JSON into typed TimelineEvent objects.
// Covers the category list, the real dataset and its ordering, and rejection of unknown categories.
import { describe, expect, test } from "vitest"
import timelineData from "@/data/timeline-events.json"
import { parseTimelineEvents } from "@/lib/timeline-events"
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

  test("gives every event its own link", () => {
    const titlesByLink = new Map<string, string[]>()
    for (const event of timelineData) {
      titlesByLink.set(event.link, [...(titlesByLink.get(event.link) ?? []), event.title])
    }
    const sharedLinks = [...titlesByLink].filter(([, titles]) => titles.length > 1)
    expect(sharedLinks).toEqual([])
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
      "IBM Deep Blue Defeats Garry Kasparov",
      "ImageNet Database Created",
      "ImageNet Breakthrough",
      "AlphaGo Defeats Lee Sedol",
      "Attention Is All You Need",
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
})
