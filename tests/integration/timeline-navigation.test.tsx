// Integration tests for the phone chapter nav in TimelineNavigation: a bar that names
// the current era and opens a chapter list, which closes again on a second tap or a pick.
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"
import { TimelineNavigation } from "@/components/timeline/timeline-navigation"

const sections = [
  { id: "the-foundation-era", label: "Foundation Era", subtitle: "1940s - 1960s", chapter: "Chapter 1" },
  { id: "the-knowledge-era", label: "Knowledge Era", subtitle: "1970s - 1980s", chapter: "Chapter 2" },
  { id: "the-learning-era", label: "Learning Era", subtitle: "1990s - 2000s", chapter: "Chapter 3" },
]

function renderNavigation() {
  render(
    <>
      <TimelineNavigation sections={sections} />
      {sections.map((section) => (
        <section key={section.id} id={section.id} style={{ height: "200vh" }} />
      ))}
    </>,
  )

  const toggle = screen.getByRole("button", { name: /current era/i })
  return { toggle, phoneNav: toggle.closest("nav")! }
}

function chapterListOf(toggle: HTMLElement) {
  return document.getElementById(toggle.getAttribute("aria-controls") ?? "")
}

describe("TimelineNavigation on a phone", () => {
  it("collapses to a bar that names the current era and its position", () => {
    const { toggle, phoneNav } = renderNavigation()

    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(toggle).toHaveTextContent("Foundation Era")
    expect(toggle).toHaveTextContent("01 / 03")
    expect(within(phoneNav).getAllByRole("button")).toEqual([toggle])
  })

  it("opens the chapter list on a tap and closes it on a second tap", async () => {
    const { toggle } = renderNavigation()

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    const chapterList = chapterListOf(toggle)!
    const chapters = within(chapterList).getAllByRole("button")
    expect(chapters).toHaveLength(sections.length)
    expect(chapters[0]).toHaveAttribute("aria-current", "location")

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(chapterList).not.toBeInTheDocument()
  })

  it("jumps to the picked chapter and closes the list", async () => {
    const { toggle } = renderNavigation()

    await userEvent.click(toggle)
    await userEvent.click(within(chapterListOf(toggle)!).getByRole("button", { name: /Learning Era/ }))

    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(chapterListOf(toggle)).toBeNull()
    await expect.poll(() => toggle.textContent).toContain("Learning Era")
    await expect.poll(() => toggle.textContent).toContain("03 / 03")
  })
})
