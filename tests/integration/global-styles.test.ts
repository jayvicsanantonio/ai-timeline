// Integration tests for the app's global stylesheet, which tests/setup.ts loads for every test.
// Covers the positioned scroll container useScroll needs, sideways clipping that keeps sticky parts working, the cursor and the dark color scheme.
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

  it("asks the browser for dark scrollbars and form controls to match the dark page", () => {
    expect(getComputedStyle(document.documentElement).colorScheme).toBe("dark")
  })

  it("draws the page in its near-black chrome without needing a theme class on the root element", () => {
    expect(document.documentElement).not.toHaveClass("dark")
    expect(getComputedStyle(document.body).backgroundColor).toBe("rgb(10, 10, 11)")
  })
})
