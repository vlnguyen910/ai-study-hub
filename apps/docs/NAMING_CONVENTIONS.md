# Naming Conventions

Use consistent naming across the repository to keep code readable and searchable.

## Branch Names

Format:

```
<type>/<short-description>
```

Examples:

- `feat/document-search`
- `fix/upload-timeout`
- `chore/update-deps`

Reference:
- [apps/docs/NAMING_CONVENTIONS.md](apps/docs/NAMING_CONVENTIONS.md)

## File and Folder Names

- Use `kebab-case` for folders and files: `document-list`, `upload-form`.
- Use `PascalCase` for React components: `DocumentCard.tsx`.
- Use `camelCase` for utilities: `formatFileSize.ts`.

## Class, Interface, and Type Names

- Use `PascalCase`: `DocumentMetadata`, `UploadStatus`.

## Function and Variable Names

- Use `camelCase`: `fetchDocumentList`, `uploadProgress`.
- Use verb-based names for actions: `createDocument`, `deleteDocument`.

## API Routes (REST)

- Use plural nouns: `/documents`, `/subjects`.
- Use nested routes for relations: `/documents/:id/versions`.
- Use `kebab-case` for multi-word paths: `/chat-history`.

## Database (if applicable)

- Table/collection: `snake_case` or `camelCase` (choose one per service).
- Columns/fields: `snake_case` preferred for SQL; `camelCase` preferred for MongoDB.
