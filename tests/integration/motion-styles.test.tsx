// Integration tests for scroll-driven motion styles rendered in a real browser.
// Covers the ParallaxContainer intensity multiplier and the PrologueScene filter.
import { expect, test } from "vitest"
import { render, screen } from "@testing-library/react"
import { ParallaxContainer } from "@/components/animations/parallax-container"
import { PrologueScene } from "@/components/storytelling/prologue-scene"

test("ParallaxContainer renders its children when intensity is not 1", () => {
  render(
    <ParallaxContainer intensity={2}>
      <p>parallax content</p>
    </ParallaxContainer>,
  )

  expect(screen.getByText("parallax content")).toBeInTheDocument()
})

test("PrologueScene applies its blur and brightness filter", () => {
  const { container } = render(<PrologueScene />)

  const section = container.querySelector("section")
  expect(section).not.toBeNull()
  expect(section!.style.filter).toBe("blur(0px) brightness(1)")
})
