// End-to-end test for the page's web font.
// Checks that text renders in a loaded web font served by the app itself, with no requests to Google Fonts.
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
