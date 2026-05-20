# Contribution Guide

This guide defines how team members contribute to AI Study Hub. It combines the branch, review, and verification flow in one place so there is a single source of truth for day-to-day contribution work.

## Development Workflow

1. Start from the latest `dev` branch.

```sh
git fetch origin
git checkout dev
git pull origin dev
```

2. Create a new branch using the naming convention in the [naming guide](NAMING_CONVENTIONS.md).

```sh
git checkout -b feat/<short-description>
```

Examples:

- `feat/document-search`
- `fix/upload-timeout`

3. Keep the change focused on one feature or bug.

- Avoid unrelated edits in the same pull request.
- Keep commits small and meaningful.

4. Add or update tests when the change introduces new behavior.

- Write unit tests for new logic.
- Make sure existing tests still pass.

5. Run the required checks before pushing.

```sh
pnpm test
pnpm format
pnpm lint
pnpm check-types
pnpm build
```

6. Rebase on the latest `dev` before pushing.

```sh
git fetch origin
git rebase origin/dev
```

7. Push the branch and request review.

```sh
git push -u origin feat/<short-description>
```

8. Merge only after approval and passing checks.

- Open a pull request into `dev`.
- Delete the branch after merge.

## Pull Request Checklist

- Scope is clear and limited to one change set.
- Code compiles and checks pass locally.
- Affected docs are updated when behavior changes.
- Screenshots or logs are included for UI or API changes when relevant.

## Commit Message Format

Use short, consistent messages. Recommended format:

```text
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

## Related Guides

- [Naming Conventions](NAMING_CONVENTIONS.md)
- [Testing Guide](TESTING.md)
