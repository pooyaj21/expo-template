---
description: "Expo SDK, config plugins, native modules, assets, versioning — fetch on-demand when adding plugins or wiring native modules"
alwaysApply: false
paths:
  - "app.config.js"
  - "plugins/**"
---

# Platform Reference (Expo + Native Modules)

On-demand reference. Pull this in when adding Expo plugins or native integrations.

## SDK

- Expo SDK **55**, React Native **0.83**, React **19.2**, New Architecture **enabled**, React Compiler **enabled**, Typed Routes **enabled**.
- When adding an Expo package, prefer the version matched to SDK 55. Use `npx expo install <pkg>` rather than `npm install`.
- Android/iOS targets are pinned in `expo-build-properties` (`app.config.js`).
- `android/` and `ios/` are **gitignored CNG output** — never hand-edit them. Everything native goes through `app.config.js` or a config plugin in `plugins/`.

## Config plugins

App config is in `app.config.js` (function form — reads env). To add a plugin:

1. Install the package with `npx expo install`.
2. Append an entry to the `plugins` array — use the `[name, options]` tuple form when options are required.
3. If the plugin needs bespoke native config, add a local plugin under `plugins/` and reference it by relative path.
4. Rebuild the dev client (`expo run:ios` / `expo run:android`) — do not expect Expo Go to work when native modules are required.

Do **not** add vendor analytics, crash reporting, messaging, payments, maps, or push plugins. This template deliberately excludes them.

## Assets

- **Images**: `assets/images/` — load via `expo-image` (`AppImage`) when available.
- **Lotties**: `assets/animation/` (or `assets/lotties/`) — use `lottie-react-native`.
- **Fonts**: handled by theme + `src/common/presentation/token/fonts.ts` (Inter + IBM Plex Sans Arabic).

## Versioning & flavors

Flavors: `develop` | `stage` | `production` via `EXPO_PUBLIC_FLAVOR`. Local builds use `scripts/build-local.sh` / `npm run build:*`. There is **no CI pipeline** in this template — see `docs/build-and-release.md`.

Identity is fixed: bundle id / package `com.pj21.apptemplate`, scheme `apptemplate`.
