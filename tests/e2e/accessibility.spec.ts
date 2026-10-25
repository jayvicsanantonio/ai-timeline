// End-to-end accessibility checks in real Chromium: landmarks, era headings, event links and their names,
// keyboard access, focus rings, cursor behavior and a page that holds still when reduced motion is preferred.
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

  test("names each event heading by its title alone in Chrome's accessibility tree", async ({ page }) => {
    await page.goto("/")
    const client = await page.context().newCDPSession(page)

    const { nodes } = await client.send("Accessibility.getFullAXTree")
    const headingNames = nodes
      .filter(
        (node) =>
          node.role?.value === "heading" &&
          node.properties?.some((property) => property.name === "level" && property.value.value === 3),
      )
      .map((node) => String(node.name?.value ?? ""))

    // Some eras set their titles in capitals, which Chrome passes on to the name
    const titles = new Set(timelineData.map((event) => event.title.toLowerCase()))
    const eventHeadings = headingNames.filter((name) => titles.has(name.toLowerCase()))
    expect(eventHeadings).toHaveLength(timelineData.length)
    expect(headingNames.filter((name) => name.includes("new tab"))).toEqual([])
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

  test("rings a keyboard-focused card with a visible outline", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    await tabToFirstEventLink(page)

    const outlineOf = (index: number) =>
      page
        .locator("article")
        .nth(index)
        .evaluate((card) => {
          const style = getComputedStyle(card)
          return { style: style.outlineStyle, width: style.outlineWidth }
        })

    expect(await outlineOf(0)).toEqual({ style: "solid", width: "2px" })
    expect((await outlineOf(1)).style).toBe("none")
  })

  test("opens the source when any part of a card is clicked, in every era's interface", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    for (const section of await page.locator("section[data-interface]").all()) {
      const card = section.locator("article").first()
      await card.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior }))

      const missedPoints = () =>
        card.evaluate((article) => {
          const anchor = article.querySelector("a[data-event-link]")
          const box = article.getBoundingClientRect()
          const middle = box.top + box.height / 2
          const points: [string, number, number][] = [
            ["center", box.left + box.width / 2, middle],
            ["left edge", box.left + 12, middle],
            ["right edge", box.right - 12, middle],
            ["bottom edge", box.left + box.width / 2, box.bottom - 6],
          ]
          return points
            .filter(([, x, y]) => document.elementFromPoint(x, y)?.closest("a") !== anchor)
            .map(([name]) => name)
        })

      await expect.poll(missedPoints, { message: await section.getAttribute("data-interface") ?? "" }).toEqual([])
    }
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

test.describe("motion when reduced motion is preferred", () => {
  test.use({ reducedMotion: "reduce" })

  test("runs no animations anywhere on the page while it scrolls", async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto("/")
    await waitForHydration(page)

    // Color transitions on hover or state changes are fine; anything that moves, fades or blinks is not.
    const runningAnimations = await page.evaluate(async () => {
      const found = new Set<string>()
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
        window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior })
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        for (const animation of document.getAnimations()) {
          if (!(animation instanceof CSSTransition)) {
            const target = (animation.effect as KeyframeEffect | null)?.target
            found.add(`${(animation as CSSAnimation).animationName ?? "script"} on ${target?.className ?? "?"}`)
          }
        }
      }
      return [...found]
    })

    expect(runningAnimations).toEqual([])
  })

  test("shows the chapter navigation at once, without fading it in", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    const opacityJustAfterEntering = await page.evaluate(async () => {
      document.getElementById("the-foundation-era")!.scrollIntoView({ behavior: "instant" as ScrollBehavior })
      // Gives the scroll handler a frame to measure and React a moment to render, far less than a fade takes
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 50))))
      const navs = [...document.querySelectorAll('nav[aria-label="Timeline chapter navigation"]')]
      const shown = navs.find((nav) => getComputedStyle(nav).display !== "none")!
      return { state: (shown as HTMLElement).dataset.state, opacity: getComputedStyle(shown).opacity }
    })

    expect(opacityJustAfterEntering).toEqual({ state: "visible", opacity: "1" })
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
