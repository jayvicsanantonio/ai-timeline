// Unit tests for the project's own settings: what git leaves out and the package's name.
// .claude/ holds Claude Code's local settings and other sessions' worktrees, so git ignores it.
/// <reference types="vite/client" />
import { describe, expect, it } from "vitest"
import gitignore from "@/.gitignore?raw"
import packageJson from "@/package.json"

describe("project config", () => {
  it("keeps the .claude folder out of git, so local Claude Code settings and other sessions' worktrees stay untracked", () => {
    expect(gitignore.split("\n")).toContain("/.claude/")
  })

  it("names the package after the project", () => {
    expect(packageJson.name).toBe("ai-timeline")
  })
})
