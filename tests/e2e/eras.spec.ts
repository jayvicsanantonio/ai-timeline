// End-to-end tests for the six eras of the AI Dex on the real page in Chromium.
// Each era is drawn in the sprites of its generation, the latest era first and every era newest first, every event an
// entry numbered in the order the events happened, and every landmark a legendary encounter.
import { expect, test, type Page } from "@playwright/test"
import timelineData from "../../data/timeline-events.json"
import yearSummaryData from "../../data/year-summaries.json"
import { buildDex, formatDexNumber, LEGENDS } from "../../lib/dex"
import { groupEventsByEra } from "../../lib/eras"
import { eventAnchorId } from "../../lib/event-format"
import { newestFirst } from "../../lib/newest-first"
import { describePace } from "../../lib/pace"
import { yearsEarlierThanPrevious } from "../../lib/year-gaps"
import { groupEventsByYear, isBusyYear } from "../../lib/year-groups"
import type { TimelineEvent } from "../../types/timeline"

const events = timelineData as TimelineEvent[]
// In time order; the page draws them the other way round
const GENERATIONS = ["gen-1", "gen-2", "gen-3", "gen-4", "gen-5", "modern"]
const erasOfData = groupEventsByEra(events)
const dex = buildDex(events)

// React marks hydrated DOM nodes with a fiber key; checks that depend on client
// effects wait for it so they cannot pass against the server-rendered HTML alone.
async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const main = document.getElementById("main-content")
    return main !== null && Object.keys(main).some((key) => key.startsWith("__reactFiber"))
  })
}

test("draws the eras from the latest to the first, each in its own generation on a backdrop of its own", async ({ page }) => {
  await page.goto("/")

  const eras = await page.locator("section[data-generation]").evaluateAll((sections) =>
    sections.map((section) => ({
      generation: (section as HTMLElement).dataset.generation,
      backdrop: getComputedStyle(section.querySelector("[data-era-backdrop]")!).backgroundColor,
    })),
  )

  expect(eras.map((era) => era.generation)).toEqual(newestFirst(GENERATIONS))
  expect(new Set(eras.map((era) => era.backdrop)).size).toBe(GENERATIONS.length)
})

test("lists every event newest first, from the latest at the top of the timeline down to the first", async ({ page }) => {
  await page.goto("/")

  const ids = await page.locator("section[data-generation] article").evaluateAll((articles) => articles.map((article) => article.id))
  expect(ids).toEqual(newestFirst(events).map(eventAnchorId))
})

test("numbers every entry in the order the events happened, from the latest down to No. 001", async ({ page }) => {
  await page.goto("/")

  const numbers = await page
    .locator("section[data-generation] article")
    .evaluateAll((articles) => articles.map((article) => article.textContent!.match(/No\. \d{3}/)![0]))
  expect(numbers).toEqual(newestFirst(events).map((event) => formatDexNumber(dex.get(eventAnchorId(event))!.number)))
  expect(numbers.at(-1)).toBe("No. 001")
})

test("draws every entry's creature in its era's generation, and every sprite it draws loads", async ({ page }) => {
  await page.goto("/")

  const wrong = await page.locator("section[data-generation]").evaluateAll((sections) =>
    sections.flatMap((section) => {
      const generation = (section as HTMLElement).dataset.generation
      return [...section.querySelectorAll<HTMLImageElement>(".dex-stage img")]
        .map((sprite) => sprite.getAttribute("src")!)
        .filter((source) => !source.startsWith(`/sprites/${generation}/`))
    }),
  )
  expect(wrong).toEqual([])

  const sources = await page.locator("img[data-sprite]").evaluateAll((sprites) => [
    ...new Set(sprites.map((sprite) => sprite.getAttribute("src")!)),
  ])
  for (const source of sources) {
    const response = await page.request.get(source)
    expect(response.ok(), source).toBe(true)
    expect(response.headers()["content-type"], source).toMatch(/^image\//)
  }
})

test("marks every approved landmark as a legendary encounter with its lore, in every era", async ({ page }) => {
  await page.goto("/")
  const landmarks = events.filter((event) => event.landmark)

  const perEra = await page
    .locator("section[data-generation]")
    .evaluateAll((sections) => sections.map((section) => section.querySelectorAll("article[data-landmark]").length))

  expect(perEra.reduce((sum, count) => sum + count, 0)).toBe(landmarks.length)
  expect(perEra.every((count) => count > 0)).toBe(true)
  await expect(page.locator("article[data-landmark]").getByText("★ Landmark", { exact: true })).toHaveCount(landmarks.length)
  for (const event of landmarks) {
    await expect(page.locator(`#${eventAnchorId(event)} [data-legend-lore]`)).toHaveText(LEGENDS[event.title].lore)
  }
})

test("marks each stretch of more than a year between events, ahead of the earlier year below it", async ({ page }) => {
  await page.goto("/")
  const erasWithGaps = erasOfData.filter((era) => ["gen-1", "gen-2", "gen-3"].includes(era.generation))

  for (const era of erasWithGaps) {
    const years = groupEventsByYear(newestFirst(era.events))
    const expected = years.flatMap((group, index) => {
      const gap = yearsEarlierThanPrevious(years, index)
      return gap === null ? [] : [`${gap} years earlier, then ${group.year}`]
    })
    const marked = await page.locator(`#${era.id} .dex-gap`).evaluateAll((markers) =>
      markers.map((marker) => `${marker.textContent}, then ${marker.parentElement!.querySelector("[data-year-column]")!.getAttribute("data-year-column")}`),
    )

    expect(expected, era.name).not.toHaveLength(0)
    expect(marked, era.name).toEqual(expected)
  }
})

test("heads the timeline with the current era, marked now, and each era below with the year the rewind passes", async ({ page }) => {
  await page.goto("/")

  await expect(page.locator("[data-era-marker]")).toHaveText([
    "Now",
    "Before 2025",
    "Before 2020",
    "Before 2010",
    "Before 1990",
    "Before 1970",
  ])
})

test("keeps a Poké Ball just above the newest entry, watching for what comes after it", async ({ page }) => {
  const newest = events[events.length - 1]
  await page.goto("/")

  const frontier = page.locator("#the-agentic-era [data-frontier]")
  await expect(frontier).toHaveCount(1)
  await expect(frontier).toContainText(`Watching for what comes after ${newest.month} ${newest.year}`)
  const above = await frontier.evaluate((row) => {
    const first = document.querySelector("#the-agentic-era article")!
    return Boolean(row.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING)
  })
  expect(above).toBe(true)
})

test("opens each year of the Generative AI and Agentic Eras with its field notes from the data, the latest year first", async ({
  page,
}) => {
  await page.goto("/")

  await expect(page.locator("[data-year-summary]")).toHaveText(
    newestFirst(yearSummaryData).map(({ year, summary }) => new RegExp(`Field notes · ${year}${summary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`)),
  )
})

test("prints the first generation in its four greens and the pixel font of its screen", async ({ page }) => {
  await page.goto("/")

  const card = page.locator("#the-foundation-era article").first()
  await expect(card).toHaveCSS("background-color", "rgb(155, 188, 15)")
  // next/font names the self-hosted Press Start 2P after its variable
  await expect(card.locator("h3")).toHaveCSS("font-family", /^pressStart,/)
})

test("keeps a year in view beside its events while they scroll past", async ({ page }) => {
  await page.goto("/")
  await waitForHydration(page)

  const gapBelowToolbar = await page.evaluate(async () => {
    const toolbar = document.querySelector('[role="search"]')!.parentElement!
    // A year with many events, so its column has room to stay pinned
    const column = document.querySelector('[data-year-column="2023"]')!
    const pinned = column.firstElementChild!
    const columnTop = column.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: columnTop + column.clientHeight / 2, behavior: "instant" as ScrollBehavior })
    await new Promise((resolve) => requestAnimationFrame(resolve))
    return pinned.getBoundingClientRect().top - toolbar.getBoundingClientRect().bottom
  })

  // The year rests a rem and a half below the toolbar
  expect(gapBelowToolbar).toBeCloseTo(24, 0)
})

test("dissolves each era into the next through the page's color", async ({ page }) => {
  await page.goto("/")

  const backdrops = await page
    .locator("section[data-generation]")
    .evaluateAll((sections) =>
      sections.map((section) => getComputedStyle(section.querySelector("[data-era-backdrop]")!).backgroundImage),
    )

  expect(backdrops).toHaveLength(GENERATIONS.length)
  // The seam comes first, whether other layers follow it or it is the only one
  for (const backdrop of backdrops) {
    expect(backdrop).toMatch(/^linear-gradient\(rgb\(11, 13, 26\), .*?, rgb\(11, 13, 26\)\)(, |$)/)
  }
})

const busyYears = groupEventsByYear(events).filter((group) => isBusyYear(group.events))

test("keeps only each busy year's landmarks and highlights in full, and lists the rest in brief", async ({ page }) => {
  await page.goto("/")

  expect(busyYears.map((group) => group.year)).toEqual([2022, 2023, 2024, 2025, 2026])
  await expect(page.locator("article")).toHaveCount(events.length)
  for (const group of busyYears) {
    const fullSize = newestFirst(group.events.filter((event) => event.landmark || event.highlight).map((event) => event.title))
    const shown = await page
      .locator(`article[data-year="${group.year}"]:not([data-brief])`)
      .evaluateAll((cards) => cards.map((card) => card.querySelector("a[data-event-link]")!.textContent))
    expect(shown, String(group.year)).toEqual(fullSize)
    await expect(page.locator(`article[data-year="${group.year}"][data-brief]`)).toHaveCount(
      group.events.length - fullSize.length,
    )
  }
})

test("shows a busy year in full from its Show all button", async ({ page }) => {
  await page.goto("/")
  await waitForHydration(page)

  const year2024 = busyYears.find((group) => group.year === 2024)!
  const button = page
    .locator('[data-year-group="2024"]')
    .getByRole("button", { name: `Show all ${year2024.events.length} in full` })
  await expect(async () => {
    await button.click()
    await expect(button).toHaveAttribute("aria-pressed", "true", { timeout: 1000 })
  }).toPass({ timeout: 15_000 })

  await expect(page.locator('article[data-year="2024"][data-brief]')).toHaveCount(0)
  await expect(page.locator('article[data-year="2023"][data-brief]')).not.toHaveCount(0)
})

test("lists the busy years in brief in under half the length of showing them in full", async ({ page }) => {
  await page.goto("/")
  await waitForHydration(page)
  const busyGroups = page.locator(busyYears.map((group) => `[data-year-group="${group.year}"]`).join(", "))
  const height = () =>
    busyGroups.evaluateAll((groups) => groups.reduce((sum, group) => sum + group.getBoundingClientRect().height, 0))
  const inBrief = await height()

  for (const group of busyYears) {
    // Two busy years can hold as many events, so each button is found within its own year
    const button = page
      .locator(`[data-year-group="${group.year}"]`)
      .getByRole("button", { name: `Show all ${group.events.length} in full` })
    await expect(async () => {
      await button.click()
      await expect(button).toHaveAttribute("aria-pressed", "true", { timeout: 1000 })
    }).toPass({ timeout: 15_000 })
  }
  const inFull = await height()

  expect(inBrief).toBeLessThan(inFull / 2)
})

test("closes the Agentic Era with how much faster its events came than those below it", async ({ page }) => {
  const pace = describePace(events, 2025)!
  await page.goto("/")

  const paceLine = page.locator("[data-pace-line]")
  await expect(paceLine).toHaveText(
    `The last ${pace.years} years hold ${pace.events} events, ${pace.multiple} times the yearly pace of the ${pace.yearsBefore} years before them.▼`,
  )
  const order = await paceLine.evaluate((line) => {
    const generative = document.getElementById("the-generative-ai-era")!
    const agentic = document.getElementById("the-agentic-era")!
    return [
      Boolean(agentic.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING),
      Boolean(line.compareDocumentPosition(generative) & Node.DOCUMENT_POSITION_FOLLOWING),
    ]
  })
  expect(order).toEqual([true, true])
})

test("shows each brief entry's date before its title on a wide screen", async ({ page }) => {
  await page.goto("/")

  const misplaced = await page.locator("article[data-brief]").evaluateAll((articles) =>
    articles
      .filter((article) => {
        const date = article.querySelector("time")!.getBoundingClientRect()
        return date.width <= 1 || date.right > article.querySelector("h3")!.getBoundingClientRect().left
      })
      .map((article) => article.id),
  )

  expect(misplaced).toEqual([])
})

const PHONE = { width: 390, height: 844 }

test.describe(`on a phone (${PHONE.width}x${PHONE.height})`, () => {
  test.use({ viewport: PHONE })

  test("shows each brief entry's date ahead of its title", async ({ page }) => {
    await page.goto("/")

    const misplaced = await page.locator("article[data-brief]").evaluateAll((articles) =>
      articles
        .filter((article) => {
          const date = article.querySelector("time")!.getBoundingClientRect()
          return date.width <= 1 || date.bottom > article.querySelector("h3")!.getBoundingClientRect().top + 1
        })
        .map((article) => article.id),
    )

    expect(misplaced).toEqual([])
  })

  test("stacks the two screens of each Generation IV entry, the creature above its entry", async ({ page }) => {
    await page.goto("/")

    const misplaced = await page.locator("#the-deep-learning-revolution article").evaluateAll((articles) =>
      articles
        .filter((article) => {
          const stage = article.querySelector(".dex-stage")!.getBoundingClientRect()
          return stage.bottom > article.querySelector(".dex-body")!.getBoundingClientRect().top
        })
        .map((article) => article.id),
    )

    expect(misplaced).toEqual([])
  })
})
