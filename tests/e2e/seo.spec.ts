// End-to-end tests for what search engines and link previews read from the production build:
// the head tags, the structured data, robots.txt, the sitemap, the favicon and the preview image.
import { expect, test } from "@playwright/test"
import timelineData from "../../data/timeline-events.json"
import { SITE_NAME, SITE_URL, siteDescription, siteTitle, websiteStructuredData } from "../../lib/site"
import { parseTimelineEvents } from "../../lib/timeline-events"

const events = parseTimelineEvents(timelineData)

// The head links to the production address, so its files are fetched from the local build by their path
function localPath(url: string) {
  const { pathname, search } = new URL(url)
  return `${pathname}${search}`
}

test("the home page gives search results its title, description and canonical address", async ({ page }) => {
  await page.goto("/")

  await expect(page).toHaveTitle(siteTitle(events))
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", siteDescription(events))
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", SITE_URL)
})

test("the home page describes itself for link previews", async ({ page }) => {
  await page.goto("/")

  const meta = (property: string) => page.locator(`meta[property="${property}"], meta[name="${property}"]`)
  await expect(meta("og:type")).toHaveAttribute("content", "website")
  await expect(meta("og:url")).toHaveAttribute("content", SITE_URL)
  await expect(meta("og:site_name")).toHaveAttribute("content", SITE_NAME)
  await expect(meta("og:title")).toHaveAttribute("content", siteTitle(events))
  await expect(meta("og:description")).toHaveAttribute("content", siteDescription(events))
  await expect(meta("og:image:alt")).toHaveAttribute("content", /\S/)
  await expect(meta("og:image:width")).toHaveAttribute("content", "1200")
  await expect(meta("og:image:height")).toHaveAttribute("content", "630")
  await expect(meta("twitter:card")).toHaveAttribute("content", "summary_large_image")
})

test("the preview image is a 1200 by 630 PNG at the production address", async ({ page, request }) => {
  await page.goto("/")

  const imageUrl = await page.locator('meta[property="og:image"]').getAttribute("content")
  expect(imageUrl).toMatch(new RegExp(`^${SITE_URL}/opengraph-image`))

  const response = await request.get(localPath(imageUrl!))
  expect(response.status()).toBe(200)
  expect(response.headers()["content-type"]).toBe("image/png")

  // A PNG's header chunk holds its width and height as 32-bit numbers from byte 16
  const png = await response.body()
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
})

test("the home page describes the site as structured data", async ({ page }) => {
  await page.goto("/")

  const scripts = page.locator('script[type="application/ld+json"]')
  await expect(scripts).toHaveCount(1)
  expect(JSON.parse((await scripts.textContent()) ?? "")).toEqual(websiteStructuredData(events))
})

test("the favicon is an SVG", async ({ page, request }) => {
  await page.goto("/")

  const iconUrl = await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute("href")
  const response = await request.get(iconUrl!)
  expect(response.status()).toBe(200)
  expect(response.headers()["content-type"]).toBe("image/svg+xml")
})

test("robots.txt lets every crawler in and points to the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt")
  expect(response.status()).toBe(200)

  const robots = await response.text()
  expect(robots).toContain("User-Agent: *\nAllow: /")
  expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)
})

test("the sitemap lists the home page at the production address", async ({ request }) => {
  const response = await request.get("/sitemap.xml")
  expect(response.status()).toBe(200)
  expect(response.headers()["content-type"]).toContain("application/xml")
  expect(await response.text()).toContain(`<loc>${SITE_URL}/</loc>`)
})
