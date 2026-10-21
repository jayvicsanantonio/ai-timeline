// Integration test for NarrativeBridge with TextReveal: the section title must be
// a level-2 heading so screen reader users can navigate between eras.
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { NarrativeBridge } from "@/components/storytelling/narrative-bridge"

describe("NarrativeBridge", () => {
  it("renders its title as a level-2 heading with the full title as its name", () => {
    render(
      <NarrativeBridge
        era="Chapter 1"
        title="The Foundation Era"
        subtitle="1940s - 1960s"
        description="The birth of artificial intelligence as a field of study."
      />,
    )

    expect(screen.getByRole("heading", { level: 2, name: "The Foundation Era" })).toBeInTheDocument()
  })
})
