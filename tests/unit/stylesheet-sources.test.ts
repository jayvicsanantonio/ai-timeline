// Unit test for which folders Tailwind scans for class names when it builds the global stylesheet.
// It skips .claude/, where other Claude Code sessions keep worktrees, because builds that hashed them crashed.
/// <reference types="vite/client" />
import { describe, expect, it } from "vitest"
import globalStyles from "@/app/globals.css?raw"

describe("global stylesheet sources", () => {
  it("keeps Tailwind out of the .claude folder, so a build never depends on other sessions' worktrees", () => {
    expect(globalStyles).toContain('@source not "../.claude";')
  })
})
