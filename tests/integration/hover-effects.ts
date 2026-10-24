// Helpers for integration tests of the hover-only card and badge effects.
// Counts framer-motion style writes inside an element over a short window.
import { userEvent } from "vitest/browser"

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Rests the pointer on the middle of the empty page body, away from where components render.
// Chromium on Linux starts the pointer at (0, 0), so a component rendered there would start out hovered.
export function restPointerOnBody() {
  return userEvent.hover(document.body)
}

// Returns the descendants of root whose inline style changed during the window.
export async function elementsAnimatingWithin(root: Element, ms = 300) {
  const animated = new Set<Element>()
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.target !== root) animated.add(record.target as Element)
    }
  })
  observer.observe(root, { attributes: true, attributeFilter: ["style"], subtree: true })
  await wait(ms)
  observer.disconnect()
  return animated
}
