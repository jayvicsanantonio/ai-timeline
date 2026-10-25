# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: AI Timeline (Next.js 15, React 19, TypeScript, Tailwind 4, Framer Motion)

Common commands
- Install dependencies
  - pnpm install
- Develop (Next.js dev server on http://localhost:3000)
  - pnpm dev
- Build and run production
  - pnpm build
  - pnpm start
- Lint (ESLint CLI, runs eslint .)
  - pnpm lint
  - Lint a single file: pnpm exec eslint path/to/file.tsx
  - Autofix: pnpm exec eslint . --fix
- Type checking
  - pnpm type-check (runs tsc --noEmit)
- Tests
  - pnpm test runs Vitest (vitest.config.mts): unit (tests/unit) and integration (tests/integration) suites with React Testing Library, in headless Chromium via Vitest browser mode.
  - pnpm test:e2e runs Playwright (playwright.config.ts, tests/e2e). Its webServer runs next build && next start on E2E_PORT (default 3100).
  - Run a single test file: pnpm exec vitest run tests/unit/timeline-events.test.ts, or pnpm exec playwright test tests/e2e/timeline.spec.ts
  - Both suites need Playwright's Chromium: pnpm exec playwright install chromium

High-level architecture
- Runtime model
  - App Router entry (app/page.tsx) loads static data from data/timeline-events.json into local state and renders <StoryEngine events={...} />.
  - Story orchestration (components/storytelling/story-engine.tsx):
    - Groups events into eras with groupEventsByEra (lib/eras.ts): Foundation, Knowledge, Learning, Deep Learning Revolution, Generative AI.
    - Holds the search and category filters (lib/timeline-filter.ts) and renders PrologueScene → TimelineControls + one EraChapter per era → TimelineNavigation → Insights → EpilogueScene.
  - Era rendering (components/eras/):
    - EraChapter draws each era in the computer interface of its day: punch cards, a green-phosphor terminal, desktop windows, a research notebook and a chat thread.
    - Every interface gives its events the same structure: an article per event with an h3 that links to the source (EventHeading in era-parts.tsx).
- Data and types
  - Dataset: data/timeline-events.json, loaded by app/page.tsx through parseTimelineEvents (lib/timeline-events.ts), which throws on unknown categories so bad data fails the build.
  - Types live in types/timeline.ts. TIMELINE_CATEGORIES is the single list of categories, and TimelineCategory is derived from it.
    - If adding a category, add it to TIMELINE_CATEGORIES and give it an icon in components/ui/category-icon.tsx. tsc errors until the icon map covers it.
- Animation and interaction
  - Most motion is CSS in app/globals.css, inside prefers-reduced-motion: no-preference: scroll-driven card reveals and the eras' carets, progress bar and typing dots. Framer Motion animates the phone chapter list.
  - Custom hooks in hooks/:
    - use-timeline-position.ts measures the era and event year at the reading line once per animation frame while scrolling.
    - use-timeline-shortcuts.ts adds J/K to step between events, 1-5 to jump to an era and / to focus search.
- UI, accessibility, and theming
  - Layout (app/layout.tsx) sets fonts, default dark theme, and injects accessibility helpers (SkipToContent) and FuturisticCursor.
  - Styling via Tailwind CSS 4, with utility helpers (lib/utils.ts cn merger) and custom components in components/ui/.
  - Accessibility helpers in components/accessibility/ (skip to content).
- Configuration and conventions
  - next.config.mjs: type and lint errors fail the build; outputFileTracingRoot is pinned to the project directory; images are unoptimized (no Next image optimizer).
  - eslint.config.mjs: flat config that extends "next" (defaults) through FlatCompat, and ignores .claude/ so nested worktrees are not linted.
  - tsconfig.json:
    - strict: true, noEmit: true, moduleResolution: bundler, jsx: preserve.
    - Path alias: @/* → project root (used extensively for imports).
  - No Docker/Makefile/CI workflows in this repo; deployment badge in README references Vercel.

Important notes (from README.md and CLAUDE.md)
- Package manager: pnpm.
- Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, Framer Motion.
- Data is static and local (no external APIs in the core flow).
- pnpm build runs type checking and ESLint, and fails on errors in either.
