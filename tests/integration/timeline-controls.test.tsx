// Integration tests for TimelineControls, the timeline's search box and category filters, in real Chromium.
// Covers searching, picking categories from the panel, clearing filters and the live count of shown events.
import { render, screen, within } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
import { TimelineControls } from "@/components/timeline/timeline-controls"
import { NO_FILTERS, type TimelineFilters } from "@/lib/timeline-filter"
import { TIMELINE_CATEGORIES, type TimelineCategory } from "@/types/timeline"

const categoryCounts = Object.fromEntries(
  TIMELINE_CATEGORIES.map((category, index) => [category, index + 1]),
) as Record<TimelineCategory, number>

// Holds the filters in state like StoryEngine does, and shows a fixed count for whatever is picked.
function ControlledControls({ initialFilters = NO_FILTERS }: { initialFilters?: TimelineFilters }) {
  const [filters, setFilters] = useState(initialFilters)
  const filtering = filters.categories.length > 0 || filters.query.trim() !== ""

  return (
    <>
      <TimelineControls
        filters={filters}
        onFiltersChange={setFilters}
        categoryCounts={categoryCounts}
        shownCount={filtering ? 12 : 275}
        totalCount={275}
      />
      <pre data-testid="filters">{JSON.stringify(filters)}</pre>
    </>
  )
}

function currentFilters() {
  return JSON.parse(screen.getByTestId("filters").textContent!) as TimelineFilters
}

function categoriesToggle() {
  return screen.getByRole("button", { name: /^Categories/ })
}

describe("TimelineControls", () => {
  it("offers a labelled search box inside a search landmark", () => {
    render(<ControlledControls />)

    const search = screen.getByRole("search")
    expect(within(search).getByRole("searchbox", { name: "Search events" })).toBeInTheDocument()
  })

  it("searches as the reader types", async () => {
    render(<ControlledControls />)

    await userEvent.type(screen.getByRole("searchbox", { name: "Search events" }), "chess")

    expect(currentFilters().query).toBe("chess")
  })

  it("keeps the category panel closed until its toggle is pressed", async () => {
    render(<ControlledControls />)

    const toggle = categoriesToggle()
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("group", { name: "Filter by category" })).not.toBeInTheDocument()

    await userEvent.click(toggle)

    expect(toggle).toHaveAttribute("aria-expanded", "true")
    const panel = screen.getByRole("group", { name: "Filter by category" })
    expect(toggle).toHaveAttribute("aria-controls", panel.id)
  })

  it("lists every category with its event count as an unpressed toggle", async () => {
    render(<ControlledControls />)
    await userEvent.click(categoriesToggle())

    const panel = screen.getByRole("group", { name: "Filter by category" })
    TIMELINE_CATEGORIES.forEach((category) => {
      const button = within(panel).getByRole("button", { name: `${category} ${categoryCounts[category]} events` })
      expect(button).toHaveAttribute("aria-pressed", "false")
    })
  })

  it("picks and unpicks categories, and names how many are picked on the toggle", async () => {
    render(<ControlledControls />)
    await userEvent.click(categoriesToggle())
    const panel = screen.getByRole("group", { name: "Filter by category" })

    await userEvent.click(within(panel).getByRole("button", { name: /^Agents/ }))
    await userEvent.click(within(panel).getByRole("button", { name: /^Ethics & Policy/ }))

    expect(currentFilters().categories).toEqual(["Agents", "Ethics & Policy"])
    expect(within(panel).getByRole("button", { name: /^Agents/ })).toHaveAttribute("aria-pressed", "true")
    expect(categoriesToggle()).toHaveAccessibleName("Categories, 2 picked")

    await userEvent.click(within(panel).getByRole("button", { name: /^Agents/ }))

    expect(currentFilters().categories).toEqual(["Ethics & Policy"])
    expect(within(panel).getByRole("button", { name: /^Agents/ })).toHaveAttribute("aria-pressed", "false")
  })

  it("closes the category panel on Escape and returns focus to its toggle", async () => {
    render(<ControlledControls />)
    await userEvent.click(categoriesToggle())
    within(screen.getByRole("group", { name: "Filter by category" })).getAllByRole("button")[0].focus()

    await userEvent.keyboard("{Escape}")

    expect(screen.queryByRole("group", { name: "Filter by category" })).not.toBeInTheDocument()
    expect(categoriesToggle()).toHaveFocus()
  })

  it("counts the shown events, and announces changes politely", () => {
    render(<ControlledControls initialFilters={{ categories: ["Agents"], query: "" }} />)

    const status = screen.getByRole("status")
    expect(status).toHaveTextContent("Showing 12 of 275 events")
  })

  it("names only the total while nothing is filtered", () => {
    render(<ControlledControls />)

    expect(screen.getByRole("status")).toHaveTextContent("275 events")
    expect(screen.getByRole("status")).not.toHaveTextContent("Showing")
  })

  it("clears the search and the categories together", async () => {
    render(<ControlledControls initialFilters={{ categories: ["Agents"], query: "robot" }} />)

    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }))

    expect(currentFilters()).toEqual(NO_FILTERS)
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument()
  })
})
