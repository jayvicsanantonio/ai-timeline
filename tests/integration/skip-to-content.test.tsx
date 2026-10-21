// Integration test for the SkipToContent accessibility link.
// Renders the real component, framer-motion included, in real Chromium.
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SkipToContent } from "@/components/accessibility/skip-to-content"

describe("SkipToContent", () => {
  it("renders a link to the main content landmark", () => {
    render(<SkipToContent />)

    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute("href", "#main-content")
  })
})
