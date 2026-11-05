---
description: "Expo template core — VLFA architecture, workflows (skills), non-negotiables, naming, imports, code style, TS essentials"
alwaysApply: true
---

# Expo App Template

Personal Expo starter. Expo SDK 55, React Native 0.83, React 19.2, Expo Router (file-based, typed routes under `src/app/`), TanStack Query, Zustand, Axios, New Architecture + React Compiler enabled. Bilingual (en / ar with RTL). No third-party crash reporting, no analytics, no auth, no force-update.

## Layout

```
src/
  app/                         # Expo Router routes ONLY (thin shells)
  common/
    presentation/              # shared UI atoms, token/, icons/, providers/
    business-logic/            # hooks, utils, routes/paths.ts, store/app-state.ts, observability/
    data-access/               # api/ (axios, queryClient, channels), type/responseTypes.ts
  features/
    core/<slice>/              # shared slices: environment, app-boot, device,
                               # feature-flags, navigation, dialogs, debug, error-pages
    CoreBootstrap.ts           # side-effect imports that register core slices
    <feature>/{presentation,business-logic,data-access}/
assets/                        # fonts, animation, images
plugins/                       # Expo config plugins
.ai/                           # rules + skills (single library; .claude/.cursor are symlinks)
.maestro/                      # Maestro smoke flows
docs/
```

## Where the scoped rules live

Folder-scoped rules load automatically when you work in that folder:

- [`.ai/rules/screens.md`](screens.md) — Expo Router route shells (`src/app/`)
- [`.ai/rules/network.md`](network.md) — feature data-access service → queries → BL hook
- [`.ai/rules/state.md`](state.md) — Zustand, providers, hooks
- [`.ai/rules/ui.md`](ui.md) — components, theming, lists (`common/presentation`, feature presentation)
- [`.ai/rules/dialogs.md`](dialogs.md) — bottom-sheet dialogs (`features/core/dialogs`)
- [`.ai/rules/tablet.md`](tablet.md) — tablet / large-screen layout
- [`.ai/rules/architecture.md`](architecture.md) — VLFA boundaries (read with any layer edit)
- [`.ai/rules/deeplinks.md`](deeplinks.md) — scheme / universal links → `useAppRouter`

Always-on companion: [`.ai/rules/localization.md`](localization.md) — i18n / RTL (every user-facing string).

On-demand reference:

- [`.ai/rules/platform.md`](platform.md) — Expo SDK, config plugins, native modules
- [`.ai/rules/featureflags.md`](featureflags.md) — one-source flags (`env` | `server`), `useFeatureFlag`
- [`.ai/rules/testing.md`](testing.md) — Maestro smoke + `testID`s (no Jest)
- [`.ai/rules/rule-authoring.md`](rule-authoring.md) — how `.ai/` works
- [`docs/build-and-release.md`](../../docs/build-and-release.md) — local builds / flavors (no CI)

## Workflows (skills)

Every task follows a project skill in `.ai/skills/`. Pick the matching one before writing code:

| Task                                      | Skill      |
| ----------------------------------------- | ---------- |
| New feature / page backed by the backend  | `feature`  |
| New or changed API call                   | `endpoint` |
| New route / screen / tab                  | `screen`   |
| Bug, crash, wrong behaviour               | `bugfix`   |
| Before every commit                       | `verify`   |
| Add or change a rule, convention or skill | `rules`    |

Rules and skills are written only in `.ai/`; `.claude/` and `.cursor/` only hold symlinks to it. After adding, renaming or deleting a rule file, run `bash scripts/link-ai-rules.sh`.

## Non-Negotiable Rules

- **NEVER** put business logic, Zustand stores, API calls, or reusable components in `src/app/`. That folder is for Expo Router screens only.
- **ALWAYS** import using the `@/*` → `src/*` and `@assets/*` → `assets/*` aliases. Never deep relative paths (`../../../`) and never bare `src/...` / `assets/...`.
- Dependency direction: `app → features/<x> → features/core → common`. `common` never imports features (exception: `common/business-logic/store/app-state.ts`). Kernel talks to features through registries (`requestHeaders`) and channels (`apiErrorChannel`, `apiResponseChannel`).
- Layer rule inside a slice: `presentation → business-logic → data-access`. Presentation may import `data-access/*Types.ts` only (enforced by `eslint-plugin-boundaries`).
- No barrel `index.ts` / `index.tsx` files.
- Named arrow-function exports for components, hooks, and utilities. Prefer named exports over default exports for new code.
- Feature gating goes through the flag system: `useFeatureFlag(name)`. Never read `process.env.EXPO_PUBLIC_FLAG_*` in a screen. Each flag declares **one** source (`env` or `server`) — see [`.ai/rules/featureflags.md`](featureflags.md).
- Errors report through `reportError` in `common/business-logic/observability/errorReporter.ts` (console only). **No third-party crash reporting.**
- Every user-facing string goes through localization (`getString` / `getStringWithReplacement`). See [`.ai/rules/localization.md`](localization.md).
- Plain `StyleSheet` + theme tokens. RTL-logical styles (`marginStart` / `paddingEnd` / `start` / `end`). Never hard-code hex colors in components.

## Naming

| Kind                         | Pattern                                                  | Example                                  |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------------- |
| Route file (`src/app/`)      | feature folder + lowercase leaf, or flat lowercase file  | `src/app/example/[id].tsx`               |
| Tab route                    | lowercase noun                                           | `src/app/(tabs)/index.tsx`               |
| Feature page                 | `<Feature>Page.tsx` (PascalCase) in `presentation/`      | `ExampleListPage.tsx`                    |
| Reusable / branded component | PascalCase, `App` prefix for shared primitives           | `AppButton.tsx`                          |
| Hook                         | `use` prefix, camelCase file                             | `useExample.ts`                          |
| Feature data-access file     | camelCase `<feature>X.ts`                                | `exampleService.ts`, `exampleQueries.ts` |
| Feature types                | camelCase `<feature>Types.ts`                            | `exampleTypes.ts`                        |
| Folder                       | kebab-case                                               | `feature-flags/`, `error-pages/`         |
| Zustand slice                | `<domain>Slice.ts` under feature `business-logic/store/` | `favoritesSlice.ts`                      |

### Symbol naming

- Types/interfaces: PascalCase. Prefer `interface` for data models, `type` for unions/prop aliases.
- Props type: `<Component>Props`.
- Enum: PascalCase + `Enums` suffix (`MetaTypeEnums`).
- Constants: SCREAMING_SNAKE_CASE only for module-level config; otherwise camelCase.
- Backend JSON arrives snake_case — preserve it in payload/response interfaces. Do NOT rename to camelCase.
- Never put a brand/project name in identifiers.

## Imports

Order:

1. React / React Native
2. Third-party libs (`expo-*`, `@tanstack/react-query`, `@shopify/flash-list`, `axios`, `zustand`, …)
3. `@/*` internal modules
4. `@assets/*`
5. Relative imports (same-feature only; avoid otherwise)

```ts
// GOOD
import { AppButton } from "@/common/presentation/components/AppButton";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";

// BAD — relative path across packages
import { AppButton } from "../../common/presentation/components/AppButton";

// BAD — bare `src/...`
import { AppPressable } from "src/common/presentation/components/AppPressable";
```

## Code Style

- **Formatting**: Prettier — 2 spaces, double quotes, trailing commas, semicolons. Don't change.
- **Comments**: No narration. Only non-obvious intent, tradeoffs, or `//FIXME:` / `//TODO:` (ALL CAPS).
- **Logging**: `console.log` only in develop paths. Production errors go through `reportError`. Network errors auto-toast via the axios interceptor — don't double-toast in BL hooks.
- **Config & secrets**: No key, token, or secret is hardcoded. Runtime values are `EXPO_PUBLIC_*`, read in `features/core/environment`. Prebuild-only values are unprefixed and read in `app.config.js`. Write each `process.env.EXPO_PUBLIC_X` name out literally — babel inlines it. Every new key goes into `.env`, `.env.example`, and the table in [`docs/build-and-release.md`](../../docs/build-and-release.md). Never commit `.env` or signing keys.
- **Inline single-use values** — don't hoist a module-level `const` used only once; inline the literal. Hoist when reused, exported, or non-trivial StyleSheet entries.
- **No `import type`** — use plain `import { Foo }` for types.

## TypeScript Essentials

- `strict: true` — never weaken types. Avoid `any`; prefer `unknown` and narrow. Do not add `@ts-ignore` to new code.
- Closed sets of named values → `enum` (`*Enums`), never a string-literal union type for catalogs.
- Every API response uses shared envelopes from `@/common/data-access/type/responseTypes` (`BaseResponseType`, `BaseListResponse`, `BasePaginationResponse`, `MutationOptions`, …) — do not redefine.
- Snake_case API fields stay snake_case in TS interfaces.
