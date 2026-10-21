// Unit tests for TextReveal's semantics: the element it renders as and how the
// animated word-by-word text is exposed to assistive technology.
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { TextReveal } from "@/components/animations/text-reveal"

describe("TextReveal", () => {
  it("renders a div that is not a heading by default", () => {
    const { container } = render(<TextReveal text="Machines that think" />)

    expect(container.firstElementChild?.tagName).toBe("DIV")
    expect(screen.queryByRole("heading")).not.toBeInTheDocument()
  })

  it("renders as the requested heading element", () => {
    render(<TextReveal as="h2" text="The Foundation Era" />)

    expect(screen.getByRole("heading", { level: 2 }).tagName).toBe("H2")
  })

  it("exposes the whole text as one accessible name instead of word by word", () => {
    render(<TextReveal as="h2" text="The Foundation Era" />)

    expect(screen.getByRole("heading", { level: 2, name: "The Foundation Era" })).toBeInTheDocument()
  })

  it("hides the individually animated words from assistive technology", () => {
    render(<TextReveal as="h2" text="The Foundation Era" />)

    const heading = screen.getByRole("heading", { level: 2 })
    const animatedWords = Array.from(heading.children).filter((child) => child.getAttribute("aria-hidden") === "true")
    expect(animatedWords.map((word) => word.textContent)).toEqual(["The", "Foundation", "Era"])
  })
})
