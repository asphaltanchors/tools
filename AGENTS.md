# Repository Guidelines

## Project Structure & Module Organization
Source routes live in `app/`, grouped by feature folders and Next.js route segments (e.g., `app/calculator/page.tsx`). Reusable UI goes in `components/`, while pure logic and shared helpers belong in `lib/`. Static assets and favicons should be added to `public/`. Keep configuration files (`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`) at the root so they apply globally.

## Build, Test, and Development Commands
Use `npm run dev` for a local Turbopack-powered dev server with hot reload. Run `npm run build` to produce an optimized production bundle and validate type safety. Start the compiled app via `npm run start`, which assumes a prior build. Execute `npm run lint` before committing to surface issues enforced by the Next.js ESLint suite.

## Coding Style & Naming Conventions
Write new code in TypeScript using React Server Components by default; client components must include the `"use client"` directive. Prefer PascalCase for component files (`Button.tsx`) and camelCase for utility modules (`lib/palletMath.ts`). Tailwind classes are available; consolidate shared patterns in `components.json`. Follow the lint rules from `next/core-web-vitals` and avoid inline styles when a Tailwind utility exists.

## Testing Guidelines
Automated tests are not yet configured, so add targeted checks alongside code changes. Co-locate lightweight assertions in `*.test.ts` or `*.test.tsx` files under the relevant folder, and document the commands required to run them in the PR if you introduce a new tool. Always verify both `npm run lint` and `npm run build` succeed before requesting review.

## Commit & Pull Request Guidelines
Write imperative, present-tense commit messages with a short scope (e.g., `feat: add pallet dimensions input`). Group related changes per commit and keep summaries under ~72 characters. Pull requests should describe the problem, outline the solution, list manual or automated verification steps, and link to tracking issues when available. Include screenshots or GIFs for UI adjustments and note any configuration or data migrations.

## Environment & Configuration Tips
Environment variables use the standard Next.js pattern; define them in `.env.local` and document additions in the PR. Never commit `.env*` files. When introducing new dependencies, justify them in the PR body and ensure they work with the Turbopack build pipeline.
