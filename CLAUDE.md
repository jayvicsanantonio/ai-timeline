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
```

Note: This project uses pnpm for package management. TypeScript and ESLint errors are ignored during builds (configured in next.config.mjs).

## Project Architecture

This is an interactive AI timeline application built with Next.js 15, React 19, TypeScript, and Framer Motion. The project showcases 183+ AI historical events from 1943-2024 through a cinematic, storytelling experience.

### Core Architecture Pattern

The application follows a story-driven architecture centered around a "StoryEngine" component that orchestrates the entire timeline experience:

```
app/page.tsx → StoryEngine → PrologueScene + TimelineStory + EpilogueScene
```

### Key Data Structures

- **Timeline Events**: Central data stored in `/data/timeline-events.json` with TypeScript interfaces in `/types/timeline.ts`
- **Era-based Organization**: Events are grouped into Foundation (1940-1970), Knowledge (1970-1990), Learning (1990-2010), and Transformation (2010+) eras
- **Category System**: Events categorized as Models & Architectures, Research Breakthroughs, Public Releases, Ethics & Policy, Hardware Advances

### Component Organization

Components are organized by purpose rather than type:

- **`/components/storytelling/`**: Narrative flow components (story-engine, prologue-scene, epilogue-scene, narrative-bridge)
- **`/components/interactive/`**: User interaction features (timeline-filter, ai-quote-carousel, timeline-insights, expandable-timeline-card)
- **`/components/animations/`**: Reusable animation components (reveal-animation, parallax-container, text-reveal, magnetic-hover)
- **`/components/accessibility/`**: WCAG compliance components (focus-trap, skip-to-content, reduced-motion-wrapper)
- **`/components/performance/`**: Optimization components (lazy-timeline-section, error-boundary, optimized-timeline)
- **`/components/timeline/`**: Timeline-specific UI (timeline-navigation, responsive-timeline, mobile-timeline-controls)

### Animation System

Heavy use of Framer Motion with custom hooks for scroll-based animations:
- `useScrollAnimation()` - Scroll-triggered animation triggers
- `useIntersectionObserver()` - Viewport intersection detection
- `useIntersectionAnimation()` - Combined scroll and intersection animations

### State Management

The application uses React's built-in state management with no external state library. Timeline events are passed down through props from the main page component.

### Styling Approach

- Tailwind CSS 4 for styling with `@/*` path aliases
- Shadcn/ui + Radix UI components for accessible UI primitives
- CSS-in-JS animations via Framer Motion
- Theme support via next-themes

### Performance Considerations

- Lazy loading implemented for timeline sections
- Intersection Observer for efficient scroll animations
- Error boundaries for graceful error handling
- Next.js automatic image optimization (unoptimized: true in config)

### Development Notes

- TypeScript strict mode enabled but build errors are ignored in production
- ESLint configured with Next.js defaults but errors ignored during builds
- Uses Next.js App Router (not Pages Router)
- All timeline data is static JSON, no external APIs