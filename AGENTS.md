# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Warp and others) working in this repository. `CLAUDE.md` imports this file, so keep every agent's guidance here.

## Development Commands

```bash
pnpm install          # Install dependencies; commit pnpm-lock.yaml when it changes
pnpm dev              # Start Next.js development server on port 3000

# Building and testing
pnpm build            # Build production version
pnpm start            # Start production server
pnpm lint             # Run ESLint checks
pnpm type-check       # Run tsc --noEmit
pnpm test             # Vitest: unit (tests/unit) and integration (tests/integration) tests in headless Chromium
pnpm test:e2e         # Playwright end-to-end tests (tests/e2e) against `next build && next start` on E2E_PORT (default 3100)
```

- Run a single test file: `pnpm exec vitest run tests/unit/timeline-events.test.ts` or `pnpm exec playwright test tests/e2e/timeline.spec.ts`
- Lint a single file: `pnpm exec eslint path/to/file.tsx`
- Both test suites need Playwright's Chromium: `pnpm exec playwright install chromium`

Note: This project uses pnpm for package management. `pnpm build` fails on TypeScript or ESLint errors.

## Project Architecture

This is an interactive AI timeline application built with Next.js 15, React 19, TypeScript, and Framer Motion. The project showcases 344 AI historical events from 1943 to October 2026. Its design is "Interfaces Through Time": each era is drawn in the computer interface of its day, from punch cards to an agent's task log.

### Core Architecture Pattern

The application follows a story-driven architecture centered around a "StoryEngine" component that orchestrates the entire timeline experience and holds the search and category filters:

```
app/page.tsx → StoryEngine → PrologueScene
                           → TimelineControls + EraChapter × 6 (one interface per era)
                           → TimelineNavigation (rail on wide screens, bar on phones)
                           → TimelineInsights + EpilogueScene
```

### Key Data Structures

- **Timeline Events**: Central data stored in `/data/timeline-events.json` with TypeScript interfaces in `/types/timeline.ts`, loaded through `parseTimelineEvents` in `/lib/timeline-events.ts`, which throws on unknown categories, so bad data fails the build
- **Era-based Organization**: `ERA_DEFINITIONS` in `/lib/eras.ts` groups events into Foundation (1940-1970), Knowledge (1970-1990), Learning (1990-2010), Deep Learning Revolution (2010-2020), Generative AI (2020-2025) and Agentic (2025-2030) eras. Each era names its interface (`punch-card`, `terminal`, `desktop`, `notebook`, `chat`, `agent`) and an accent color; the six colors were validated together as a categorical palette on the dark chrome. An era of whole decades is subtitled by its decades and any other by its years
- **Landmarks**: About 20 turning points carry `"landmark": true` in the data, and each era interface sets them apart in its own style. Keep the list curated; a unit test pins it
- **Highlights**: A busy year, one with more than 12 events (`isBusyYear` in `/lib/year-groups.ts`), lists its events in brief in the chat thread or the agent's task log, one line each, apart from its landmarks and the events marked `"highlight": true`, until its "Show all" button shows the whole year in full. A search or filter shows every match in full. Keep about five full-size events per busy year, landmarks included; a unit test pins the approved list
- **Year Summaries**: `/data/year-summaries.json` holds the one-sentence answer the chat thread gives to each year's "What happened in {year}?", and the report the agent gives on each year it researches, read through `yearSummary` in `/lib/year-summaries.ts`. A unit test requires one for every year of the Generative AI and Agentic Eras that has events, so adding events in a new year means writing its summary
- **Category System**: Events categorized as Models & Architectures, Research Breakthroughs, Public Releases, Ethics & Policy, Hardware Advances, Companies & Investments, AI Tools, Bombshell News, Agents (`TIMELINE_CATEGORIES` in `/types/timeline.ts`, the single list that `TimelineCategory` derives from). Each has its own icon in `components/ui/category-icon.tsx`, always shown beside the category's name. A new category goes in `TIMELINE_CATEGORIES` and needs an icon; `tsc` errors until the icon map covers it
- **Filtering and activity**: `/lib/timeline-filter.ts` narrows events by picked categories and search words, and `/lib/timeline-activity.ts` counts events per year for the activity charts

### Component Organization

Components are organized by purpose rather than type:

- **`/components/storytelling/`**: Narrative flow components (story-engine, prologue-scene, epilogue-scene). Before the final era, the story engine sets a line saying how many times faster its events come, in events per year, than in all the years before it (`describePace` in `/lib/pace.ts`), left out while the reader filters
- **`/components/eras/`**: The six era interfaces (punch-card-era, terminal-era, desktop-era, notebook-era, chat-era, agent-era), the era-chapter section that picks one, their shared era-parts, and the era-preview miniatures on the opening tiles. Every interface renders the same accessible structure: a section named by its h2, and one article per event (attributes from `eventCardAttributes`) whose date comes before its h3, whose h3 links to the source (`EventHeading` in era-parts), and which names the source site. An era that the filters empty shrinks to a short row (`CompactEraText`). The punch-card, terminal and desktop eras say how many years passed between two events when more than one did (`YearGap`, from `yearsSincePreviousEvent` in `/lib/year-gaps.ts`). Every interface groups its events by year (`groupEventsByYear` in `/lib/year-groups.ts`) beside a `YearColumn` that stays in view from the md breakpoint up and becomes a one-line label on phones. Each era draws the year in its own style, rules it off from its events with a divider (a right border from md up, a bottom border on phones), and screen readers hear the year and its count in plain words instead. Keep every era within `max-w-4xl`, so its cards stay clear of the navigation rail on a 1280px screen
- **`/components/interactive/`**: User interaction features (timeline-insights)
- **`/components/accessibility/`**: WCAG compliance components (skip-to-content)
- **`/components/timeline/`**: Timeline-specific UI (timeline-controls, timeline-navigation, activity-chart)
- **`/components/ui/`**: Shared pieces (category-icon). The page keeps the system cursor

### Animation System

Most motion is CSS in the `@layer components` block of `app/globals.css`, always inside `prefers-reduced-motion: no-preference`: event cards rise in with a scroll-driven animation (`animation-timeline: view()`), and the eras' carets, progress bar and typing dots run as keyframes. Framer Motion animates the phone chapter list. Hooks that move the reader around:
- `useTimelinePosition()` - Measures, once per animation frame while scrolling, the era, event year and month at the reading line (`READING_LINE` in `/lib/timeline-scroll.ts`) and how far through the era the reader has come
- `useTimelineShortcuts()` - J and K step between events, 1 to 6 jump to an era, and / focuses search

Derive styles from MotionValues with `useTransform` or `useMotionTemplate`. Interpolating a MotionValue into a plain template string silently produces an invalid style.

### State Management

The application uses React's built-in state management with no external state library. Timeline events are passed down through props from the main page component.

### Styling Approach

- Tailwind CSS 4 for styling with `@/*` path aliases, and `cn` in `lib/utils.ts` to merge class names
- Work Sans and Open Sans are self-hosted from `app/fonts/` via `next/font/local`. Don't switch to `next/font/google`: it downloads fonts during `next build`, which makes builds fail at random
- `app/globals.css` keeps Tailwind out of `.claude/` with `@source not`. Tailwind reports every folder it scans to webpack, which hashes them on each build, and other Claude Code sessions' worktrees in `.claude/worktrees/` (one with `node_modules` symlinked to this checkout's) crashed webpack's cache when it hashed them. Keep the exclusion; a unit test and an end-to-end test check it
- CSS-in-JS animations via Framer Motion
- The page chrome has a single neutral dark theme: its color tokens sit on `:root` in `app/globals.css` with `color-scheme: dark`, and each era's interface brings its own palette. Add a chrome token only when a class uses it
- Every era's backdrop in `app/globals.css` lists `var(--era-seam)` as its first background layer, which fades its top and bottom into the page's black so one era dissolves into the next. Keep that layer first when changing a backdrop; tests check it in every era
- `html` and `body` clip sideways overflow with `overflow-x: clip`, not `hidden`, because `hidden` turns them into scroll containers and breaks the sticky toolbar and month dividers

### Performance Considerations

- Scroll-driven CSS animations instead of a JavaScript observer per card, and a single scroll measure per frame for the navigation

### Configuration

- `next.config.mjs` pins `outputFileTracingRoot` to the project directory, so file tracing works even when the checkout sits inside another one
- `eslint.config.mjs` is a flat config that extends `next` through `FlatCompat`, and ignores `.claude/` so nested worktrees are not linted
- `tsconfig.json` runs strict mode with `moduleResolution: bundler`, and maps `@/*` to the project root
- `pnpm-workspace.yaml` keeps install scripts off for packages whose prebuilt binaries are used, and raises next's copy of postcss to a patched release
- `.github/workflows/ci.yml` runs the type check, lint, Vitest and Playwright suites on every pull request and push to main

### Development Notes

- TypeScript strict mode enabled, and `next build` fails on type errors
- ESLint configured with Next.js defaults, and `next build` fails on lint errors
- Uses Next.js App Router (not Pages Router)
- All timeline data is static JSON, no external APIs

## Coding Style & Naming Conventions

- TypeScript everywhere; keep strict typing and avoid `any` unless defensive guards are required
- Files use kebab-case (`story-engine.tsx`), components PascalCase, helpers camelCase
- Two-space indentation. Quote style and semicolons differ between files, so match the file you are editing
- Tailwind classes stay inline; extract shared helpers into `lib/` when reused

## Testing

- Vitest tests render components in real Chromium (browser mode), so they use real browser APIs. Don't fake them or mock
- Unit tests live in `tests/unit`, integration tests in `tests/integration` and end-to-end specs in `tests/e2e`
- Run `pnpm lint`, `pnpm type-check` and `pnpm test` before pushing, and `pnpm test:e2e` for changes the browser shows

## Commit & Pull Request Guidelines

- Write imperative, present-tense commit messages ("Update timeline events", "Refine accessibility helpers")
- Keep commits focused; split data revisions from UI refactors
- PR descriptions should list user-visible changes, manual QA steps, linked issues, and any new environment needs
- Include screenshots or short clips for visual tweaks

## Data Stewardship

- Keep `data/timeline-events.json` sorted by year, with a verified source URL for every event
- Document large data updates in the PR body
