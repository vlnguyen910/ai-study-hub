## Getting Started

Run the development server from the workspace root:

```bash
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Useful scripts:

```bash
pnpm --filter web lint
pnpm --filter web test
pnpm --filter web check-types
```

## Architecture Overview

The web app keeps the implementation split between route wrappers and feature modules. The route files stay thin, while the real page logic, data handling, and UI composition live in `app/modules/`.

### Folder Structure

```text
app/
├── modules/                    # Feature modules (pages + logic)
│   ├── user/
│   │   ├── login/
│   │   │   └── page.tsx        # Login page component
│   │   └── register/
│   │       └── page.tsx        # Register page component
│   └── library/
│       └── page.tsx            # Library page component
│
├── (auth)/                     # Route group (doesn't affect URL)
│   ├── user/
│   │   ├── login/
│   │   │   └── page.tsx        # Wrapper - exports from modules
│   │   └── register/
│   │       └── page.tsx        # Wrapper - exports from modules
│   └── library/
│       └── page.tsx            # Wrapper - exports from modules
│
├── components/                 # Reusable UI components
├── apis/                       # API client functions
├── config/                     # App config and route helpers
├── consts/                     # App constants
├── types/                      # TypeScript types and interfaces
├── utils/                      # Utility functions
├── hooks/                      # Custom React hooks
├── stores/                     # State management
├── lib/                        # Shared library helpers
├── mockdata/                   # Mock data for development
├── layout.tsx                  # Root layout
├── page.tsx                    # Home page
└── globals.css                 # Global styles
```

### Core Conventions

- Put page-level business logic in [app/modules/](./app/modules) and keep route files in the App Router as wrappers.
- Use `app/(auth)/` for route-grouped pages that should share auth-specific layout or routing behavior without changing the URL.
- Keep reusable UI in [app/components/](./app/components) and shared helpers in [app/lib/](./app/lib), [app/utils/](./app/utils), and [app/hooks/](./app/hooks).
- Centralize API access in [app/apis/](./app/apis) instead of calling backend endpoints directly from pages.
- Keep app-wide constants, route helpers, and typed config in [app/config/](./app/config) and [app/consts/](./app/consts).

## Import Paths

Use the aliases defined in `tsconfig.json`.

```ts
import type { User, Document } from "@/types";
import { ROUTES, API_ENDPOINTS } from "@/consts";
import { APP_CONFIG, ROUTE_PATHS } from "@/config";
import { getRoute, requiresAuth } from "@/config/routes";
import { validateEmail, truncate } from "@/utils";
import { fetchAPI, cn } from "@/lib";
import { authApi, documentApi } from "@/apis";
import { MOCK_DOCUMENTS } from "@/mockdata";
import SearchBar from "@/components/SearchBar";
import "@/modules/user/login/page";
```

## Routes and Access Control

Route definitions, guards, and helpers live in [app/routes/](./app/routes). Keep navigation logic there rather than scattering route strings across features.

- Public routes are accessible without auth.
- User-protected routes require a valid auth token.
- Admin routes require the `admin` role.
- Use the route helpers from [app/routes/README.md](./app/routes/README.md) for path generation, protection, and access checks.

### Common usage

```ts
import { ROUTE_PATHS, getRoutePath, ProtectedRoute } from "@/routes";

router.push(ROUTE_PATHS.HOME);
router.push(ROUTE_PATHS.AUTH_ROUTES.LOGIN);
const detailPath = getRoutePath(ROUTE_PATHS.LIBRARY_DETAIL, { id: "123" });
```

## Development Workflow

1. Create or update the page logic in [app/modules/](./app/modules).
2. Add or update the thin route wrapper in [app/(auth)/](<./app/(auth)>) or the relevant App Router folder.
3. Add API calls in [app/apis/](./app/apis) and shared config in [app/config/](./app/config).
4. Add or update types in [app/types/](./app/types) and utilities in [app/utils/](./app/utils).
5. Keep shared UI in [app/components/](./app/components) and theme usage aligned with [app/globals.css](./app/globals.css).
6. If the route or guard behavior changes, update [app/routes/README.md](./app/routes/README.md).

This is the Next.js web app for AI Study Hub. It consumes shared design tokens from `@repo/tokens`, keeps feature logic in route modules, and uses the App Router for the public, auth, and protected experience.

## Shared Design Tokens

Use `@repo/tokens` for colors, spacing, radius, typography, and other shared values.

- Keep web-only theme bootstrapping in [app/layout.tsx](./app/layout.tsx).
- Use the CSS variables exposed by `createWebThemeStyles()` in [app/globals.css](./app/globals.css) and component styles.
- Prefer shared tokens over app-local magic numbers so the web app stays aligned with the rest of the workspace.

Example:

```ts
import { createWebThemeStyles } from "@repo/tokens/web";
```

## Related Docs

- [Project overview](../docs/PROJECT_OVERVIEW.md)
- [Design system](../docs/DESIGN.md)
- [Shared tokens](../docs/SHARED_TOKENS.md)
- [Route management](./app/routes/README.md)
- [Page development guide](../docs/PAGE_DEVELOPMENT_GUIDE.md)
