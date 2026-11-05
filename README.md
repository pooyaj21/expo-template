# App Template

Personal Expo (SDK 55) starter with VLFA architecture: vertical feature slices split into `presentation` / `business-logic` / `data-access`, shared `common/` kernel, and thin Expo Router screens under `src/app/`.

## Setup

```bash
nvm use              # Node 24 — see .nvmrc
npm ci
cp .env.example .env
npm run ios          # or: npm run android
```

Requires a dev client (native modules). Expo Go is not the target.

## Scripts

| Command                                                      | What it does                  |
| ------------------------------------------------------------ | ----------------------------- |
| `npm run start`                                              | Expo dev client               |
| `npm run ios` / `android`                                    | Build & run native            |
| `npm run prebuild`                                           | `expo prebuild --clean`       |
| `npm run type:check` / `lint` / `validate`                   | Static checks                 |
| `npm run feature -- <name>`                                  | Scaffold a VLFA feature slice |
| `npm run build:develop` / `build:stage` / `build:production` | Local release builds          |

## Flavors

`EXPO_PUBLIC_FLAVOR` = `develop` | `stage` | `production`. Each has its own API base URL (`EXPO_PUBLIC_API_*_URL` in `.env`). Develop/stage keep the debug menu; production strips it via Metro.

Runtime environment switching (debug menu) can point a develop build at another API without changing the build flavor — see `docs/build-and-release.md`.

## Architecture

See `CLAUDE.md` and `docs/architecture.md`. Agent rules live in `.ai/rules/` (symlinked for Claude Code and Cursor).

## Tests

Maestro smoke flow only (`.maestro/`). App id: `com.pj21.apptemplate`.

```bash
maestro test .maestro/flows/smoke/
```
