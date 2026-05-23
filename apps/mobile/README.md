# Mobile App (Expo)

This app runs with Expo + Expo Router and is managed as part of the pnpm + Turborepo workspace.
It follows the repo naming and workflow conventions in apps/docs.

## Prerequisites

- Node.js >= 18
- pnpm (use corepack)
- Android Studio or Xcode if you need emulators/simulators

## Install

```bash
pnpm install
```

## Environment

Create a local env file in apps/mobile:

```bash
cp .env.example .env
```

Set the API base URL for the mobile app:

```
EXPO_PUBLIC_API_URL=http://localhost:8080 # local development
```

## Run (local)

```bash
pnpm -F mobile dev
```

Other run options:

```bash
pnpm -F mobile android
pnpm -F mobile ios
pnpm -F mobile web
```

## Folder structure

Keep Expo Router routes inside src/app. App logic, data access, and UI live outside src/app.

```
src/
	app/                 # Expo Router routes and layouts
	components/          # Shared UI components
	constants/           # App-specific adapters over shared tokens
	features/            # Domain modules
		auth/
		documents/
		chat/
		profile/
	hooks/               # Shared hooks
	services/            # API clients and integrations
	store/               # State management
	types/               # Shared types
	utils/               # Pure utilities
	configs/             # App configuration
```

## Routing conventions (Expo Router)

- Only route screens and layouts go in src/app.
- Keep route components thin; move logic into src/features or src/services.
- Use \_layout.tsx for shared layout; use group folders for feature grouping.

## Data and API

- Use EXPO_PUBLIC_API_URL for the API base URL.
- Put API clients in src/services and feature-specific adapters in src/features/<domain>.
- Keep state modules inside src/store and avoid cross-feature coupling.

## Shared design tokens

- Import primitives and semantic aliases from `@repo/tokens`.
- Keep platform-only values in `src/constants/theme.ts`.
- Use [../docs/SHARED_TOKENS.md](../docs/SHARED_TOKENS.md) for the shared token contract and import examples.

## Quality checks

```bash
pnpm -F mobile lint
pnpm -F mobile check-types
pnpm -F mobile test
```

## Testing

Unit tests use Jest + React Native Testing Library. Test files live under src/\*\*/**tests**.

Run in watch mode:

```bash
pnpm -F mobile test:watch
```

## Reset starter code

```bash
pnpm -F mobile reset-project
```

## Team workflow

- Follow apps/docs/CONTRIBUTING.md for branching, PR flow, and checks.
- Follow apps/docs/NAMING_CONVENTIONS.md for naming.
- Keep changes scoped and update docs when behavior changes.
- Use pnpm only. Do not use npm or yarn in this workspace.
- Expo Go is fine for quick checks, but use emulators for native behavior.
