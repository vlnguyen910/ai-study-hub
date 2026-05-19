# Web App Guide

This app uses Next.js and consumes shared design tokens from `@repo/tokens`.

## Shared design tokens

- Use `@repo/tokens` for colors, spacing, radius, typography, and other shared values.
- Keep web-only theme bootstrapping in `apps/web/app/layout.tsx`.
- Use CSS variables exposed by `createWebThemeStyles()` in `apps/web/app/globals.css` and component styles.

Example:

```ts
import { createWebThemeStyles } from "@repo/tokens/web";
```

## Related docs

- [Shared tokens](../docs/SHARED_TOKENS.md)
- [Design system](../docs/DESIGN.md)
- [Project overview](../docs/PROJECT_OVERVIEW.md)This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
