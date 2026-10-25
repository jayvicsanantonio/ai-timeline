// Integration tests for the app's global stylesheet, which tests/setup.ts loads for every test.
// Covers the positioned scroll container useScroll needs, sideways clipping that keeps sticky parts working, and the cursor.
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

  it("keeps the system cursor, even for a mouse with motion allowed", () => {
    expect(getComputedStyle(document.body).cursor).toBe("auto")
  })
})
