// Unit test for how the root layout loads its fonts.
// The fonts ship with the app, because fetching them from Google Fonts during `next build` makes builds fail at random.
/// <reference types="vite/client" />
import { describe, expect, it } from "vitest"
import layoutSource from "@/app/layout.tsx?raw"

describe("root layout fonts", () => {
  it("loads Work Sans and Open Sans from files in the repo instead of Google Fonts", () => {
    expect(layoutSource).not.toContain("next/font/google")
    expect(layoutSource).toContain("next/font/local")
  })
})
