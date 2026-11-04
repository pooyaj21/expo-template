---
description: "Expo SDK, config plugins, native modules, assets, versioning — fetch on-demand when adding plugins or wiring native modules"
alwaysApply: false
paths:
  - "app.config.ts"
  - "plugins/**"
  - "modules/**"
  - "eas.json"
---

# Platform Reference (Expo + Native Modules)

On-demand reference. Pull this in when adding an Expo plugin, wiring a native
module, or touching `app.config.ts` / `plugins/`.

## SDK

- Expo SDK **55**, React Native **0.83**, React **19**, New Architecture (the
  SDK 55 default), React Compiler **enabled** (`experiments.reactCompiler`),
  Typed Routes **enabled** (`experiments.typedRoutes`).
- Add Expo packages with `npx expo install <pkg>`, never bare `npm install` —
  it picks the version matched to the SDK.
- The app is a **dev client**, not Expo Go: it depends on native modules Expo Go
  does not ship. `npm start` runs `expo start --dev-client`.
- Android/iOS targets are pinned in `expo-build-properties` (`app.config.ts`):
  `compileSdkVersion` / `targetSdkVersion` 36, `minSdkVersion` 24, iOS
  `deploymentTarget` 15.1. Unpinned, a prebuild on another machine silently
  shifts the target. `kotlinVersion`, `buildToolsVersion` and `ndkVersion` stay
  unpinned on purpose: the Expo Gradle plugin's hardcoded fallbacks are not
  what actually resolves, so pinning from them pins the wrong values — read the
  resolved versions off a real build first.
- Android predictive back is **on** (`predictiveBackGestureEnabled: true`, which
  writes `android:enableOnBackInvokedCallback` at prebuild). Register a
  `hardwareBackPress` listener only while it will actually intercept: any
  registered handler makes Android treat back as app-handled and drops the
  predictive preview for the whole screen, even one that returns `false`. Use
  `useHardwareBackPress` (focus-scoped), or key the subscription on open state
  the way `AppBaseBottomSheetDialog` does.

## App config

`app.config.ts` is the function form (`({ config }) => ({ expo: { … } })`) and
runs in Node at prebuild time, so it reads plain `process.env` — not
`EXPO_PUBLIC_*`. Values it must have (bundle id, package, team, map keys) go
through its `requireEnv` helper, which throws: a missing identity value fails
the build instead of silently shipping a wrong one.

Runtime config is the other half, and the two never mix: `EXPO_PUBLIC_*` →
`src/App.ts` → `AppConfig`. See the Config & secrets rule in the root
`.ai/rules/`.

## Config plugins

To add one:

1. Install the package.
2. Append to the `plugins` array — use the `[name, options]` tuple form when
   options are required.
3. If it needs bespoke native config, write a local plugin under `plugins/` and
   reference it by relative path (`"./plugins/withX"`).
4. Re-run `npx expo prebuild --clean` and rebuild the dev client
   (`npm run ios` / `npm run android`). `/ios` and `/android` are generated and
   gitignored — never hand-edit them, the edit is lost on the next prebuild.

Local plugins in this base:

| Plugin                       | What it does                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `withFastlane.js`            | Writes the fastlane lanes/config into the generated native projects                                               |
| `withAndroidSigning.js`      | Copies the release keystore in and rewrites `signingConfigs` from `.env` (skipped in CI, which signs its own way) |
| `withAndroidResConfigs.js`   | Pins `resourceConfigurations += ["en", "ar"]` so only shipped locales are bundled                                 |
| `withFolderConfigChanges.js` | Adds `smallestScreenSize` to the activity's `configChanges` so a fold/resize does not restart the activity        |

## Capabilities already wired

Don't re-integrate these — use the provided hook / helper:

| Concern                    | Use                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Auth token persist         | `useAuthManager()` (Zustand + SecureStore via `secureStateStorage`)                                                            |
| Device id / registration   | `useDeviceManager()` + `useSetupDeviceUseCase()`                                                                               |
| API headers                | `apiHeaders` / `sessionApiHeaders` (`src/common/data-access/api/apiHeaders.ts`) — attached by the Axios interceptor            |
| Deep links                 | `useDeepLinkSystem()`                                                                                                          |
| Feature flags              | `useFeatureFlag()` / `isFeatureEnabled()`                                                                                      |
| Navigation                 | `useAppRouter()`                                                                                                               |
| Bottom sheets              | `AppBaseBottomSheetDialog` + `useLazyBottomSheet()`                                                                            |
| Toast                      | `showAppToast()` (`src/common/presentation/components/app/AppToast.tsx`)                                                       |
| Safe area                  | `useAppSafeAreaInsets()` for screen padding (`PageContainer`); Android floors `bottom` at max(inset, initialWindowMetrics, 34) |
| Haptics                    | `haptics` (`src/common/business-logic/utils/haptics.ts`) — never `expo-haptics` directly                                       |
| Shake-to-open-debug        | `useShake(cb, { enabled })`                                                                                                    |
| Hidden-tap debug entry     | `useHiddenTap()`                                                                                                               |
| Network logger             | `src/common/data-access/api/NetworkLogger.ts`, started in the root layout; viewed from the debug menu                          |
| API response mocking (dev) | `src/common/data-access/api/mock/registry.ts`, gated on `AppConfig.mocksEnabled`                                               |
| Crash reporting            | Sentry, initialized in `src/app/_layout.tsx` — just throw a meaningful error                                                   |

## Assets

- **Icons**: SVGs live in `assets/icons/` as generated TSX components — import
  from `@/assets/icons/...`. Do not inline raw SVG markup in a component.
- **Images**: `assets/images/` — render through `AppImage` (expo-image), and
  pass `blurhash` when the backend provides one.
- **Lotties**: `assets/lotties/` — `lottie-react-native`.
- **Fonts**: `assets/fonts/<lang>/`, declared in `src/common/presentation/theme/AppFont.ts`
  (`FontFamily`, `FontFiles`, `AppFonts`) and loaded by `AppThemeProvider`.
  The base ships none and falls back to the system face; **load every
  language's faces**, not just the active one — loading on demand flips the
  theme's `loaded` back to `false` mid-switch and remounts the tree.

## Versioning

`app.config.ts` derives `version` / `buildNumber` / `versionCode` from the CI
tag `X.Y.Z(#N)`. Don't bump them by hand — tag a release and let CI do it. See
[`docs/build-and-release.md`](../docs/build-and-release.md).
