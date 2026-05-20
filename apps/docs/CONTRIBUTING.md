# Contribution Guide

This guide defines how team members contribute to AI Study Hub. It combines the branch, review, and verification flow in one place so there is a single source of truth for day-to-day contribution work.

## Development Workflow

1. Start from the latest `dev` branch.

```sh
git fetch origin
git checkout dev
git pull origin dev
```

2. Create a new branch using the naming convention.

**Branch naming format:**

```text
<type>/<short-description>
```

Where `<type>` is one of:

- `feat` — new feature
- `fix` — bug fix
- `chore` — maintenance, dependency updates
- `refactor` — code restructuring without behavior change
- `docs` — documentation updates
- `test` — test additions or improvements

**Examples:**

- `feat/document-search`
- `fix/upload-timeout`
- `chore/update-dependencies`
- `docs/add-api-guide`

**Rules:**

- Use `kebab-case` for the description part
- Keep it short and descriptive (3–5 words)
- One feature or fix per branch

```sh
git checkout -b feat/<short-description>
```

3. Keep the change focused on one feature or bug.

- Avoid unrelated edits in the same pull request.
- Keep commits small and meaningful.

4. Write tests before or alongside your implementation.

See [Testing Guide](TESTING.md) for setup and examples:

- API tests use NestJS + Jest in `apps/api/src/**/*.spec.ts`
- Web tests use Vitest + React Testing Library in `apps/web/tests/**/*.test.tsx`
- Coverage threshold is 80% — maintain or improve it
- Run tests locally: `pnpm test`

Write unit tests for all new logic. Make sure existing tests still pass.

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
- Tests are included or updated for new logic.
- Coverage is maintained or improved.

## Writing Commits

### Commit Message Format

Commit messages should be clear and follow a consistent structure:

```
<type>(<scope>): <short summary>

[optional body explaining the change]
[optional footer with issue/PR references]
```

**Format breakdown:**

- `<type>` — required; indicates the kind of change (see type guidelines below)
- `(<scope>)` — optional; indicates which package/app was affected: `api`, `web`, `mobile`, or general area name
- `<short summary>` — required; concise description (imperative mood, lowercase)

**Examples:**

- `feat(api): add document preview endpoint`
- `fix(web): handle empty search query in form`
- `docs: update contribution guide`
- `test(mobile): add validation tests for upload form`
- `chore(api): upgrade nestjs to v11`
- `refactor(web): simplify component structure` — no scope for monorepo-wide changes

**Scope guidelines:**

- `api` — changes in `apps/api`
- `web` — changes in `apps/web`
- `mobile` — changes in `apps/mobile`
- `packages` — changes in `packages/*` (eslint-config, tokens, ui, theme, etc.)
- Omit scope if the change affects multiple apps or is purely docs/tooling

**Type guidelines:**

- `feat` — new feature or capability
- `fix` — bug fix
- `docs` — documentation-only changes
- `chore` — tooling, deps, configs (no feature/logic change)
- `refactor` — code restructuring (no behavior change)
- `test` — tests only, no source code change

**Keep commits small:**

- One logical change per commit
- Each commit should compile and pass tests
- Avoid mixing unrelated changes

## Code Review Expectations

- Reviewers check behavior, naming, and tests.
- Authors address comments and re-request review.
- Merge only after approvals and passing checks.

## Additional Resources

- [Naming Conventions](NAMING_CONVENTIONS.md) — code style and naming rules
- [Testing Guide](TESTING.md) — test setup, commands, and coverage
- [Project Overview](PROJECT_OVERVIEW.md) — architecture and project structure
