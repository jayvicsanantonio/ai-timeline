// Integration tests for the app's global stylesheet, which tests/setup.ts loads for every test.
// framer-motion's useScroll needs a positioned scroll container, and sticky parts need a body that does not scroll itself.
import { describe, expect, it } from "vitest"

describe("global styles", () => {
  it("positions the page's scroll container so useScroll can measure its targets", () => {
    expect(document.scrollingElement).toBe(document.documentElement)
    expect(getComputedStyle(document.documentElement).position).not.toBe("static")
  })

  it("clips sideways overflow without turning the page into a scroll container that would unstick sticky parts", () => {
    for (const element of [document.documentElement, document.body]) {
      const style = getComputedStyle(element)
      expect(style.overflowX).toBe("clip")
      expect(style.overflowY).toBe("visible")
    }
  })
})
