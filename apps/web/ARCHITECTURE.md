# Project Architecture Documentation

## Folder Structure Overview

```
app/
├── modules/                    # Feature modules (pages + logic)
│   ├── user/
│   │   ├── login/
│   │   │   └── page.tsx       # Login page component
│   │   └── register/
│   │       └── page.tsx       # Register page component
│   └── library/
│       └── page.tsx           # Library page component
│
├── (auth)/                     # Route group (doesn't affect URL)
│   ├── user/
│   │   ├── login/
│   │   │   └── page.tsx       # Wrapper - exports from modules
│   │   └── register/
│   │       └── page.tsx       # Wrapper - exports from modules
│   └── library/
│       └── page.tsx           # Wrapper - exports from modules
│
├── components/                 # Reusable UI components
│   ├── SearchBar.tsx
│   └── SortDropdown.tsx
│
├── apis/                       # API client functions
│   ├── auth.ts                # Authentication API
│   ├── document.ts            # Document API
│   └── index.ts               # Exports
│
├── config/                     # Configuration files
│   ├── index.ts               # Main config (APP_CONFIG)
│   └── routes.ts              # Routes configuration & helpers
│
├── consts/                     # Application constants
│   └── index.ts               # Routes, API endpoints, user roles, etc.
│
├── types/                      # TypeScript types & interfaces
│   └── index.ts               # User, Document, API types
│
├── utils/                      # Utility functions
│   └── index.ts               # Helpers (validation, storage, format)
│
├── hooks/                      # Custom React hooks
│   └── index.ts               # Re-exports (useAuth, useFetch, etc.)
│
├── stores/                     # State management (Zustand, Redux, etc.)
│   └── index.ts               # Re-exports
│
├── lib/                        # Library functions
│   └── index.ts               # API client, cn() utility
│
├── mockdata/                   # Mock data for development
│   ├── documents.ts           # Mock documents
│   └── index.ts               # Exports
│
├── layout.tsx                  # Root layout
├── page.tsx                    # Home page
├── globals.css                 # Global styles
└── [other files]
```

## Import Paths (Path Aliases)

All imports should use the aliases defined in `tsconfig.json`:

```typescript
// Types
import type { User, Document } from "@/types";

// Constants
import { ROUTES, API_ENDPOINTS } from "@/consts";

// Config
import { APP_CONFIG, ROUTE_PATHS } from "@/config";
import { getRoute, requiresAuth } from "@/config/routes";

// Utils & Helpers
import { validateEmail, truncate } from "@/utils";
import { fetchAPI, cn } from "@/lib";

// APIs
import { authApi, documentApi } from "@/apis";

// Mock Data
import { MOCK_DOCUMENTS } from "@/mockdata";

// Components
import SearchBar from "@/components/SearchBar";

// Modules
import "@/modules/user/login/page";
```

## Routes & Navigation

All routes should be imported from `@/consts` or `@/config/routes`:

```typescript
import { ROUTES, ROUTE_PATHS, getRoute } from "@/config/routes";

// Available routes:
ROUTES.HOME; // '/'
ROUTES.LOGIN; // '/user/login'
ROUTES.REGISTER; // '/user/register'
ROUTES.LIBRARY; // '/library'
ROUTES.PROFILE; // '/profile'

// With parameters:
getRoute(ROUTE_PATHS.LIBRARY_DETAIL, { id: "123" });
// Returns: '/library/123'
```

## API Usage

All API calls should go through `@/apis`:

```typescript
import { authApi, documentApi } from "@/apis";

// Login
const response = await authApi.login({
  email: "user@example.com",
  password: "12345678",
});

// Get documents
const docs = await documentApi.list(1, 12);

// Search documents
const results = await documentApi.search("Giải tích");
```

## Type Safety

Always use types from `@/types`:

```typescript
import type { User, Document, LoginFormData } from "@/types";

interface PageProps {
  user?: User;
  documents: Document[];
}
```

## Configuration

All app-wide config goes to `@/config`:

```typescript
import APP_CONFIG from "@/config";

const apiUrl = APP_CONFIG.api.baseUrl;
const maxFileSize = APP_CONFIG.upload.maxFileSize;
```

## Development Workflow

1. **Create a new page**: Add to `modules/` folder
2. **Create API function**: Add to `apis/` folder
3. **Add constants**: Use `consts/` folder
4. **Add types**: Use `types/` folder
5. **Create utility**: Add to `utils/` folder
6. **Use routes**: Import from `config/routes.ts`

## Best Practices

✅ **DO:**

- Use path aliases for imports
- Keep module logic in `modules/` folder
- Export all APIs from `apis/index.ts`
- Use types from `@/types`
- Centralize routes in `config/routes.ts`
- Create wrapper pages in `(auth)/` for route groups

❌ **DON'T:**

- Use relative paths (`../../../`) - use aliases instead
- Mix business logic with page components
- Hardcode API endpoints
- Create unnamed routes
- Keep auth logic spread across components
