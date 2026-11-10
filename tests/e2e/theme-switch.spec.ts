// End-to-end tests for the theme switch on the real page in Chromium: the page opens on the classic timeline, Pokémon-ify
// turns it into the Pokémon adventure and Back to classic returns, the choice outlasts a reload, a link can ask for a theme,
// and switching keeps the reader at the event they were reading.
import { expect, test } from "@playwright/test"
import timelineData from "../../data/timeline-events.json"
import { eventAnchorId } from "../../lib/event-format"
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "../../lib/theme"

const themeRoot = "[data-theme-root]"

test("opens on the classic timeline, with nothing of the Pokémon theme loaded", async ({ page }) => {
  const sprites: string[] = []
  page.on("request", (request) => {
    if (request.url().includes("/sprites/")) sprites.push(request.url())
  })
  await page.goto("/")

  await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", "classic")
  await expect(page.locator("html")).toHaveAttribute(THEME_ATTRIBUTE, "classic")
  await expect(page.locator("section[data-interface]")).toHaveCount(6)
  await expect(page.locator("[data-dex-card]")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Pokémon-ify" }).first()).toBeVisible()
  await page.waitForLoadState("networkidle")
  expect(sprites).toEqual([])
})

test("turns into the Pokémon adventure on Pokémon-ify, back on Back to classic, and remembers the choice", async ({ page }) => {
  await page.goto("/")

  await page.locator('[data-theme-switch="bar"]').click()
  await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", "pokemon")
  await expect(page.locator("section[data-generation]")).toHaveCount(6)
  await expect(page.locator("section[data-interface]")).toHaveCount(0)
  expect(await page.evaluate((key) => window.localStorage.getItem(key), THEME_STORAGE_KEY)).toBe("pokemon")

  await page.reload()
  await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", "pokemon")
  await expect(page.locator("html")).toHaveAttribute(THEME_ATTRIBUTE, "pokemon")

  await page.locator('[data-theme-switch="bar"]').click()
  await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", "classic")
  await page.reload()
  await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", "classic")
})

test("never flashes the classic page when it comes up in the Pokémon theme", async ({ page }) => {
  await page.addInitScript((key) => window.localStorage.setItem(key, "pokemon"), THEME_STORAGE_KEY)
  // Holds the page's scripts back, so the prerendered classic page is all there is until they run
  await page.route("**/_next/static/chunks/**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await route.continue()
  })
  await page.goto("/", { waitUntil: "commit" })

  const classic = page.locator('[data-theme-root="classic"]')
  await expect(classic).toBeAttached()
  await expect(page.locator("html")).toHaveAttribute(THEME_ATTRIBUTE, "pokemon")
  expect(await classic.evaluate((root) => getComputedStyle(root).visibility)).toBe("hidden")

  await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", "pokemon")
  await expect(page.locator(themeRoot)).toBeVisible()
})

test("opens in the theme a link asks for", async ({ page }) => {
  await page.goto("/?theme=pokemon")
  await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", "pokemon")

  await page.goto("/?theme=classic")
  await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", "classic")
})

test.describe("on a wide screen", () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test("keeps the switch at hand only once the bar at the top has scrolled away", async ({ page }) => {
    await page.goto("/")
    const floating = page.locator('[data-theme-switch="floating"]')

    await expect(page.locator('[data-theme-switch="bar"]')).toBeVisible()
    await expect(floating).toBeHidden()

    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 2, behavior: "instant" as ScrollBehavior }))
    await expect(floating).toBeVisible()

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }))
    await expect(floating).toBeHidden()
  })

  test("keeps the reader at the event they were reading when they switch with the button kept at hand", async ({ page }) => {
    await page.goto("/")
    const reading = timelineData.find((event) => event.title === "IBM Deep Blue Defeats Garry Kasparov")!
    const card = page.locator(`#${eventAnchorId(reading)}`)
    await card.evaluate((element) => {
      element.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior })
      window.scrollBy({ top: -window.innerHeight * 0.2, behavior: "instant" as ScrollBehavior })
    })

    await page.locator('[data-theme-switch="floating"]').click()
    await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", "pokemon")
    await expect(card).toHaveAttribute("data-dex-card", "")
    await expect(card).toBeInViewport()

    await page.locator('[data-theme-switch="floating"]').click()
    await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", "classic")
    await expect(card).toBeInViewport()
  })
})
