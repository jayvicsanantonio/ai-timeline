// End-to-end smoke test for the home page.
// Loads the production build and checks the page title and main landmark.
import { expect, test } from "@playwright/test"

test("home page loads", async ({ page }) => {
  await page.goto("/")

  await expect(page).toHaveTitle(/The AI Timeline/)
  await expect(page.locator("#main-content")).toBeVisible()
})
