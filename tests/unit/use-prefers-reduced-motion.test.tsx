// Unit tests for usePrefersReducedMotion, using Chromium's own media emulation for reduced motion.
// The hook must read false while hydrating server HTML, then follow the user's real preference.
import { act, render, screen } from "@testing-library/react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, onTestFinished } from "vitest"
import { cdp } from "vitest/browser"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

function emulateReducedMotion(enabled: boolean) {
  return cdp().send("Emulation.setEmulatedMedia", {
    features: enabled ? [{ name: "prefers-reduced-motion", value: "reduce" }] : [],
  })
}

function MotionPreference() {
  return <p data-testid="motion-preference">{usePrefersReducedMotion() ? "reduce" : "allow"}</p>
}

describe("usePrefersReducedMotion", () => {
  afterEach(async () => {
    await emulateReducedMotion(false)
  })

  it("reads false when motion is allowed", () => {
    render(<MotionPreference />)

    expect(screen.getByTestId("motion-preference")).toHaveTextContent("allow")
  })

  it("reads true when the user prefers reduced motion", async () => {
    await emulateReducedMotion(true)

    render(<MotionPreference />)

    expect(screen.getByTestId("motion-preference")).toHaveTextContent("reduce")
  })

  it("follows the preference when it changes after mounting", async () => {
    render(<MotionPreference />)
    expect(screen.getByTestId("motion-preference")).toHaveTextContent("allow")

    await act(async () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
      const reducedMotionChanged = new Promise((resolve) => {
        reducedMotion.addEventListener("change", resolve, { once: true })
      })
      await emulateReducedMotion(true)
      await reducedMotionChanged
    })

    expect(screen.getByTestId("motion-preference")).toHaveTextContent("reduce")
  })

  it("hydrates server HTML without a mismatch, then reads the real preference", async () => {
    await emulateReducedMotion(true)
    const container = document.createElement("div")
    container.innerHTML = renderToString(<MotionPreference />)
    document.body.append(container)
    expect(container).toHaveTextContent("allow")

    const hydrationErrors: unknown[] = []
    const root = await act(async () =>
      hydrateRoot(container, <MotionPreference />, {
        onRecoverableError: (error) => hydrationErrors.push(error),
      }),
    )
    onTestFinished(() => {
      act(() => root.unmount())
      container.remove()
    })

    expect(hydrationErrors).toEqual([])
    expect(container).toHaveTextContent("reduce")
  })
})
