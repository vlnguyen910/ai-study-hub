# Development Workflow

This document defines the feature and bug-fix workflow for team members.

## 1. Sync Latest Code

Always start from the latest `dev` branch:

```sh
git fetch origin
git checkout dev
git pull origin dev
```

## 2. Create a Feature or Fix Branch

Create a short-lived branch from `dev`:

```sh
git checkout -b feat/<short-description>
```

Examples:

- `feat/document-search`
- `fix/upload-timeout`

## 3. Implement the Change

- Focus on one feature or bug per branch.
- Keep commits small and meaningful.

## 4. Add Tests (When Needed)

- Write or update unit tests for new logic.
- Ensure existing tests still pass.

## 5. Run Code Quality Checks

Run the required checks before pushing:

```sh
pnpm test
pnpm format
pnpm lint
pnpm check-types
pnpm build
```

## 6. Rebase on Latest `dev`

Ensure your branch is up to date before pushing:

```sh
git fetch origin
git rebase origin/dev
```

Resolve conflicts if any, then continue the rebase.

## 7. Push and Request Review

```sh
git push -u origin feat/<short-description>
```

- Open a pull request into `dev`.
- Request review from teammates.

## 8. Merge After Approval

- Merge into `dev` only after PR approval and passing checks.
- Delete the branch after merge.
