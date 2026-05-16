# Hệ thống Quản lý Tài liệu Học tập AI (AI Study Hub)

## Project Overview
AI Study Hub is a web platform that centralizes students' learning documents and enables fast retrieval and AI-assisted Q&A. It addresses scattered storage, poor organization, and the difficulty of quickly finding or asking about previous materials. The system targets both students and development teams building a real-world fullstack workflow.

Core scope:

- Authentication: sign up, sign in/out, password recovery, profile updates
- Document management: upload, list, download, delete, edit metadata, view details
- Search and filtering: search documents, filter by subject
- Cloud storage: upload to cloud, upload status, file preview
- AI chatbot: ask questions about documents, receive AI answers, view chat history

## Tech Stack
- NestJS (API)
- Next.js (Web and Docs)
- TypeScript
- Turborepo
- pnpm
- Node.js >= 18

## Installation
```sh
pnpm install
```

## Run Project
```sh
pnpm dev

pnpm dev --filter web  # for only web
pnpm dev --filter api  # for only api
```

Common scripts:

- `pnpm test`
- `pnpm build`
- `pnpm lint`
- `pnpm check-types`
- `pnpm format`

## Environment Variables
To be added. Environment files will be documented per app when finalized.

## API Docs
To be added.

## Team Docs
- Contributting Guide: [CONTRIBUTING.md](apps/docs/CONTRIBUTING.md)
- Development Workflow: [DEVELOPMENT_WORKFLOW.md](apps/docs/DEVELOPMENT_WORKFLOW.md)
- Naming Conventions: [NAMING_CONVENTIONS.md](apps/docs/NAMING_CONVENTIONS.md)
- Testing: [TESTING.md](apps/docs/TESTING.md)

## Team Members
To be added.
