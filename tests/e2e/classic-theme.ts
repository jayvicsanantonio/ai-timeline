// The Playwright test for the classic page's specs. The page opens in the Pokémon theme by default, so these pages open in
// the classic theme, as a reader who pressed Switch to classic on an earlier visit would see them: the choice is in their
// browser's storage before the page's first script runs. The page is prerendered in the Pokémon theme and draws the
// classic one once it runs, so every navigation waits until the classic timeline is drawn.
import { test as base, type Page } from "@playwright/test"
import { THEME_STORAGE_KEY } from "../../lib/theme"

export { expect, type Locator, type Page } from "@playwright/test"

async function classicDrawn(page: Page) {
  await page.locator('[data-theme-root="classic"]').waitFor({ state: "attached" })
  await page.locator('[data-pokeball-overlay][data-phase="idle"]').waitFor({ state: "attached" })
}

export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.addInitScript((key) => window.localStorage.setItem(key, "classic"), THEME_STORAGE_KEY)
    const goto = page.goto.bind(page)
    const reload = page.reload.bind(page)
    page.goto = async (...args) => {
      const response = await goto(...args)
      await classicDrawn(page)
      return response
    }
    page.reload = async (...args) => {
      const response = await reload(...args)
      await classicDrawn(page)
      return response
    }
    await provide(page)
  },
})
