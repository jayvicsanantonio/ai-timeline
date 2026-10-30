// Integration tests for the routes that serve /llms.txt and /llms-full.txt from the real timeline data.
// Both are prerendered as plain text, and the full listing names the page as its canonical version for search engines.
import { describe, expect, it } from "vitest"
import * as llmsFullRoute from "@/app/llms-full.txt/route"
import * as llmsRoute from "@/app/llms.txt/route"
import timelineData from "@/data/timeline-events.json"
import { llmsFullTxt, llmsTxt } from "@/lib/llms"
import { SITE_URL } from "@/lib/site"
import { parseTimelineEvents } from "@/lib/timeline-events"

const events = parseTimelineEvents(timelineData)

describe("/llms.txt", () => {
  it("is rendered once at build time", () => {
    expect(llmsRoute.dynamic).toBe("force-static")
  })

  it("serves the site's summary as plain UTF-8 text", async () => {
    const response = llmsRoute.GET()

    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8")
    expect(await response.text()).toBe(llmsTxt(events))
  })
})

describe("/llms-full.txt", () => {
  it("is rendered once at build time", () => {
    expect(llmsFullRoute.dynamic).toBe("force-static")
  })

  it("serves every event as plain UTF-8 text", async () => {
    const response = llmsFullRoute.GET()

    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8")
    expect(await response.text()).toBe(llmsFullTxt(events))
  })

  it("names the home page as its canonical version, so search engines list the page instead of the text", () => {
    expect(llmsFullRoute.GET().headers.get("Link")).toBe(`<${SITE_URL}/>; rel="canonical"`)
  })
})
