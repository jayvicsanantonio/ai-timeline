// End-to-end layout tests at phone, tablet and desktop widths: nothing runs off the side of the screen, the toolbar
// sticks while reading, and the chapter nav fits each width as a rail on wide screens and a compact bar on phones.
import { expect, test, type Page } from "@playwright/test"

const PHONE = { width: 375, height: 812 }
const PHONE_LANDSCAPE = { width: 812, height: 320 }
const TABLET = { width: 900, height: 1000 }
const DESKTOP = { width: 1280, height: 800 }

// Height budget for the collapsed phone chapter nav, about 7% of an 812px screen.
const MAX_PHONE_NAV_HEIGHT = 56

const CHAPTER_NAV = 'nav[aria-label="Timeline chapter navigation"]'

// React marks hydrated DOM nodes with a fiber key; checks that depend on client
// effects wait for it so they cannot pass against the server-rendered HTML alone.
async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const main = document.getElementById("main-content")
    return main !== null && Object.keys(main).some((key) => key.startsWith("__reactFiber"))
  })
}

// The chapter nav stays out of the way over the opening, so tests that use it start in the first era.
async function enterTimeline(page: Page) {
  await page.goto("/")
  await waitForHydration(page)
  await page.locator("#the-foundation-era").evaluate((section) =>
    section.scrollIntoView({ behavior: "instant" as ScrollBehavior }),
  )
  await expect(page.locator(CHAPTER_NAV).filter({ visible: true })).toHaveCount(1)
}

for (const [device, viewport] of Object.entries({ phone: PHONE, tablet: TABLET, desktop: DESKTOP })) {
  test.describe(`timeline on a ${device} (${viewport.width}x${viewport.height})`, () => {
    test.use({ viewport })

    test("keeps the page and every event card within the screen's width", async ({ page }) => {
      await page.goto("/")
      await waitForHydration(page)

      const layout = await page.evaluate(() => ({
        pageWidth: document.documentElement.scrollWidth,
        cardsOffScreen: [...document.querySelectorAll("article")]
          .filter((card) => {
            const box = card.getBoundingClientRect()
            return box.left < 0 || box.right > document.documentElement.clientWidth
          })
          .map((card) => card.id),
      }))

      expect(layout.pageWidth).toBeLessThanOrEqual(viewport.width)
      expect(layout.cardsOffScreen).toEqual([])
    })

    test("keeps the search toolbar pinned to the top while reading any era", async ({ page }) => {
      await page.goto("/")
      await waitForHydration(page)

      const toolbarTops = await page.evaluate(async () => {
        const toolbar = document.querySelector('[role="search"]')!.parentElement!
        const tops: number[] = []
        for (const section of document.querySelectorAll("section[data-interface]")) {
          const middle = section.getBoundingClientRect().top + window.scrollY + section.clientHeight / 2
          window.scrollTo({ top: middle, behavior: "instant" as ScrollBehavior })
          await new Promise((resolve) => requestAnimationFrame(resolve))
          tops.push(Math.round(toolbar.getBoundingClientRect().top))
        }
        return tops
      })

      expect(toolbarTops).toEqual([0, 0, 0, 0, 0])
    })
  })
}

test.describe(`desktop layout at ${DESKTOP.width}x${DESKTOP.height}`, () => {
  test.use({ viewport: DESKTOP })

  test("keeps the chapter nav out of the way over the opening", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    await expect(page.locator(CHAPTER_NAV).filter({ visible: true })).toHaveCount(0)
  })

  test("shows the side rail in the timeline instead of the phone bar", async ({ page }) => {
    await enterTimeline(page)

    const rail = page.locator(CHAPTER_NAV).filter({ visible: true })
    await expect(rail.getByRole("button", { name: "Chapter 1: Foundation Era" })).toBeVisible()
    await expect(page.getByRole("button", { name: /current era/i })).toBeHidden()
  })

  test("marks the era being read on the rail and reads out the month and year", async ({ page }) => {
    await enterTimeline(page)

    await page
      .getByRole("heading", { level: 3, name: "IBM Deep Blue Defeats Garry Kasparov" })
      .evaluate((heading) => heading.closest("article")!.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior }))

    const rail = page.locator(CHAPTER_NAV).filter({ visible: true })
    await expect(rail.getByRole("button", { name: "Chapter 3: Learning Era" })).toHaveAttribute("aria-current", "location")
    await expect(rail.getByText("1997", { exact: true })).toBeVisible()
    await expect(rail.getByText("May", { exact: true })).toBeVisible()
  })
})

test.describe(`chapter nav on a phone (${PHONE.width}x${PHONE.height})`, () => {
  test.use({ viewport: PHONE })

  test("collapses to a single bar that names the current era", async ({ page }) => {
    await enterTimeline(page)

    const nav = page.locator(CHAPTER_NAV).filter({ visible: true })
    expect((await nav.boundingBox())!.height).toBeLessThanOrEqual(MAX_PHONE_NAV_HEIGHT)

    const toggle = nav.getByRole("button", { name: /current era/i })
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
    await expect(toggle).toContainText("Foundation Era")
    await expect(toggle).toContainText("01 / 05")
  })

  test("opens the chapter list from the bar and closes it on a second tap", async ({ page }) => {
    await enterTimeline(page)

    const nav = page.locator(CHAPTER_NAV).filter({ visible: true })
    const toggle = nav.getByRole("button", { name: /current era/i })

    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-expanded", "true")
    const chapterList = page.locator(`[id="${await toggle.getAttribute("aria-controls")}"]`)
    await expect(chapterList.getByRole("button")).toHaveCount(5)

    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
    await expect(chapterList).toHaveCount(0)
  })

  test("jumps to a chapter picked from the list and closes the list", async ({ page }) => {
    await enterTimeline(page)

    const nav = page.locator(CHAPTER_NAV).filter({ visible: true })
    const toggle = nav.getByRole("button", { name: /current era/i })

    await toggle.click()
    await nav.getByRole("button", { name: /Learning Era/ }).click()

    await expect(toggle).toHaveAttribute("aria-expanded", "false")
    const learningEraTop = () =>
      page.locator("#the-learning-era").evaluate((section) => section.getBoundingClientRect().top)
    await expect.poll(learningEraTop).toBeLessThan(150)
    expect(await learningEraTop()).toBeGreaterThanOrEqual(0)
    await expect(toggle).toContainText("Learning Era")
    await expect(toggle).toContainText("03 / 05")
    expect((await nav.boundingBox())!.height).toBeLessThanOrEqual(MAX_PHONE_NAV_HEIGHT)
  })

  test("keeps the search toolbar to a single row until the reader filters", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    const toolbar = page.getByRole("search")
    const idleHeight = (await toolbar.boundingBox())!.height

    await page.getByRole("searchbox", { name: "Search events" }).fill("robot")

    await expect(page.getByRole("button", { name: "Clear filters" })).toBeVisible()
    expect(idleHeight).toBeLessThan(70)
  })

  test.describe(`in a short landscape viewport (${PHONE_LANDSCAPE.width}x${PHONE_LANDSCAPE.height})`, () => {
    test.use({ viewport: PHONE_LANDSCAPE })

    test("keeps the open chapter list on screen", async ({ page }) => {
      await enterTimeline(page)

      const nav = page.locator(CHAPTER_NAV).filter({ visible: true })
      const toggle = nav.getByRole("button", { name: /current era/i })
      await toggle.click()

      const chapterList = page.locator(`[id="${await toggle.getAttribute("aria-controls")}"]`)
      await expect(chapterList.getByRole("button").first()).toBeInViewport({ ratio: 1 })
      expect((await nav.boundingBox())!.y).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" })

    test("shows the chapter list at once without fading it in", async ({ page }) => {
      await enterTimeline(page)

      const toggle = page.getByRole("button", { name: /current era/i })
      await toggle.click()

      const chapterList = page.locator(`[id="${await toggle.getAttribute("aria-controls")}"]`)
      expect(await chapterList.evaluate((list) => getComputedStyle(list).opacity)).toBe("1")
    })
  })
})
