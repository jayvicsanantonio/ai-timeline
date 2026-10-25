// End-to-end tests for the five era interfaces on the real page in Chromium.
// Each era is drawn in its own interface, and each interface answers the pointer the way its original did.
import { expect, test, type Locator, type Page } from "@playwright/test"
import { encodeHollerith } from "../../lib/hollerith"

const INTERFACES = ["punch-card", "terminal", "desktop", "notebook", "chat"]

// React marks hydrated DOM nodes with a fiber key; checks that depend on client
// effects wait for it so they cannot pass against the server-rendered HTML alone.
async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const main = document.getElementById("main-content")
    return main !== null && Object.keys(main).some((key) => key.startsWith("__reactFiber"))
  })
}

async function openEraCard(page: Page, eraId: string, index = 0) {
  await page.goto("/")
  const card = page.locator(`#${eraId} article`).nth(index)
  await card.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior }))
  // Lets the card's entrance settle so it is still under the pointer
  await expect(card).toHaveCSS("opacity", "1")
  return card
}

function styleOf(locator: Locator, property: string) {
  return locator.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property)
}

test("draws the eras in order, each on a backdrop of its own", async ({ page }) => {
  await page.goto("/")

  const eras = await page.locator("section[data-interface]").evaluateAll((sections) =>
    sections.map((section) => ({
      interface: (section as HTMLElement).dataset.interface,
      backdrop: getComputedStyle(section.firstElementChild!).backgroundColor,
    })),
  )

  expect(eras.map((era) => era.interface)).toEqual(INTERFACES)
  expect(new Set(eras.map((era) => era.backdrop)).size).toBe(INTERFACES.length)
})

test("punches every card in the punch-card era with its title in Hollerith code", async ({ page }) => {
  await page.goto("/")

  const cards = await page.locator("#the-foundation-era article").evaluateAll((articles) =>
    articles.map((article) => ({
      title: article.querySelector("a[data-event-link]")!.textContent!,
      holes: article.querySelectorAll("svg [data-hole]").length,
    })),
  )

  expect(cards.length).toBeGreaterThan(0)
  for (const card of cards) {
    expect(card.holes, card.title).toBe(encodeHollerith(card.title).flat().length)
  }
})

test("inverts a terminal record's title while the pointer is over it", async ({ page }) => {
  const card = await openEraCard(page, "the-knowledge-era")
  const title = card.locator("a[data-event-link]")
  const idle = await styleOf(title, "background-color")

  await card.hover()

  await expect(title).toHaveCSS("background-color", "rgb(92, 240, 154)")
  expect(idle).not.toBe("rgb(92, 240, 154)")
})

test("brightens a window's title bar while the pointer is over the window", async ({ page }) => {
  const card = await openEraCard(page, "the-learning-era")
  const titleBar = card.locator(".desktop-title-bar")
  const idle = await styleOf(titleBar, "background-image")

  await card.hover()

  await expect.poll(() => styleOf(titleBar, "background-image")).not.toBe(idle)
})

test("selects a notebook cell while the pointer is over it", async ({ page }) => {
  const card = await openEraCard(page, "the-deep-learning-revolution")

  await card.hover()

  await expect(card).toHaveCSS("border-left-color", "rgb(42, 120, 214)")
})

test("pins each month's divider just under the toolbar while its messages scroll by", async ({ page }) => {
  await page.goto("/")
  await waitForHydration(page)

  const gapBelowToolbar = await page.evaluate(async () => {
    const toolbar = document.querySelector('[role="search"]')!.parentElement!
    const toolbarBottom = toolbar.getBoundingClientRect().height
    // A month with several messages, so the divider has room to stay pinned
    const group = [...document.querySelectorAll("[data-month]")].find(
      (month) => month.querySelectorAll("article").length >= 3,
    )!
    const divider = group.querySelector("[data-month-divider]")!.parentElement!
    const groupTop = group.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: groupTop + group.clientHeight / 2 - toolbarBottom, behavior: "instant" as ScrollBehavior })
    await new Promise((resolve) => requestAnimationFrame(resolve))
    return divider.getBoundingClientRect().top - toolbar.getBoundingClientRect().bottom
  })

  // The divider rests half a rem below the toolbar
  expect(gapBelowToolbar).toBeCloseTo(8, 0)
})

test("lets clicks pass through a pinned month divider to the messages under it", async ({ page }) => {
  await page.goto("/")
  await waitForHydration(page)

  const hitsDivider = await page.evaluate(async () => {
    const toolbarHeight = document.querySelector('[role="search"]')!.parentElement!.getBoundingClientRect().height
    const group = [...document.querySelectorAll("[data-month]")].find(
      (month) => month.querySelectorAll("article").length >= 3,
    )!
    const pinned = group.querySelector("[data-month-divider]")!.parentElement!
    const groupTop = group.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: groupTop + group.clientHeight / 2 - toolbarHeight, behavior: "instant" as ScrollBehavior })
    await new Promise((resolve) => requestAnimationFrame(resolve))

    // Samples the pinned row across its width, where messages scroll underneath
    const box = pinned.getBoundingClientRect()
    return [0.1, 0.5, 0.9].some((share) =>
      pinned.contains(document.elementFromPoint(box.left + box.width * share, box.top + box.height / 2)),
    )
  })

  expect(hitsDivider).toBe(false)
})
