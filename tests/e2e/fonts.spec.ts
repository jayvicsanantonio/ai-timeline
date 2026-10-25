// End-to-end tests for the page's web fonts.
// Checks that text renders in loaded web fonts served by the app itself, with no requests to Google Fonts.
import { expect, test } from "@playwright/test"

test("renders text in a web font served by the app", async ({ page }) => {
  const fontUrls: string[] = []
  page.on("request", (request) => {
    if (request.resourceType() === "font" || /fonts\.(googleapis|gstatic)\.com/.test(request.url())) {
      fontUrls.push(request.url())
    }
  })

  await page.goto("/")
  await page.evaluate(() => document.fonts.ready)

  for (const element of [page.locator("body"), page.getByRole("heading", { level: 1 })]) {
    const family = await element.evaluate((node) =>
      getComputedStyle(node).fontFamily.split(",")[0].trim().replace(/^['"]|['"]$/g, ""),
    )
    const isLoaded = await page.evaluate(
      (name) => [...document.fonts].some((face) => face.family.replace(/^['"]|['"]$/g, "") === name && face.status === "loaded"),
      family,
    )
    expect(isLoaded, `${family} should be a loaded web font`).toBe(true)
  }

  const appOrigin = new URL(page.url()).origin
  expect(fontUrls.length).toBeGreaterThan(0)
  for (const url of fontUrls) {
    expect(new URL(url).origin).toBe(appOrigin)
  }
})

test("loads its own web font for the serif family", async ({ page }) => {
  await page.goto("/")

  const fonts = await page.evaluate(async () => {
    const firstFamily = (element: Element) =>
      getComputedStyle(element).fontFamily.split(",")[0].trim().replace(/^['"]|['"]$/g, "")

    // Nothing on the page uses the serif family yet, so a sample element asks for it.
    const sample = document.createElement("p")
    sample.textContent = "The AI Timeline"
    sample.style.fontFamily = "var(--font-serif)"
    document.body.append(sample)

    const serif = firstFamily(sample)
    await document.fonts.load(`400 16px "${serif}"`)

    return {
      body: firstFamily(document.body),
      serif,
      serifLoaded: [...document.fonts].some(
        (face) => face.family.replace(/^['"]|['"]$/g, "") === serif && face.status === "loaded",
      ),
    }
  })

  expect(fonts.serif).not.toBe(fonts.body)
  expect(fonts.serifLoaded, `${fonts.serif} should be a loaded web font`).toBe(true)
})
