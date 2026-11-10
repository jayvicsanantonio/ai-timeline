// Integration tests for CategoryIcon in real Chromium.
// Every category is drawn as its own item from the bag, hidden from assistive technology because its name is always shown
// beside it.
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CategoryIcon } from "@/components/pokemon/ui/category-icon"
import { CATEGORY_ITEMS } from "@/lib/dex"
import { TIMELINE_CATEGORIES } from "@/types/timeline"

describe("CategoryIcon", () => {
  it.each(TIMELINE_CATEGORIES)("draws a decorative item for %s", (category) => {
    const { container } = render(<CategoryIcon category={category} />)

    const icon = container.firstElementChild!
    expect(icon).toHaveAttribute("aria-hidden", "true")
    expect(icon).toHaveAttribute("data-category-item", CATEGORY_ITEMS[category].item)
    expect(icon.querySelector("img")).toHaveAttribute("src", `/sprites/items/${CATEGORY_ITEMS[category].item}.png`)
    expect(icon.querySelector("img")).toHaveAttribute("alt", "")
  })

  it("gives each category a different item", () => {
    const sources = TIMELINE_CATEGORIES.map((category) => {
      const { container, unmount } = render(<CategoryIcon category={category} />)
      const source = container.querySelector("img")!.getAttribute("src")
      unmount()
      return source
    })

    expect(new Set(sources).size).toBe(TIMELINE_CATEGORIES.length)
  })
})
