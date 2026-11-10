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

This is an interactive AI timeline application built with Next.js 15, React 19, TypeScript, and Framer Motion. The project showcases 340 AI historical events from 1943 to October 2026. Its design is "The AI Dex": AI history told as nine Pokémon evolution lines. Every branch of AI is one line (neural networks are MAGIKARP until AlexNet evolves them into GYARADOS; language runs PORYGON, PORYGON2 at the Transformer, PORYGON-Z at ChatGPT; agents are the GASTLY line, the ghost in the machine), every event is a numbered entry showing its line at the stage and level it had reached, and the story plays out in scenes: evolutions at the real turning points, human-versus-machine matches as battles, moves used, legendary encounters, and the AI winters freezing every line. Each era is drawn in the sprites of one generation of handheld games, from Generation I's four greens for the Foundation Era to today's animated 3D for the Agentic Era, so the pictures grow up as the field does. The whole page is an adventure: it opens on a game's title screen with a start menu, each era is a region of the journey with a place name and a night-time biome (Origin Meadow, Frostbite Pass where the AI winters hit, Learning Woods, Deep Cavern, Prompt City, Frontier Peak) along one route, each opens on a signpost previewing what it holds and ends in a gym challenge, a question on what it told that earns its badge, and the journey ends in the Hall of Fame. The page opens on the latest news, then the journey runs forward from 1943: the Foundation Era first, the Agentic Era, marked "Now", last, every era its first year and its first event first, so lines evolve in the order they did.

### Core Architecture Pattern

The application follows a story-driven architecture centered around a "StoryEngine" component that orchestrates the entire timeline experience and holds the search and category filters:

```
app/page.tsx → StoryEngine (builds the dex) → PrologueScene (the title screen: the premise, MEW over the lines, the start menu and the latest sightings)
                           → WorldMap (the six regions along the route, and a slim events-per-year chart)
                           → PartyScene (the professor's briefing, then the nine lines, each stage linking to where it appears or evolves)
                           → TimelineControls + EraChapter × 6 (a signpost, the era's entries and scenes along its route, its gym challenge; the first era first)
                           → TimelineNavigation (rail on wide screens, bar on phones)
                           → TimelineInsights + EpilogueScene
```

### Key Data Structures

- **Timeline Events**: Central data stored in `/data/timeline-events.json` with TypeScript interfaces in `/types/timeline.ts`, loaded through `parseTimelineEvents` in `/lib/timeline-events.ts`, which throws on unknown categories, so bad data fails the build
- **Forward Through Time**: The data keeps its events oldest first, and the page draws them in that order, so a line's earlier stages come before its evolution. Only the opening's latest sightings run newest first (`latestEvents` in `/lib/newest-first.ts`). Every era draws its events in the order it is given; a year gap says how many years later the next year came; each era's marker gives its place in the journey ("Era 1 of 6", the current one also "Now"); the number keys follow the page, 1 being the Foundation Era; J steps down the page to later events; and the rail's vertical chart runs the first year at the top
- **Era-based Organization**: `ERA_DEFINITIONS` in `/lib/eras.ts` groups events into Foundation (1940-1970), Knowledge (1970-1990), Learning (1990-2010), Deep Learning Revolution (2010-2020), Generative AI (2020-2025) and Agentic (2025-2030) eras. Each era names its generation of sprites (`gen-1` to `gen-5`, then `modern`) and how its header says so, the gym badge the reader earns for it (by its number in `public/sprites/badges`), its place on the journey's route and the biome its stretch of the route runs through (`place`, `biome`), and an accent color; the six colors were validated together as a categorical palette on the dark chrome. An era of whole decades is subtitled by its decades and any other by its years, and the current era (`isCurrentEra`) runs to "now"
- **The AI Dex**: `/lib/dex.ts` holds the story. `LINES` are the nine evolution lines (neural networks, logic and reasoning, language, games and self-play, chips and robots, images and media, money and companies, safety and law, agents), each with its stages and, for every stage after the first, the event it evolves at (`evolvesAt`) and why the evolution fits. `lineOf` files each event under a line: by hand (`LINE_OVERRIDES`, by title), by category (ethics is safety, companies money, hardware machines, agents agents) or by keyword. `SCENES` scripts the moments that play after events, by title: `dialog`, `encounter` (a legendary), `weather` (the winters' hail and thaw), `move`, `battle` (each side's share of the match on its HP bar) and, derived from `LINES`, `evolution`; in their lines `{NAME}` becomes the creature as it stands then. `WINTERS` freezes every entry of 1974–1979 and 1987–1993. `buildDex` builds the dex once from every event, so an entry keeps its number, line, stage, level and scenes however the reader filters; StoryEngine hands it and the events down through `DexProvider` in `/components/eras/dex-context.tsx`, and components read them with `useDexEntry` and `useDexStory`. An entry shows its line at the stage it had reached before the event's own evolution, its level is how many of the line's events have happened so far, and `partyAfter` says where every line stands after any event. Every creature a scene or an entry shows must be known to its era's generation (`GENERATION_SPRITES`); a unit test checks. Creature names live in `/lib/species-names.ts`; `speciesOf` throws for a number without one. Keep the story's lines true to the event descriptions: they are history first
- **Landmarks**: About 25 turning points carry `"landmark": true` in the data. Every era tags them "★ Landmark", frames them in gold with a holographic sheen, and moves their sprite where the generation animated sprites, and almost every one sets off a scene. Keep the list curated; a unit test pins it
- **Highlights**: A busy year, one with more than 12 events (`isBusyYear` in `/lib/year-groups.ts`), lists its events in brief, one line each with the creature's icon, apart from its landmarks, the events marked `"highlight": true` and the events that set off a scene, until its "Show all" button shows the whole year in full. A search or filter shows every match in full. Keep about five full-size events per busy year, landmarks included; a unit test pins the approved list
- **The Journey's Teaching**: `/lib/journey.ts` holds `GYM_CHALLENGES`, one question for each region, asked through one of its creatures, with three answers, the right one, an explanation from the event's description and the event it is about; a unit test requires each to name an event of its own region and a creature its generation knew. `previewRegion` says what a region holds (the lines first met there, its landmarks and its evolutions) for its signpost and its recap, and `pageSprites` lists every sprite the page shows, the dex's and the challenges'
- **Year Summaries**: `/data/year-summaries.json` holds the one-sentence field notes that open each year of the Generative AI and Agentic Eras, read through `yearSummary` in `/lib/year-summaries.ts`, and left out while the reader filters. A unit test requires one for every year of the Generative AI and Agentic Eras that has events, so adding events in a new year means writing its summary
- **Category System**: Events categorized as Models & Architectures, Research Breakthroughs, Public Releases, Ethics & Policy, Hardware Advances, Companies & Investments, AI Tools, Bombshell News, Agents (`TIMELINE_CATEGORIES` in `/types/timeline.ts`, the single list that `TimelineCategory` derives from). Each is drawn as an item from the bag (`CATEGORY_ITEMS` in `/lib/dex.ts`: a Rare Candy for research, a Nugget for money, a Rotom Phone for agents) in `components/ui/category-icon.tsx`, always shown beside the category's name (`CategoryBadge`). A new category goes in `TIMELINE_CATEGORIES` and needs an item in `CATEGORY_ITEMS`; `tsc` errors until the map covers it
- **Filtering and activity**: `/lib/timeline-filter.ts` narrows events by picked categories and search words, and `/lib/timeline-activity.ts` counts events per year for the activity charts

### Component Organization

Components are organized by purpose rather than type:

- **`/components/storytelling/`**: Narrative flow components (story-engine, prologue-scene, world-map, party-scene, epilogue-scene). The prologue is a game's title screen under a night sky and stays about a screen tall, which an integration test pins with room for other machines' fallback fonts: the title in its yellow wordmark and the premise, MEW floating over the first creature of every line on a grass ledge, the start menu (NEW GAME to the first era, CONTINUE to the latest entry, POKéDEX to the party), and the three latest sightings with their numbers, creatures and how long ago each happened, each linking to its entry at the end of the timeline (`scrollToEvent` in `/lib/timeline-scroll.ts`). The world map shows the six regions along one route, each linking to its signpost with its badge, route number, place, era, years and count, and a slim events-per-year chart whose numbers table runs from the first year. The party scene opens on the professor's briefing, a message box and six rules of how to read the journey, each beside a piece of the page it explains, then maps the nine lines, each stage with the year it arrived, linking to the entry where the line appears or the scene where it evolves. Ahead of the latest era, the story engine sets a message box ("Evolution speed") saying how many times faster its events came, in events per year, than in all the years before it (`describePace` in `/lib/pace.ts`), left out while the reader filters. The epilogue, the Hall of Fame after the latest entry, shows the party today with every line's level, how many years the reader has travelled, a wobbling mystery egg for the next era, the badges of every era, a link back to the start and the sprite credits, which say the site is an unofficial fan project
- **`/components/eras/`**: The era-chapter section, the era-header every era shares, `DexEra` (dex-era) that draws every era's entries, the scenes, the dex context and the shared era-parts. EraChapter draws each era's header (`EraHeader`) in the page's color ahead of its entries: a wooden signpost naming its route and place beside its badge (left out of a row the filters empty, which stays short), its marker, the h2 that names the section, its place, years, count and sprites, its description, and, unless filtering, what the region holds: the lines met there for the first time and its turning points, each linking to its entry. Eras draw no title of their own, and their backdrop root carries `data-era-backdrop` and `data-biome`: the era's biome (`biome-meadow` to `biome-summit` in `app/globals.css`), drawn at night with scenery at either side of the route on wide screens (SVG silhouettes, the right strip mirroring the left) and falling snow in Frostbite Pass. The year column's divider is the route's dashed dirt path from md up, with a stop on it beside every entry (`dex-route-stop`), and the column shows the creatures met that year. Unless filtering, an era ends in its gym challenge (`components/eras/gym-challenge.tsx`): its creature asks its question; a wrong answer says so and can be tried again; the right one disables the answers, explains itself in a live region, links to its entry and awards the badge; and a recap lists the region's evolutions, each linking to its scene. An era that the filters empty shows only its header. Every era renders one article per event (attributes from `eventCardAttributes`, plus `data-line`) whose date comes before its h3, whose h3 links to the source (`EventHeading` in era-parts), and which names the source site. A full entry draws its line's creature on a stage (decorative, `alt=""`), a "New line" tag on the line's first entry, its number and date, its title, what happened, and a footer with its creature, level and line, its category and its source; an AI winter freezes it (`data-frozen`, an ice overlay and the games' FRZ status, said in words to screen readers). Its scenes (`components/eras/scenes.tsx`) follow it in the same list item, each a `figure` with `data-scene` whose art is decorative and whose caption says everything: an evolution flickers from one stage to the next in white silhouettes as the reader scrolls through it (a named view timeline, `--scene`, keeps the sprites and the result line together; without scroll timelines or motion both stages stand side by side), a battle drains each side's HP bar to its share of the match with the AI's creature from behind on the near side, and moves, encounters, weather and dialog print their lines in a message box. Scenes stay out of filtered results. One component draws every generation, and each generation's look is CSS keyed on `data-gen` in `app/globals.css`: Generation I prints in four greens and the pixel font (an SVG filter, `#dmg-palette`, maps its gray sprites onto the greens), Generation II in rounded blue frames, Generation III in banded panels with soft shadows, Generation IV on two screens (the creature above, the entry below), Generation V in black and white with animated sprites, and today's era on glass with bobbing 3D sprites. Eras say how many years later a year came than the one above it when more than one year lies between them (`YearGap`, from `yearsLaterThanPrevious` in `/lib/year-gaps.ts`), drawn as tall grass. Every era groups its events by year (`groupEventsByYear` in `/lib/year-groups.ts`) beside a `YearColumn` that stays in view from the md breakpoint up and becomes a one-line label on phones, with the year in the pixel font, its count of entries and landmarks. It rules the year off from its events with a divider (a right border from md up, a bottom border on phones), and screen readers hear the year and its count in plain words instead. Keep every era within `max-w-4xl`, so its cards stay clear of the navigation rail on a 1280px screen. The current era ends on a Poké Ball (`Frontier`, watching for what comes after the latest event and saying how long ago that was, left out while filtering). Entries of the last twelve months say how long ago they happened (`RelativeTime`). Tests pin each generation's look and the story's scenes
- **`/components/interactive/`**: User interaction features (timeline-insights, headed as the trainer card)
- **`/components/accessibility/`**: WCAG compliance components (skip-to-content)
- **`/components/timeline/`**: Timeline-specific UI (timeline-controls, timeline-navigation, activity-chart). The toolbar, ruled off in red, says the route runs from 1943 to now, and its category filter is the BAG ("Bag: filter by category"), each toggle showing the category's item, the item's name and what it does. The navigation rail is a small dex with a red cap, the year in the pixel font, the current era's badge and place, and the party at the reading position: every line's icon as it stands there, swapping as the reader scrolls past an evolution (`partyAfter` with the event at the reading line, `eventId` from `useTimelinePosition`), an empty slot before a line appears; the phone bar's list shows the party too. Vertical activity charts, like the rail's, run the first year at the top, as the page does. The rail's era buttons show the year each era began and sit beside that year's row like ticks on an axis, stacking in page order where the short recent eras crowd together at the bottom
- **`/components/ui/`**: Shared pieces (category-icon, category-badge, sprite, relative-time). `Sprite` draws a file from `public/sprites` as a plain lazy-loading `img`, pixelated for pixel art; it is decorative unless given an `alt`. `RelativeTime` says how long ago an event happened to the month ("last month", "8 months ago", from `relativeMonthLabel` in `/lib/relative-time.ts`) for events under a year old. The page is prerendered, so it reads the reader's clock only in the browser (`useCurrentMonth`), and tests compare it with the real date instead of faking one. The page keeps the system cursor

### Animation System

Most motion is CSS in the `@layer components` block of `app/globals.css`, always inside `prefers-reduced-motion: no-preference`: event cards rise in with a scroll-driven animation (`animation-timeline: view()`), the scenes play on the scroll too (evolutions flicker, HP bars drain, encounters and battlers slide in), and today's 3D sprites bob, landmarks' sheen sweeps, the Poké Ball and the egg wobble, moves shake, hail and Frostbite Pass's snow fall, a badge pops when it is earned, the message boxes' carets blink and the hero's lens glows as keyframes. Framer Motion animates the phone chapter list. Hooks that move the reader around:
- `useTimelinePosition()` - Measures, once per animation frame while scrolling, the era, event (its anchor id), year and month at the reading line (`READING_LINE` in `/lib/timeline-scroll.ts`) and how far through the era the reader has come
- `useTimelineShortcuts()` - J and K step down and up the page between events, so J moves to later ones, 1 to 6 jump to the eras in page order, 1 being the Foundation Era at the top, and / focuses search

Derive styles from MotionValues with `useTransform` or `useMotionTemplate`. Interpolating a MotionValue into a plain template string silently produces an invalid style.

### State Management

The application uses React's built-in state management with no external state library. Timeline events are passed down through props from the main page component.

### Styling Approach

- Tailwind CSS 4 for styling with `@/*` path aliases, and `cn` in `lib/utils.ts` to merge class names
- Work Sans, Open Sans and the pixel font Press Start 2P (`--font-press-start`, used through `.font-pixel` and the `font-pixel` utility) are self-hosted from `app/fonts/` via `next/font/local`. Every use of the pixel font names `"Press Start 2P"` as the variable's fallback, so it still applies where the layout does not set the variable. Don't switch to `next/font/google`: it downloads fonts during `next build`, which makes builds fail at random
- `app/globals.css` keeps Tailwind out of `.claude/` with `@source not`. Tailwind reports every folder it scans to webpack, which hashes them on each build, and other Claude Code sessions' worktrees in `.claude/worktrees/` (one with `node_modules` symlinked to this checkout's) crashed webpack's cache when it hashed them. Keep the exclusion; a unit test and an end-to-end test check it
- CSS-in-JS animations via Framer Motion
- The page chrome has a single night-blue dark theme (`#0b0d1a`): its color tokens sit on `:root` in `app/globals.css` with `color-scheme: dark`, and each era's generation brings its own palette. The accents are the games' sun yellow (`#ffcb05`) for focus rings and highlights, and the dex's red (`#e3263b`). Add a chrome token only when a class uses it
- Every biome's backdrop in `app/globals.css` lists `var(--era-seam)` as its first background layer, which fades its top and bottom into the page's color so one era dissolves into the next. Keep that layer first when changing a backdrop; tests check it in every era
- `html` and `body` clip sideways overflow with `overflow-x: clip`, not `hidden`, because `hidden` turns them into scroll containers and breaks the sticky toolbar and month dividers

### Sprites

- The sprites come from `jayvicsanantonio/sprites`, a fork of PokéAPI's sprite collection, and ship in `public/sprites` (about 130 files, 2.5 MB, most of it today's animated GIFs): each line's stages in every generation it appears in, the battlers' back sprites, the legendaries, item icons and badges. `public/_headers` lets browsers keep them for a week
- `scripts/sync-sprites.mjs` copies exactly the files `pageSprites` in `/lib/journey.ts` lists from a clone of the sprites repository and deletes the rest, loading the TypeScript through Vite. The repository is over 14 GB, so clone it blobless: `git clone --depth 1 --filter=blob:none --no-checkout https://github.com/jayvicsanantonio/sprites ../sprites`, then `node scripts/sync-sprites.mjs ../sprites`. Run it after adding events or changing creatures; a unit test fails while any sprite the page shows is missing
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

- Keep `data/timeline-events.json` sorted by year, oldest first, with a verified source URL for every event. The page runs in that order, and the dex numbers entries by it, so never store the events newest first. A new event joins a line through `lineOf` in `/lib/dex.ts`; check where it lands, and run `scripts/sync-sprites.mjs` if it needs a sprite the page did not show before
- Document large data updates in the PR body
