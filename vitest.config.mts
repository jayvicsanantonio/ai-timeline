// Vitest configuration for the unit and integration test suites.
// Runs tests in real headless Chromium through Playwright and resolves the "@/" alias from tsconfig.json.
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // Source directories are listed explicitly so tests in nested git worktrees under .claude/ are never collected.
    include: [
      "tests/unit/**/*.test.{ts,tsx}",
      "tests/integration/**/*.test.{ts,tsx}",
      "{app,components,hooks,lib}/**/*.test.{ts,tsx}",
    ],
    setupFiles: ["./tests/setup.ts"],
    // Processes CSS imports, so tests render with the app's real global styles from tests/setup.ts.
    css: true,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
})
