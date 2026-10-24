// Unit tests for FuturisticCursor: the custom cursor only appears for fine pointers
// with motion allowed, using Chromium's own media emulation for touch and reduced motion.
import { act, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, onTestFinished } from "vitest"
import { cdp } from "vitest/browser"
import { FuturisticCursor } from "@/components/ui/futuristic-cursor"

function emulateReducedMotion(enabled: boolean) {
  return cdp().send("Emulation.setEmulatedMedia", {
    features: enabled ? [{ name: "prefers-reduced-motion", value: "reduce" }] : [],
  })
}

function emulateTouchScreen(enabled: boolean) {
  return cdp().send("Emulation.setTouchEmulationEnabled", {
    enabled,
    maxTouchPoints: enabled ? 5 : undefined,
  })
}

describe("FuturisticCursor", () => {
  afterEach(async () => {
    await emulateReducedMotion(false)
  })

  it("renders a decorative cursor for a fine pointer with motion allowed", () => {
    render(<FuturisticCursor />)

    expect(screen.getByTestId("futuristic-cursor")).toHaveAttribute("aria-hidden", "true")
  })

  it("renders nothing when the user prefers reduced motion", async () => {
    await emulateReducedMotion(true)

    render(<FuturisticCursor />)

    expect(screen.queryByTestId("futuristic-cursor")).not.toBeInTheDocument()
  })

  it("removes itself when reduced motion is turned on after mounting", async () => {
    render(<FuturisticCursor />)
    expect(screen.getByTestId("futuristic-cursor")).toBeInTheDocument()

    await act(async () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
      const reducedMotionChanged = new Promise((resolve) => {
        reducedMotion.addEventListener("change", resolve, { once: true })
      })
      await emulateReducedMotion(true)
      await reducedMotionChanged
    })

    expect(screen.queryByTestId("futuristic-cursor")).not.toBeInTheDocument()
  })

  // Runs last: once touch emulation is turned off, Chromium on Linux reports no pointer at all,
  // not the fine pointer the tests above need.
  it("renders nothing on touch screens", async () => {
    await emulateTouchScreen(true)
    onTestFinished(async () => {
      await emulateTouchScreen(false)
    })

    render(<FuturisticCursor />)

    expect(screen.queryByTestId("futuristic-cursor")).not.toBeInTheDocument()
  })
})
