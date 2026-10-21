// Integration tests for TimelineBadge's hover shimmer and glow in real Chromium.
// The shimmer loop must run only on hover, and both effects must use valid CSS colors.
import { render, screen } from "@testing-library/react"
import { userEvent } from "vitest/browser"
import { describe, expect, it } from "vitest"
import { TimelineBadge } from "@/components/ui/timeline-badge"
import { elementsAnimatingWithin, wait } from "./hover-effects"

const variants = ["research", "model", "release", "ethics", "hardware", "company", "tool", "bombshell", "agent"] as const

function renderBadge(variant: (typeof variants)[number] = "research") {
  render(<TimelineBadge variant={variant}>Badge label</TimelineBadge>)
  const badge = screen.getByText("Badge label").parentElement
  if (!badge) throw new Error("TimelineBadge root not found")
  const shimmer = badge.firstElementChild as HTMLElement
  return { badge, shimmer }
}

describe("TimelineBadge hover effects", () => {
  it("keeps the shimmer still while the badge is not hovered", async () => {
    const { badge } = renderBadge()
    await wait(500)

    expect((await elementsAnimatingWithin(badge)).size).toBe(0)
  })

  it("keeps looping the shimmer while the badge is hovered", async () => {
    const { badge, shimmer } = renderBadge()
    await wait(500)

    await userEvent.hover(badge)
    // Longer than the 2s shimmer cycle, so a run that does not repeat would have stopped.
    await wait(2100)

    expect(await elementsAnimatingWithin(badge)).toEqual(new Set([shimmer]))
  }, 10_000)

  it("stops the shimmer after the pointer leaves", async () => {
    const { badge } = renderBadge()
    await wait(500)
    await userEvent.hover(badge)
    await wait(100)

    await userEvent.unhover(badge)
    await wait(500)

    expect((await elementsAnimatingWithin(badge)).size).toBe(0)
  })

  it.each(variants)("gives the %s shimmer a valid gradient color", (variant) => {
    const { shimmer } = renderBadge(variant)

    expect(shimmer.style.backgroundImage).toMatch(
      /^linear-gradient\(45deg, transparent 30%, rgba\(\d+, \d+, \d+, 0\.1\) 50%, transparent 70%\)$/,
    )
  })

  it("glows with a valid color while hovered", async () => {
    const { badge } = renderBadge("research")

    await userEvent.hover(badge)

    await expect.poll(() => getComputedStyle(badge).boxShadow).toBe("rgba(16, 185, 129, 0.3) 0px 0px 20px 0px")
  })
})
