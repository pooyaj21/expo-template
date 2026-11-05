---
name: feature
description: Build a brand-new feature end to end — plan, types, service → queries → BL hook, optional store, page, route shell, paths, strings, flag, verify. Use when asked to add, create or build a new feature, page, flow or screen backed by the backend.
---

# Build a new feature

Don't skip steps; mark optional ones "n/a" in the plan instead of silently dropping them. Scaffold with `npm run feature -- <name>` then fill in. Reference shape: `src/features/example/`.

## 1. Plan first (show it to the user before coding)

Collect, and ask for anything missing:

- Endpoint(s): method, path, request + real response JSON.
- Design / states: loading, empty, error, success.
- Entry points: which screens navigate here? Behind a feature flag?

Write a short plan listing every file with **create / edit / n/a**.

## 2. Types — `data-access/<feature>Types.ts`

Rules: `.ai/rules/network.md`. Fields snake_case. Wrap with shared envelopes from `@/common/data-access/type/responseTypes`.

## 3–4. Service + queries

Use the `endpoint` skill. Mandatory layers. Presentation consumes only the BL hook.

## 5. Business-logic — `use<Feature>.ts`

Flat API for the page. Side effects live here.

## 6. State (only if it must survive unmount)

Rules: `.ai/rules/state.md` — slice under `business-logic/store/`, composed in `app-state.ts`.

## 7. UI — `presentation/<Feature>Page.tsx`

`PageContainer` + `AppToolbar` + `StateHandler` + BL hook. Rules: `.ai/rules/screens.md`, `.ai/rules/ui.md`. Tablet in the same change (`.ai/rules/tablet.md`). `testID`s while building (`.ai/rules/testing.md`).

## 8. Route + paths

Use the `screen` skill: thin shell in `src/app/`, register in `_layout`, add `routes.*` in `paths.ts`.

## 9. Strings

Every user-facing string → `en.json` + `ar.json` + `MessageKey`. Interpolation: `getStringWithReplacement`.

## 10. Optional flag

`.ai/rules/featureflags.md` — one source (`env` | `server`), `useFeatureFlag`.

## 11. Verify and hand off

1. Run the `verify` skill.
2. Run on iOS and Android, en and ar, phone and tablet as relevant.
3. Suggest a Maestro flow — write only if asked.
4. Commit only if asked.
