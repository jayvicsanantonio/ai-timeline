// End-to-end test for how the global stylesheet is built: Tailwind scans the project's own folders for class names.
// It runs the real Tailwind PostCSS plugin on a copy of the stylesheet, beside a .claude/ worktree it must not read.
import { expect, test } from "@playwright/test"
import { mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import tailwindcss from "@tailwindcss/postcss"
import postcss from "postcss"

test("builds the stylesheet from the project's own files, never from another session's worktree in .claude", async () => {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), "stylesheet-sources-")))
  try {
    // A small project: the real stylesheet, a page using one class, and a worktree under .claude using another
    const stylesheet = await readFile(path.resolve("app/globals.css"), "utf8")
    const worktree = path.join(root, ".claude", "worktrees", "other-session")
    await mkdir(path.join(root, "app"))
    await mkdir(worktree, { recursive: true })
    await symlink(path.resolve("node_modules"), path.join(root, "node_modules"), "dir")
    await writeFile(path.join(root, "app", "globals.css"), stylesheet)
    await writeFile(path.join(root, "app", "page.tsx"), 'export const page = <p className="text-red-500" />\n')
    await writeFile(path.join(worktree, "page.tsx"), 'export const page = <p className="bg-lime-500" />\n')

    const result = await postcss([tailwindcss({ base: root })]).process(stylesheet, {
      from: path.join(root, "app", "globals.css"),
    })

    // Each folder Tailwind scans becomes a folder the bundler hashes on every build
    const scannedFolders = result.messages
      .filter((message) => message.type === "dir-dependency")
      .map((message) => String(message.dir))
    expect(scannedFolders).toContain(path.join(root, "app"))
    expect(scannedFolders.filter((folder) => folder.startsWith(path.join(root, ".claude")))).toEqual([])
    expect(result.css).toContain(".text-red-500")
    expect(result.css).not.toContain(".bg-lime-500")
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
