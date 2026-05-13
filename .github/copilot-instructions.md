# Copilot Instructions — Trove

## Feature specs

When building a new feature, create a spec file under `docs/features/<feature-name>.md` before (or alongside) implementation. The spec is optional but encouraged — it helps with context, review, and future maintenance. At minimum it should include: summary, data model changes, key UI components, and open questions.

## Pre-push checklist

Always run `npx next build` and confirm a clean build **before** pushing code. Do not push if there are TypeScript or build errors.

## Pull requests

After finishing a feature or task, ask the user if they are ready to create a PR. If they say yes:

1. **Prefer `gh pr create`** — use the GitHub CLI to create the PR directly from the terminal with a `--title` and `--body` containing a summary of changes.
2. **Fall back to `git push`** — if `gh` is not available, push the branch with `git push -u origin <branch>` and provide the GitHub URL to create the PR manually.
3. **Last resort: copy-paste** — if neither CLI tool can push (e.g. auth issues), give the user a ready-to-copy-paste `gh pr create` command and the equivalent GitHub web URL so they can open the PR themselves.

Always include a clear PR summary: what changed, why, and which files were added or modified.
