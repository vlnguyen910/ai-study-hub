# Testing Guide

This project uses Jest for the API and Vitest + React Testing Library for the web app.

## Quick Commands (Repo Root)

- Unit tests: `pnpm test`

## API Tests (NestJS + Jest)

Location: `apps/api`

- Unit tests: `pnpm --filter api test`
- Watch mode: `pnpm --filter api test:watch`
- Coverage: `pnpm --filter api test:cov`

Unit test files use `*.spec.ts` in `apps/api/src/**`.

## Web Unit Tests (Vitest + RTL)

Location: `apps/web`

- Unit tests: `pnpm --filter web test`
- Watch mode: `pnpm --filter web test:watch`
- Coverage: `pnpm --filter web test:cov`

Test files live in `apps/web/tests/**/*.test.tsx`.

## Coverage Policy

Coverage thresholds are set to 80% (lines, branches, functions, statements). Keep or improve coverage when adding new logic.
