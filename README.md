# AI Timeline: A Comprehensive History of Artificial Intelligence

_An interactive, cinematic exploration of AI's evolution from 1943 to October 2026_

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/jayvic-san-antonios-projects/v0-image-analysis)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-purple?style=for-the-badge&logo=framer)](https://www.framer.com/motion)

## Overview

This project presents the complete history of artificial intelligence through an immersive, interactive timeline featuring **340 curated events** spanning from 1943 to October 2026. Built with modern web technologies, it combines storytelling with data visualization to create an engaging educational experience.

### Key Features

- **Comprehensive Dataset**: 340 meticulously researched AI milestones with verified sources
- **Latest News, Then the Journey**: The page opens on the newest events, each saying how long ago it happened, then the journey runs forward from 1943 to now, so every line evolves in the order it did
- **Nine Evolution Lines**: AI history told as Pokémon evolution lines. Neural networks are a MAGIKARP that uses SPLASH to no effect for fifty years, learns TACKLE with backpropagation and evolves into GYARADOS when AlexNet wins ImageNet. Language runs PORYGON, PORYGON2 at the Transformer and PORYGON-Z at ChatGPT; reasoning runs ABRA to ALAKAZAM at Deep Blue; games run MACHOP to MACHAMP, traded to Google with DeepMind; chips run MAGNEMITE to MAGNEZONE at the TPU; agents are the GASTLY line, the ghost in the machine. Every event is a numbered entry showing its line at the stage and level it had reached
- **The Story in Scenes**: Evolutions play out as you scroll at the real turning points; human-versus-machine matches are battles (Deep Blue against Kasparov, AlphaGo's MOVE 37 against Lee Sedol, a gold medal at the Math Olympiad) with HP bars at the final score; the AI winters bring hail and freeze every line; MEW opens the story and legendaries mark a few singular moments
- **Your Party**: A map of the nine lines links each stage to the moment it evolved, the navigation rail shows the party as it stands wherever you are reading, and the journey ends on the party today and an egg for the next era
- **Sprites Through Time**: Each era is drawn in the sprites of one generation of handheld games, as AI's own fidelity grew: Generation I's four greens for the Foundation Era, then Generation II's color, Generation III's brighter panels, Generation IV's two screens, Generation V's animated sprites, and today's animated 3D for the Agentic Era
- **Search, Filters and Shortcuts**: Search every event, filter by category, and jump around with J, K, 1–6 and /
- **Sources**: Each entry names the site its link opens
- **Pace and Context**: Each year's label stays beside its events as they scroll past, the early eras mark the quiet years between events, and each year of the Generative AI and Agentic Eras opens on its field notes, a one-sentence summary. The busy years of the 2020s keep their highlights in full and list the rest in brief, with a button to show them all
- **Responsive Design**: Optimized for desktop, tablet, and mobile experiences
- **Accessibility First**: A skip link, full keyboard access, visible focus rings and reduced motion support
- **Performance Optimized**: Scroll-driven CSS animations instead of a JavaScript observer per card, and one scroll measurement per frame for the navigation

## Technical Architecture

### Frontend Stack

- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations

### Key Components Architecture

```
components/
├── storytelling/            # Narrative-driven components
│   ├── story-engine.tsx     # Main orchestrator: builds the dex, holds the search and category filters, runs the eras from 1943
│   ├── prologue-scene.tsx   # Opening: title, MEW and the premise, latest sightings, era links and a slim chart
│   ├── party-scene.tsx      # The nine lines, each stage linking to where it evolves
│   └── epilogue-scene.tsx   # Closing: the party today, the egg for the next era and the sprite credits
├── eras/                    # The AI Dex, one generation of sprites per era
│   ├── era-chapter.tsx      # The era's section: its shared header, then its entries
│   ├── era-header.tsx       # The header every era shares, with its badge, marked Now or Before {year}
│   ├── dex-era.tsx          # An era's entries in its generation's style (data-gen), from the first forward
│   ├── scenes.tsx           # Evolutions, battles, moves, encounters, weather and dialog
│   ├── dex-context.tsx      # Hands every part of the page the dex built once from all events
│   └── era-parts.tsx        # Pieces every era shares: card attributes, titles, year columns, brief listings
├── timeline/                # Timeline-wide UI
│   ├── timeline-controls.tsx    # Search box and the category filters
│   ├── timeline-navigation.tsx  # Chapter rail and phone bar
│   └── activity-chart.tsx       # Events-per-year chart
├── interactive/             # User interaction features
│   └── timeline-insights.tsx
└── accessibility/           # Accessibility helpers
    └── skip-to-content.tsx
```

### Data Management

- **Structured Timeline Events**: TypeScript interfaces for type safety
- **Era-based Grouping**: Foundation, Knowledge, Learning, Deep Learning Revolution, Generative AI and Agentic eras
- **Category System**: Research Breakthroughs, Models & Architectures, Public Releases, Ethics & Policy, Hardware Advances, Companies & Investments, AI Tools, Bombshell News, Agents, each drawn as an item from the bag (`CATEGORY_ITEMS` in `lib/dex.ts`)

### Sprites

The sprites come from [jayvicsanantonio/sprites](https://github.com/jayvicsanantonio/sprites), a fork of PokéAPI's sprite collection, and ship in `public/sprites` so the page never depends on another host. `scripts/sync-sprites.mjs` copies exactly the files the page shows (`requiredSprites` in `lib/dex.ts`) and removes the rest, so run it after adding events or changing creatures. A blobless clone downloads only what the script asks for:

```bash
git clone --depth 1 --filter=blob:none --no-checkout https://github.com/jayvicsanantonio/sprites ../sprites
node scripts/sync-sprites.mjs ../sprites
```

A unit test fails if any sprite the page shows is missing. Pokémon and its characters are trademarks of Nintendo, Creatures Inc. and GAME FREAK inc.; this is an unofficial fan project, and the epilogue says so.

## Getting Started

### Prerequisites

- Node.js 22.12 or later, which Vitest requires
- pnpm 11, the version CI uses (`pnpm-lock.yaml` and `pnpm-workspace.yaml` are pnpm-only)

### Installation

```bash
# Clone the repository
git clone https://github.com/jayvicsanantonio/ai-timeline.git
cd ai-timeline

# Install dependencies
pnpm install

# Install the Chromium build that pnpm test and pnpm test:e2e run in
pnpm exec playwright install chromium

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint
```

### Development Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
pnpm test         # Run unit and integration tests (Vitest in headless Chromium)
pnpm test:e2e     # Build, serve and run end-to-end tests (Playwright)
```

Both test commands need Playwright's Chromium; install it once with `pnpm exec playwright install chromium`.

## User Experience Design

### Interactive Features

- **Timeline Navigation**: A rail with the current year, an events-per-year chart and a button per era; a compact bar on phones
- **Search and Category Filters**: Narrow every era at once, with a live count of the events shown
- **Keyboard Shortcuts**: J and K step between events, 1 to 6 jump to an era, / focuses search
- **Responsive Timeline**: Adapts layout for different screen sizes

### Accessibility Features

- **Keyboard Navigation**: Full tab support and focus management
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Reduced Motion**: Respects user preferences for motion
- **Focus Indicators**: Clear visual focus states

### Performance Optimizations

- **Scroll-driven CSS Animations**: Cards rise into place without a JavaScript observer per card
- **Static Prerendering**: The page is rendered to static HTML at build time

## Data Quality & Verification

### Sources and Checks

- **Source Attribution**: Every event links to its source, and each card names the site the link opens
- **Curated Lists**: Unit tests pin the landmark and highlight lists, and require a summary for every Generative AI and Agentic year that has events

### Data Structure

```typescript
interface TimelineEvent {
  year: number;
  month: string;
  title: string;
  description: string;
  category:
    | 'Models & Architectures'
    | 'Research Breakthroughs'
    | 'Public Releases'
    | 'Ethics & Policy'
    | 'Hardware Advances'
    | 'Companies & Investments'
    | 'AI Tools'
    | 'Bombshell News'
    | 'Agents';
  link: string;
  landmark?: boolean; // One of the turning points every era sets apart
  highlight?: boolean; // Kept in full in a busy year, whose other entries are listed in brief
}
```

`app/page.tsx` loads `data/timeline-events.json` through `parseTimelineEvents` (`lib/timeline-events.ts`), which rejects unknown categories, so bad data fails `pnpm build`.

## Advanced Features

### Animation System

- **Scroll-driven Reveals**: Event cards rise into place as they scroll into view
- **Scroll-driven Scenes**: Evolutions flicker in white silhouettes and HP bars drain as each scene scrolls through the screen, with both stages side by side when motion is reduced
- **Dex Details**: Today's 3D sprites bob, hail falls in the AI winters, a Poké Ball wobbles while it watches for the next entry, and the hero's lens glows
- **Reduced Motion**: Every animation is off when the reader prefers reduced motion

### Custom Hooks

```typescript
useTimelinePosition(); // The era, event date and era progress at the reading line
useTimelineShortcuts(); // J, K, 1–6 and / keyboard shortcuts
```

## Standout Engineering Practices

### Code Quality

- **TypeScript Strict Mode**: Zero `any` types, full type coverage
- **Component Architecture**: Reusable, composable design patterns
- **Custom Hook Pattern**: Shared logic abstraction

### Development Workflow

- **Continuous Integration**: GitHub Actions runs the type check, lint, and the Vitest and Playwright suites in real Chromium on every pull request
- **Type Safety**: Compile-time error prevention
- **Documentation**: Comprehensive inline documentation

## Impact & Learning Outcomes

This project demonstrates:

- **Data Visualization**: Complex timeline interactions
- **Performance Engineering**: Large dataset optimization
- **Accessibility Engineering**: Inclusive design implementation
- **TypeScript Mastery**: Advanced type system usage
- **Animation Programming**: Sophisticated motion design
- **User Experience Design**: Intuitive interaction patterns

## Future Enhancements

- **Personalization**: User-customizable timeline views
- **Export Features**: PDF/image timeline generation
- **Interactive Annotations**: User-contributed insights
- **API Integration**: Real-time AI news aggregation
- **Internationalization**: Multi-language support

## At a Glance

- **340 Events**: Comprehensive historical coverage
- **Mobile-First**: Responsive across all devices

---

_This project showcases advanced frontend engineering skills including React architecture, TypeScript mastery, animation programming, accessibility implementation, and performance optimization. It demonstrates the ability to handle complex data visualization while maintaining excellent user experience and code quality standards._
