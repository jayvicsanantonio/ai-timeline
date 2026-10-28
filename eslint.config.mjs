// ESLint flat configuration, run with `eslint .` and by `next build`.
// Applies Next.js's "next" rule set through FlatCompat, since eslint-config-next 15 ships legacy configs only.
import path from "node:path"
import { fileURLToPath } from "node:url"
import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat({
  baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
})

const eslintConfig = [
  {
    // .claude/ holds nested git worktrees, which have their own checkouts to lint.
    ignores: [
      ".next/",
      ".open-next/",
      ".wrangler/",
      "node_modules/",
      "playwright-report/",
      "test-results/",
      ".vitest/",
      ".claude/",
    ],
  },
  ...compat.extends("next"),
]

export default eslintConfig
