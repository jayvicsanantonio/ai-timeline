// Shared setup for the Vitest unit and integration suites.
// Adds the jest-dom matchers and unmounts rendered components after each test.
/// <reference types="@vitest/browser-playwright" />
import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(() => {
  cleanup()
})
