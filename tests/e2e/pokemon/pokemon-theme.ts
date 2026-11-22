// The Playwright test for the Pokémon theme's specs. Its pages open in the Pokémon theme, the page's default, as a first-time
// reader sees them. The page is prerendered in the Pokémon theme, and every navigation waits until it is drawn and its
// scripts have run.
import { test as base, type Page } from "@playwright/test"

export { expect, type Page } from "@playwright/test"

async function pokemonDrawn(page: Page) {
  await page.locator('[data-theme-root="pokemon"]').waitFor({ state: "attached" })
  await page.locator('[data-pokeball-overlay][data-phase="idle"]').waitFor({ state: "attached" })
}

export const test = base.extend({
  page: async ({ page }, provide) => {
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
