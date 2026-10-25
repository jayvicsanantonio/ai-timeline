// Integration tests for AnimatedBackground's neural variant in real Chromium:
// the pattern paints in the theme's primary color, and every instance has its own pattern id.
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AnimatedBackground } from "@/components/ui/animated-background"

// Resolves --primary to the rgb() form that computed styles report.
function primaryColor() {
  const probe = document.createElement("div")
  probe.style.color = "var(--primary)"
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

describe("AnimatedBackground neural variant", () => {
  it("fills its nodes and strokes its links with the primary color", () => {
    const { container } = render(<AnimatedBackground variant="neural" />)
    const primary = primaryColor()
    expect(primary).not.toBe("rgb(0, 0, 0)")

    const fills = [...container.querySelectorAll("pattern circle")].map((circle) => getComputedStyle(circle).fill)
    const strokes = [...container.querySelectorAll("pattern path")].map((path) => getComputedStyle(path).stroke)

    expect(fills).toEqual(Array(5).fill(primary))
    expect(strokes).toEqual(Array(2).fill(primary))
  })

  it("gives each instance its own pattern id and fills its rect with that pattern", () => {
    const { container } = render(
      <>
        <AnimatedBackground variant="neural" />
        <AnimatedBackground variant="neural" />
      </>,
    )

    const svgs = [...container.querySelectorAll("svg")]
    const patternIds = svgs.map((svg) => svg.querySelector("pattern")?.id)

    expect(new Set(patternIds).size).toBe(svgs.length)
    svgs.forEach((svg, index) => {
      expect(svg.querySelector("rect")).toHaveAttribute("fill", `url(#${patternIds[index]})`)
    })
  })
})
