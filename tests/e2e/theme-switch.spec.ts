// End-to-end tests for the theme switch on the real page in Chromium. The page is prerendered in the Pokémon theme and opens
// on it with no Poké Ball; Switch to classic changes the page at once, and Pokémon-ify shuts a Poké Ball over the screen
// that waits for the theme's sprites and opens onto the Pokémon adventure. The choice outlasts a reload, a link can ask for
// a theme, a reader who picked the classic timeline never sees the Pokémon page flash, and switching keeps the reader at
// the event they were reading.
import { expect, test, type Page, type Route } from "@playwright/test"
import timelineData from "../../data/timeline-events.json"
import { eventAnchorId } from "../../lib/event-format"
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "../../lib/theme"

const themeRoot = "[data-theme-root]"
const ball = "[data-pokeball-overlay]"
const SPRITES = "**/sprites/**"

async function settledOn(page: Page, theme: "classic" | "pokemon") {
  await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", theme, { timeout: 15_000 })
  await expect(page.locator(ball)).toHaveAttribute("data-phase", "idle", { timeout: 15_000 })
}

// Saves a reader's pick before the page's first script runs, as an earlier visit would have
async function pickedBefore(page: Page, theme: "classic" | "pokemon") {
  await page.addInitScript(
    ([key, value]) => {
      if (!window.sessionStorage.getItem("seeded")) {
        window.localStorage.setItem(key, value)
        window.sessionStorage.setItem("seeded", "yes")
      }
    },
    [THEME_STORAGE_KEY, theme],
  )
}

// Holds the Pokémon theme's sprites back, as a slow connection would, until release is called
async function holdSprites(page: Page) {
  const held: Route[] = []
  let released = false
  await page.route(SPRITES, async (route) => {
    if (released) await route.continue()
    else held.push(route)
  })
  return {
    release: async () => {
      released = true
      await Promise.all(held.splice(0).map((route) => route.continue()))
    },
  }
}

test("is prerendered in the Pokémon theme, so readers without scripts get it too", async ({ request }) => {
  const html = await (await request.get("/")).text()

  expect(html).toContain('data-theme-root="pokemon"')
  expect(html).not.toContain('data-theme-root="classic"')
  expect(html).toContain("data-dex-card")
})

test("opens on the Pokémon theme with no Poké Ball, in its pixel font", async ({ page }) => {
  const phases: string[] = []
  await page.exposeFunction("notePhase", (phase: string) => phases.push(phase))
  await page.addInitScript(() => {
    new MutationObserver((records) => {
      for (const record of records) {
        const target = record.target as HTMLElement
        if (target.matches?.("[data-pokeball-overlay]")) (window as unknown as { notePhase: (phase: string) => void }).notePhase(target.dataset.phase ?? "")
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ["data-phase"] })
  })
  await page.goto("/")
  await settledOn(page, "pokemon")

  await expect(page.locator("html")).toHaveAttribute(THEME_ATTRIBUTE, "pokemon")
  await expect(page.locator(ball)).toBeHidden()
  expect(phases.filter((phase) => phase !== "idle")).toEqual([])
  await expect(page.locator("section[data-generation]")).toHaveCount(6)
  await expect(page.locator("section[data-interface]")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Switch to classic" }).first()).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() => {
        // next/font names the face itself, so its name comes from the variable the layout sets on <html>
        const family = getComputedStyle(document.documentElement).getPropertyValue("--font-press-start").split(",")[0].trim().replace(/^['"]|['"]$/g, "")
        return [...document.fonts].some((font) => font.family.replace(/^['"]|['"]$/g, "") === family && font.status === "loaded")
      }),
    )
    .toBe(true)
})

test("switches to classic at once, and remembers each choice across a reload", async ({ page }) => {
  await page.goto("/")
  // The prerendered button does nothing until the page has run its scripts
  await settledOn(page, "pokemon")

  await page.locator('[data-theme-switch="bar"]').click()
  await expect(page.locator(themeRoot)).toHaveAttribute("data-theme-root", "classic")
  await expect(page.locator(ball)).toHaveAttribute("data-phase", "idle")
  await expect(page.locator("section[data-interface]")).toHaveCount(6)
  expect(await page.evaluate((key) => window.localStorage.getItem(key), THEME_STORAGE_KEY)).toBe("classic")

  await page.reload()
  await settledOn(page, "classic")
  await expect(page.locator("html")).toHaveAttribute(THEME_ATTRIBUTE, "classic")

  await page.locator('[data-theme-switch="bar"]').click()
  await settledOn(page, "pokemon")
  await page.reload()
  await settledOn(page, "pokemon")
})

test("shuts a Poké Ball over the screen on Pokémon-ify while the theme's sprites arrive, then opens it onto the theme", async ({ page }) => {
  await pickedBefore(page, "classic")
  const sprites = await holdSprites(page)
  // The held sprites keep the page from finishing its load
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await settledOn(page, "classic")

  await page.locator('[data-theme-switch="bar"]').click()

  // The ball wobbles shut over the whole screen for as long as the sprites in view take
  await expect(page.locator(ball)).toHaveAttribute("data-phase", "loading")
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

  await sprites.release()
  await settledOn(page, "pokemon")
  await expect(page.locator(ball)).toBeHidden()
  await expect(page.locator("section[data-generation]")).toHaveCount(6)
  await expect(page.locator("section[data-interface]")).toHaveCount(0)
  expect(await page.evaluate((key) => window.localStorage.getItem(key), THEME_STORAGE_KEY)).toBe("pokemon")
})

test("never flashes the Pokémon page when it comes up in the classic theme", async ({ page }) => {
  await page.addInitScript((key) => window.localStorage.setItem(key, "classic"), THEME_STORAGE_KEY)
  // Holds the page's scripts back, so the prerendered Pokémon page is all there is until they run
  await page.route("**/_next/static/chunks/**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await route.continue()
  })
  await page.goto("/", { waitUntil: "commit" })

  const pokemon = page.locator('[data-theme-root="pokemon"]')
  await expect(pokemon).toBeAttached()
  await expect(page.locator("html")).toHaveAttribute(THEME_ATTRIBUTE, "classic")
  expect(await pokemon.evaluate((root) => getComputedStyle(root).visibility)).toBe("hidden")
  await expect(page.locator(ball)).toBeHidden()

  await settledOn(page, "classic")
  await expect(page.locator(themeRoot)).toBeVisible()
})

test("opens in the theme a link asks for", async ({ page }) => {
  await page.goto("/?theme=classic")
  await settledOn(page, "classic")

  await page.goto("/?theme=pokemon")
  await settledOn(page, "pokemon")
})

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" })

  test("fades the ball in and out instead of shutting and wobbling it", async ({ page }) => {
    await pickedBefore(page, "classic")
    const sprites = await holdSprites(page)
    await page.goto("/", { waitUntil: "domcontentloaded" })
    await settledOn(page, "classic")

    await page.locator('[data-theme-switch="bar"]').click()
    await expect(page.locator(ball)).toHaveAttribute("data-phase", "loading")
    const moving = await page.evaluate(() =>
      document.getAnimations().filter((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target
        return target instanceof Element && target.closest("[data-pokeball-overlay]") !== null
      }).length,
    )
    expect(moving).toBe(0)

    await sprites.release()
    await settledOn(page, "pokemon")
  })
})

test.describe("on a wide screen", () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test("keeps the switch at hand only once the bar at the top has scrolled away", async ({ page }) => {
    await page.goto("/")
    await settledOn(page, "pokemon")
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
    await settledOn(page, "pokemon")
    const reading = timelineData.find((event) => event.title === "IBM Deep Blue Defeats Garry Kasparov")!
    const card = page.locator(`#${eventAnchorId(reading)}`)
    await card.evaluate((element) => {
      element.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior })
      window.scrollBy({ top: -window.innerHeight * 0.2, behavior: "instant" as ScrollBehavior })
    })

    await page.locator('[data-theme-switch="floating"]').click()
    await settledOn(page, "classic")
    await expect(card).not.toHaveAttribute("data-dex-card")
    await expect(card).toBeInViewport()

    await page.locator('[data-theme-switch="floating"]').click()
    await settledOn(page, "pokemon")
    await expect(card).toHaveAttribute("data-dex-card", "")
    await expect(card).toBeInViewport()
  })
})
