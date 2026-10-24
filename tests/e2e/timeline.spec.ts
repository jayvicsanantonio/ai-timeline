// End-to-end tests for the timeline page running in a real Next.js server.
// Covers error-free loading, the prologue filter, category badge colors on real data, and the neural backgrounds.
import { expect, test } from "@playwright/test"

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

test("paints every neural background in the primary color, each with its own pattern id", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("section").first()).toBeVisible()

  const { primary, patterns } = await page.evaluate(() => {
    // Resolves --primary to the rgb() form that computed styles report.
    const probe = document.createElement("div")
    probe.style.color = "var(--primary)"
    document.body.append(probe)
    const primary = getComputedStyle(probe).color
    probe.remove()

    return {
      primary,
      patterns: Array.from(document.querySelectorAll("svg pattern"), (pattern) => ({
        id: pattern.id,
        colors: [
          ...Array.from(pattern.querySelectorAll("circle"), (circle) => getComputedStyle(circle).fill),
          ...Array.from(pattern.querySelectorAll("path"), (path) => getComputedStyle(path).stroke),
        ],
      })),
    }
  })

  expect(primary).not.toBe("rgb(0, 0, 0)")
  expect(patterns.length).toBeGreaterThan(1)
  expect(new Set(patterns.map((pattern) => pattern.id)).size).toBe(patterns.length)
  for (const pattern of patterns) {
    expect(new Set(pattern.colors)).toEqual(new Set([primary]))
  }
})
