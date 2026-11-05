---
name: verify
description: Pre-commit gate — typecheck, lint/prettier, and a grep audit of non-negotiable rules (localization, imports, layers, env, enums, RTL, tablet). Use after finishing any change, before committing, or when asked to verify / check / review changes.
---

# Verify a change

Run this at the end of every `feature`, `endpoint`, `screen` and `bugfix` run, and before every commit. There are no unit tests — **typecheck + lint + this audit + a device run is the bar**.

## 1. Scope

```bash
git status --short
git diff --name-only HEAD
git ls-files --others --exclude-standard
```

Work only on files in this list. Do not "fix" unrelated legacy code.

## 2. Mechanical checks (must pass)

```bash
npm run type:check
npm run lint
npx prettier --check <changed files>
```

- Errors in files you touched → fix them. Pre-existing errors elsewhere → report, don't fix.

## 3. Rule audit (changed files only)

| Rule                                                          | Pass when                                                                                       |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| No relative / bare `src/` / `assets/` imports                 | no hits                                                                                         |
| No `process.env` outside environment wiring / `app.config.js` | only those files                                                                                |
| Presentation never imports axios / `@tanstack/react-query`    | only data-access / BL                                                                           |
| No logic in `src/app/`                                        | thin shells only                                                                                |
| No hard-coded user-facing copy                                | every hit is brand/debug                                                                        |
| No `getString(…).replace`                                     | use `getStringWithReplacement`                                                                  |
| Value catalogs are enums                                      | no string-literal unions for states/modes                                                       |
| No new `any` / `@ts-ignore`                                   | no new hits                                                                                     |
| RTL-safe layout                                               | `Start/End`, not `Left/Right`                                                                   |
| Tablet-aware layout                                           | no fixed `numColumns={N}` / `Platform.isPad`                                                    |
| Logs gated                                                    | `console.log` only in develop paths                                                             |
| Env flags                                                     | `EXPO_PUBLIC_FLAG_*` only in flag/env wiring                                                    |
| Excluded vendors                                              | no crash, analytics, push, attribution, support-chat, or payments SDKs from the Decisions table |

## 4. Wiring checks (if the change added these)

- New route → registered + `paths.ts` helper.
- New component / page → `testID`s.
- New page → tablet layout when applicable.
- New string key → `en.json` + `ar.json`.
- New env key → `.env`, `.env.example`, `docs/build-and-release.md`.

## 5. Report

1. Pass/fail for typecheck, lint, audit, wiring.
2. Each remaining fail with `file:line` and the fix.
3. What still needs a human: device run, backend questions.

Do not commit unless asked.
