// End-to-end tests for the timeline cards' hover-only effects.
// Checks that idle cards stay still, hovered cards animate, and reduced motion turns the loops off.
import { expect, test, type Locator, type Page } from "@playwright/test"

// Children of a CinematicCard root, in render order.
const SWEEP = 1
const SCAN_LINE = 2
const FIRST_CORNER = 3
const CORNER_COUNT = 4

async function openTimeline(page: Page) {
  await page.goto("/")
  await expect(page.locator("article").first()).toBeAttached()
  // Lets the mount and entrance animations finish.
  await page.waitForTimeout(1500)
}

async function scrollToFirstCard(page: Page) {
  const card = page.locator("article .group").first()
  await card.scrollIntoViewIfNeeded()
  // Lets the card's entrance animation finish so it is stable under the pointer.
  await page.waitForTimeout(1000)
  return card
}

async function hoverFirstCard(page: Page) {
  const card = await scrollToFirstCard(page)
  await card.hover()
  return card
}

// Counts how many of the given elements had their inline style changed during the window.
async function countAnimating(locator: Locator, ms = 500) {
  return locator.evaluateAll(
    (elements, duration) =>
      new Promise<number>((resolve) => {
        const animated = new Set<Node>()
        const observer = new MutationObserver((records) => records.forEach((record) => animated.add(record.target)))
        elements.forEach((element) => observer.observe(element, { attributes: true, attributeFilter: ["style"] }))
        setTimeout(() => {
          observer.disconnect()
          resolve(animated.size)
        }, duration)
      }),
    ms,
  )
}

function cardChild(card: Locator, index: number) {
  return card.locator(":scope > div").nth(index)
}

test("idle cards outside the viewport do not animate", async ({ page }) => {
  await openTimeline(page)

  const offScreenAnimating = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const animated = new Set<Element>()
        const observer = new MutationObserver((records) =>
          records.forEach((record) => animated.add(record.target as Element)),
        )
        document.querySelectorAll("article").forEach((article) =>
          observer.observe(article, { attributes: true, attributeFilter: ["style"], subtree: true }),
        )
        setTimeout(() => {
          observer.disconnect()
          const offScreen = [...animated].filter((element) => {
            const rect = element.closest("article")!.getBoundingClientRect()
            return rect.bottom < 0 || rect.top > window.innerHeight
          })
          resolve(offScreen.length)
        }, 1000)
      }),
  )

  expect(offScreenAnimating).toBe(0)
})

test("hovering a card shows and runs the sweep, scan line and corner accents", async ({ page }) => {
  await openTimeline(page)
  const card = await hoverFirstCard(page)

  expect(await countAnimating(cardChild(card, SWEEP).or(cardChild(card, SCAN_LINE)))).toBe(2)
  await expect(cardChild(card, SWEEP)).toHaveCSS("opacity", "1")
  await expect(cardChild(card, SCAN_LINE)).toHaveCSS("opacity", "0.3")
  for (let corner = FIRST_CORNER; corner < FIRST_CORNER + CORNER_COUNT; corner++) {
    await expect(cardChild(card, corner)).toHaveCSS("opacity", "1")
  }
})

test("hovering a badge shows a valid glow and shimmer color", async ({ page }) => {
  await openTimeline(page)
  const card = await scrollToFirstCard(page)
  // Hovering the badge straight away keeps the card's hover lift from moving it mid-hover.
  const badge = card.locator("span.rounded-full").first()
  await badge.hover()

  await expect(badge).toHaveCSS("box-shadow", /rgba\(\d+, \d+, \d+, 0\.3\) 0px 0px 20px/)
  await expect(badge.locator(":scope > div").first()).toHaveCSS("background-image", /rgba\(\d+, \d+, \d+, 0\.1\)/)
})

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" })

  test("hovering a card does not run the sweep or scan line", async ({ page }) => {
    await openTimeline(page)
    const card = await hoverFirstCard(page)

    expect(await countAnimating(cardChild(card, SWEEP).or(cardChild(card, SCAN_LINE)))).toBe(0)
  })
})
