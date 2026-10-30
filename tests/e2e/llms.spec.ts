// End-to-end tests for what AI agents and language models read from the production build:
// /llms.txt, which summarizes the site, and /llms-full.txt, which holds every event at a fraction of the page's size.
import { expect, test } from "@playwright/test"
import timelineData from "../../data/timeline-events.json"
import { SITE_URL } from "../../lib/site"

test("llms.txt summarizes the site and links to every event in Markdown", async ({ request }) => {
  const response = await request.get("/llms.txt")
  expect(response.status()).toBe(200)
  expect(response.headers()["content-type"]).toBe("text/plain; charset=utf-8")

  const text = await response.text()
  expect(text.startsWith("# The AI Timeline\n\n> ")).toBe(true)
  expect(text).toContain(`(${SITE_URL}/llms-full.txt)`)
})

test("llms-full.txt lists every event with its source, at a fraction of the page's size", async ({ request }) => {
  const response = await request.get("/llms-full.txt")
  expect(response.status()).toBe(200)
  expect(response.headers()["content-type"]).toBe("text/plain; charset=utf-8")
  expect(response.headers()["link"]).toBe(`<${SITE_URL}/>; rel="canonical"`)

  const text = await response.text()
  for (const event of timelineData) {
    expect(text).toContain(`  Source: ${event.link}\n`)
  }

  const page = await (await request.get("/")).text()
  expect(text.length).toBeLessThan(page.length / 5)
})
