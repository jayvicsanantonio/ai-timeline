// End-to-end tests for the timeline page running in a real Next.js server.
// Covers error-free loading, the prologue filter, category badge colors, card dates and insight stats on real data.
import { expect, test } from "@playwright/test"
import timelineData from "../../data/timeline-events.json"

test("loads and scrolls the whole timeline without console or page errors", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.message))

  await page.goto("/")
  await expect(page.locator("section").first()).toBeVisible()

  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  })

  expect(errors).toEqual([])
})

test("applies the prologue blur and brightness filter", async ({ page }) => {
  await page.goto("/")

  const prologue = page.locator("section").first()
  await expect(prologue).toBeVisible()
  expect(await prologue.evaluate((element) => getComputedStyle(element).filter)).toBe("blur(0px) brightness(1)")
})

test("shows categories outside the original five in their own badge colors", async ({ page }) => {
  await page.goto("/")

  const expectedBadgeTextClass = {
    "Companies & Investments": /text-indigo-400/,
    "AI Tools": /text-pink-400/,
    "Bombshell News": /text-red-400/,
    Agents: /text-violet-400/,
  }

  for (const [category, textClass] of Object.entries(expectedBadgeTextClass)) {
    const badgeLabel = page.getByText(category, { exact: true }).first()
    await badgeLabel.scrollIntoViewIfNeeded()
    await expect(badgeLabel.locator("xpath=..")).toHaveClass(textClass)
  }
})

test("shows only the year on cards whose month is unknown", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 3, name: "Kismet the Robot" })).toBeAttached()

  await expect(page.getByText(/Unknown/)).toHaveCount(0)
})

test("computes the 2010-or-later share in Timeline Insights from the real events", async ({ page }) => {
  const recentCount = timelineData.filter((event) => event.year >= 2010).length
  const expectedShare = `${Math.round((recentCount / timelineData.length) * 100)}%`

  await page.goto("/")

  const statLabel = page.getByText(`of the ${timelineData.length} events happened in 2010 or later`, { exact: true })
  await statLabel.scrollIntoViewIfNeeded()
  await expect(statLabel.locator("xpath=preceding-sibling::div[1]")).toHaveText(expectedShare)
})
