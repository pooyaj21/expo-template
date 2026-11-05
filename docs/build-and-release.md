# Build & release (local only)

This template has **no CI pipeline** and no Fastlane distribution to stores by default. Builds run on your machine via `scripts/build-local.sh`.

## Flavors

| Flavor     | `EXPO_PUBLIC_FLAVOR` | Typical API env var         | Debug menu |
| ---------- | -------------------- | --------------------------- | ---------- |
| develop    | `develop`            | `EXPO_PUBLIC_API_DEV_URL`   | on         |
| stage      | `stage`              | `EXPO_PUBLIC_API_STAGE_URL` | on         |
| production | `production`         | `EXPO_PUBLIC_API_PROD_URL`  | off        |

Aliases accepted by the local script: `dev` / `development` → `develop`, `prod` → `production`.

Identity (fixed in `app.config.js`):

- iOS bundle id / Android package: `com.pj21.apptemplate`
- URL scheme: `apptemplate`

## Env files

Copy `.env.example` → `.env`. Two kinds of variables:

- **`EXPO_PUBLIC_*`** — inlined into the JS bundle at Metro time. Restart Metro after changes.
- **Unprefixed** (e.g. `APPLE_TEAM_ID`, Android keystore passwords) — read by `app.config.js` / signing plugins at prebuild. Re-run prebuild after changes.

Write every `process.env.EXPO_PUBLIC_X` name **literally** in source — babel only inlines the static form.

### Feature-flag env keys

Env-sourced flags read `EXPO_PUBLIC_FLAG_<NAME>`. Empty / misspelled means "use catalog default". Example:

```
EXPO_PUBLIC_FLAG_EXAMPLE_DETAIL=true
```

## Local build

```bash
npm run build:develop
npm run build:stage
npm run build:production

# or:
bash scripts/build-local.sh --flavor develop --platform ios
bash scripts/build-local.sh --flavor stage --platform android
```

What the script does (high level):

1. Exports `EXPO_PUBLIC_FLAVOR` for prebuild **and** the JS bundle the native lanes embed.
2. Runs `npx expo prebuild --clean` (unless `--skip-prebuild`).
3. Runs local Fastlane `build_local` lanes for Android and/or iOS (parallel by default).

Logs land in `build-logs/`.

Changing flavor requires a clean prebuild — Metro restart alone is not enough for native differences (e.g. debug menu / sensors).

## Build flavor vs runtime API environment

- **Build flavor** is baked at prebuild (`extra.flavor`, debug menu presence, etc.).
- **Runtime API environment** can be switched from the debug menu on develop builds and persisted — it does not change what the binary _is_.

## Versioning

Optional CI-style tags `X.Y.Z(#N)` still parse in `app.config.js` when `CI_COMMIT_TAG` is set. For day-to-day local builds, `version` / `versionCode` defaults in config are enough — bump deliberately when you need store-facing numbers.

## Signing

- iOS: set `APPLE_TEAM_ID` in `.env` when you need a development team on prebuild.
- Android release: `key.jks` at repo root (gitignored) plus `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

Never commit `.env`, keystores, or service-account JSON.
