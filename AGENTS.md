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

# Cloudflare Workers
pnpm preview          # Build the Worker with OpenNext and serve it locally in workerd
pnpm run deploy       # Build the Worker with OpenNext and deploy it; bare `pnpm deploy` is pnpm's own command
```

- Run a single test file: `pnpm exec vitest run tests/unit/timeline-events.test.ts` or `pnpm exec playwright test tests/e2e/timeline.spec.ts`
- Lint a single file: `pnpm exec eslint path/to/file.tsx`
- Both test suites need Playwright's Chromium: `pnpm exec playwright install chromium`

Note: This project uses pnpm for package management, at the version `packageManager` pins in `package.json`. CI and Workers Builds both install that version, so bump it there and nowhere else; Workers Builds otherwise falls back to pnpm 9, which rejects a `pnpm-workspace.yaml` without a `packages` list. `pnpm build` fails on TypeScript or ESLint errors.

## Project Architecture

This is an interactive AI timeline application built with Next.js 15, React 19, TypeScript, and Framer Motion. The project showcases 340 AI historical events from 1943 to October 2026. Its design is "The AI Dex", a Pokémon-style field guide: every event is a numbered entry spotted as a creature of its category's type, and each era is drawn in the sprites of one generation of handheld games, from Generation I's four greens for the Foundation Era to today's animated 3D for the Agentic Era ("Sprites Through Time"). The page rewinds from now: it opens on the latest events, then runs from the Agentic Era, marked "Now", down to the Foundation Era and ends where it all began, every era its latest year and its latest event first.

### Core Architecture Pattern

The application follows a story-driven architecture centered around a "StoryEngine" component that orchestrates the entire timeline experience and holds the search and category filters:

```
app/page.tsx → StoryEngine (builds the dex) → PrologueScene (Porygon's line, the latest sightings, links to the eras and a slim chart)
                           → TimelineControls + EraChapter × 6 (a shared header, then the era's entries in its generation's sprites, the latest era first)
                           → TimelineNavigation (rail on wide screens, bar on phones)
                           → TimelineInsights + EpilogueScene
```

### Key Data Structures

- **Timeline Events**: Central data stored in `/data/timeline-events.json` with TypeScript interfaces in `/types/timeline.ts`, loaded through `parseTimelineEvents` in `/lib/timeline-events.ts`, which throws on unknown categories, so bad data fails the build
- **Newest First**: The data keeps its events oldest first, and `/lib/newest-first.ts` reverses that order in one place: StoryEngine hands the eras and the navigation `erasNewestFirst`, and the opening's latest events come from `latestEvents`. Every era draws the events in the order it is given, and its decorations are built for newest first: the running year comes first, a year gap says how many years earlier, and so on. Eras have no chapter numbers: the page names them by their years, and the number keys follow the page. The opening's chart, the era axis and the epilogue's badge trail still run left to right through time
- **Era-based Organization**: `ERA_DEFINITIONS` in `/lib/eras.ts` groups events into Foundation (1940-1970), Knowledge (1970-1990), Learning (1990-2010), Deep Learning Revolution (2010-2020), Generative AI (2020-2025) and Agentic (2025-2030) eras. Each era names its generation of sprites (`gen-1` to `gen-5`, then `modern`) and how its header says so, the gym badge the reader earns for it (by its number in `public/sprites/badges`), and an accent color; the six colors were validated together as a categorical palette on the dark chrome. An era of whole decades is subtitled by its decades and any other by its years, and the current era (`isCurrentEra`) runs to "now"
- **The AI Dex**: `/lib/dex.ts` builds the dex once from every event (`buildDex`), so an entry keeps its number and creature however the reader filters; StoryEngine hands it down through `DexProvider` in `/components/eras/dex-context.tsx`, and components read an entry with `useDexEntry`. An entry's number is its place in time order, No. 001 the first event. Each category is a type (`CATEGORY_TYPES`, with the type's color, the ink its chip prints in, and why). An era spots each event as the next creature of its type's pool (`TYPE_POOLS`, typed as the games type them today) that its generation knew (`GENERATION_SPRITES`), its own generation's first, so neighbors differ and the result is stable. `SPOTLIGHTS` picks creatures by hand for events that call for one (Smeargle paints for DALL-E, Porygon's line runs GPT-1, GPT-2 and GPT-5), and each must be of its event's type. Creature names live in `/lib/species-names.ts`; `buildDex` throws for a number without one
- **Landmarks**: About 25 turning points carry `"landmark": true` in the data, and each is a legendary encounter: `LEGENDS` in `/lib/dex.ts` picks its creature by hand, one never used twice and known to its era's generation, with a line of lore that starts from the creature's legend and ends at the event. Every era tags it "★ Landmark", frames it in gold with a holographic sheen, and moves its sprite where the generation animated sprites. Keep the list curated; unit tests pin it and require a legend for every landmark
- **Highlights**: A busy year, one with more than 12 events (`isBusyYear` in `/lib/year-groups.ts`), lists its events in brief, one line each with the creature's icon, apart from its landmarks and the events marked `"highlight": true`, until its "Show all" button shows the whole year in full. A search or filter shows every match in full. Keep about five full-size events per busy year, landmarks included; a unit test pins the approved list
- **Year Summaries**: `/data/year-summaries.json` holds the one-sentence field notes that open each year of the Generative AI and Agentic Eras, read through `yearSummary` in `/lib/year-summaries.ts`, and left out while the reader filters. A unit test requires one for every year of the Generative AI and Agentic Eras that has events, so adding events in a new year means writing its summary
- **Category System**: Events categorized as Models & Architectures, Research Breakthroughs, Public Releases, Ethics & Policy, Hardware Advances, Companies & Investments, AI Tools, Bombshell News, Agents (`TIMELINE_CATEGORIES` in `/types/timeline.ts`, the single list that `TimelineCategory` derives from). Each is drawn as its type's icon from the sprites (`components/ui/category-icon.tsx`), always shown beside the category's name, and as a type chip (`TypeBadge`). A new category goes in `TIMELINE_CATEGORIES` and needs a type in `CATEGORY_TYPES`; `tsc` errors until the map covers it
- **Filtering and activity**: `/lib/timeline-filter.ts` narrows events by picked categories and search words, and `/lib/timeline-activity.ts` counts events per year for the activity charts

### Component Organization

Components are organized by purpose rather than type:

- **`/components/storytelling/`**: Narrative flow components (story-engine, prologue-scene, epilogue-scene). The prologue stays about a screen tall, which an integration test pins: the title in its yellow wordmark beside a red dex showing Porygon's evolution line (the creature made of code, `ART` in `/lib/dex.ts`), the three latest sightings with their numbers, creatures and how long ago each happened, each linking to its card in the timeline (`scrollToEvent` in `/lib/timeline-scroll.ts`), a link to each era in page order, and a slim events-per-year chart whose numbers table runs newest first. Below the latest era, the story engine sets a message box ("Evolution speed") saying how many times faster its events came, in events per year, than in all the years before it (`describePace` in `/lib/pace.ts`), left out while the reader filters. The epilogue, below the oldest events, ends the rewind where it began, with Mew over No. 001, how many years the reader has rewound, the badges of every era up to a mystery egg for the next one, a link back up to now and the sprite credits, which say the site is an unofficial fan project
- **`/components/eras/`**: The era-chapter section, the era-header every era shares, `DexEra` (dex-era) that draws every era's entries, the dex context and the shared era-parts. EraChapter draws each era's header (`EraHeader`) in the page's color ahead of its entries, like an intertitle: the era's badge, a marker ("Now" for the current era, "Before {year}" for the others, the year the era above it began), the h2 that names the section, its years, count and sprites, and its description. Eras draw no title of their own and start on their newest year, and their backdrop root carries `data-era-backdrop`. An era that the filters empty shows only its header. Every era renders one article per event (attributes from `eventCardAttributes`) whose date comes before its h3, whose h3 links to the source (`EventHeading` in era-parts), and which names the source site. A full entry draws its creature on a stage (decorative, `alt=""`), then its number and date, its title, what happened, a landmark's lore, and a footer with its type chip and category, its creature's name and its source. One component draws every generation, and each generation's look is CSS keyed on `data-gen` in `app/globals.css`: Generation I prints in four greens and the pixel font (an SVG filter, `#dmg-palette`, maps its gray sprites onto the greens), Generation II in rounded blue frames, Generation III in banded panels with soft shadows, Generation IV on two screens (the creature above, the entry below), Generation V in black and white with animated sprites, and today's era on glass with bobbing 3D sprites. Eras say how many years earlier a year came than the one above it when more than one year lies between them (`YearGap`, from `yearsEarlierThanPrevious` in `/lib/year-gaps.ts`), drawn as tall grass. Every era groups its events by year (`groupEventsByYear` in `/lib/year-groups.ts`) beside a `YearColumn` that stays in view from the md breakpoint up and becomes a one-line label on phones, with the year in the pixel font, its count of entries and legends. It rules the year off from its events with a divider (a right border from md up, a bottom border on phones), and screen readers hear the year and its count in plain words instead. Keep every era within `max-w-4xl`, so its cards stay clear of the navigation rail on a 1280px screen. The current era opens on a Poké Ball (`Frontier`, watching for what comes after the latest event and saying how long ago that was, left out while filtering). Entries of the last twelve months say how long ago they happened (`RelativeTime`). Tests pin each generation's look
- **`/components/interactive/`**: User interaction features (timeline-insights)
- **`/components/accessibility/`**: WCAG compliance components (skip-to-content)
- **`/components/timeline/`**: Timeline-specific UI (timeline-controls, timeline-navigation, activity-chart). The toolbar, ruled off in red, says the timeline reads newest first, and its category filters are named Types: each toggle shows the category's type icon, the type and why. The navigation rail is a small dex with a red cap, the year in the pixel font and the current era's badge. Vertical activity charts, like the rail's, run the latest year at the top, as the page does. The rail's era buttons show the year each era began and sit beside that year's row like ticks on an axis, stacking in page order where the short recent eras crowd together
- **`/components/ui/`**: Shared pieces (category-icon, type-badge, sprite, relative-time). `Sprite` draws a file from `public/sprites` as a plain lazy-loading `img`, pixelated for pixel art; it is decorative unless given an `alt`. `RelativeTime` says how long ago an event happened to the month ("last month", "8 months ago", from `relativeMonthLabel` in `/lib/relative-time.ts`) for events under a year old. The page is prerendered, so it reads the reader's clock only in the browser (`useCurrentMonth`), and tests compare it with the real date instead of faking one. The page keeps the system cursor

### Animation System

Most motion is CSS in the `@layer components` block of `app/globals.css`, always inside `prefers-reduced-motion: no-preference`: event cards rise in with a scroll-driven animation (`animation-timeline: view()`), and today's 3D sprites bob, the legends' sheen sweeps, the frontier's Poké Ball wobbles, the message boxes' carets blink and the hero's lens glows as keyframes. Framer Motion animates the phone chapter list. Hooks that move the reader around:
- `useTimelinePosition()` - Measures, once per animation frame while scrolling, the era, event year and month at the reading line (`READING_LINE` in `/lib/timeline-scroll.ts`) and how far through the era the reader has come
- `useTimelineShortcuts()` - J and K step down and up the page between events, so J moves to older ones, 1 to 6 jump to the eras in page order, 1 being the era at the top, and / focuses search

Derive styles from MotionValues with `useTransform` or `useMotionTemplate`. Interpolating a MotionValue into a plain template string silently produces an invalid style.

### State Management

The application uses React's built-in state management with no external state library. Timeline events are passed down through props from the main page component.

### Styling Approach

- Tailwind CSS 4 for styling with `@/*` path aliases, and `cn` in `lib/utils.ts` to merge class names
- Work Sans, Open Sans and the pixel font Press Start 2P (`--font-press-start`, used through `.font-pixel` and the `font-pixel` utility) are self-hosted from `app/fonts/` via `next/font/local`. Every use of the pixel font names `"Press Start 2P"` as the variable's fallback, so it still applies where the layout does not set the variable. Don't switch to `next/font/google`: it downloads fonts during `next build`, which makes builds fail at random
- `app/globals.css` keeps Tailwind out of `.claude/` with `@source not`. Tailwind reports every folder it scans to webpack, which hashes them on each build, and other Claude Code sessions' worktrees in `.claude/worktrees/` (one with `node_modules` symlinked to this checkout's) crashed webpack's cache when it hashed them. Keep the exclusion; a unit test and an end-to-end test check it
- CSS-in-JS animations via Framer Motion
- The page chrome has a single night-blue dark theme (`#0b0d1a`): its color tokens sit on `:root` in `app/globals.css` with `color-scheme: dark`, and each era's generation brings its own palette. The accents are the games' sun yellow (`#ffcb05`) for focus rings and highlights, and the dex's red (`#e3263b`). Add a chrome token only when a class uses it
- Every era's backdrop in `app/globals.css` lists `var(--era-seam)` as its first background layer, which fades its top and bottom into the page's color so one era dissolves into the next. Keep that layer first when changing a backdrop; tests check it in every era
- `html` and `body` clip sideways overflow with `overflow-x: clip`, not `hidden`, because `hidden` turns them into scroll containers and breaks the sticky toolbar and month dividers

### Sprites

- The sprites come from `jayvicsanantonio/sprites`, a fork of PokéAPI's sprite collection, and ship in `public/sprites` (about 600 files, 12 MB, most of it Generation V and today's animated GIFs). `public/_headers` lets browsers keep them for a week
- `scripts/sync-sprites.mjs` copies exactly the files `requiredSprites` in `/lib/dex.ts` lists from a clone of the sprites repository and deletes the rest, loading the TypeScript through Vite. The repository is over 14 GB, so clone it blobless: `git clone --depth 1 --filter=blob:none --no-checkout https://github.com/jayvicsanantonio/sprites ../sprites`, then `node scripts/sync-sprites.mjs ../sprites`. Run it after adding events or changing creatures; a unit test fails while any sprite the page shows is missing
- Pokémon and its characters are trademarks of Nintendo, Creatures Inc. and GAME FREAK inc. Keep the epilogue's credit and its note that the site is an unofficial fan project

### Performance Considerations

- Scroll-driven CSS animations instead of a JavaScript observer per card, and a single scroll measure per frame for the navigation
- Sprites load lazily as they scroll near, except those in the first screen

### Configuration

- `next.config.mjs` pins `outputFileTracingRoot` to the project directory, so file tracing works even when the checkout sits inside another one
- `eslint.config.mjs` is a flat config that extends `next` through `FlatCompat`, and ignores `.claude/` so nested worktrees are not linted
- `tsconfig.json` runs strict mode with `moduleResolution: bundler`, and maps `@/*` to the project root
- `pnpm-workspace.yaml` keeps install scripts off for packages whose prebuilt binaries are used, and raises next's copy of postcss to a patched release. CI's pnpm 11 fails the install on any dependency whose install script is not listed there, so list a new one as `true` or `false`
- `.github/workflows/ci.yml` runs the type check, lint, Vitest and Playwright suites on every pull request and push to main
- `lib/site.ts` holds `SITE_URL`, the production address that every deployment names as its canonical page, and builds the page title, description, Open Graph tags and schema.org `WebSite` data from the timeline events, so the event count and years stay current. `app/robots.ts`, `app/sitemap.ts`, `app/icon.svg` and `app/opengraph-image.tsx` are Next.js metadata files, all prerendered. The preview image is drawn with `next/og`, whose WebAssembly roughly doubles the Worker, to about 1.8 MiB gzipped of the free plan's 3 MiB
- `lib/llms.ts` writes what AI agents read instead of the page, served as plain text by `app/llms.txt/route.ts` and `app/llms-full.txt/route.ts`, both prerendered: `/llms.txt` summarizes the site and its eras, and `/llms-full.txt` lists every event by era and year with its date, category and source, in under a tenth of the page's HTML. `/llms-full.txt` names the page as its canonical version in a `Link` header, so search engines list the page instead
- Vercel and Cloudflare Workers both deploy each push to main. Vercel runs `next build`, so `pnpm build` stays plain `next build`. Workers Builds runs `npx opennextjs-cloudflare build`, which bundles that build into a Worker in `.open-next/` through OpenNext (`open-next.config.ts`), then `npx opennextjs-cloudflare deploy`; `npx wrangler deploy` hands off to the same command. `wrangler.jsonc` names the Worker `ai-timeline`, matching the dashboard. Without it, every Workers build reconfigures the project from scratch. Its empty `previews` block lets branch builds create Worker Previews with `npx wrangler preview`, which uploads the same `.open-next/` build, so the dashboard's build command must be the OpenNext build for branch builds too. `preview_urls` gives each Preview its workers.dev URL, but only a production `wrangler deploy` applies it, so Previews have no URL until main has deployed with it. Every page is prerendered, so the Worker needs no bindings beyond its assets, and `public/_headers` lets browsers cache `/_next/static` for a year

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

- Keep `data/timeline-events.json` sorted by year, oldest first, with a verified source URL for every event. The page reverses the order itself (`/lib/newest-first.ts`), so never store the events newest first
- Document large data updates in the PR body
