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
- Lint (ESLint via Next.js)
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
    - Groups events into eras by year ranges (Foundation, Knowledge, Learning, Deep Learning Revolution, Generative AI).
    - Renders PrologueScene → per-era NarrativeBridge + TimelineStory → Insights → EpilogueScene.
  - Timeline rendering (components/storytelling/timeline-story.tsx):
    - Framer Motion-heavy section with layered animated backgrounds.
    - Maps each event to an animated TimelineEventCard using CinematicCard (components/ui) and category styling via a categoryVariants map.
- Data and types
  - Dataset: data/timeline-events.json, loaded by app/page.tsx through parseTimelineEvents (lib/timeline-events.ts), which throws on unknown categories so bad data fails the build.
  - Types live in types/timeline.ts. TIMELINE_CATEGORIES is the single list of categories, and TimelineCategory is derived from it.
    - If adding a category, add it to TIMELINE_CATEGORIES and give it a TimelineBadge variant in the categoryVariants map in components/storytelling/timeline-story.tsx. tsc errors until the map covers it.
- Animation and interaction
  - Framer Motion is used broadly for parallax, scroll-tied transforms, and staged reveals.
  - Custom hooks in hooks/:
    - use-scroll-animation.ts provides motion values (opacity/scale/rotate/parallax) tied to scroll.
    - use-intersection-animation.ts provides in-view detection (useInView, with threshold passed as amount) and reveal variants.
- UI, accessibility, and theming
  - Layout (app/layout.tsx) sets fonts, default dark theme, and injects accessibility helpers (SkipToContent) and FuturisticCursor.
  - Styling via Tailwind CSS 4, with utility helpers (lib/utils.ts cn merger) and custom components in components/ui/.
  - Accessibility helpers in components/accessibility/ (skip to content).
- Configuration and conventions
  - next.config.mjs: type and lint errors fail the build; outputFileTracingRoot is pinned to the project directory; images are unoptimized (no Next image optimizer).
  - .eslintrc.json: extends "next" (defaults), with root: true so a parent checkout's config is not merged in.
  - tsconfig.json:
    - strict: true, noEmit: true, moduleResolution: bundler, jsx: preserve.
    - Path alias: @/* → project root (used extensively for imports).
  - No Docker/Makefile/CI workflows in this repo; deployment badge in README references Vercel.

Important notes (from README.md and CLAUDE.md)
- Package manager: pnpm.
- Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, Framer Motion.
- Data is static and local (no external APIs in the core flow).
- pnpm build runs type checking and ESLint, and fails on errors in either.
