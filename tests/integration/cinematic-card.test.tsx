// Integration tests for CinematicCard's hover effects in real Chromium.
// The sweep and scan-line loops must run only while the card is hovered.
import { render, screen } from "@testing-library/react"
import { userEvent } from "vitest/browser"
import { beforeEach, describe, expect, it } from "vitest"
import { CinematicCard } from "@/components/ui/cinematic-card"
import { elementsAnimatingWithin, restPointerOnBody, wait } from "./hover-effects"

function renderCard() {
  render(<CinematicCard>Card content</CinematicCard>)
  const card = screen.getByText("Card content").closest(".group")
  if (!card) throw new Error("CinematicCard root not found")
  const [, sweep, scanLine] = Array.from(card.children)
  return { card, sweep, scanLine }
}

describe("CinematicCard hover effects", () => {
  beforeEach(async () => {
    await restPointerOnBody()
  })

  it("keeps the sweep and scan line still while the card is not hovered", async () => {
    const { card } = renderCard()
    await wait(700)

    expect((await elementsAnimatingWithin(card)).size).toBe(0)
  })

  it("keeps looping the sweep and scan line while the card is hovered", async () => {
    const { card, sweep, scanLine } = renderCard()
    await wait(700)

    await userEvent.hover(card)
    // Longer than the 3s sweep cycle, so a run that does not repeat would have stopped.
    await wait(3100)

    expect(await elementsAnimatingWithin(card)).toEqual(new Set([sweep, scanLine]))
  }, 10_000)

  it("stops the sweep and scan line after the pointer leaves", async () => {
    const { card } = renderCard()
    await wait(700)
    await userEvent.hover(card)
    await wait(100)

    await userEvent.unhover(card)
    await wait(500)

    expect((await elementsAnimatingWithin(card)).size).toBe(0)
  })
})
