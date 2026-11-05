---
description: "VLFA layer boundaries, dependency direction, feature flow, and thin src/app/ routes for Expo Router"
globs: src/**/*.{ts,tsx}
alwaysApply: false
paths:
  - "src/**/*.{ts,tsx}"
---

# Architecture: VLFA layer boundaries

This repo uses **Vertical Layered Feature Architecture (VLFA)**. Deep notes live in `docs/architecture.md` and `CLAUDE.md`; this rule captures the boundaries every edit must respect.

## Layout

- `src/common/{presentation,business-logic,data-access}/` — shared **atoms**: things that _are_ a layer (`AppButton`, `responseTypes`, `paths.ts`, observability). Canonical `useLocalization` / `useAppTheme` live under `common/business-logic/hooks/`; their Provider components live under `common/presentation/providers/`.
- `src/features/core/<name>/` — shared **slices**: cohesive concerns several features need (`environment`, `app-boot`, `device`, `feature-flags`, `navigation`, `dialogs`, `alerts`, `first-run`, `app-settings`, `debug`, `error-pages`). Always the three layers when files exist; omit a layer folder only when it has zero files. Core slice layers follow the same import rules as normal features.
- `src/features/<feature>/{presentation,business-logic,data-access}/` — feature slices. Feature Zustand slices live under `business-logic/store/` and are composed in `common/business-logic/store/app-state.ts`.
- `src/app/` — Expo Router routes only (layouts, redirects, thin shells that render feature presentation). **Do not** add `components/` trees under `src/app/`.
- `src/features/CoreBootstrap.ts` — side-effect composition root that imports each core slice's registration.

## Dependency direction

```
src/app → features/<feature> → features/core → common
```

- `common` **must not** import `features/**` (exception: Zustand composer `common/business-logic/store/app-state.ts`).
- When the kernel needs a slice it announces outward (`apiErrorChannel`, `apiResponseChannel`) or asks a registry (`requestHeaders`); the slice subscribes or registers via `CoreBootstrap`.
- Cross-feature imports should stay minimal and deliberate. Prefer going through `common` or `features/core`.

## Layer dependency rules (within a slice)

- `presentation` → may import `business-logic`, `common/presentation`, `common/business-logic`, and `features/core`. Must **not** import `data-access` except `*Types.ts`.
- `business-logic` → may import `data-access` (own feature or `common`) and `features/core`. Must **not** import `presentation`.
- `data-access` → keep free of presentation / UI. Services return `response.data`. No navigation, toasts, or storage writes here.
- `src/app/` routes stay **thin**: compose `features/*/presentation` and shared UI from `src/common`.

Enforced by `eslint-plugin-boundaries` in `eslint.config.js`.

## Feature flow (Expo / client)

1. **data-access**: `[feature]Service` (axios via `apiClient`) → `[feature]Queries` (React Query; keys wrapped in `useDefaultQueryKey`)
2. **business-logic**: `use[Feature]()` hook that consumes queries, applies rules, exposes a flat API
3. **presentation**: `<Feature>Page` uses the BL hook and shared `App*` components
4. **app**: Expo Router file renders the page component

Never skip the BL hook from a screen for remote data. Never call axios or React Query from presentation.

## Naming & files

- No barrel `index` files.
- PascalCase `.tsx` components, camelCase `<feature>X.ts` modules, kebab-case folders.
- Named arrow-function exports.
- Align names with existing patterns: `use[Feature]`, `[feature]Keys` / query factories, `[feature]Service`, `<Feature>Page`.

## Client persistence

- Anywhere that uses AsyncStorage / SecureStore goes through `StorageInterface` (`common/business-logic/interfaces/storageInterface.ts`) — `appStorage` / `secureStorage`.
- Small flags/ids → `StorageInterface` + a feature `*Storage.ts` helper. Never name it `*Store.ts` unless it is Zustand.
- In-memory UI / client mirror of server data → Zustand slice under the feature, composed into `useAppStore`.

## Consistency checks before touching a feature

- Locate the feature's `data-access` entry first, then trace up through `business-logic` to `presentation` before editing.
- Scaffold a new slice with `npm run feature -- <name>` (see `docs/adding-features.md`).
