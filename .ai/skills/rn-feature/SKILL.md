---
name: rn-feature
description: Build a brand-new VLFA feature in this Expo RN app end to end — plan, types, service → queries → business-logic hook, optional store, screen, route shell, router destination, strings, flag, verify. Use when asked to add, create or build a new feature, page, flow or screen backed by the backend.
---

# expo-template — build a new feature (VLFA)

Don't skip steps; mark optional ones "n/a" in the plan instead of silently dropping them. Reference slice: **example** (`src/features/example/` → `src/app/example/`).

Prefer the generator when starting from empty:

```bash
npm run feature -- <name>
```

It scaffolds the three layers + cell + screen + route shell. It does **not** edit `paths.ts` or `strings.ts` — apply those two edits yourself from the printed checklist.

## 1. Plan first (show it to the user before coding)

Collect, and ask for anything missing — don't invent it:

- Endpoint(s): method, path, request + **real** response JSON
- Design (Figma / screenshot), states: loading, empty, error, success
- Entry points: which screens navigate here? Deep link? Login required? Behind a feature flag?

Write a short plan listing every file from steps 2–10 with **create / edit / n/a**.

## 2. Types — `src/features/<f>/data-access/<f>Types.ts`

Rules: `.ai/rules/entities.md` + `src/common/data-access/CLAUDE.md`. One
`export interface <Name>Interface`, fields **snake_case** exactly as the backend
sends. Wrap responses with `BaseResponseType<T>` / `BaseListResponse<T>` /
`BasePaginationResponse<T>` from `@/common/data-access/api/responseTypes` — `T`
is never an array. Closed sets of values → `*Enums` enum.

## 3–5. Network — service → queries → business-logic hook

Use the `rn-endpoint` skill. Mandatory, no merged layers.

- `data-access/<f>Service.ts` — raw axios; client is the first argument
- `data-access/<f>Queries.ts` — `use*Query` / `use*Mutation` only
- `business-logic/use<Feature>.ts` — the only surface a screen consumes

Screens never import a service or a query hook.

## 6. State (only if it must survive unmount)

Rules: `.ai/rules/state.md` — `business-logic/store/<domain>Slice.ts` +
`<domain>Selectors.ts` + `use<Domain>Manager.ts`. Screen-local state stays
`useState`.

## 7. UI

- Screen body: `presentation/<Feature>Screen.tsx` — `PageContainer` +
  `AppToolbar` + `StateHandler` + the business-logic hook. Rules:
  `.ai/rules/screens.md`, `.ai/rules/ui.md`.
- Reuse `App*` components. Colors / fonts from the theme, never hex. Logical
  edges (`marginStart`, `start`).
- Cells: `presentation/components/<Name>Cell.tsx`.
- Lists: prefer `AppList` + `DimensionProvider.<feature>` tablet side margins.
- Bottom sheets: shared → `src/features/core/dialogs/` + DialogManager; single
  caller → next to the screen (`.ai/rules/dialogs.md`).
- Every new screen / pressable / list item ships with `testID`s from
  `src/common/business-logic/testIds.ts`.

## 8. Route + router destination

Use the `rn-screen` skill: thin shell in `src/app/`, register in the feature
`_layout` (and root when needed), add `routes.<name>()` in
`src/common/business-logic/routes/paths.ts`.

## 9. Strings

Every user-facing string → `AppStringKey` in
`src/common/data-access/localization/strings.ts` (both `en` and `ar`).
Interpolation: positional `p0` / `p1` via `.replace` at the call site.

## 10. Optional extras

| Need                          | Read                                                               |
| ----------------------------- | ------------------------------------------------------------------ |
| Feature flag                  | `.ai/rules/featureflags.md` — `FeatureFlagEnums`, `useFeatureFlag` |
| Deep link                     | `.ai/rules/deeplinks.md`                                           |
| Native module / config plugin | `.ai/rules/platform.md`                                            |
| Blur / tablet                 | `.ai/rules/blur.md`, `.ai/rules/tablet.md`                         |
| Maestro                       | `.ai/rules/testing.md` — suggest a flow; write only if asked       |

## 11. Verify and hand off

1. Run `rn-verify` (or `npm run type:check` + `npm run lint`).
2. Run on iOS and Android, in en and ar (RTL).
3. If you discovered a new convention or trap → `rn-rules`.
4. Suggest a Maestro flow for the happy path (do not write it unless asked).
5. Report: what now works, new string keys, open backend questions.
6. Commit only if asked.
