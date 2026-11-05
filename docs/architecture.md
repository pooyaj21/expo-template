# Architecture: VLFA (Expo)

Vertical Layered Feature Architecture adapted for Expo Router. Boundaries are also summarized in `CLAUDE.md` and enforced by `.ai/rules/architecture.md` + `eslint-plugin-boundaries`.

## What is VLFA?

- **Vertical slices**: each feature under `src/features/<feature>/` with `presentation` / `business-logic` / `data-access` as needed.
- **Common kernel**: shared atoms under `src/common/` in the same three layers.
- **Shared slices**: cohesive multi-feature concerns under `src/features/core/<name>/` (environment, app-boot, device, feature-flags, navigation, dialogs, alerts, first-run, app-settings, debug, error-pages — same `presentation` / `business-logic` / `data-access` rules as feature slices). Localization and theme context/hooks live in `common`; core keeps only feature-specific orchestration when needed.
- **Thin routes**: `src/app/` only composes feature presentation — no `components/` trees there.
- **Kernel never imports a feature slice** (except Zustand composition in `app-state.ts`). It announces on channels or asks registries; slices subscribe/register via `CoreBootstrap.ts`.

```
src/app  →  features/<feature>  →  features/core  →  common
```

## Layer rules

| Layer          | May import                                                | Must not                                         |
| -------------- | --------------------------------------------------------- | ------------------------------------------------ |
| presentation   | business-logic, core, common presentation/BL, `*Types.ts` | data-access services/queries, axios, React Query |
| business-logic | data-access, core, common                                 | presentation                                     |
| data-access    | common data-access / types                                | presentation, navigation, toasts, storage writes |

## Feature flow

1. `data-access/<feature>Service.ts` — axios via `apiClient`, return `response.data`
2. `data-access/<feature>Queries.ts` — React Query; keys via `useDefaultQueryKey`
3. `business-logic/use<Feature>.ts` — flat API + side effects
4. `presentation/<Feature>Page.tsx` — UI
5. `src/app/...` — thin route shell

Scaffold: `npm run feature -- <name>`.

## Shared contracts (common)

- `createAxiosInstance` / `apiClient` / `setApiBaseUrl` — `common/data-access/api/axios.ts`
- `registerRequestHeaderProvider` / `resolveRequestHeaders` — `requestHeaders.ts`
- `registerAuthRefreshHandler` / `registerSessionAuth` — 401 single-flight refresh slot + session plug-in (`authRefresh.ts`, `business-logic/session/`)
- `setupQueryManagers` — NetInfo → `onlineManager`, AppState → `focusManager` (call once from `src/app/_layout.tsx`)
- `usePurgeStaleDefaultQueryScopes` — drop previous language/env query-scope cache (mount under `QueryClientProvider`)
- `apiErrorChannel` / `apiResponseChannel` — pub/sub for failures / typed envelopes; `features/core/alerts` subscribes and renders via `AppToast`
- `queryClient` / `queryUtils` — TanStack defaults + infinite list mappers
- `responseTypes` + entity `*Types` — envelopes and shared Image / Action / NoteBox / DeviceOs DTOs
- `useLocalization` / `useAppTheme` — canonical context hooks in `common/business-logic/hooks/`
- `useNetworkStatus` — live connectivity for UI banners (see example list page)
- `StorageInterface` — `appStorage` / `secureStorage`
- `useAppStore` — Zustand persist composition root
- `routes` — central path helpers
- `reportError` — console error reporter (no third-party crash reporting)

## Naming

- No barrel `index` files
- PascalCase `.tsx`, camelCase `<feature>X.ts`, kebab-case folders
- Named arrow-function exports
- Aliases `@/*` → `src/*`, `@assets/*` → `assets/*`
- Plain `StyleSheet`, RTL-logical styles

## Providers

ErrorBoundary → Environment → Localization → Theme → QueryClient (+ `setupQueryManagers` / `QueryLifecycle` purge hook) → GestureHandlerRootView → BottomSheetModal → DialogManager → AlertProvider → AppBoot → Stack / AppToast / FirstRunHost (DebugMenuHost wraps inside AppBoot).

`CoreBootstrap` (imported at the top of `_layout`) registers device headers, the soft feature-flags boot step, and the soft app-settings boot step.

## Navigation

- Path helpers live in `src/common/business-logic/routes/paths.ts` (`routes.home`, `routes.exampleDetail`, …).
- In-app navigation goes through the core slice `src/features/core/navigation/`:
  - `useAppRouter` — typed `navigateTo` catalog (home, exampleDetail, notFound), `push` / `replace` / `back` / `dismiss` / `reset`, double-push guard, per-destination `featureGate` via `useFeatureFlagManager` (call-time no-op when the flag is off).
  - `navCallbacks` — stash/retrieve function tokens when a screen must pass a callback through route params.
- Feature screens must not call Expo Router with ad-hoc path strings; add a catalog entry instead.
- Deep links: custom scheme + optional universal/app links are declared in `app.config.js`; parse once in `src/app/+native-intent.tsx` (`redirectSystemPath`) and map to `navigateTo` destinations. See `.ai/rules/deeplinks.md` and `.ai/rules/screens.md`.

## Out of scope for this template

third-party crash reporting, auth/social login, analytics, force update, payments, maps, push vendors, CI. Local builds only.
