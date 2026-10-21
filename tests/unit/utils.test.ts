// Unit tests for the shared helpers in lib/utils.
// Covers how cn() joins conditional class names and resolves Tailwind conflicts.
import { describe, expect, it } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("joins class names and drops falsy values", () => {
    expect(cn("px-2", false && "hidden", "py-1")).toBe("px-2 py-1")
  })

  it("keeps the last of two conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })
})
