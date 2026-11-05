# Build & release (local only)

This template has **no CI pipeline**. Builds run on your machine via `scripts/build-local.sh`, which prebuilds native projects and runs Fastlane `build_local` lanes. Fastlane templates live under `fastlane/{android,ios}` and are copied into `android/` / `ios/` by `plugins/withFastlane.js` during `expo prebuild`.

## Prerequisites

| Tool                             | Notes                                                                      |
| -------------------------------- | -------------------------------------------------------------------------- |
| Node                             | `.nvmrc` (24) — `nvm use`                                                  |
| Ruby + Bundler                   | Root `Gemfile` — `bundle install` (fastlane, dotenv, cocoapods, xcodeproj) |
| Fastlane on `PATH`               | After Bundler: `bundle exec fastlane …` or install binstubs                |
| Xcode / Android SDK              | For the platform you build                                                 |
| `key.jks` + Android keystore env | Release APK/AAB signing                                                    |
| `APPLE_TEAM_ID`                  | iOS prebuild / local export                                                |

There is **no** third-party beta distribution or CI upload wiring in this template. Optional store lanes stay env-gated (see below).

## Flavors

| Flavor     | `EXPO_PUBLIC_FLAVOR` | Bundle / package suffix | Display name suffix | Scheme suffix | Icons                       |
| ---------- | -------------------- | ----------------------- | ------------------- | ------------- | --------------------------- |
| develop    | `develop`            | `.develop`              | ` Dev`              | `-develop`    | `assets/images/develop/`    |
| stage      | `stage`              | `.stage`                | ` Stage`            | `-stage`      | `assets/images/stage/`      |
| production | `production`         | _(none)_                | _(none)_            | _(none)_      | `assets/images/production/` |

Aliases accepted by the local script: `dev` / `development` → `develop`, `prod` → `production`.

Base identity (single block at the top of `app.config.js` — edited by `npm run rename`):

- name / slug / bundleId / scheme — see `IDENTITY` in `app.config.js`
- Defaults: `App Template` / `app-template` / `com.pj21.apptemplate` / `apptemplate`

## Env files

Copy `.env.example` → `.env`. Two kinds of variables:

- **`EXPO_PUBLIC_*`** — inlined into the JS bundle at Metro time. Restart Metro after changes.
- **Unprefixed** (e.g. `APPLE_TEAM_ID`, Android keystore passwords, `APP_LINK_HOSTS`) — read by `app.config.js` / signing plugins / Fastlane at prebuild or lane time. Re-run prebuild after config changes.

Write every `process.env.EXPO_PUBLIC_X` name **literally** in source — babel only inlines the static form.

### Feature-flag env keys

Env-sourced flags read `EXPO_PUBLIC_FLAG_<NAME>`. Empty / misspelled means "use catalog default". Example:

```
EXPO_PUBLIC_FLAG_EXAMPLE_DETAIL=true
```

### App link hosts

```
APP_LINK_HOSTS=links.example.com,www.example.com
```

Empty disables universal / app links. Templates: `docs/deeplinks/`.

## Local build

```bash
npm run build:develop
npm run build:stage
npm run build:production

# or:
bash scripts/build-local.sh --flavor develop --platform ios
bash scripts/build-local.sh --flavor stage --platform android
bash scripts/build-local.sh --lane bundle_local --platform android   # AAB
```

What the script does:

1. Exports `EXPO_PUBLIC_FLAVOR` / `APP_ENV` for prebuild **and** the JS bundle the native lanes embed.
2. Runs `npx expo prebuild --clean` (unless `--skip-prebuild`) — this also injects Fastlane via `withFastlane`.
3. Runs Fastlane `<platform> <lane>` (default `build_local`) for Android and/or iOS (parallel by default).

Logs land in `build-logs/`.

Changing flavor requires a clean prebuild — Metro restart alone is not enough for native differences (bundle id, icons, app-link hosts, sensors).

## Fastlane lanes

### Android (`fastlane/android/fastlane/Fastfile`)

| Lane                      | Purpose                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| `build_local`             | Signed release APK (arm64). Uses `KEYSTORE_PATH`/`key.jks` or `ANDROID_KEYSTORE_B64`.          |
| `bundle_local`            | Signed release AAB                                                                             |
| `build_apk` / `build_aab` | Same builds for scripted use                                                                   |
| `publish_play_internal`   | **Optional** Play upload — needs `PLAY_SERVICE_ACCOUNT_B64`, `ANDROID_PACKAGE_NAME`, prior AAB |

### iOS (`fastlane/ios/fastlane/Fastfile`)

| Lane                    | Purpose                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `build_local`           | Local IPA; scheme auto-detected from `*.xcworkspace`. Export method `IOS_EXPORT_METHOD` (default `development`). |
| `certificate` / `build` | Manual App Store signing from `IOS_*` / `ASC_*` secrets                                                          |
| `upload`                | **Optional** TestFlight — needs `ASC_API_KEY_*`; groups from `TESTFLIGHT_GROUPS` or flavor map                   |

## Build flavor vs runtime API environment

- **Build flavor** is baked at prebuild (`extra.flavor`, bundle id suffix, icons, debug menu, etc.).
- **Runtime API environment** can be switched from the debug menu on develop builds and persisted — it does not change what the binary _is_.

## Versioning

Optional CI-style tags `X.Y.Z(#N)` still parse in `app.config.js` when `CI_COMMIT_TAG` is set. For day-to-day local builds, `version` / `versionCode` defaults in config are enough — bump deliberately when you need store-facing numbers.

## Signing

- iOS: set `APPLE_TEAM_ID` in `.env` when you need a development team on prebuild. Store lanes need the `IOS_*` / `ASC_*` secret set documented in the Fastfile.
- Android release: `key.jks` at repo root (gitignored) plus `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Optional `KEYSTORE_PATH` override; CI may pass `ANDROID_KEYSTORE_B64` instead.

Never commit `.env`, keystores, or service-account JSON.
