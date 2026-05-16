# Contribution Guide

This guide defines how team members contribute to AI Study Hub. Follow these steps for consistent, reviewable changes.

## Workflow

1. Create a branch from `main` using the naming convention in the naming guide.
2. Keep changes small and focused; avoid unrelated edits in one PR.
3. Write clear commit messages and include tests or notes when needed.
4. Open a pull request and request review before merging.

## Pull Request Checklist

- Scope is clear and limited to one change set.
- Code compiles and checks pass locally.
- Affected docs are updated when behavior changes.
- Screenshots or logs are included for UI or API changes when relevant.

## Commit Message Format

Use short, consistent messages. Recommended format:

```
<type>: <short summary>
```

Examples:

- `feat: add document preview endpoint`
- `fix: handle empty search query`
- `docs: update contribution guide`

Suggested types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.

## Code Review Expectations

- Reviewers check behavior, naming, and tests.
- Authors address comments and re-request review.
- Merge only after approvals and passing checks.
