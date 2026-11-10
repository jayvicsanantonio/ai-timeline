// End-to-end tests for the theme switch on the real page in Chromium. The page opens on the classic timeline without any
// of the Pokémon theme's files, and Pokémon-ify downloads them behind a Poké Ball that fills the screen and opens onto the
// Pokémon adventure; Back to classic returns at once. The choice outlasts a reload, a link can ask for a theme, a failed
// download leaves the reader on the classic page, and switching keeps the reader at the event they were reading.
import { expect, test, type Page, type Route } from "@playwright/test"
import timelineData from "../../data/timeline-events.json"
import { eventAnchorId } from "../../lib/event-format"
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "../../lib/theme"

const themeRoot = "[data-theme-root]"
const ball = "[data-pokeball-overlay]"

// The files only the Pokémon theme needs: its code and styles come as chunks the page loads on demand, then its font and
// sprites. The page's own scripts and stylesheet are loaded before any of these are asked for.
const ON_DEMAND = /\/_next\/static\/(chunks\/\d+\.[0-9a-f]+\.js|css\/.+\.css)$/

async function settledOn(page: Page, theme: "classic" | "pokemon") {
  await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", theme, { timeout: 15_000 })
  await expect(page.locator(ball)).toHaveAttribute("data-phase", "idle", { timeout: 15_000 })
}

// Holds the Pokémon theme's files back, as a slow connection would, until release is called
async function holdOnDemandFiles(page: Page) {
  const held: Route[] = []
  let released = false
  await page.route(ON_DEMAND, async (route) => {
    if (released) await route.continue()
    else held.push(route)
  })
  return {
    held: () => held.length,
    release: async () => {
      released = true
      await Promise.all(held.splice(0).map((route) => route.continue()))
    },
  }
}

test("opens on the classic timeline, without downloading any of the Pokémon theme", async ({ page }) => {
  const requests: string[] = []
  page.on("request", (request) => requests.push(new URL(request.url()).pathname))
  await page.goto("/")
  await settledOn(page, "classic")
  await page.waitForLoadState("networkidle")

  await expect(page.locator("html")).toHaveAttribute(THEME_ATTRIBUTE, "classic")
  await expect(page.locator("section[data-interface]")).toHaveCount(6)
  await expect(page.getByRole("button", { name: "Pokémon-ify" }).first()).toBeVisible()
  expect(requests.filter((path) => path.startsWith("/sprites/"))).toEqual([])
  const pokemonLoaded = await page.evaluate(() => ({
    styles: [...document.styleSheets].some((sheet) => [...sheet.cssRules].some((rule) => rule.cssText.includes(".dex-card"))),
    font: [...document.fonts].some((font) => font.family.includes("Press_Start") && font.status !== "unloaded"),
  }))
  expect(pokemonLoaded).toEqual({ styles: false, font: false })
})

test("shuts a Poké Ball over the screen while the Pokémon theme downloads, then opens it onto the theme", async ({ page }) => {
  await page.goto("/")
  await settledOn(page, "classic")
  const files = await holdOnDemandFiles(page)

  await page.locator('[data-theme-switch="bar"]').click()

  // The ball wobbles shut over the whole screen for as long as the files take
  await expect(page.locator(ball)).toHaveAttribute("data-phase", "loading")
  await expect.poll(files.held).toBeGreaterThan(0)
  await page.waitForTimeout(1500)
  await expect(page.locator(ball)).toHaveAttribute("data-phase", "loading")
  const covered = await page.evaluate(() => {
    const corners = [
      [1, 1],
      [window.innerWidth - 2, 1],
      [window.innerWidth / 2, window.innerHeight / 2],
      [1, window.innerHeight - 2],
      [window.innerWidth - 2, window.innerHeight - 2],
    ]
    return corners.every(([x, y]) => document.elementFromPoint(x, y)?.closest("[data-pokeball-overlay]") !== null)
  })
  expect(covered).toBe(true)
  await expect(page.locator(ball)).toContainText("Loading the Pokémon edition…")
  await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", "classic")

  await files.release()
  await settledOn(page, "pokemon")
  await expect(page.locator(ball)).toBeHidden()
  await expect(page.locator("section[data-generation]")).toHaveCount(6)
  await expect(page.locator("section[data-interface]")).toHaveCount(0)
  expect(await page.evaluate((key) => window.localStorage.getItem(key), THEME_STORAGE_KEY)).toBe("pokemon")
})

test("returns to classic at once, and remembers each choice across a reload", async ({ page }) => {
  await page.goto("/")
  await page.locator('[data-theme-switch="bar"]').click()
  await settledOn(page, "pokemon")

  await page.reload()
  await settledOn(page, "pokemon")
  await expect(page.locator("html")).toHaveAttribute(THEME_ATTRIBUTE, "pokemon")

  await page.locator('[data-theme-switch="bar"]').click()
  await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", "classic")
  await expect(page.locator(ball)).toHaveAttribute("data-phase", "idle")
  await page.reload()
  await settledOn(page, "classic")
})

test("leaves the reader on the classic page if the Pokémon theme cannot download, and lets them try again", async ({ page }) => {
  await page.goto("/")
  await settledOn(page, "classic")
  await page.route(ON_DEMAND, (route) => route.abort())

  await page.locator('[data-theme-switch="bar"]').click()

  await settledOn(page, "classic")
  await expect(page.locator("[data-theme-bar]")).toContainText("The Pokémon edition couldn’t load.")
  expect(await page.evaluate((key) => window.localStorage.getItem(key), THEME_STORAGE_KEY)).toBe("classic")

  await page.unroute(ON_DEMAND)
  await page.locator('[data-theme-switch="bar"]').click()
  await settledOn(page, "pokemon")
})

test("never flashes the classic page when it comes up in the Pokémon theme, showing the shut ball instead", async ({ page }) => {
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
  await expect(page.locator(ball)).toBeVisible()

  await settledOn(page, "pokemon")
  await expect(page.locator(themeRoot)).toBeVisible()
})

test("opens in the theme a link asks for", async ({ page }) => {
  await page.goto("/?theme=pokemon")
  await settledOn(page, "pokemon")

  await page.goto("/?theme=classic")
  await settledOn(page, "classic")
})

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" })

  test("fades the ball in and out instead of shutting and wobbling it", async ({ page }) => {
    await page.goto("/")
    await settledOn(page, "classic")
    const files = await holdOnDemandFiles(page)

    await page.locator('[data-theme-switch="bar"]').click()
    await expect(page.locator(ball)).toHaveAttribute("data-phase", "loading")
    const moving = await page.evaluate(() =>
      document.getAnimations().filter((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target
        return target instanceof Element && target.closest("[data-pokeball-overlay]") !== null
      }).length,
    )
    expect(moving).toBe(0)

    await files.release()
    await settledOn(page, "pokemon")
  })
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
    await settledOn(page, "pokemon")
    await expect(card).toHaveAttribute("data-dex-card", "")
    await expect(card).toBeInViewport()

    await page.locator('[data-theme-switch="floating"]').click()
    await settledOn(page, "classic")
    await expect(card).toBeInViewport()
  })
})
