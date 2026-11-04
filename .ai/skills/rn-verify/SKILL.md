---
name: rn-verify
description: Pre-commit / pre-MR gate — typecheck and a grep audit of the project's non-negotiable rules (localization, imports, network layers, env, dates, enums, autofill). Use after finishing any change, before committing, or when asked to "verify", "check", "review my changes" or "is this ready".
---

# expo-template — verify a change

Run this at the end of every `rn-feature`, `rn-upgrade`, `rn-endpoint`, `rn-screen` and `rn-bugfix` run, and before every commit.

## 1. Scope

```bash
git status --short
git diff --name-only HEAD
git ls-files --others --exclude-standard
```

Work only on the files in this list. Do not "fix" unrelated legacy code.

## 2. Mechanical checks (must pass)

```bash
npx tsc --noEmit
```

## 3. Rule audit (changed files only)

Fail the verify if any of these show up in the diff without a deliberate reason:

- Hard-coded user-facing strings in `src/app/` / `src/` (must go through `getString` / `AppStringKey`) — `.ai/rules/localization.md`
- Imports missing the `@/` alias, or deep `../../../` paths — `.ai/rules/general.md`
- Screens importing axios / React Query directly (must use a use case) — `.ai/rules/network.md`
- `process.env.EXPO_PUBLIC_*` read outside `src/App.ts` / `AppConfig` — Config & secrets in `.ai/rules/general.md`
- Bare `new Date(...)` / `Intl.DateTimeFormat` for backend dates — use `formatDateOrText`
- String-literal unions for closed value catalogs — use `*Enums`
- Auth inputs without `autofillField={AutofillFieldEnums.X}`
- New routes missing dual `<Stack.Screen>` registration or a `useAppRouter` destination

## 4. Report

- Pass / fail per check
- Files touched
- Anything skipped on purpose (and why)
