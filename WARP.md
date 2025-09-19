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
  - Note: README mentions pnpm type-check, but no script is defined.
  - Run directly: pnpm exec tsc --noEmit
- Tests
  - No test runner is configured in this repo (no test scripts, configs, or deps). Running a single test is not applicable.

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
  - Primary dataset: data/timeline-events.json (used by the app/page.tsx entry).
  - Additional dataset: data/comprehensive-timeline-events.ts (not wired into the entry page; appears as a larger/alternate data source).
  - Types live in types/timeline.ts.
    - Note: The runtime categories include items beyond the type union (e.g., Bombshell News, Companies & Investments, AI Tools, Agents). Builds succeed because next.config.mjs ignores TypeScript and ESLint errors. If adding categories, update both types/timeline.ts and the categoryVariants map in components/storytelling/timeline-story.tsx to keep types and visuals aligned.
- Animation and interaction
  - Framer Motion is used broadly for parallax, scroll-tied transforms, and staged reveals.
  - Custom hooks in hooks/:
    - use-scroll-animation.ts provides motion values (opacity/scale/rotate/parallax) tied to scroll.
    - use-intersection-observer.ts and use-intersection-animation.ts provide in-view detection and reveal variants.
  - Performance layer (components/performance/):
    - error-boundary.tsx implements a React error boundary with a cinematic fallback.
    - lazy-timeline-section.tsx illustrates lazy loading for heavy components (e.g., insights, quotes) using React.lazy and Suspense.
- UI, accessibility, and theming
  - Layout (app/layout.tsx) sets fonts, default dark theme, and injects accessibility helpers (SkipToContent) and FuturisticCursor.
  - Styling via Tailwind CSS 4, with utility helpers (lib/utils.ts cn merger) and shadcn/radix-based components in components/ui/.
  - Accessibility helpers in components/accessibility/ (focus trap, reduced motion wrapper, skip to content).
- Configuration and conventions
  - next.config.mjs: ignores ESLint and TypeScript build errors; images are unoptimized (no Next image optimizer).
  - .eslintrc.json: extends "next" (defaults).
  - tsconfig.json:
    - strict: true, noEmit: true, moduleResolution: bundler, jsx: preserve.
    - Path alias: @/* → project root (used extensively for imports).
  - No Docker/Makefile/CI workflows in this repo; deployment badge in README references Vercel.

Important notes (from README.md and CLAUDE.md)
- Package manager: pnpm.
- Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, Framer Motion, Radix UI/shadcn.
- Data is static and local (no external APIs in the core flow).
- Build behavior intentionally ignores TypeScript and ESLint errors (see next.config.mjs). This allows category/type mismatches to ship; run lint and type-check locally to catch issues during development.
