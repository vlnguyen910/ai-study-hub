# Mobile App (Expo)

This app runs with Expo + Expo Router and is managed as part of the pnpm + Turborepo workspace.

## Prerequisites

- Node.js >= 18
- pnpm (use corepack)
- Android Studio or Xcode if you need emulators/simulators

## Install

```bash
pnpm install
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

## Quality checks

```bash
pnpm -F mobile lint
pnpm -F mobile check-types
pnpm -F mobile test
```

## Testing

Unit tests use Jest + React Native Testing Library. Test files live under `src/**/__tests__`.

Run in watch mode:

```bash
pnpm -F mobile test:watch
```

## Reset starter code

```bash
pnpm -F mobile reset-project
```

## Notes for teammates

- Use pnpm only. Do not use npm or yarn in this workspace.
- Expo Go is fine for quick checks, but use emulators for native behavior.
- Run `pnpm lint` and `pnpm check-types` at the repo root before pushing.
