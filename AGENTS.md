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

This is an interactive AI timeline application built with Next.js 15, React 19, TypeScript, and Framer Motion. The project showcases 340 AI historical events from 1943 to October 2026. Its design is "Interfaces Through Time": each era is drawn in the computer interface of its day, from punch cards to an agent's task log. The page rewinds from now: it opens on the latest events, then runs from the Agentic Era, marked "Now", down to the Foundation Era and ends where it all began, every era its latest year and its latest event first. That classic design is the default; a Pokémon-ify button switches the page to a second theme, the same history told as a Pokémon adventure (see "Themes" below).

### Core Architecture Pattern

The application follows a story-driven architecture centered around a "StoryEngine" component that orchestrates the entire timeline experience and holds the search and category filters:

```
app/page.tsx → ThemedTimeline → StoryEngine (classic, the default) or PokemonStoryEngine (after Pokémon-ify)
StoryEngine → PrologueScene (the latest events, links to the eras and a slim chart)
            → TimelineControls + EraChapter × 6 (a shared header, then one interface per era, the latest era first)
            → TimelineNavigation (rail on wide screens, bar on phones)
            → TimelineInsights + EpilogueScene
```

### Themes

The page has two themes, and everything above describes the classic one. `ThemedTimeline` in `/components/theme/themed-timeline.tsx` renders one of them inside a root that carries `data-theme-root`, with a bar at the top of the page offering the other ("Pokémon-ify" or "Back to classic") and, on wide screens, the same button fixed at the bottom left once that bar has scrolled away.
- **Choosing**: `/lib/theme.ts` holds the choice. The classic theme is the default; `?theme=pokemon` or `?theme=classic` in a link wins, then the reader's last pick in localStorage (`ai-timeline-theme`). The page is prerendered in the classic theme. `THEME_BOOT_SCRIPT`, inline in `<head>`, marks `<html data-timeline-theme>` before the first paint, and `app/theme-switch.css` keeps the classic root hidden behind a shut Poké Ball while that mark says pokemon, until the Pokémon tree replaces it (or for 2s if scripts never run), so the classic page never flashes
- **Loading on demand**: the classic page carries none of the Pokémon theme. `PokemonStoryEngine` and `app/pokemon.css`, which it imports, come in one chunk that `loadPokemonEngine` in `/components/theme/load-pokemon-theme.ts` fetches with `import()`, and the Press Start 2P font is declared with `preload: false`. Never import from `/components/pokemon/` or `pokemon.css` outside that folder and that loader, or the theme lands back in the classic page's bundle; an end-to-end test checks the classic page loads none of its styles, font or sprites
- **The Poké Ball**: on Pokémon-ify, a Poké Ball fills the screen (`PokeballOverlay`, drawn in `app/theme-switch.css`, phases in its `data-phase`: boot, idle, closing, loading, opening). It shuts, wobbles while the theme's code, styles and font download, swaps the theme in behind it, waits for the sprites in view to decode (at most 8s), then opens; readers who prefer less motion see it fade. `ThemedTimeline` moves the ball by writing to its element, not through React state, because React holds back every commit while a stylesheet it manages is loading, which the theme's is, and it waits for the CSS animations' `animationend` rather than timers. If the download fails, the ball opens back onto the classic page and the bar says so. Back to classic is instant. A visually hidden `aria-live` line tells screen readers what the ball shows
- **Keeping the reader's place**: both themes give every event the same anchor id (`eventAnchorId`), so switching scrolls back to the event at the reading line
- **The Pokémon theme** lives in `/components/pokemon/` (eras, storytelling, timeline, interactive, ui), mirroring the classic folders, and `PokemonStoryEngine` is its entry point. It reads forward from 1943, unlike the classic page. AI history becomes nine evolution lines (`/lib/dex.ts`: lines, per-event overrides, evolution and battle scenes, the AI winters, category items) on a journey through six regions with signposts and a gym challenge each (`/lib/journey.ts`). Every event also says what it did to its line, as one line of the games' battle text on its card and its brief row (`EVENT_ACTIONS` in `/lib/dex-actions.ts`, keyed by title, with `{NAME}` for the creature its line had become): a move learned or used, a stat that rose or fell, coins picked up, or a status condition (PSN, BRN, PAR, SLP, FNT, CNF) that also shows on the creature. Scandals and harms are filed under the line that caused them and get a status; the safety line stands for the people and institutions holding AI to account and never gets one; deaths are told plainly, with no status and no exclamation. A unit test requires an action for every event, so adding an event means writing one. A line evolves at the event named in its stage's `evolvesAt`, before the event's scenes, or after them with `afterScenes` (MACHAMP evolves once AlphaGo has won its battle); the images line is MIME JR., which learns MIMIC at GANs and evolves into MR. MIME at DALL-E 2, since every creature must exist in the generation of the era it appears in. Each era also carries the theme's `generation`, `place`, `biome` and `badge` in `ERA_DEFINITIONS`. Its styles are all in `app/pokemon.css`, which arrives with its code; none of its classes is shared with the classic page, and its chrome tokens are set on `.pokemon-theme` alone. Shared pieces take an option where the themes differ, such as `ActivityChart`'s `verticalTop="first"`
- **Sprites**: `public/sprites` holds only the sprites the page shows, copied from the `jayvicsanantonio/sprites` repository by `scripts/sync-sprites.mjs` (`pageSprites` in `/lib/journey.ts` lists them, and a unit test checks every one exists). Changing a line, scene or challenge means running the script again
- **Tests**: the Pokémon theme's tests sit in `tests/unit/pokemon`, `tests/integration/pokemon` and `tests/e2e/pokemon`. The end-to-end specs import `test` from `tests/e2e/pokemon/pokemon-theme.ts`, which opens every page in the Pokémon theme and waits for it to be drawn. `tests/e2e/theme-switch.spec.ts` covers switching. Keep a change to the classic page covered in the classic specs, and its Pokémon counterpart in the Pokémon ones

### Key Data Structures

- **Timeline Events**: Central data stored in `/data/timeline-events.json` with TypeScript interfaces in `/types/timeline.ts`, loaded through `parseTimelineEvents` in `/lib/timeline-events.ts`, which throws on unknown categories, so bad data fails the build
- **Newest First**: The data keeps its events oldest first, and `/lib/newest-first.ts` reverses that order in one place: StoryEngine hands the eras and the navigation `erasNewestFirst`, and the opening's latest events come from `latestEvents`. Every era interface draws the events in the order it is given, and its decorations are built for newest first: the running year comes first, a year gap says how many years earlier, and so on. Eras have no chapter numbers: the page names them by their years, and the number keys follow the page. The opening's chart, the era axis and the epilogue's era trail still run left to right through time
- **Era-based Organization**: `ERA_DEFINITIONS` in `/lib/eras.ts` groups events into Foundation (1940-1970), Knowledge (1970-1990), Learning (1990-2010), Deep Learning Revolution (2010-2020), Generative AI (2020-2025) and Agentic (2025-2030) eras. Each era names its interface (`punch-card`, `terminal`, `desktop`, `notebook`, `chat`, `agent`) and an accent color; the six colors were validated together as a categorical palette on the dark chrome. An era of whole decades is subtitled by its decades and any other by its years, and the current era (`isCurrentEra`) runs to "now"
- **Landmarks**: About 25 turning points carry `"landmark": true` in the data, and each era interface sets them apart in its own style. Keep the list curated; a unit test pins it
- **Highlights**: A busy year, one with more than 12 events (`isBusyYear` in `/lib/year-groups.ts`), lists its events in brief in the chat thread or the agent's task log, one line each, apart from its landmarks and the events marked `"highlight": true`, until its "Show all" button shows the whole year in full. A search or filter shows every match in full. Keep about five full-size events per busy year, landmarks included; a unit test pins the approved list
- **Year Summaries**: `/data/year-summaries.json` holds the one-sentence answer the chat thread gives to each year's "What happened in {year}?", and the report the agent gives on each year it researches, read through `yearSummary` in `/lib/year-summaries.ts`. A unit test requires one for every year of the Generative AI and Agentic Eras that has events, so adding events in a new year means writing its summary
- **Category System**: Events categorized as Models & Architectures, Research Breakthroughs, Public Releases, Ethics & Policy, Hardware Advances, Companies & Investments, AI Tools, Bombshell News, Agents (`TIMELINE_CATEGORIES` in `/types/timeline.ts`, the single list that `TimelineCategory` derives from). Each has its own icon in `components/ui/category-icon.tsx`, always shown beside the category's name. A new category goes in `TIMELINE_CATEGORIES` and needs an icon; `tsc` errors until the icon map covers it
- **Filtering and activity**: `/lib/timeline-filter.ts` narrows events by picked categories and search words, and `/lib/timeline-activity.ts` counts events per year for the activity charts

### Component Organization

Components are organized by purpose rather than type:

- **`/components/storytelling/`**: Narrative flow components (story-engine, prologue-scene, epilogue-scene). The prologue stays about a screen tall, which an integration test pins: the title, the three latest events with how long ago each happened, each linking to its card in the timeline (`scrollToEvent` in `/lib/timeline-scroll.ts`), a link to each era in page order, and a slim events-per-year chart whose numbers table runs newest first. Below the latest era, the story engine sets a line saying how many times faster its events came, in events per year, than in all the years before it (`describePace` in `/lib/pace.ts`), left out while the reader filters. The epilogue, below the oldest events, ends the rewind where it began, with the first event and how many years the reader has rewound, and links back up to now
- **`/components/eras/`**: The six era interfaces (punch-card-era, terminal-era, desktop-era, notebook-era, chat-era, agent-era), the era-chapter section that picks one, the era-header every era shares, and their shared era-parts. EraChapter draws each era's header (`EraHeader`) in the page's black ahead of its interface, like an intertitle: a marker ("Now" for the current era, "Before {year}" for the others, the year the era above it began), the h2 that names the section, its years, count and interface, and its description. Interfaces draw no title of their own and start on their newest year, and their backdrop root carries `data-era-backdrop`. An era that the filters empty shows only its header. Every interface renders one article per event (attributes from `eventCardAttributes`) whose date comes before its h3, whose h3 links to the source (`EventHeading` in era-parts), and which names the source site. The punch-card, terminal and desktop eras say how many years earlier an event came than the one above it when more than one year lies between them (`YearGap`, from `yearsEarlierThanPrevious` in `/lib/year-gaps.ts`). Every interface groups its events by year (`groupEventsByYear` in `/lib/year-groups.ts`) beside a `YearColumn` that stays in view from the md breakpoint up and becomes a one-line label on phones. Each era draws the year in its own style, rules it off from its events with a divider (a right border from md up, a bottom border on phones), and screen readers hear the year and its count in plain words instead. Keep every era within `max-w-4xl`, so its cards stay clear of the navigation rail on a 1280px screen. The Generative AI and Agentic Eras sit side by side and must stay unlike each other: the chat thread is rounded and sans-serif, under its aurora, and answers each year in one reply that writes its events out as points; the agent's console is square and monospace on a flat black, and traces each year as tool calls, parallel fetches and checkpoints. Read newest first, the chat opens under its model picker on the latest year. The agent's console puts the year still running first, with a live row just above its newest step (`Frontier`, watching for what comes after the latest event and saying how long ago that was, left out while filtering), opens each finished year with its write-up, notes beside each year how many sites it read, and ends at the instruction it was given, just above the chat thread that handed it over. Steps in full of the last twelve months say how long ago they happened (`RelativeTime`). Tests pin both
- **`/components/interactive/`**: User interaction features (timeline-insights)
- **`/components/accessibility/`**: WCAG compliance components (skip-to-content)
- **`/components/timeline/`**: Timeline-specific UI (timeline-controls, timeline-navigation, activity-chart). The toolbar says the timeline reads newest first. Vertical activity charts, like the rail's, run the latest year at the top, as the page does. The rail's era buttons show the year each era began and sit beside that year's row like ticks on an axis, stacking in page order where the short recent eras crowd together
- **`/components/ui/`**: Shared pieces (category-icon, relative-time). `RelativeTime` says how long ago an event happened to the month ("last month", "8 months ago", from `relativeMonthLabel` in `/lib/relative-time.ts`) for events under a year old. The page is prerendered, so it reads the reader's clock only in the browser (`useCurrentMonth`), and tests compare it with the real date instead of faking one. The page keeps the system cursor

### Animation System

Most motion is CSS in the `@layer components` block of `app/globals.css`, always inside `prefers-reduced-motion: no-preference`: event cards rise in with a scroll-driven animation (`animation-timeline: view()`), and the eras' carets and the agent's spinner and shimmering status run as keyframes. Framer Motion animates the phone chapter list. Hooks that move the reader around:
- `useTimelinePosition()` - Measures, once per animation frame while scrolling, the era, event year and month at the reading line (`READING_LINE` in `/lib/timeline-scroll.ts`) and how far through the era the reader has come
- `useTimelineShortcuts()` - J and K step down and up the page between events, so J moves to older ones, 1 to 6 jump to the eras in page order, 1 being the era at the top, and / focuses search

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
