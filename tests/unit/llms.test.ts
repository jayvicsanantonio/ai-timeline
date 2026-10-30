// Unit tests for the Markdown that AI agents and language models read: llms.txt, which summarizes the site and its eras,
// and llms-full.txt, which writes out every event by era and year with its date, category and source.
import { describe, expect, it } from "vitest"
import timelineData from "@/data/timeline-events.json"
import { groupEventsByEra } from "@/lib/eras"
import { llmsFullTxt, llmsTxt } from "@/lib/llms"
import { SITE_URL, siteDescription } from "@/lib/site"
import { parseTimelineEvents } from "@/lib/timeline-events"
import { TIMELINE_CATEGORIES, type TimelineEvent } from "@/types/timeline"

const events = parseTimelineEvents(timelineData)

const neuron: TimelineEvent = {
  year: 1943,
  month: "December",
  title: "McCulloch-Pitts Neuron",
  description: "The first mathematical model of a neural network.",
  category: "Research Breakthroughs",
  link: "https://example.com/neuron",
  landmark: true,
}

const perceptron: TimelineEvent = {
  year: 1958,
  month: "Unknown",
  title: "Perceptron",
  description: "A machine that learns to recognize patterns.",
  category: "Models & Architectures",
  link: "https://example.com/perceptron",
}

const chatbot: TimelineEvent = {
  year: 2022,
  month: "November",
  title: "ChatGPT",
  description: "A chatbot reaches a hundred million people.",
  category: "Public Releases",
  link: "https://example.com/chatgpt",
}

describe("llmsTxt", () => {
  const text = llmsTxt(events)

  it("opens with the site's name and its description as a summary", () => {
    expect(text.startsWith(`# The AI Timeline\n\n> ${siteDescription(events)}\n`)).toBe(true)
  })

  it("names every era with its years, event count and description", () => {
    for (const era of groupEventsByEra(events)) {
      expect(text).toContain(`- ${era.name} (${era.subtitle}, ${era.events.length} events): ${era.description}`)
    }
  })

  it("names every category", () => {
    expect(text).toContain(`Categories: ${TIMELINE_CATEGORIES.join(", ")}.`)
  })

  it("links to every event in Markdown and to the interactive timeline", () => {
    expect(text).toContain(`- [Every event in Markdown](${SITE_URL}/llms-full.txt): `)
    expect(text).toContain(`- [The interactive timeline](${SITE_URL}/): `)
  })

  it("ends with a single newline", () => {
    expect(text).toMatch(/[^\n]\n$/)
  })
})

describe("llmsFullTxt", () => {
  it("writes out each event under its era and year, with its date, category and source", () => {
    const text = llmsFullTxt([neuron, perceptron, chatbot])

    expect(text).toContain(
      [
        "## The Foundation Era (1940s – 1960s)",
        "",
        groupEventsByEra([neuron])[0].description,
        "",
        "### 1943",
        "",
        "- McCulloch-Pitts Neuron (December 1943, Research Breakthroughs, landmark)",
        "  The first mathematical model of a neural network.",
        "  Source: https://example.com/neuron",
        "",
        "### 1958",
        "",
        "- Perceptron (1958, Models & Architectures)",
        "  A machine that learns to recognize patterns.",
        "  Source: https://example.com/perceptron",
        "",
        "## The Knowledge Era (1970s – 1980s)",
      ].join("\n"),
    )
    expect(text).toContain(
      ["### 2022", "", "- ChatGPT (November 2022, Public Releases)"].join("\n"),
    )
  })

  it("opens with the site's name and description, and points to the interactive timeline", () => {
    const text = llmsFullTxt(events)

    expect(text.startsWith(`# The AI Timeline\n\n> ${siteDescription(events)}\n`)).toBe(true)
    expect(text).toContain(`${SITE_URL}/`)
  })

  it("lists every event of the real data once, with its source", () => {
    const text = llmsFullTxt(events)

    expect(text.match(/^- /gm)).toHaveLength(events.length)
    for (const event of events) {
      expect(text).toContain(`  Source: ${event.link}\n`)
    }
  })

  it("heads every era in order", () => {
    const headings = llmsFullTxt(events).match(/^## .+$/gm)

    expect(headings).toEqual(groupEventsByEra(events).map((era) => `## ${era.name} (${era.subtitle})`))
  })

  it("ends with a single newline", () => {
    expect(llmsFullTxt(events)).toMatch(/[^\n]\n$/)
  })
})
