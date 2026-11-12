# The AI Timeline

_The history of artificial intelligence from 1943 to October 2026, each era drawn in the computer interface of its day._

[![Live site](https://img.shields.io/badge/Live-ai--timeline.pokemoncenter.dev-black?style=for-the-badge)](https://ai-timeline.pokemoncenter.dev)
[![CI](https://img.shields.io/github/actions/workflow/status/jayvicsanantonio/ai-timeline/ci.yml?branch=main&style=for-the-badge&label=CI)](https://github.com/jayvicsanantonio/ai-timeline/actions/workflows/ci.yml)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

**[Open the timeline →](https://ai-timeline.pokemoncenter.dev)**

340 events, from McCulloch and Pitts's artificial neuron to this year's agents, each with a source link. The page rewinds from now: it opens on the latest events and runs back through six eras to where it all began. A Pokémon-ify button retells the same history as a Pokémon adventure.

## Contents

- [What's on the page](#whats-on-the-page)
- [The Pokémon theme](#the-pokémon-theme)
- [Getting started](#getting-started)
- [Commands](#commands)
- [Project structure](#project-structure)
- [Data](#data)
- [Adding or changing an event](#adding-or-changing-an-event)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## What's on the page

### Interfaces through time

Every era is drawn as the interface people used to talk to computers at the time, and every era starts on its latest year.

| Era | Years | Events | Interface |
| --- | --- | ---: | --- |
| Agentic Era | 2025 – now | 80 | An agent's task log: tool calls, parallel fetches, checkpoints |
| Generative AI Era | 2020 – 2024 | 104 | A chat thread that answers "What happened in {year}?" |
| Deep Learning Revolution | 2010s | 58 | Research notebook cells |
| Learning Era | 1990s – 2000s | 30 | Beveled desktop windows |
| Knowledge Era | 1970s – 1980s | 33 | A green-phosphor terminal |
| Foundation Era | 1940s – 1960s | 35 | 80-column punch cards |

### Reading it

- **Newest first.** The opening shows the three latest events, how long ago each happened, a link to every era and an events-per-year chart. The page ends on the first event and how many years the reader has rewound.
- **Pace.** Below the Agentic Era, a line says how many times faster events now arrive than in all the years before. The early eras mark the quiet years between events, and the chat thread and the agent sum up each year in a sentence.
- **Busy years stay readable.** A year with more than 12 events keeps its landmarks and highlights in full and lists the rest one line each, with a "Show all" button.
- **Landmarks.** 26 turning points, such as the Dartmouth conference, the 2012 ImageNet breakthrough, "Attention Is All You Need" and ChatGPT, stand out in every era's own style.
- **Search and filters.** Search every event and filter by any of nine categories; every era narrows at once, with a live count.
- **Navigation.** A rail on wide screens shows the year at the reading line, an events-per-year chart and a button per era; phones get a compact bar.
- **Keyboard.** <kbd>J</kbd> and <kbd>K</kbd> step to older and newer events, <kbd>1</kbd>–<kbd>6</kbd> jump to the eras in page order, and <kbd>/</kbd> focuses search.
- **Accessibility.** A skip link, full keyboard access, visible focus rings, plain-language years for screen readers, and no motion for readers who prefer reduced motion.

### For machines

- `/llms.txt` summarizes the site and its eras for AI agents, and `/llms-full.txt` lists every event by era and year, with its date, category and source, in under a tenth of the page's HTML.
- Page metadata, Open Graph tags, the preview image, `robots.txt`, `sitemap.xml` and schema.org `WebSite` data are all generated from the events at build time, so counts and years never go stale.

## The Pokémon theme

The **Pokémon-ify** button at the top of the page turns the timeline into a Pokémon adventure that reads forward from 1943:

- AI history becomes nine evolution lines (neural networks, logic and reasoning, language, games and self-play, chips and robots, images and media, money and companies, safety and law, and agents) on a journey through six regions, one per era.
- Each region is drawn in the sprites of one generation of the games, so the pictures grow up as the field does.
- Lines evolve at AI's turning points, freeze in the AI winters, and fight famous matches (Deep Blue against Kasparov, AlphaGo against Lee Sedol) as battle scenes. Each region ends in a gym challenge.
- Every event says what it did to its line in the games' battle text: a move learned, a stat raised or lowered, or a status condition for scandals and harms.

**Back to classic** returns instantly. Either way the page keeps the reader at the event they were reading, and remembers the choice for the next visit. A link can pick a theme with `?theme=pokemon` or `?theme=classic`.

The classic page downloads none of the Pokémon theme. Pressing Pokémon-ify shuts a Poké Ball over the screen, which wobbles while the theme's code, styles, font and first sprites download, then opens onto it. If the download fails, the ball opens back onto the classic page.

Pokémon and its creatures are trademarks of Nintendo, Creatures Inc. and GAME FREAK inc. This is an unofficial fan project. The sprites come from [jayvicsanantonio/sprites](https://github.com/jayvicsanantonio/sprites).

## Getting started

### Prerequisites

- **Node.js 22.12 or later** (Vite 8 and Vitest 5 need it; CI runs Node 22)
- **pnpm 11**, at the version `packageManager` pins in `package.json`. With Corepack, `corepack enable` picks it up. The lockfile and `pnpm-workspace.yaml` are pnpm-only, so npm and Yarn won't work.

### Install and run

```bash
git clone https://github.com/jayvicsanantonio/ai-timeline.git
```

```bash
cd ai-timeline
```

```bash
pnpm install
```

```bash
pnpm dev
```

Then open <http://localhost:3000>. Add `?theme=pokemon` to start in the Pokémon theme.

Both test suites run in Playwright's Chromium, so install it once before testing:

```bash
pnpm exec playwright install chromium
```

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server on port 3000 |
| `pnpm build` | Production build; fails on TypeScript or ESLint errors and on invalid event data |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Run `tsc --noEmit` |
| `pnpm test` | Unit and integration tests (Vitest, browser mode, headless Chromium) |
| `pnpm test:e2e` | End-to-end tests (Playwright) against `next build && next start` on `E2E_PORT` (default 3100) |
| `pnpm preview` | Build the Cloudflare Worker with OpenNext and serve it locally in workerd |
| `pnpm run deploy` | Build the Worker and deploy it to Cloudflare (bare `pnpm deploy` is pnpm's own command) |

Run one test file:

```bash
pnpm exec vitest run tests/unit/timeline-events.test.ts
```

```bash
pnpm exec playwright test tests/e2e/timeline.spec.ts
```

## Project structure

```
app/
├── page.tsx                  # Loads and validates the events, renders the timeline
├── layout.tsx                # Fonts, metadata and the inline script that picks the theme before first paint
├── globals.css               # Chrome tokens, era backdrops and scroll-driven animations
├── theme-switch.css          # The theme bar and the Poké Ball
├── pokemon.css               # The Pokémon theme's styles, downloaded with its code
├── llms.txt/, llms-full.txt/ # Plain-text routes for AI agents
└── robots.ts, sitemap.ts, opengraph-image.tsx, icon.svg
components/
├── theme/                    # ThemedTimeline (classic or Pokémon) and the on-demand loader
├── storytelling/             # StoryEngine (filters, era order), the opening and the closing
├── eras/                     # The era section, its shared header and the six era interfaces
├── timeline/                 # Search and filters, the navigation rail and bar, the activity chart
├── interactive/              # Timeline insights
├── accessibility/            # Skip link
├── ui/                       # Category icons, relative times
└── pokemon/                  # The Pokémon theme, mirroring the folders above
data/
├── timeline-events.json      # Every event, oldest first
└── year-summaries.json       # One sentence per year of the Generative AI and Agentic Eras
hooks/                        # Reading position, keyboard shortcuts, reduced motion, current month
lib/                          # Eras, filtering, ordering, pace, scrolling, site metadata, llms.txt, theme choice
lib/dex.ts, dex-actions.ts, journey.ts  # The Pokémon theme's lines, battle text and regions
scripts/sync-sprites.mjs      # Copies the sprites the Pokémon theme shows into public/sprites
tests/                        # unit/, integration/ and e2e/, each with a pokemon/ folder
```

How the page fits together:

```
app/page.tsx
└── ThemedTimeline
    ├── StoryEngine (classic, the default)
    │   ├── PrologueScene        latest events, era links, chart
    │   ├── TimelineControls     search and category filters
    │   ├── EraChapter × 6       EraHeader + one era interface, latest era first
    │   ├── TimelineNavigation   rail on wide screens, bar on phones
    │   └── TimelineInsights + EpilogueScene
    └── PokemonStoryEngine (loaded with import() after Pokémon-ify)
```

**Stack:** Next.js 15 (App Router, fully prerendered), React 19, TypeScript in strict mode, Tailwind CSS 4, Framer Motion for the phone chapter list. Most motion is CSS: cards rise in with scroll-driven animations (`animation-timeline: view()`) rather than a JavaScript observer per card, and the navigation measures scroll once per frame. Work Sans and Open Sans are self-hosted in `app/fonts/`.

## Data

All content is static JSON. `data/timeline-events.json` holds every event, oldest first; the page reverses the order itself in `lib/newest-first.ts`.

```typescript
interface TimelineEvent {
  year: number;
  month: string;
  title: string;
  description: string;
  category: TimelineCategory; // one of TIMELINE_CATEGORIES in types/timeline.ts
  link: string;               // the source; every event needs a verified one
  landmark?: boolean;         // one of the turning points every era sets apart
  highlight?: boolean;        // kept in full in a busy year
}
```

| Category | Events |
| --- | ---: |
| Research Breakthroughs | 86 |
| Public Releases | 59 |
| Ethics & Policy | 55 |
| Companies & Investments | 34 |
| Models & Architectures | 30 |
| Bombshell News | 29 |
| Hardware Advances | 21 |
| AI Tools | 13 |
| Agents | 13 |

`parseTimelineEvents` in `lib/timeline-events.ts` throws on an unknown category, so bad data fails `pnpm build`. Eras are defined in `ERA_DEFINITIONS` in `lib/eras.ts`.

## Adding or changing an event

The data is guarded by tests, so a new event usually touches more than one file:

1. **Add it to `data/timeline-events.json`** in date order, oldest first, with a source URL you have checked.
2. **Write its Pokémon battle text** in `EVENT_ACTIONS` in `lib/dex-actions.ts`, keyed by the event's title. A unit test requires one for every event.
3. **Write a year summary** in `data/year-summaries.json` if the event opens a new year from 2020 on. A unit test requires one sentence for every such year.
4. **Landmarks and highlights are curated.** Marking an event `"landmark": true` or `"highlight": true` means updating the list a unit test pins. Keep about five full-size events per busy year.
5. **A new category** goes in `TIMELINE_CATEGORIES` in `types/timeline.ts` and needs an icon in `components/ui/category-icon.tsx`; `tsc` fails until it has one.
6. **If the Pokémon theme shows a new creature**, run the sprite script:

   ```bash
   git clone --depth 1 --filter=blob:none --no-checkout https://github.com/jayvicsanantonio/sprites ../sprites
   ```

   ```bash
   node scripts/sync-sprites.mjs ../sprites
   ```

Large data updates should be described in the pull request.

## Testing

- **Vitest** (`tests/unit`, `tests/integration`) renders components in real headless Chromium through browser mode, so tests use real browser APIs instead of mocks.
- **Playwright** (`tests/e2e`) runs against a production build. It also checks that the classic page loads none of the Pokémon theme's styles, font or sprites.
- The Pokémon theme's tests live in `pokemon/` subfolders of each suite. `tests/e2e/theme-switch.spec.ts` covers switching between themes.
- Before pushing, run `pnpm lint`, `pnpm type-check` and `pnpm test`, plus `pnpm test:e2e` for anything the browser shows.

[CI](.github/workflows/ci.yml) runs the type check, lint, Vitest and Playwright on every pull request and every push to `main`, and uploads the Playwright report when end-to-end tests fail.

## Deployment

Every push to `main` deploys to two hosts. Both name <https://ai-timeline.pokemoncenter.dev> as the canonical address (`SITE_URL` in `lib/site.ts`).

- **Vercel** runs `next build`.
- **Cloudflare Workers** (Workers Builds) runs `npx opennextjs-cloudflare build`, which bundles the Next.js build into a Worker in `.open-next/`, then `npx opennextjs-cloudflare deploy`. `wrangler.jsonc` names the Worker `ai-timeline`. Branch builds upload Worker Previews with `npx wrangler preview`. Every page is prerendered, so the Worker needs no bindings beyond its static assets, and `public/_headers` lets browsers cache `/_next/static` for a year.

## Contributing

- Use pnpm and commit `pnpm-lock.yaml` when it changes.
- Write imperative commit messages ("Add the October 2026 events") and keep data changes in separate commits from UI changes.
- In a pull request, list the user-visible changes and how to check them by hand, and include screenshots for visual changes.
- [`AGENTS.md`](AGENTS.md) documents the architecture and conventions in depth, for people and coding agents alike.
