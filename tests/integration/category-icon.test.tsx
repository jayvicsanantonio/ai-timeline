// Integration tests for CategoryIcon in real Chromium.
// Every category is drawn with the icon of its own type, hidden from assistive technology because its name is always shown
// beside it.
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CategoryIcon } from "@/components/ui/category-icon"
import { CATEGORY_TYPES } from "@/lib/dex"
import { TIMELINE_CATEGORIES } from "@/types/timeline"

describe("CategoryIcon", () => {
  it.each(TIMELINE_CATEGORIES)("draws a decorative icon of its type for %s", (category) => {
    const { container } = render(<CategoryIcon category={category} />)

    const icon = container.firstElementChild!
    expect(icon).toHaveAttribute("aria-hidden", "true")
    expect(icon).toHaveAttribute("data-type-icon", CATEGORY_TYPES[category].name)
    expect(icon.querySelector("img")).toHaveAttribute("src", `/sprites/types/${CATEGORY_TYPES[category].id}.png`)
    expect(icon.querySelector("img")).toHaveAttribute("alt", "")
  })

  it("gives each category a different icon", () => {
    const sources = TIMELINE_CATEGORIES.map((category) => {
      const { container, unmount } = render(<CategoryIcon category={category} />)
      const source = container.querySelector("img")!.getAttribute("src")
      unmount()
      return source
    })

    expect(new Set(sources).size).toBe(TIMELINE_CATEGORIES.length)
  })
})
