// Integration test for the app's global stylesheet, which tests/setup.ts loads for every test.
// framer-motion's useScroll needs a positioned scroll container to measure its targets without warning.
import { describe, expect, it } from "vitest"

describe("global styles", () => {
  it("positions the page's scroll container so useScroll can measure its targets", () => {
    expect(document.scrollingElement).toBe(document.documentElement)
    expect(getComputedStyle(document.documentElement).position).not.toBe("static")
  })
})
