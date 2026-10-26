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

This is an interactive AI timeline application built with Next.js 15, React 19, TypeScript, and Framer Motion. The project showcases 275 AI historical events from 1943 to October 2026. Its design is "Interfaces Through Time": each era is drawn in the computer interface of its day, from punch cards to a chat thread.

### Core Architecture Pattern

The application follows a story-driven architecture centered around a "StoryEngine" component that orchestrates the entire timeline experience and holds the search and category filters:

```
app/page.tsx → StoryEngine → PrologueScene
                           → TimelineControls + EraChapter × 5 (one interface per era)
                           → TimelineNavigation (rail on wide screens, bar on phones)
                           → TimelineInsights + EpilogueScene
```

### Key Data Structures

- **Timeline Events**: Central data stored in `/data/timeline-events.json` with TypeScript interfaces in `/types/timeline.ts`, loaded through `parseTimelineEvents` in `/lib/timeline-events.ts`, which throws on unknown categories
- **Era-based Organization**: `ERA_DEFINITIONS` in `/lib/eras.ts` groups events into Foundation (1940-1970), Knowledge (1970-1990), Learning (1990-2010), Deep Learning Revolution (2010-2020), and Generative AI (2020-2030) eras. Each era names its interface (`punch-card`, `terminal`, `desktop`, `notebook`, `chat`) and an accent color; the five colors were validated together as a categorical palette on the dark chrome
- **Landmarks**: About 20 turning points carry `"landmark": true` in the data, and each era interface sets them apart in its own style. Keep the list curated; a unit test pins it
- **Year Summaries**: `/data/year-summaries.json` holds the one-sentence answer the chat thread gives to each year's "What happened in {year}?", read through `yearSummary` in `/lib/year-summaries.ts`. A unit test requires one for every year of the Generative AI Era that has events, so adding events in a new year means writing its summary
- **Category System**: Events categorized as Models & Architectures, Research Breakthroughs, Public Releases, Ethics & Policy, Hardware Advances, Companies & Investments, AI Tools, Bombshell News, Agents (`TIMELINE_CATEGORIES` in `/types/timeline.ts`). Each has its own icon in `components/ui/category-icon.tsx`, always shown beside the category's name
- **Filtering and activity**: `/lib/timeline-filter.ts` narrows events by picked categories and search words, and `/lib/timeline-activity.ts` counts events per year for the activity charts

### Component Organization

Components are organized by purpose rather than type:

- **`/components/storytelling/`**: Narrative flow components (story-engine, prologue-scene, epilogue-scene)
- **`/components/eras/`**: The five era interfaces (punch-card-era, terminal-era, desktop-era, notebook-era, chat-era), the era-chapter section that picks one, their shared era-parts, and the era-preview miniatures on the opening tiles. Every interface renders the same accessible structure: a section named by its h2, and one article per event (attributes from `eventCardAttributes`) whose date comes before its h3, whose h3 links to the source, and which names the source site. An era that the filters empty shrinks to a short row (`CompactEraText`). The punch-card, terminal and desktop eras say how many years passed between two events when more than one did (`YearGap`, from `yearsSincePreviousEvent` in `/lib/year-gaps.ts`)
- **`/components/interactive/`**: User interaction features (timeline-insights)
- **`/components/accessibility/`**: WCAG compliance components (skip-to-content)
- **`/components/timeline/`**: Timeline-specific UI (timeline-controls, timeline-navigation, activity-chart)
- **`/components/ui/`**: Shared pieces (category-icon). The page keeps the system cursor

### Animation System

Most motion is CSS in the `@layer components` block of `app/globals.css`, always inside `prefers-reduced-motion: no-preference`: event cards rise in with a scroll-driven animation (`animation-timeline: view()`), and the eras' carets, progress bar and typing dots run as keyframes. Framer Motion animates the phone chapter list. Hooks that move the reader around:
- `useTimelinePosition()` - Measures, once per animation frame while scrolling, the era, event year and month at the reading line (`READING_LINE` in `/lib/timeline-scroll.ts`) and how far through the era the reader has come
- `useTimelineShortcuts()` - J and K step between events, 1 to 5 jump to an era, and / focuses search

Derive styles from MotionValues with `useTransform` or `useMotionTemplate`. Interpolating a MotionValue into a plain template string silently produces an invalid style.

### State Management

The application uses React's built-in state management with no external state library. Timeline events are passed down through props from the main page component.

### Styling Approach

- Tailwind CSS 4 for styling with `@/*` path aliases
- Work Sans and Open Sans are self-hosted from `app/fonts/` via `next/font/local`. Don't switch to `next/font/google`: it downloads fonts during `next build`, which makes builds fail at random
- CSS-in-JS animations via Framer Motion
- Theme support via next-themes. The page chrome is a neutral dark theme, and each era's interface brings its own palette
- `html` and `body` clip sideways overflow with `overflow-x: clip`, not `hidden`, because `hidden` turns them into scroll containers and breaks the sticky toolbar and month dividers

### Performance Considerations

- Scroll-driven CSS animations instead of a JavaScript observer per card, and a single scroll measure per frame for the navigation
- Next.js automatic image optimization (unoptimized: true in config)

### Development Notes

- TypeScript strict mode enabled, and `next build` fails on type errors
- ESLint configured with Next.js defaults, and `next build` fails on lint errors
- Vitest tests render components in real Chromium (browser mode), so they use real browser APIs. Don't fake them or mock
- Uses Next.js App Router (not Pages Router)
- All timeline data is static JSON, no external APIs