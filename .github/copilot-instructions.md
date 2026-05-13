# Copilot Instructions — Trove

## Feature specs

When building a new feature, create a spec file under `docs/features/<feature-name>.md` before (or alongside) implementation. The spec is optional but encouraged — it helps with context, review, and future maintenance. At minimum it should include: summary, data model changes, key UI components, and open questions.

## Pre-push checklist

Always run `npx next build` and confirm a clean build **before** pushing code. Do not push if there are TypeScript or build errors.
