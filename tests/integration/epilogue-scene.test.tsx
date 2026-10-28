// Integration tests for EpilogueScene, the close of the page, in real Chromium.
// It ends on a level-2 heading, leaves room for the next era's interface and links back to the start.
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { EpilogueScene } from "@/components/storytelling/epilogue-scene"
import { ERA_DEFINITIONS } from "@/lib/eras"

// The rgb() a computed style reports for a #rrggbb color
function rgb(hex: string) {
  const [red, green, blue] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16))
  return `rgb(${red}, ${green}, ${blue})`
}

describe("EpilogueScene", () => {
  it("closes the story with a level-2 heading", () => {
    render(<EpilogueScene firstEraId="the-foundation-era" firstYear={1943} />)

    expect(screen.getByRole("heading", { level: 2, name: "The Story Continues" })).toBeInTheDocument()
  })

  it("leaves an empty frame for the interface of the next era", () => {
    render(<EpilogueScene firstEraId="the-foundation-era" firstYear={1943} />)

    expect(screen.getByText("Chapter 6")).toBeInTheDocument()
    expect(screen.getByText("Interface not yet invented")).toBeInTheDocument()
  })

  it("traces the five eras' colors in order up to the open slot for the next one", () => {
    const { container } = render(<EpilogueScene firstEraId="the-foundation-era" firstYear={1943} />)

    const trail = container.querySelector("[data-era-trail]")!
    expect(trail).toHaveAttribute("aria-hidden", "true")
    const segments = [...trail.querySelectorAll("[data-era-color]")]
    expect(segments.map((segment) => getComputedStyle(segment).backgroundColor)).toEqual(
      ERA_DEFINITIONS.map((era) => rgb(era.color)),
    )
    const openSlot = trail.querySelector("[data-next-era]")!
    expect(getComputedStyle(openSlot).borderTopStyle).toBe("dashed")
    expect(segments.at(-1)!.compareDocumentPosition(openSlot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("links back to the first era", () => {
    render(<EpilogueScene firstEraId="the-foundation-era" firstYear={1943} />)

    expect(screen.getByRole("link", { name: "Back to 1943" })).toHaveAttribute("href", "#the-foundation-era")
  })
})
