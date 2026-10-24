// Unit test for how the root layout loads its font.
// The font ships with the app, because fetching it from Google Fonts during `next build` makes builds fail at random.
/// <reference types="vite/client" />
import { describe, expect, it } from "vitest"
import layoutSource from "@/app/layout.tsx?raw"

describe("root layout font", () => {
  it("loads Work Sans from a file in the repo instead of Google Fonts", () => {
    expect(layoutSource).not.toContain("next/font/google")
    expect(layoutSource).toContain("next/font/local")
  })
})
