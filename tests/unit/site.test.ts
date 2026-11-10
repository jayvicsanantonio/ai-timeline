// Unit tests for how the site describes itself to search engines and link previews: its address, title,
// description, page metadata and structured data, with the event count and years taken from the timeline data.
import { describe, expect, it } from "vitest"
import timelineData from "@/data/timeline-events.json"
import {
  SITE_NAME,
  SITE_URL,
  jsonLd,
  siteDescription,
  siteMetadata,
  siteTitle,
  websiteStructuredData,
} from "@/lib/site"
import { parseTimelineEvents } from "@/lib/timeline-events"
import type { TimelineEvent } from "@/types/timeline"

function eventsIn(...years: number[]): TimelineEvent[] {
  return years.map((year, index) => ({
    year,
    month: "Unknown",
    title: `Event ${index + 1}`,
    description: "An event for the site tests.",
    category: "Public Releases",
    link: `https://example.com/${index + 1}`,
  }))
}

const events = parseTimelineEvents(timelineData)

describe("SITE_URL", () => {
  it("is the production address over https, with no trailing slash to double up when paths are added", () => {
    expect(SITE_URL).toBe("https://ai-timeline.pokemoncenter.dev")
  })
})

describe("siteTitle", () => {
  it("names the site and the years its events span", () => {
    expect(siteTitle(eventsIn(1950, 1956, 1962))).toBe(
      "The AI Timeline: A History of Artificial Intelligence, 1950–1962",
    )
  })

  it("fits in a search result for the real data", () => {
    expect(siteTitle(events).length).toBeLessThanOrEqual(65)
  })
})

describe("siteDescription", () => {
  it("counts the events and names the years they span", () => {
    expect(siteDescription(eventsIn(1950, 1956, 1962))).toBe(
      "Explore 3 milestones in the history of artificial intelligence from 1950 to 1962, each era drawn in the interface of its day, from punch cards to AI agents.",
    )
  })

  it("fits in a search result snippet for the real data", () => {
    expect(siteDescription(events).length).toBeLessThanOrEqual(160)
  })
})

describe("siteMetadata", () => {
  const metadata = siteMetadata(events)

  it("resolves its links against the production address and names it as the canonical page", () => {
    expect(metadata.metadataBase).toEqual(new URL(SITE_URL))
    expect(metadata.alternates).toEqual({ canonical: "/" })
  })

  it("gives search results the site's title and description", () => {
    expect(metadata.title).toBe(siteTitle(events))
    expect(metadata.description).toBe(siteDescription(events))
  })

  it("describes the page as a website for link previews", () => {
    expect(metadata.openGraph).toEqual({
      type: "website",
      url: "/",
      siteName: SITE_NAME,
      title: siteTitle(events),
      description: siteDescription(events),
      locale: "en_US",
    })
  })

  it("asks for a large image in X's link preview", () => {
    expect(metadata.twitter).toEqual({ card: "summary_large_image" })
  })
})

describe("websiteStructuredData", () => {
  it("describes the site as a schema.org WebSite at its home page", () => {
    expect(websiteStructuredData(events)).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: siteDescription(events),
      inLanguage: "en",
    })
  })
})

describe("jsonLd", () => {
  it("serializes the data as JSON", () => {
    expect(JSON.parse(jsonLd({ name: SITE_NAME }))).toEqual({ name: SITE_NAME })
  })

  it("escapes every < so no value can close the script tag that holds it", () => {
    const serialized = jsonLd({ name: "</script><script>alert(1)</script>" })

    expect(serialized).not.toContain("<")
    expect(JSON.parse(serialized)).toEqual({ name: "</script><script>alert(1)</script>" })
  })
})
