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
# Android emulator on Genymotion:
EXPO_PUBLIC_API_URL=http://10.0.3.2:8080

# iOS simulator / desktop browser / real device on the same LAN:
# EXPO_PUBLIC_API_URL=http://<your-host-ip>:8080
```

## Run (local)

```bash
pnpm -F mobile dev
```

To launch directly in an Android emulator from Expo:

```bash
pnpm -F mobile android
```

If Expo cannot reach the device over LAN, start it with a tunnel:

```bash
pnpm -F mobile start -- --tunnel
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
- Keep route strings in `src/constants/routes.ts`.
- Public routes live in `(tabs)` or `documents`; guest-only auth routes live in `(auth)`; authenticated routes live in `(protected)`.

### Current user flow

| Access          | Route                                                  | Purpose                                                        |
| --------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| Public          | `/` → `/home`                                          | Default entry; loads `ACTIVE` documents                        |
| Public          | `/search`, `/library`                                  | Search and browse active documents                             |
| Public          | `/documents/:id`                                       | Inline preview, direct device download, and original-file link |
| Guest only      | `/login`, `/register`, `/forgot-password`              | Authentication flow                                            |
| Authenticated   | `/profile`, `/documents/upload`, `/documents/:id/edit` | Account and document management                                |
| Moderator/Admin | `/moderator/documents`                                 | Moderation flow                                                |

`SessionProvider` restores tokens, verifies them through `/accounts/me`, and drives redirects. Guest auth screens redirect an authenticated user to Home; protected screens preserve the requested path and send guests to Login.

## Boilerplate cho dev mới

Bộ boilerplate mẫu đã được thêm sẵn để dev mới có thể tạo feature theo đúng cấu trúc.

### Đường dẫn mẫu

- Screen demo: `src/features/template-feature/screens/TemplateFeatureScreen.tsx`
- Hook demo: `src/features/template-feature/hooks/useTemplateFeature.ts`
- Service demo: `src/features/template-feature/services/template-feature.service.ts`
- Store demo: `src/store/template-feature.store.ts`
- Test demo: `src/__tests__/template-feature`

### Quy trình tạo feature mới (6 bước)

1. Copy folder `src/features/template-feature` thành `src/features/<ten-feature>` theo kebab-case.
2. Đổi tên symbol `TemplateFeature*` thành tên feature mới.
3. Tạo service tương ứng trong feature và cập nhật endpoint/API contract.
4. Tạo route mới trong `src/app` và render screen từ folder feature (giữ route file thật mỏng).
5. Thêm state chia sẻ ở `src/store` nếu cần, nếu không thì giữ local state trong hook.
6. Thêm test cho service + hook, sau đó chạy lint/type/test trước khi mở PR.

### Tài liệu chi tiết

- Xem hướng dẫn đầy đủ tại `apps/mobile/BOILERPLATE_GUIDE.md`.
- Xem workflow phát triển feature tại `apps/docs/MOBILE_FEATURE_WORKFLOW.md`.

## Data and API

- Use EXPO_PUBLIC_API_URL for the API base URL.
- Put API clients in src/services and feature-specific adapters in src/features/<domain>.
- Keep state modules inside src/store and avoid cross-feature coupling.
- Email verification still works with `{ token }`; pass `deviceId` only when a Mobile verify flow needs the backend to rotate a fresh session token after activation.

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
