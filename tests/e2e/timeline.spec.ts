// End-to-end tests for the timeline page in a real Next.js server: error-free loading with and without reduced
// motion, cards that settle in place, card dates, the opening's events-per-year chart and its landmark dots, and an insight stat.
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

test("dots each landmark's year on the opening chart and the chapter rail", async ({ page }) => {
  const landmarkYears = [...new Set(timelineData.filter((event) => "landmark" in event).map((event) => event.year))]
  const dottedYears = (chart: ReturnType<Page["locator"]>) =>
    chart
      .locator('[data-year-bar]:has([data-part="landmark"])')
      .evaluateAll((bars) => bars.map((bar) => Number((bar as HTMLElement).dataset.year)))

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")

  await expect(page.getByRole("figure")).toContainText("Gold dots mark the years with a landmark.")
  expect(await dottedYears(page.getByRole("figure"))).toEqual(landmarkYears)
  // The rail stays hidden until the reader reaches the timeline, and the phone's bar is hidden on a wide screen
  const rail = page.getByRole("navigation", { name: "Timeline chapter navigation", includeHidden: true }).first()
  expect(await dottedYears(rail.locator('[data-orientation="vertical"]'))).toEqual(landmarkYears)
})

test("jumps to a year's first event from its bar in the opening chart, as the chart's hint says", async ({ page }) => {
  const year = 1956
  const firstOfYear = timelineData.find((event) => event.year === year)!
  // Some eras set titles in capitals, so the link is matched by its whole title in any case
  const escapedTitle = firstOfYear.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  await page.goto("/")

  const chart = page.getByRole("figure")
  await expect(chart).toContainText("Click a bar to jump to that year.")
  // The bars answer clicks once the page hydrates, so the first click repeats until it lands
  await expect(async () => {
    await chart.locator(`[data-year-bar][data-year="${year}"]`).click()
    await expect(page.getByRole("link", { name: new RegExp(`^${escapedTitle}$`, "i") })).toBeFocused({ timeout: 1000 })
  }).toPass({ timeout: 15_000 })
})

test("compares the Agentic Era's events a year with the Generative AI Era's in Timeline Insights, from the real events", async ({ page }) => {
  const latest = timelineData.filter((event) => event.year >= 2025)
  const latestRate = latest.length / (Math.max(...latest.map((event) => event.year)) - 2025 + 1)
  const previousRate = timelineData.filter((event) => event.year >= 2020 && event.year < 2025).length / 5
  const oneDecimal = (value: number) => Math.round(value * 10) / 10

  await page.goto("/")

  const statLabel = page.getByText(
    `${oneDecimal(latestRate)} events a year in the Agentic Era, against ${oneDecimal(previousRate)} in the Generative AI Era`,
    { exact: true },
  )
  await statLabel.scrollIntoViewIfNeeded()
  await expect(statLabel.locator("xpath=preceding-sibling::div[1]")).toHaveText(`${oneDecimal(latestRate / previousRate)}×`)
})
