// Shared setup for the Vitest unit and integration suites.
// Loads the app's global styles, adds the jest-dom matchers and unmounts rendered components after each test.
/// <reference types="@vitest/browser-playwright" />
import "@/app/globals.css"
import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(() => {
  cleanup()
})
