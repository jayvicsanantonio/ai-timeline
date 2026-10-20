// Unit tests for turning the raw timeline JSON into typed TimelineEvent objects.
// Covers the category list, the real dataset, and rejection of unknown categories.
import { describe, expect, test } from "vitest"
import timelineData from "@/data/timeline-events.json"
import { parseTimelineEvents } from "@/lib/timeline-events"
import { TIMELINE_CATEGORIES } from "@/types/timeline"

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
