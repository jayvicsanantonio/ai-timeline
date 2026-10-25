// Integration tests for EpilogueScene, the close of the page, in real Chromium.
// It ends on a level-2 heading, leaves room for the next era's interface and links back to the start.
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { EpilogueScene } from "@/components/storytelling/epilogue-scene"

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

  it("links back to the first era", () => {
    render(<EpilogueScene firstEraId="the-foundation-era" firstYear={1943} />)

    expect(screen.getByRole("link", { name: "Back to 1943" })).toHaveAttribute("href", "#the-foundation-era")
  })
})
