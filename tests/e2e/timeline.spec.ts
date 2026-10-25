// End-to-end tests for the timeline page in a real Next.js server: error-free loading with and without reduced
// motion, cards that settle in place, card dates, the opening's events-per-year chart and the insight stats.
import { expect, test, type Page } from "@playwright/test"
import timelineData from "../../data/timeline-events.json"

// Loads the page, scrolls through all of it, and returns every console error and uncaught page error.
async function loadAndScrollTimeline(page: Page) {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.message))

  await page.goto("/")
  await expect(page.locator("section").first()).toBeVisible()

  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  })

  return errors
}

// Lists each event card that is still faded or offset from its resting place. A finished entrance
// leaves an identity matrix rather than "none", which places the card just the same.
function unsettledCards(page: Page) {
  return page.locator("article").evaluateAll((cards) =>
    cards.flatMap((card, index) => {
      const style = getComputedStyle(card)
      return style.opacity !== "1" || !new DOMMatrix(style.transform).isIdentity ? [`card ${index}`] : []
    }),
  )
}

test("loads and scrolls the whole timeline without console or page errors", async ({ page }) => {
  expect(await loadAndScrollTimeline(page)).toEqual([])
})

test("settles each card fully in place once it has scrolled into view", async ({ page }) => {
  await page.goto("/")

  const card = page.locator("#the-learning-era article").nth(3)
  await card.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior }))

  await expect
    .poll(() =>
      card.evaluate((element) => {
        const style = getComputedStyle(element)
        return style.opacity === "1" && new DOMMatrix(style.transform).isIdentity
      }),
    )
    .toBe(true)
})

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" })

  test("hydrates and scrolls the whole timeline without console or page errors", async ({ page }) => {
    expect(await loadAndScrollTimeline(page)).toEqual([])
  })

  test("shows every timeline card at once, without moving them in", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("article").first()).toBeAttached()

    expect(await unsettledCards(page)).toEqual([])
  })
})

test("shows only the year on cards whose month is unknown", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 3, name: "Kismet the Robot" })).toBeAttached()

  await expect(page.getByText(/Unknown/)).toHaveCount(0)
})

test("charts every year from the first event to the last, and labels the busiest one", async ({ page }) => {
  const years = timelineData.map((event) => event.year)
  const firstYear = Math.min(...years)
  const lastYear = Math.max(...years)
  const countsByYear = new Map<number, number>()
  years.forEach((year) => countsByYear.set(year, (countsByYear.get(year) ?? 0) + 1))
  const [busiestYear, busiestCount] = [...countsByYear].reduce((best, entry) => (entry[1] > best[1] ? entry : best))

  await page.goto("/")

  const chart = page.getByRole("figure")
  await expect(chart.locator("[data-year-bar]")).toHaveCount(lastYear - firstYear + 1)
  await expect(chart).toContainText(`${busiestCount} events in ${busiestYear}`)
})

test("computes the 2010-or-later share in Timeline Insights from the real events", async ({ page }) => {
  const recentCount = timelineData.filter((event) => event.year >= 2010).length
  const expectedShare = `${Math.round((recentCount / timelineData.length) * 100)}%`

  await page.goto("/")

  const statLabel = page.getByText(`of the ${timelineData.length} events happened in 2010 or later`, { exact: true })
  await statLabel.scrollIntoViewIfNeeded()
  await expect(statLabel.locator("xpath=preceding-sibling::div[1]")).toHaveText(expectedShare)
})
