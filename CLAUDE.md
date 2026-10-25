# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
pnpm dev              # Start Next.js development server on port 3000

# Building and testing
pnpm build            # Build production version
pnpm start            # Start production server
pnpm lint             # Run ESLint checks
pnpm type-check       # Run tsc --noEmit
pnpm test             # Vitest: unit (tests/unit) and integration (tests/integration) tests in headless Chromium
pnpm test:e2e         # Playwright end-to-end tests (tests/e2e) against `next build && next start` on E2E_PORT (default 3100)
```

Note: This project uses pnpm for package management. `pnpm build` fails on TypeScript or ESLint errors.

## Project Architecture

This is an interactive AI timeline application built with Next.js 15, React 19, TypeScript, and Framer Motion. The project showcases 275 AI historical events from 1943 to October 2026 through a cinematic, storytelling experience.

### Core Architecture Pattern

The application follows a story-driven architecture centered around a "StoryEngine" component that orchestrates the entire timeline experience:

```
app/page.tsx → StoryEngine → PrologueScene + TimelineStory + EpilogueScene
```

### Key Data Structures

- **Timeline Events**: Central data stored in `/data/timeline-events.json` with TypeScript interfaces in `/types/timeline.ts`, loaded through `parseTimelineEvents` in `/lib/timeline-events.ts`, which throws on unknown categories
- **Era-based Organization**: Events are grouped into Foundation (1940-1970), Knowledge (1970-1990), Learning (1990-2010), Deep Learning Revolution (2010-2020), and Generative AI (2020-2030) eras
- **Category System**: Events categorized as Models & Architectures, Research Breakthroughs, Public Releases, Ethics & Policy, Hardware Advances, Companies & Investments, AI Tools, Bombshell News, Agents (`TIMELINE_CATEGORIES` in `/types/timeline.ts`). Each maps to its own `TimelineBadge` variant via `categoryVariants` in `timeline-story.tsx`

### Component Organization

Components are organized by purpose rather than type:

- **`/components/storytelling/`**: Narrative flow components (story-engine, prologue-scene, epilogue-scene, narrative-bridge)
- **`/components/interactive/`**: User interaction features (timeline-insights)
- **`/components/animations/`**: Reusable animation components (reveal-animation, parallax-container, stagger-animation, text-reveal)
- **`/components/accessibility/`**: WCAG compliance components (skip-to-content)
- **`/components/timeline/`**: Timeline-specific UI (timeline-navigation)

### Animation System

Heavy use of Framer Motion with custom hooks for scroll-based animations:
- `useScrollAnimation()` - Scroll-triggered animation triggers
- `useIntersectionAnimation()` - Viewport detection (via `useInView`, `threshold` maps to its `amount`) with reveal variants

Derive styles from MotionValues with `useTransform` or `useMotionTemplate`. Interpolating a MotionValue into a plain template string silently produces an invalid style.

### State Management

The application uses React's built-in state management with no external state library. Timeline events are passed down through props from the main page component.

### Styling Approach

- Tailwind CSS 4 for styling with `@/*` path aliases
- Work Sans and Open Sans are self-hosted from `app/fonts/` via `next/font/local`. Don't switch to `next/font/google`: it downloads fonts during `next build`, which makes builds fail at random
- CSS-in-JS animations via Framer Motion
- Theme support via next-themes

### Performance Considerations

- Intersection Observer for efficient scroll animations
- Next.js automatic image optimization (unoptimized: true in config)

### Development Notes

- TypeScript strict mode enabled, and `next build` fails on type errors
- ESLint configured with Next.js defaults, and `next build` fails on lint errors
- Vitest tests render components in real Chromium (browser mode), so they use real browser APIs. Don't fake them or mock
- Uses Next.js App Router (not Pages Router)
- All timeline data is static JSON, no external APIs