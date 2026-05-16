# Testing Guide

This project uses Jest for the API and Vitest + React Testing Library for the web app. Web E2E tests run with Playwright.

## Quick Commands (Repo Root)

- Unit tests: `pnpm test`
- E2E tests: `pnpm test:e2e`

## API Tests (NestJS + Jest)

Location: `apps/api`

- Unit tests: `pnpm --filter api test`
- Watch mode: `pnpm --filter api test:watch`
- Coverage: `pnpm --filter api test:cov`
- E2E tests: `pnpm --filter api test:e2e`

Unit test files use `*.spec.ts` in `apps/api/src/**`.
E2E test files use `*.e2e-spec.ts` in `apps/api/test/**`.

## Web Unit Tests (Vitest + RTL)

Location: `apps/web`

- Unit tests: `pnpm --filter web test`
- Watch mode: `pnpm --filter web test:watch`
- Coverage: `pnpm --filter web test:cov`

Test files live in `apps/web/tests/**/*.test.tsx`.

## Web E2E Tests (Playwright)

Location: `apps/web`

- E2E tests: `pnpm --filter web test:e2e`

Test files live in `apps/web/e2e/**/*.spec.ts`.

## Coverage Policy

Coverage thresholds are set to 80% (lines, branches, functions, statements). Keep or improve coverage when adding new logic.
