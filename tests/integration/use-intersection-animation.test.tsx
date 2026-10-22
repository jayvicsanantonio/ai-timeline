// Integration tests for useIntersectionAnimation using the browser's real IntersectionObserver.
// Checks that the threshold option controls how much of an element must be visible.
import { expect, test } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { useIntersectionAnimation } from "@/hooks/use-intersection-animation"

function Probe({ testId, visiblePixels }: { testId: string; visiblePixels: number }) {
  const { ref, isInView } = useIntersectionAnimation({ threshold: 0.1 })

  return (
    <div
      ref={ref}
      data-testid={testId}
      data-in-view={String(isInView)}
      style={{ position: "absolute", left: 0, width: 100, height: 1000, top: `calc(100vh - ${visiblePixels}px)` }}
    />
  )
}

test("only reports in view once the threshold share of the element is visible", async () => {
  render(
    <>
      <Probe testId="mostly-hidden" visiblePixels={50} />
      <Probe testId="past-threshold" visiblePixels={300} />
    </>,
  )

  await waitFor(() => expect(screen.getByTestId("past-threshold")).toHaveAttribute("data-in-view", "true"))
  expect(screen.getByTestId("mostly-hidden")).toHaveAttribute("data-in-view", "false")
})
