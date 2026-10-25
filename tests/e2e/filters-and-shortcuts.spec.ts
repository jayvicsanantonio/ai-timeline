// End-to-end tests for searching, filtering and the keyboard shortcuts on the real page in Chromium.
// Filters narrow every era and the activity rail at once, and J, K, the era numbers and / move the reader around.
import { expect, test, type Page } from "@playwright/test"
import timelineData from "../../data/timeline-events.json"
import { filterEvents } from "../../lib/timeline-filter"
import type { TimelineEvent } from "../../types/timeline"

const events = timelineData as TimelineEvent[]
const NO_MATCHES = "No events in this era match your search and filters."

// React marks hydrated DOM nodes with a fiber key; checks that depend on client
// effects wait for it so they cannot pass against the server-rendered HTML alone.
async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const main = document.getElementById("main-content")
    return main !== null && Object.keys(main).some((key) => key.startsWith("__reactFiber"))
  })
}

async function openPage(page: Page) {
  await page.goto("/")
  await waitForHydration(page)
}

test.describe("search and category filters", () => {
  test("narrows the whole timeline to a search and restores it when cleared", async ({ page }) => {
    await openPage(page)
    const matches = filterEvents(events, { categories: [], query: "chess" })

    await page.getByRole("searchbox", { name: "Search events" }).fill("chess")

    await expect(page.locator("article")).toHaveCount(matches.length)
    await expect(page.getByRole("status")).toHaveText(`Showing ${matches.length} of ${events.length} events`)

    await page.getByRole("button", { name: "Clear filters" }).click()

    await expect(page.locator("article")).toHaveCount(events.length)
    await expect(page.getByRole("searchbox", { name: "Search events" })).toHaveValue("")
  })

  test("shows only a picked category, and says so in each era without one", async ({ page }) => {
    await openPage(page)
    const agents = events.filter((event) => event.category === "Agents")

    await page.getByRole("button", { name: /^Categories/ }).click()
    await page.getByRole("group", { name: "Filter by category" }).getByRole("button", { name: /^Agents/ }).click()

    await expect(page.locator("article")).toHaveCount(agents.length)
    await expect(page.locator("#the-foundation-era")).toContainText(NO_MATCHES)
    await expect(page.locator("#the-generative-ai-era")).not.toContainText(NO_MATCHES)
    await expect(page.getByRole("button", { name: "Categories, 1 picked" })).toBeVisible()
  })

  test("keeps eras without matches to a short row, so the results start near the top", async ({ page }) => {
    await openPage(page)

    await page.getByRole("button", { name: /^Categories/ }).click()
    await page.getByRole("group", { name: "Filter by category" }).getByRole("button", { name: /^Agents/ }).click()

    const layout = await page.evaluate(() => {
      const sections = [...document.querySelectorAll("section[data-interface]")]
      return {
        emptyEraHeights: sections
          .filter((section) => !section.querySelector("article"))
          .map((section) => Math.round(section.getBoundingClientRect().height)),
        firstMatchBelowTimelineStart: Math.round(
          document.querySelector("article")!.getBoundingClientRect().top - sections[0].getBoundingClientRect().top,
        ),
      }
    })

    expect(layout.emptyEraHeights).toHaveLength(4)
    for (const height of layout.emptyEraHeights) {
      expect(height).toBeLessThan(200)
    }
    expect(layout.firstMatchBelowTimelineStart).toBeLessThan(1500)
  })

  test("brings the start of the results into view when filtering from further down", async ({ page }) => {
    await openPage(page)
    await page.locator("#the-generative-ai-era article").nth(80).evaluate((card) =>
      card.scrollIntoView({ behavior: "instant" as ScrollBehavior }),
    )

    await page.keyboard.press("/")
    await page.keyboard.type("turing")

    await expect.poll(() => page.locator("#the-foundation-era").evaluate((era) => Math.round(era.getBoundingClientRect().top))).toBeLessThan(120)
    await expect(page.getByRole("searchbox", { name: "Search events" })).toBeFocused()
  })

  test.describe("on a wide screen", () => {
    test.use({ viewport: { width: 1280, height: 800 } })

    test("leaves a ghost of the filtered-out events on the rail's chart", async ({ page }) => {
      await openPage(page)

      await page.getByRole("searchbox", { name: "Search events" }).fill("agent")
      await page.locator("#the-foundation-era").evaluate((era) => era.scrollIntoView({ behavior: "instant" as ScrollBehavior }))

      const rail = page.locator('nav[aria-label="Timeline chapter navigation"]').filter({ visible: true })
      const bar1956 = rail.locator('[data-year-bar][data-year="1956"]')
      await expect(bar1956.locator('[data-part="matching"]')).toHaveAttribute("style", /width: 0%/)
      await expect(bar1956.locator('[data-part="total"]')).not.toHaveAttribute("style", /width: 0%/)
    })
  })
})

test.describe("keyboard shortcuts", () => {
  // Some eras set titles in capitals, so links are matched by their whole title in any case
  function eventLink(page: Page, title: string) {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return page.getByRole("link", { name: new RegExp(`^${escaped}$`, "i") })
  }

  test("steps forward and back through the events with J and K", async ({ page }) => {
    await openPage(page)

    await page.keyboard.press("j")
    await expect(eventLink(page, events[0].title)).toBeFocused()

    await page.keyboard.press("j")
    const second = eventLink(page, events[1].title)
    await expect(second).toBeFocused()
    await expect
      .poll(() =>
        second.evaluate((link) => {
          const box = link.closest("article")!.getBoundingClientRect()
          return box.top >= 0 && box.bottom <= window.innerHeight
        }),
      )
      .toBe(true)

    await page.keyboard.press("k")
    await expect(eventLink(page, events[0].title)).toBeFocused()
  })

  test("jumps to an era's title with its number key, just below the toolbar", async ({ page }) => {
    await openPage(page)

    await page.keyboard.press("3")

    await expect(page.getByRole("heading", { level: 2, name: "The Learning Era" })).toBeFocused()
    const toolbarHeight = await page.getByRole("search").evaluate((search) => search.parentElement!.getBoundingClientRect().height)
    await expect
      .poll(() => page.locator("#the-learning-era").evaluate((era) => Math.round(era.getBoundingClientRect().top)))
      .toBe(Math.round(toolbarHeight))
  })

  test("focuses the search box with /", async ({ page }) => {
    await openPage(page)

    await page.keyboard.press("/")

    const search = page.getByRole("searchbox", { name: "Search events" })
    await expect(search).toBeFocused()
    await expect(search).toHaveValue("")
  })
})
