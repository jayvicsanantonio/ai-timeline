// The Playwright test for the Pokémon theme's specs. Its pages open in the Pokémon theme, as a reader who pressed Pokémon-ify
// on an earlier visit would see them: the choice is in their browser's storage before the page's first script runs. The
// page is prerendered in the classic theme and draws the Pokémon theme once it runs, so every navigation waits for that.
import { test as base, type Page } from "@playwright/test"
import { THEME_STORAGE_KEY } from "../../../lib/theme"

export { expect, type Page } from "@playwright/test"

async function pokemonDrawn(page: Page) {
  await page.locator('[data-theme-root="pokemon"]').waitFor({ state: "attached" })
}

export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.addInitScript((key) => window.localStorage.setItem(key, "pokemon"), THEME_STORAGE_KEY)
    const goto = page.goto.bind(page)
    const reload = page.reload.bind(page)
    page.goto = async (...args) => {
      const response = await goto(...args)
      await pokemonDrawn(page)
      return response
    }
    page.reload = async (...args) => {
      const response = await reload(...args)
      await pokemonDrawn(page)
      return response
    }
    await provide(page)
  },
})
