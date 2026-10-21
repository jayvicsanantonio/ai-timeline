// Helpers for integration tests of the hover-only card and badge effects.
// Counts framer-motion style writes inside an element over a short window.
export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
