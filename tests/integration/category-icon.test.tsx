// Integration tests for CategoryIcon in real Chromium.
// Every category gets its own icon, hidden from assistive technology because its name is always shown beside it.
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CategoryIcon } from "@/components/ui/category-icon"
import { TIMELINE_CATEGORIES } from "@/types/timeline"

describe("CategoryIcon", () => {
  it.each(TIMELINE_CATEGORIES)("draws a decorative icon for %s", (category) => {
    const { container } = render(<CategoryIcon category={category} />)

    const icon = container.querySelector("svg")
    expect(icon).not.toBeNull()
    expect(icon).toHaveAttribute("aria-hidden", "true")
  })

  it("gives each category a different icon", () => {
    const drawings = TIMELINE_CATEGORIES.map((category) => {
      const { container, unmount } = render(<CategoryIcon category={category} />)
      const drawing = container.querySelector("svg")!.innerHTML
      unmount()
      return drawing
    })

    expect(new Set(drawings).size).toBe(TIMELINE_CATEGORIES.length)
  })
})
