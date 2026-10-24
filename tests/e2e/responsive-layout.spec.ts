// End-to-end layout tests for the timeline at phone, tablet and desktop widths.
// Checks that the timeline line and node dots stay clear of the cards and that the phone chapter nav stays compact.
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

// Scrolls through the whole page so every card plays its entrance animation and comes to rest.
// "instant" overrides the page's smooth scrolling; TypeScript 5.0's DOM types predate it, though Chromium supports it.
async function playEveryEntranceAnimation(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior })
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  })
}

// Lists every card that its node dot or the timeline line runs across.
function findCardsUnderTheLine(page: Page) {
  return page.evaluate(() => {
    const overlapsX = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right
    const overlapsY = (a: DOMRect, b: DOMRect) => a.top < b.bottom && b.top < a.bottom

    return [...document.querySelectorAll("article")].flatMap((article) => {
      const title = article.querySelector("h3")!.textContent
      const card = article.querySelector(".group")!.getBoundingClientRect()
      const node = article.querySelector('[data-testid="timeline-node"]')!.getBoundingClientRect()
      const line = article
        .closest("section")!
        .querySelector('[data-testid="timeline-line"]')!
        .getBoundingClientRect()
      const problems: string[] = []

      if (overlapsX(node, card) && overlapsY(node, card)) {
        problems.push(`node dot covers "${title}"`)
      }
      // The line runs the full height of the list, so any horizontal overlap crosses the card.
      if (overlapsX(line, card)) {
        problems.push(`line crosses "${title}"`)
      }
      return problems
    })
  })
}

// Summarizes where the line, node dots and cards sit, for comparison with the alternating desktop layout.
function describeTimelineLayout(page: Page) {
  return page.evaluate(() => {
    const centerOf = (rect: DOMRect) => Math.round(rect.left + rect.width / 2)
    const lineCenters = new Set<number>()
    const nodeCenters = new Set<number>()
    const cardWidths = new Set<number>()
    const cardSides: string[] = []

    document.querySelectorAll('[data-testid="timeline-line"]').forEach((line) => {
      lineCenters.add(centerOf(line.getBoundingClientRect()))

      line
        .closest("section")!
        .querySelectorAll("article")
        .forEach((article, index) => {
          const card = article.querySelector(".group")!.getBoundingClientRect()
          const node = article.querySelector('[data-testid="timeline-node"]')!.getBoundingClientRect()
          const side = card.right <= node.left ? "left" : card.left >= node.right ? "right" : "overlapping"
          const expectedSide = index % 2 === 0 ? "left" : "right"

          nodeCenters.add(centerOf(node))
          cardWidths.add(Math.round(card.width))
          if (side !== expectedSide) {
            cardSides.push(`${article.querySelector("h3")!.textContent} is ${side}, expected ${expectedSide}`)
          }
        })
    })

    return {
      pageCenter: Math.round(document.documentElement.clientWidth / 2),
      lineCenters: [...lineCenters],
      nodeCenters: [...nodeCenters],
      cardWidths: [...cardWidths],
      cardSides,
    }
  })
}

for (const [device, viewport] of Object.entries({ phone: PHONE, tablet: TABLET, desktop: DESKTOP })) {
  test.describe(`timeline on a ${device} (${viewport.width}x${viewport.height})`, () => {
    test.use({ viewport })

    test("keeps the line and node dots clear of every card", async ({ page }) => {
      test.setTimeout(120_000)
      await page.goto("/")
      await waitForHydration(page)
      await playEveryEntranceAnimation(page)

      await expect.poll(() => findCardsUnderTheLine(page)).toEqual([])
    })

    test("keeps every node dot on the line, even before its card enters", async ({ page }) => {
      await page.goto("/")
      await waitForHydration(page)

      const offsets = await page.evaluate(() => {
        const centerOf = (element: Element) => {
          const rect = element.getBoundingClientRect()
          return Math.round(rect.left + rect.width / 2)
        }

        return [...document.querySelectorAll("article")].map((article) => {
          const line = article.closest("section")!.querySelector('[data-testid="timeline-line"]')!
          return centerOf(article.querySelector('[data-testid="timeline-node"]')!) - centerOf(line)
        })
      })

      expect(new Set(offsets)).toEqual(new Set([0]))
    })
  })
}

test.describe(`desktop layout at ${DESKTOP.width}x${DESKTOP.height}`, () => {
  test.use({ viewport: DESKTOP })

  test("alternates cards on both sides of a centered line", async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto("/")
    await waitForHydration(page)
    await playEveryEntranceAnimation(page)

    await expect
      .poll(async () => {
        const layout = await describeTimelineLayout(page)
        return {
          lineCenters: layout.lineCenters.map((center) => center - layout.pageCenter),
          nodeCenters: layout.nodeCenters.map((center) => center - layout.pageCenter),
          cardWidths: layout.cardWidths,
          cardSides: layout.cardSides,
        }
      })
      .toEqual({ lineCenters: [0], nodeCenters: [0], cardWidths: [464], cardSides: [] })
  })

  test("shows the side chapter nav instead of the phone bar", async ({ page }) => {
    await page.goto("/")

    const nav = page.locator(CHAPTER_NAV).filter({ visible: true })
    await expect(nav).toHaveCount(1)
    await expect(nav.getByRole("button", { name: "Chapter 1: Foundation Era" })).toBeVisible()
    await expect(page.getByRole("button", { name: /current era/i })).toBeHidden()
  })
})

test.describe(`chapter nav on a phone (${PHONE.width}x${PHONE.height})`, () => {
  test.use({ viewport: PHONE })

  test("collapses to a single bar that names the current era", async ({ page }) => {
    await page.goto("/")

    const nav = page.locator(CHAPTER_NAV).filter({ visible: true })
    await expect(nav).toHaveCount(1)
    expect((await nav.boundingBox())!.height).toBeLessThanOrEqual(MAX_PHONE_NAV_HEIGHT)

    const toggle = nav.getByRole("button", { name: /current era/i })
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
    await expect(toggle).toContainText("Foundation Era")
    await expect(toggle).toContainText("01 / 05")
  })

  test("opens the chapter list from the bar and closes it on a second tap", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

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
    await page.goto("/")
    await waitForHydration(page)

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

  test.describe(`in a short landscape viewport (${PHONE_LANDSCAPE.width}x${PHONE_LANDSCAPE.height})`, () => {
    test.use({ viewport: PHONE_LANDSCAPE })

    test("keeps the open chapter list on screen", async ({ page }) => {
      await page.goto("/")
      await waitForHydration(page)

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
      await page.goto("/")
      await waitForHydration(page)

      const toggle = page.getByRole("button", { name: /current era/i })
      await toggle.click()

      const chapterList = page.locator(`[id="${await toggle.getAttribute("aria-controls")}"]`)
      expect(await chapterList.evaluate((list) => getComputedStyle(list).opacity)).toBe("1")
    })
  })
})
