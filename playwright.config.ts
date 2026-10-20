// Playwright configuration for the end-to-end test suite.
// Builds the app and serves it with `next start` before running the specs in tests/e2e.
import { defineConfig, devices } from "@playwright/test"

const port = Number(process.env.E2E_PORT ?? 3100)
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `next build && next start --port ${port}`,
    url: baseURL,
    timeout: 300_000,
    reuseExistingServer: false,
  },
})
