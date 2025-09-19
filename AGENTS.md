# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router segments, layouts, and server components per route.
- `components/`: Feature-scoped UI (`storytelling/`, `interactive/`, `ui/`); keep motion and styling with each component.
- `data/`: Timeline JSON sources aligned with interfaces in `types/`.
- `hooks/` & `lib/`: Shared hooks, animation helpers, and constants; prefer named exports for reuse.
- `styles/`, `public/`, `logs/`: Tailwind layers, static assets, and generated reports—update only when necessary.

## Build, Test, and Development Commands
- `pnpm install`: Install dependencies; commit `pnpm-lock.yaml` when it changes.
- `pnpm dev`: Local development server with fast refresh.
- `pnpm build`: Production bundle check before shipping major changes.
- `pnpm start`: Serve the built app for smoke tests.
- `pnpm lint`: ESLint plus accessibility rules; resolve warnings.
- `pnpm exec tsc --noEmit`: Type-check without emitting JS.

## Coding Style & Naming Conventions
- TypeScript everywhere; keep strict typing and avoid `any` unless defensive guards are required.
- Files use kebab-case (`timeline-core.tsx`), components PascalCase, helpers camelCase.
- Two-space indentation, single quotes, and trailing commas on multi-line literals.
- Tailwind classes stay inline; extract shared variants into utilities such as `lib/utils.ts` when reused.
- Run linting before pushing to catch accessibility, import order, and Tailwind issues.

## Testing Guidelines
- No automated suite yet—add `.test.tsx` or `.test.ts` files beside new logic when possible.
- Focus tests on timeline data parsing and critical interactive flows.
- After data edits, run `pnpm dev` and confirm routes render without console errors.

## Commit & Pull Request Guidelines
- Write imperative, present-tense commit messages ("Update timeline events", "Refine accessibility helpers").
- Keep commits focused; split data revisions from UI refactors.
- PR descriptions should list user-visible changes, manual QA steps, linked issues, and any new environment needs.
- Include screenshots or short clips for visual tweaks.

## Data Stewardship Tips
- Keep `data/` entries chronologically sorted with verified source URLs.
- Document large data updates in the PR body and regenerate artifacts in `logs/` when they change.
