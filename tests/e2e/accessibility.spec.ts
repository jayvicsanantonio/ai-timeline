// End-to-end accessibility checks for the AI Timeline page in real Chromium:
// landmarks, era headings, keyboard access to event links, focus styles, cursor behavior and
// narrative bridges that hold still when reduced motion is preferred.
import { expect, test, type Page } from "@playwright/test"
import timelineData from "../../data/timeline-events.json"

const ERA_TITLES = [
  "The Foundation Era",
  "The Knowledge Era",
  "The Learning Era",
  "The Deep Learning Revolution",
  "The Generative AI Era",
]

const EVENT_LINKS = 'h3 a[target="_blank"]'

const BRIDGE_TITLES = [...ERA_TITLES, "Patterns of Progress"]

// React marks hydrated DOM nodes with a fiber key; checks that depend on client
// effects wait for it so they cannot pass against the server-rendered HTML alone.
async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const main = document.getElementById("main-content")
    return main !== null && Object.keys(main).some((key) => key.startsWith("__reactFiber"))
  })
}

async function tabToFirstEventLink(page: Page) {
  for (let presses = 0; presses < 100; presses += 1) {
    await page.keyboard.press("Tab")
    const isEventLink = await page.evaluate(
      (selector) => document.activeElement?.matches(selector) ?? false,
      EVENT_LINKS,
    )
    if (isEventLink) {
      return
    }
  }
  throw new Error("No event link received focus within 100 Tab presses")
}

// A narrative bridge is the section that holds its level-2 title.
function narrativeBridge(page: Page, title: string) {
  return page.getByRole("heading", { level: 2, name: title, exact: true }).locator("xpath=ancestor::section[1]")
}

test.describe("landmarks and headings", () => {
  test("has exactly one main landmark, and it is the skip link target", async ({ page }) => {
    await page.goto("/")

    await expect(page.locator("main")).toHaveCount(1)
    await expect(page.getByRole("main")).toHaveAttribute("id", "main-content")
    await expect(page.getByRole("link", { name: "Skip to main content" })).toHaveAttribute("href", "#main-content")
  })

  test("announces each era title as one level-2 heading", async ({ page }) => {
    await page.goto("/")

    for (const title of ERA_TITLES) {
      await expect(page.getByRole("heading", { level: 2, name: title, exact: true })).toHaveCount(1)
    }
  })
})

test.describe("event links", () => {
  test("renders a real link for every timeline event", async ({ page }) => {
    await page.goto("/")

    const links = page.locator(EVENT_LINKS)
    await expect(links).toHaveCount(timelineData.length)
    await expect(links.first()).toHaveAttribute("href", timelineData[0].link)
    await expect(links.first()).toHaveAttribute("rel", "noopener noreferrer")
  })

  test("reaches every event link using only the Tab key", async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto("/")
    await waitForHydration(page)

    const focusedEventLinks = new Set<number>()
    const maxPresses = timelineData.length * 3

    for (let presses = 0; presses < maxPresses && focusedEventLinks.size < timelineData.length; presses += 1) {
      await page.keyboard.press("Tab")
      const index = await page.evaluate((selector) => {
        const links = Array.from(document.querySelectorAll(selector))
        return links.indexOf(document.activeElement as Element)
      }, EVENT_LINKS)
      if (index >= 0) {
        focusedEventLinks.add(index)
      }
    }

    expect(focusedEventLinks.size).toBe(timelineData.length)
  })

  test("shows a visible focus outline around a keyboard-focused card", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    await tabToFirstEventLink(page)

    const outlineOf = (index: number) =>
      page
        .locator(EVENT_LINKS)
        .nth(index)
        .evaluate((link) => {
          const style = getComputedStyle(link, "::after")
          return { style: style.outlineStyle, width: style.outlineWidth }
        })

    expect(await outlineOf(0)).toEqual({ style: "solid", width: "2px" })
    expect((await outlineOf(1)).style).toBe("none")
  })

  test("opens the source when any part of the card is clicked, including its padding", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    const link = page.locator(EVENT_LINKS).first()
    await link.scrollIntoViewIfNeeded()

    const linkCoversCardCorners = () =>
      link.evaluate((anchor) => {
        const card = anchor.closest(".group")
        if (!card) {
          return false
        }
        const box = card.getBoundingClientRect()
        const corners = [
          [box.left + 8, box.top + 8],
          [box.right - 8, box.top + 8],
          [box.left + 8, box.bottom - 8],
          [box.right - 8, box.bottom - 8],
        ]
        return corners.every(([x, y]) => document.elementFromPoint(x, y)?.closest("a") === anchor)
      })

    await expect.poll(linkCoversCardCorners).toBe(true)
  })
})

test.describe("cursor on a fine pointer with motion allowed", () => {
  test("hides the system cursor and draws the custom cursor", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    await expect(page.getByTestId("futuristic-cursor")).toHaveCount(1)
    await expect(page.locator("body")).toHaveCSS("cursor", "none")
  })
})

test.describe("cursor when reduced motion is preferred", () => {
  test.use({ reducedMotion: "reduce" })

  test("keeps the system cursor and skips the custom cursor", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    await expect(page.locator("body")).toHaveCSS("cursor", "auto")
    await expect(page.getByTestId("futuristic-cursor")).toHaveCount(0)
  })
})

test.describe("narrative bridges when reduced motion is preferred", () => {
  test.use({ reducedMotion: "reduce" })

  test("shows every bridge fully opaque, without scaling or moving it", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    for (const title of BRIDGE_TITLES) {
      const bridge = narrativeBridge(page, title)
      await expect(bridge).toHaveCSS("opacity", "1")
      await expect(bridge).toHaveCSS("transform", "none")
    }
  })

  test("keeps the background and particles of an on-screen bridge still", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    const bridge = narrativeBridge(page, ERA_TITLES[0])
    await bridge.evaluate((section) => section.scrollIntoView({ block: "center" }))

    // Waits out the one-time entrance animations, after which nothing in the bridge is transformed.
    const transformedElements = () =>
      bridge.evaluate((section) =>
        [section, ...section.querySelectorAll("*")]
          .map((element) => getComputedStyle(element).transform)
          .filter((transform) => transform !== "none"),
      )
    await expect.poll(transformedElements).toEqual([])

    const styleChanges = await bridge.evaluate(
      (section) =>
        new Promise<number>((resolve) => {
          const changed = new Set<Node>()
          const observer = new MutationObserver((records) => records.forEach((record) => changed.add(record.target)))
          observer.observe(section, { attributes: true, attributeFilter: ["style"], subtree: true })
          setTimeout(() => {
            observer.disconnect()
            resolve(changed.size)
          }, 1000)
        }),
    )
    expect(styleChanges).toBe(0)
  })
})

test.describe("cursor on a touch screen", () => {
  test.use({ hasTouch: true })

  test("keeps the system cursor and skips the custom cursor", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    await expect(page.locator("body")).toHaveCSS("cursor", "auto")
    await expect(page.getByTestId("futuristic-cursor")).toHaveCount(0)
  })
})
