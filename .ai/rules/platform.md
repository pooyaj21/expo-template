---
description: "Expo SDK, config plugins, native modules, assets, versioning — fetch on-demand when adding plugins or wiring native modules"
alwaysApply: false
paths:
  - "app.config.js"
  - "plugins/**"
  - "fastlane/**"
  - "scripts/build-local.sh"
  - "Gemfile"
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

Local plugins already in the template:

- `withAndroidResConfigs` / `withFolderConfigChanges` — resource / folder tweaks
- `withAndroidSigning` — copies `key.jks` for local release signing (skipped on CI)
- `withFastlane` — copies `fastlane/{android,ios}` into the generated native projects on prebuild

Do **not** add vendor analytics, crash reporting, messaging, payments, maps, or push plugins. This template deliberately excludes them.

## Identity & flavors

Single source of truth: the `IDENTITY` block at the top of `app.config.js` (`name`, `slug`, `bundleId`, `scheme`). `npm run rename` rewrites that block (and matching strings elsewhere).

Per-flavor derivation (do not hard-code suffixes elsewhere):

| Flavor     | Package / bundle suffix | Name suffix | Scheme suffix | Icon dir                    |
| ---------- | ----------------------- | ----------- | ------------- | --------------------------- |
| develop    | `.develop`              | ` Dev`      | `-develop`    | `assets/images/develop/`    |
| stage      | `.stage`                | ` Stage`    | `-stage`      | `assets/images/stage/`      |
| production | _(none)_                | _(none)_    | _(none)_      | `assets/images/production/` |

`APP_LINK_HOSTS` (comma-separated) drives `ios.associatedDomains` + Android `intentFilters` with `autoVerify`. Empty = disabled. Association file templates: `docs/deeplinks/`.

## Assets

- **Images**: `assets/images/` — flavor icons under `assets/images/{develop,stage,production}/`. Load via `expo-image` (`AppImage`) when available.
- **Lotties**: `assets/animation/` (or `assets/lotties/`) — use `lottie-react-native`.
- **Fonts**: handled by theme + `src/common/presentation/token/fonts.ts` (Inter + IBM Plex Sans Arabic).

## Versioning & local builds

Flavors: `develop` | `stage` | `production` via `EXPO_PUBLIC_FLAVOR`. Local builds use `scripts/build-local.sh` / `npm run build:*` after `bundle install` (root `Gemfile`). There is **no CI pipeline** and no third-party beta-distribution upload — optional Play / TestFlight lanes are env-parameterised only. See `docs/build-and-release.md` and `docs/new-project.md`.
