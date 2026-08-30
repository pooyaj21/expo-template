# App Template

Expo / React Native starter with the architecture already in place, so a new
project begins at "write the feature" instead of "wire the app".

**Stack** — Expo SDK 57 · React Native 0.86 · React 19 · Expo Router (typed
routes) · TanStack Query · Zustand · Axios · TypeScript strict · New
Architecture + React Compiler.

## What is already wired

**App shell** — bilingual en/ar with RTL · colour, typography and spacing tokens
· runtime-switchable environments with a shake-to-open debug screen · a
bootstrap gate that owns the splash · global error boundary.

**Identity & data** — secure token storage with sign-out on 401 · a per-install
device id on every request · an axios client that knows about neither ·
TanStack Query scoped by environment + language + session.

**Plumbing you would otherwise rebuild** — toasts fed automatically by API
failures · push notification permission, token and tap-routing · deep links · an
adapter-based analytics layer · lazy bottom-sheet dialogs with a shared confirm.

**No auth screens.** The `session` core slice holds the reusable half — the
token in the keychain, sign-out on 401, the `Authorization` header — so each
project adds its own login flow against `useSession().signIn` / `signOut`.

**Components** — `AppButton` `AppText` `AppTextInput` `AppSearchInput`
`AppPinCode` `AppSwitch` `AppRadioButton` `AppToolbar` `AppImage`
`AppBottomSheet` `AppExpandable` `AppKeyboardAvoidingView` `AppPressable` ·
`PageContainer` `StateHandler` `Loading` `ErrorView` `Skeleton` `IconView`
`Divider` `Spacer` `CTouchable`.

**Hooks & utils** — `useAppRouter` `useForm` `useHardwareBackPress` `useShake`
`useHiddenTap` `useAppState` `useCountdown` `useDimensions` `useDebouncedValue`
`useNavParams` · validators, formatters, responsive grid maths.

**Tooling** — ESLint enforcing the layer boundaries · Prettier · husky
(lint-staged on commit, type-check on push) · a feature generator · an Expo
config plugin for Android release signing.

## Start a project

```bash
cp -R expo-template my-app && cd my-app
rm -rf .git && git init
npm install
cp .env.example .env          # then fill in the API URLs
npm start
```

Then:

1. Set the identity constants at the top of `app.config.ts` (name, slug, scheme,
   bundle id, package) and the `name` in `package.json`.
2. Swap the palette in `src/common/presentation/theme/AppColor.ts`.
3. Drop font files in `assets/fonts/<lang>/` and register them in
   `src/common/presentation/theme/AppFont.ts` (system fonts until you do).
4. Replace `assets/images/*` (icon, splash, adaptive icon).
5. Read `src/features/example/` end to end, then delete it.

## Architecture

**VLFA — Vertical Layered Feature Architecture.** Every feature is a vertical
slice with the same three layers, and the shared code is organised the same way.

```
src/
  app/                       Routes only — shells, layouts, params
  common/
    data-access/             API client · channels · registries · storage · types · strings
    business-logic/          Cross-cutting hooks · routes map · localization · utils
    presentation/            Theme · primitives · App* components
  features/
    core/                    session · environment · alerts · api + CoreProviders
    <feature>/
      data-access/           <feature>Service.ts · <feature>Queries.ts · <feature>Types.ts
      business-logic/        use<Feature>.ts · store/
      presentation/          <Feature>Screen.tsx · components/
```

**Dependency rule:** `presentation → business-logic → data-access`, and
`common/` never imports `features/`. Both are enforced by `no-restricted-imports`
in `eslint.config.js`, so a violation fails `npm run lint` rather than surviving
review.

When the kernel does need something a feature owns, the dependency inverts:

- **The kernel announces, the slice listens** — the API client publishes
  failures on `apiErrorChannel`; alerts toast them, session signs out on 401.
  The client imports neither.
- **The kernel asks, the slice registers** — request headers come from a
  registry that localization and session write into at bootstrap. The client
  never hears about languages or tokens.

Full rules live in `CLAUDE.md` and the scoped `CLAUDE.md` files under `src/`.

## Adding a feature

```bash
npm run feature -- orders
```

Writes the whole slice, already wired to `useApiClient` and
`useDefaultQueryKey`:

```
src/features/orders/
  data-access/ordersTypes.ts       # OrdersInterface, payloads (snake_case)
  data-access/ordersService.ts     # raw axios; client is the first argument
  data-access/ordersQueries.ts     # useOrdersListQuery, useOrdersDetailQuery
  business-logic/useOrdersList.ts  # the only surface a screen consumes
  presentation/OrdersListScreen.tsx
  presentation/components/OrdersCell.tsx
src/app/orders/index.tsx           # 3-line route shell
```

It deliberately does **not** edit `paths.ts`, `strings.ts` or `_layout.tsx` — it
prints those edits for you to make. A generator that silently rewrites the routes
map and the string catalog is how those two files rot.

## Core slices

`src/features/core/` holds the concerns every app needs, each a normal
three-layer slice:

| Slice           | Owns                                                     |
| --------------- | -------------------------------------------------------- |
| `api`           | the axios client context                                 |
| `environment`   | which backend the app talks to, switchable at runtime    |
| `session`       | the token, the user, sign-in / sign-out, 401 handling    |
| `device`        | the per-install uuid and the `Device-Id` header          |
| `alerts`        | the toast channel, the API→toast bridge, one render host |
| `analytics`     | the event catalog and the vendor adapter registry        |
| `notifications` | push permission, token, and notification-tap routing     |
| `deep-links`    | URL → route resolution for cold and warm starts          |
| `dialogs`       | the lazy bottom-sheet manager and the shared confirm     |

`CoreProviders` composes them; `CoreBootstrap` runs their side-effect
registration; `AppBootstrap` gates the first render and owns the splash.

**Analytics ships with a console adapter only.** Add Mixpanel, Firebase or
Adjust by writing one adapter in `analytics/adapters/` and registering it — the
vendor SDK is imported there and nowhere else, so no call site changes.

## Commands

| Command              | Does                                          |
| -------------------- | --------------------------------------------- |
| `npm start`          | Metro                                         |
| `npm run ios`        | native iOS build + run                        |
| `npm run android`    | native Android build + run                    |
| `npm run lint`       | ESLint, including the layer-boundary rules    |
| `npm run type:check` | `tsc --noEmit`                                |
| `npm run format`     | Prettier write                                |
| `npm run validate`   | format:check + lint:ci + type:check (CI gate) |

`husky` runs `lint-staged` on commit and `type:check` on push.

## Versioning & signing

`APP_VERSION` and `BUILD_NUMBER` are constants at the top of `app.config.ts`.
Bump `BUILD_NUMBER` for every store upload — both stores reject a repeated one.

`plugins/withAndroidSigning.js` copies `key.jks` (repo root, gitignored) into
the Android project at prebuild and points the signing config at it, reading
`KEYSTORE_PASSWORD` / `KEY_ALIAS` / `KEY_PASSWORD` from the environment. Missing
file or vars → it skips and leaves the default debug keystore, so prebuild still
works for anyone without the signing material.

There is no CI pipeline in the template; add one when the project needs it.

## Environments

`.env` supplies three base URLs. The build's default target comes from
`EXPO_PUBLIC_ENVIRONMENT`; in a dev or stage build the **Debug screen**
(home → "tap for debug") switches between Development / Stage / Production /
Local at runtime, Local taking a URL you type in. Switching re-creates the axios
client and re-scopes the query cache, so nothing stale survives.
