# CLAUDE.md

Guidance for agents working in this Expo app template. Deep references live under `docs/` and `.ai/rules/`.

## Development commands

```bash
nvm use                 # Node from .nvmrc (24)
npm ci
cp .env.example .env    # once
npm run start           # Expo dev client
npm run ios             # expo run:ios
npm run android         # expo run:android
npm run type:check
npm run lint
npm run validate        # format:check + lint + type:check
npm run feature -- <name>
npm run build:develop   # local release lanes via scripts/build-local.sh
```

## Architecture at a glance (VLFA)

**Vertical Layered Feature Architecture.** Three layers, two homes:

- `src/features/<feature>/{presentation,business-logic,data-access}/` — feature slices
- `src/common/{presentation,business-logic,data-access}/` — shared **atoms** (includes `useLocalization` / `useAppTheme` hooks + Localization/Theme providers)
- `src/features/core/<name>/` — shared **slices** (environment, app-boot, device, feature-flags, navigation, dialogs, alerts, first-run, app-settings, debug, error-pages); same three layers as normal features
- `src/app/` — Expo Router only (thin shells)
- `src/features/CoreBootstrap.ts` — side-effect registrations for core slices (device headers, feature-flags boot, app-settings soft boot)

**Dependency direction:** `app → features/<x> → features/core → common`.

**`common/` must not import features** except `common/business-logic/store/app-state.ts` (Zustand composition). Kernel ↔ slices via `requestHeaders` registry and `apiErrorChannel` / `apiResponseChannel`.

**Layer rule:** `presentation → business-logic → data-access` (enforced inside `features/core/<slice>` too). Presentation may import `data-access/*Types.ts` only (`eslint-plugin-boundaries`).

**No barrel index files.** PascalCase `.tsx`, camelCase `<feature>X.ts`, kebab-case folders. Named arrow-function exports. Aliases: `@/*` → `src/*`, `@assets/*` → `assets/*`.

Root provider order: ErrorBoundary → Environment → Localization → Theme → QueryClient (+ `setupQueryManagers` / `usePurgeStaleDefaultQueryScopes`) → GestureHandlerRootView → BottomSheetModal → DialogManager → AlertProvider → AppBoot → (Stack, AppToast, FirstRunHost; DebugMenuHost wraps inside AppBoot).

Full write-up: **`docs/architecture.md`**. New feature recipe: **`docs/adding-features.md`**. Scoped agent rules: **`.ai/rules/`** (symlinked into `.claude/` / `.cursor/`).

## Key technologies

- Expo SDK **55** · RN **0.83** · React **19.2** · Expo Router · TanStack Query · Zustand · Axios
- In-house i18n (`en.json` / `ar.json`, `MessageKey`, `getString` / `getStringWithReplacement`)
- Theme tokens in `common/presentation/token` via `useAppTheme()` (system light/dark)
- Fonts: Inter (en), IBM Plex Sans Arabic (ar)
- Feature flags: one source per flag (`env` | `server`) via `useFeatureFlag`
- Errors: `reportError` console reporter — **no third-party crash reporting**
- Testing: Maestro smoke only — **no Jest**, **no CI**
- Flavors: `develop` / `stage` / `production` — local builds only (`docs/build-and-release.md`)

## Where things live

| Concern                | Path                                                                     |
| ---------------------- | ------------------------------------------------------------------------ |
| API client             | `src/common/data-access/api/`                                            |
| Query managers setup   | `src/common/data-access/api/setupQueryManagers.ts` (call from `_layout`) |
| Scope purge hook       | `src/common/business-logic/hooks/usePurgeStaleDefaultQueryScopes.ts`     |
| Network status (UI)    | `src/common/business-logic/hooks/useNetworkStatus.ts`                    |
| Auth refresh slot      | `src/common/data-access/api/authRefresh.ts` + `business-logic/session/`  |
| Response / entity DTOs | `src/common/data-access/type/`                                           |
| Routes map             | `src/common/business-logic/routes/paths.ts`                              |
| Typed navigation       | `src/features/core/navigation/business-logic/useAppRouter.ts`            |
| Alerts / toasts        | `src/features/core/alerts/` (+ `AppToast` host)                          |
| First-run prompts      | `src/features/core/first-run/` (`FirstRunHost` in `_layout`)             |
| App settings cache     | `src/features/core/app-settings/` (soft boot via `CoreBootstrap`)        |
| App store composer     | `src/common/business-logic/store/app-state.ts`                           |
| Storage                | `src/common/business-logic/interfaces/storageInterface.ts`               |
| Shared UI              | `src/common/presentation/components/`                                    |
| Tokens                 | `src/common/presentation/token/`                                         |
| i18n / theme hooks     | `src/common/business-logic/hooks/useLocalization.ts`, `useAppTheme.ts`   |
| i18n / theme providers | `src/common/presentation/providers/`                                     |
| Example feature        | `src/features/example/`                                                  |
| Agent rules/skills     | `.ai/rules/`, `.ai/skills/` (symlink via `scripts/link-ai-rules.sh`)     |

## Workflows

| Task        | Skill in `.ai/skills/` |
| ----------- | ---------------------- |
| New feature | `feature`              |
| Endpoint    | `endpoint`             |
| Screen      | `screen`               |
| Bugfix      | `bugfix`               |
| Verify      | `verify`               |
| Rules       | `rules`                |
