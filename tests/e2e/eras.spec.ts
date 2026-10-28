// End-to-end tests for the five era interfaces on the real page in Chromium.
// Each era is drawn in its own interface, and each interface answers the pointer the way its original did.
import { expect, test, type Locator, type Page } from "@playwright/test"
import timelineData from "../../data/timeline-events.json"
import yearSummaryData from "../../data/year-summaries.json"
import { groupEventsByEra } from "../../lib/eras"
import { eventSource } from "../../lib/event-format"
import { encodeHollerith } from "../../lib/hollerith"
import { describePace } from "../../lib/pace"
import { yearsSincePreviousEvent } from "../../lib/year-gaps"
import { groupEventsByYear, isBusyYear } from "../../lib/year-groups"
import type { TimelineEvent } from "../../types/timeline"

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

test("marks every approved landmark, in every era", async ({ page }) => {
  await page.goto("/")
  const landmarkCount = timelineData.filter((event) => "landmark" in event).length

  const perEra = await page
    .locator("section[data-interface]")
    .evaluateAll((sections) => sections.map((section) => section.querySelectorAll("article[data-landmark]").length))

  expect(perEra.reduce((sum, count) => sum + count, 0)).toBe(landmarkCount)
  expect(perEra.every((count) => count > 0)).toBe(true)
  await expect(page.locator("article[data-landmark]").getByText("Landmark", { exact: true })).toHaveCount(landmarkCount)
})

test("steps the window cascade only slightly, so the dates in the title bars stay in line", async ({ page }) => {
  await page.goto("/")

  const leftEdges = await page
    .locator("#the-learning-era article")
    .evaluateAll((windows) => windows.map((window) => Math.round(window.getBoundingClientRect().left)))

  expect(Math.max(...leftEdges) - Math.min(...leftEdges)).toBeLessThanOrEqual(32)
})

test("marks each stretch of more than a year between events, ahead of the event that ends it", async ({ page }) => {
  await page.goto("/")
  const erasWithGaps = groupEventsByEra(timelineData as TimelineEvent[]).filter((era) =>
    ["punch-card", "terminal", "desktop"].includes(era.interface),
  )

  for (const era of erasWithGaps) {
    const expected = era.events.flatMap((event, index) => {
      const years = yearsSincePreviousEvent(era.events, index)
      return years === null ? [] : [`${years} years later, then ${event.title}`]
    })
    const marked = await page.locator(`#${era.id} li`).evaluateAll((items) =>
      items.flatMap((item) => {
        const marker = [...item.children].find((child) => /^\d+ years later$/.test(child.textContent ?? ""))
        return marker ? [`${marker.textContent}, then ${item.querySelector("a[data-event-link]")!.textContent}`] : []
      }),
    )

    expect(expected, era.name).not.toHaveLength(0)
    expect(marked, era.name).toEqual(expected)
  }
})

test("opens each year of the chat thread with the reader's question", async ({ page }) => {
  await page.goto("/")
  const years = [...new Set(timelineData.filter((event) => event.year >= 2020).map((event) => event.year))]

  await expect(page.locator("[data-year-prompt]")).toHaveText(years.map((year) => `What happened in ${year}?`))
})

test("answers each year's question in the chat thread with its summary from the data", async ({ page }) => {
  await page.goto("/")

  await expect(page.locator("[data-year-summary]")).toHaveText(yearSummaryData.map(({ summary }) => summary))
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

test("dissolves each era into the next through the page's black", async ({ page }) => {
  await page.goto("/")

  const backdrops = await page
    .locator("section[data-interface]")
    .evaluateAll((sections) => sections.map((section) => getComputedStyle(section.firstElementChild!).backgroundImage))

  expect(backdrops).toHaveLength(5)
  for (const backdrop of backdrops) {
    expect(backdrop).toMatch(/^linear-gradient\(rgb\(10, 10, 11\), .*?, rgb\(10, 10, 11\)\), /)
  }
})

const busyYears = groupEventsByYear(timelineData as TimelineEvent[]).filter((group) => isBusyYear(group.events))

test("keeps only each busy year's landmarks and highlights in full, and lists the rest in brief", async ({ page }) => {
  await page.goto("/")

  expect(busyYears.map((group) => group.year)).toEqual([2023, 2024, 2025, 2026])
  await expect(page.locator("article")).toHaveCount(timelineData.length)
  for (const group of busyYears) {
    const fullSize = group.events.filter((event) => event.landmark || event.highlight).map((event) => event.title)
    const shown = await page
      .locator(`#the-generative-ai-era article[data-year="${group.year}"]:not([data-brief])`)
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

  const button = page.getByRole("button", { name: "Show all 64 in full" })
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
  const chat = page.locator("#the-generative-ai-era")
  const inBrief = await chat.evaluate((section) => section.getBoundingClientRect().height)

  for (const group of busyYears) {
    const button = page.getByRole("button", { name: `Show all ${group.events.length} in full` })
    await expect(async () => {
      await button.click()
      await expect(button).toHaveAttribute("aria-pressed", "true", { timeout: 1000 })
    }).toPass({ timeout: 15_000 })
  }
  const inFull = await chat.evaluate((section) => section.getBoundingClientRect().height)

  expect(inBrief).toBeLessThan(inFull / 2)
})

test("opens the 2020s with how much faster the events come", async ({ page }) => {
  const pace = describePace(timelineData as TimelineEvent[], 2020)!
  await page.goto("/")

  const paceLine = page.locator("[data-pace-line]")
  await expect(paceLine).toHaveText(
    `The next ${pace.years} years hold ${pace.events} events, ${pace.multiple} times the yearly pace of the ${pace.yearsBefore} years before them.`,
  )
  const order = await paceLine.evaluate((line) => {
    const notebook = document.getElementById("the-deep-learning-revolution")!
    const chat = document.getElementById("the-generative-ai-era")!
    return [
      Boolean(notebook.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING),
      Boolean(line.compareDocumentPosition(chat) & Node.DOCUMENT_POSITION_FOLLOWING),
    ]
  })
  expect(order).toEqual([true, true])
})

const PHONE = { width: 390, height: 844 }
const TABLET = { width: 900, height: 1000 }

const foundationCards = groupEventsByEra(timelineData as TimelineEvent[])[0].events.map((event) => ({
  description: event.description,
  fields: [event.category, eventSource(event)],
}))

// Where each Foundation Era card prints its category and source: beside its title above the punched holes,
// or after its description at the foot of the card
async function punchCardFieldPlaces(page: Page) {
  await page.goto("/")

  return page.locator("#the-foundation-era article").evaluateAll(
    (articles, cards) =>
      articles.map((article, index) => {
        const box = (text: string) =>
          [...article.querySelectorAll("span, p")].find((element) => element.textContent === text)!.getBoundingClientRect()
        const title = article.querySelector("h3")!.getBoundingClientRect()
        const holes = article.querySelector("svg")!.getBoundingClientRect()
        const description = box(cards[index].description)
        const fields = cards[index].fields.map(box)
        if (fields.every((field) => field.left > title.right && field.bottom <= holes.top) && description.top >= holes.bottom) {
          return "beside its title"
        }
        return fields.every((field) => field.top >= description.bottom) ? "after its description" : "elsewhere"
      }),
    foundationCards,
  )
}

test("stamps each punch card's category and source beside its date and title, so its description ends the card", async ({
  page,
}) => {
  const places = await punchCardFieldPlaces(page)

  expect(places).toEqual(foundationCards.map(() => "beside its title"))
})

test("wraps each long punch card title into lines of even length", async ({ page }) => {
  await page.goto("/")

  const lineWidths = await page.locator("#the-foundation-era h3 a").evaluateAll((links) =>
    links.map((link) => {
      const range = document.createRange()
      range.selectNodeContents(link)
      const lines = new Map<number, number>()
      for (const box of range.getClientRects()) {
        const line = Math.round(box.top)
        lines.set(line, (lines.get(line) ?? 0) + box.width)
      }
      return [...lines.values()]
    }),
  )

  const wrapped = lineWidths.filter((widths) => widths.length > 1)
  expect(wrapped.length).toBeGreaterThan(0)
  for (const widths of wrapped) {
    expect(Math.min(...widths) / Math.max(...widths)).toBeGreaterThan(0.5)
  }
})

// Each cell's prompts in order, and whether each takes up room on the page
async function notebookPrompts(page: Page) {
  await page.goto("/")

  return page.locator("#the-deep-learning-revolution article").evaluateAll((cells) =>
    cells.map((cell) =>
      [...cell.querySelectorAll(".notebook-prompt")].map(
        (prompt) => `${prompt.textContent} ${getComputedStyle(prompt).display === "none" ? "left out" : "shown"}`,
      ),
    ),
  )
}

test("prompts each notebook code cell and its output with In [n]: and Out[n]:", async ({ page }) => {
  const prompts = await notebookPrompts(page)

  expect(prompts).toEqual(prompts.map((_, index) => [`In [${index + 2}]: shown`, `Out[${index + 2}]: shown`]))
})

test("shows each brief event's date before its title on a wide screen", async ({ page }) => {
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

// Measured on the list items, which hold still while their messages' scroll reveal moves them
test("keeps each month's divider close to its messages, 24px below the month before and 12px above its first message", async ({
  page,
}) => {
  await page.goto("/")

  const gaps = await page.locator("#the-generative-ai-era div[data-month]").evaluateAll((months) =>
    months.map((month, index) => {
      const divider = month.querySelector("[data-month-divider]")!.parentElement!.getBoundingClientRect()
      const firstMessage = month.querySelector("li")!.getBoundingClientRect()
      const previous = months[index - 1]
      const sameYear = previous !== undefined && previous.parentElement === month.parentElement
      return {
        above: sameYear ? Math.round(divider.top - previous.getBoundingClientRect().bottom) : null,
        below: Math.round(firstMessage.top - divider.bottom),
      }
    }),
  )

  expect(gaps.length).toBeGreaterThan(50)
  expect(new Set(gaps.map((gap) => gap.below))).toEqual(new Set([12]))
  expect(new Set(gaps.flatMap((gap) => (gap.above === null ? [] : [gap.above])))).toEqual(new Set([24]))
})

test.describe(`on a tablet (${TABLET.width}x${TABLET.height})`, () => {
  test.use({ viewport: TABLET })

  test("keeps each punch card's category and source after its description", async ({ page }) => {
    const places = await punchCardFieldPlaces(page)

    expect(places).toEqual(foundationCards.map(() => "after its description"))
  })
})

test.describe(`on a phone (${PHONE.width}x${PHONE.height})`, () => {
  test.use({ viewport: PHONE })

  test("follows each notebook code cell with its output, keeping only the In [n]: prompt", async ({ page }) => {
    const prompts = await notebookPrompts(page)

    expect(prompts).toEqual(prompts.map((_, index) => [`In [${index + 2}]: shown`, `Out[${index + 2}]: left out`]))
  })

  test("leaves each brief event's date to its month's divider, still in the text screen readers hear", async ({ page }) => {
    await page.goto("/")

    const briefs = await page.locator("article[data-brief]").evaluateAll((articles) =>
      articles.map((article) => {
        const time = article.querySelector("time")!
        const box = time.getBoundingClientRect()
        const style = getComputedStyle(time)
        const divider = article.closest("div[data-month]")!.querySelector("[data-month-divider]")!
        return {
          id: article.id,
          sameAsDivider: time.textContent === divider.textContent,
          drawn: box.width > 1 || box.height > 1,
          heard: style.display !== "none" && style.visibility === "visible" && !time.closest('[aria-hidden="true"]'),
        }
      }),
    )

    expect(briefs.length).toBeGreaterThan(100)
    expect(briefs.filter((brief) => !brief.sameAsDivider || brief.drawn || !brief.heard)).toEqual([])
  })
})
