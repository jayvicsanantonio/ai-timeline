// Unit tests for YearCluster grouping and Keystone Landmark classification in lib/landmarks.ts.
import { describe, expect, it } from "vitest"
import { groupEventsByYear, isLandmarkEvent } from "@/lib/landmarks"
import type { TimelineEvent } from "@/types/timeline"

function makeEvent(year: number, month: string, title: string): TimelineEvent {
  return {
    year,
    month,
    title,
    description: `Milestone: ${title}`,
    category: "Research Breakthroughs",
    link: "https://arxiv.org/abs/1706.03762",
  }
}

describe("isLandmarkEvent", () => {
  it("identifies foundational AI inflection points as keystone landmarks", () => {
    expect(isLandmarkEvent(makeEvent(1950, "October", "The Turing Test"))).toBe(true)
    expect(isLandmarkEvent(makeEvent(2017, "June", "Attention Is All You Need"))).toBe(true)
    expect(isLandmarkEvent(makeEvent(2022, "November", "OpenAI Launches ChatGPT"))).toBe(true)
    expect(isLandmarkEvent(makeEvent(2024, "March", "Minor Point Update"))).toBe(false)
  })
})

describe("groupEventsByYear", () => {
  it("groups sequential events by year, computes temporal intervals, and tallies monthly activity", () => {
    const events = [
      makeEvent(1950, "October", "The Turing Test"),
      makeEvent(1956, "June", "Dartmouth AI Conference"),
      makeEvent(1956, "August", "Logic Theorist"),
    ]

    const clusters = groupEventsByYear(events)

    expect(clusters).toHaveLength(2)
    expect(clusters[0].year).toBe(1950)
    expect(clusters[0].yearGap).toBeNull()
    expect(clusters[0].landmarkCount).toBe(1)
    expect(clusters[0].monthCounts[9]).toBe(1)

    expect(clusters[1].year).toBe(1956)
    expect(clusters[1].yearGap).toBe(6)
    expect(clusters[1].events).toHaveLength(2)
    expect(clusters[1].monthCounts[5]).toBe(1)
    expect(clusters[1].monthCounts[7]).toBe(1)
  })
})
