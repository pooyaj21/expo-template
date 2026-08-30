<!--
Project rules for Claude Code.

This root file holds the always-apply rules (overview, architecture, naming,
imports, code style, TypeScript, localization). Scoped guidance lives in nested
CLAUDE.md files that Claude Code auto-loads when working in those subtrees —
see "Where the scoped rules live".
-->

# App Template — Expo / React Native

Bilingual (en / ar with RTL) Expo app. Expo SDK 57, React Native 0.86, React 19,
Expo Router (file-based, typed routes), TanStack Query, Zustand, Axios, New
Architecture + React Compiler enabled.

Start a new project from here: set the identity constants at the top of
`app.config.ts` and the `name` in `package.json`, then swap the palette, the
fonts and `assets/images/*`.

## Architecture — VLFA

**Vertical Layered Feature Architecture.** Three layers, three homes:

- `src/features/<feature>/{data-access,business-logic,presentation}/` — feature slices
- `src/common/{data-access,business-logic,presentation}/` — shared **atoms**: things
  that _are_ a layer (`AppButton`, `responseTypes`, `paths.ts`, the API client)
- `src/features/core/<name>/` — shared **slices**: cohesive concerns several
  features need (`session`, `environment`, `alerts`, `api`)

**Where does shared code go?** A loose atom → `common/<layer>/`. A cohesive
concern with its own types, rules and (maybe) UI → `features/core/<name>/`.

```
src/
  app/                         Expo Router routes ONLY — shells, layouts, params
  common/
    data-access/               API client, channels, registries, storage, types, strings
    business-logic/            Cross-cutting hooks, routes map, localization, utils
    presentation/              Theme, unbranded primitives, branded App* components
  features/
    core/<slice>/              api · environment · session · device · alerts ·
                               analytics · notifications · deep-links · dialogs
                               (+ CoreProviders, CoreBootstrap, AppBootstrap)
    <feature>/                 One folder per product feature
      data-access/             <feature>Service.ts · <feature>Queries.ts · <feature>Types.ts
      business-logic/          use<Feature>.ts · store/ · rules
      presentation/            <Feature>Screen.tsx · components/
```

**Layer dependency rule:** `presentation → business-logic → data-access`.
Presentation must **not** import `data-access` directly; `data-access` must
**not** import `business-logic` or `presentation`. This is enforced by
`no-restricted-imports` in `eslint.config.js` — a violation fails `npm run lint`.

**`common/` must not import `features/`.** Two mechanisms keep that true when
the kernel needs a slice:

- **Outbound — the kernel announces, the slice listens.** The API client
  publishes failures on `common/data-access/api/apiErrorChannel`; the `alerts`
  slice raises a toast from it, the `session` slice signs out on 401. The client
  imports neither.
- **Inbound — the kernel asks a registry, the slice registers.** Per-request
  headers come from `common/data-access/api/requestHeaders`; `localization` and
  `session` each register a provider, mounted by `features/core/CoreBootstrap`.
  The client never hears about languages or tokens.

Where a provider genuinely needs a value from a slice (theme needs the language,
the API client needs the base URL), the kernel **declares the slot as a prop**
and `features/core/CoreProviders` fills it. `CoreProviders.tsx` is the one
composition root allowed to know about every slice.

**Feature flow:** service → query hook → business-logic hook → screen → route.
Never skip a step; never let a screen see axios or React Query.

## Where the scoped rules live

| Working in…                | Read                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| `src/app/**`               | [`src/app/CLAUDE.md`](src/app/CLAUDE.md) — routes and navigation             |
| `src/**/data-access/**`    | [`src/common/data-access/CLAUDE.md`](src/common/data-access/CLAUDE.md)       |
| `src/**/business-logic/**` | [`src/common/business-logic/CLAUDE.md`](src/common/business-logic/CLAUDE.md) |
| `src/**/presentation/**`   | [`src/common/presentation/CLAUDE.md`](src/common/presentation/CLAUDE.md)     |
| `src/features/core/**`     | [`src/features/core/CLAUDE.md`](src/features/core/CLAUDE.md)                 |

`src/features/example/` is a complete reference slice — read it before writing a
new feature, and delete it once the project has real features.

## Non-Negotiable Rules

- **NEVER** put business logic, stores, API calls, or reusable components in
  `src/app/`. That folder is route shells only.
- **ALWAYS** import through the `@/*` alias (`@/common/...`, `@/features/...`).
  Never deep relative paths (`../../../`), never a bare `src/...`.
- The three-layer stack is mandatory. Screens consume business-logic hooks —
  never a service, a query hook, or axios.
- Every user-facing string goes through `getString`. No exceptions in `src/app/`
  or `src/features/`.
- Global wiring (providers, bootstrap, splash gate, route registry) lives in
  `src/app/_layout.tsx` and `features/core/CoreProviders.tsx`. Do not reproduce
  it elsewhere.
- Dev-only routes go under a `Stack.Protected guard={AppConfig.isDevelop}`.
- Never hard-code a colour, a font family, or a URL path at a call site. Use
  `colors.*`, `typography.*`, `routes.*`.

## Naming

| Kind                | Pattern                                              | Example                     |
| ------------------- | ---------------------------------------------------- | --------------------------- |
| Route file          | lowercase; folder per feature                        | `app/example/[id].tsx`      |
| Screen component    | `<Feature>Screen.tsx`, PascalCase                    | `ExampleListScreen.tsx`     |
| Branded component   | `App` prefix                                         | `AppButton`, `AppTextInput` |
| Custom touchable    | `C` prefix                                           | `CTouchable`                |
| List/grid item      | `<Entity>Cell.tsx`                                   | `ExampleCell.tsx`           |
| Service (raw HTTP)  | `<feature>Service.ts` exporting `<feature>Service`   | `exampleService.ts`         |
| Query module        | `<feature>Queries.ts` → `use*Query` / `use*Mutation` | `useExampleListQuery`       |
| Business-logic hook | `use<Feature>.ts`                                    | `useExampleList.ts`         |
| Domain model / DTO  | `<Name>Interface`, in `<feature>Types.ts`            | `ExampleInterface`          |
| Zustand slice       | `business-logic/store/<domain>Slice.ts`              | `sessionSlice.ts`           |
| Zustand selectors   | `<domain>Selectors.ts` → `use<Domain>Store<Verb>`    | `useSessionStoreToken`      |
| Enum                | PascalCase + `Enums` suffix                          | `AlertSeverityEnums`        |
| Props type          | `<Component>Props`                                   | `AppButtonProps`            |

- Types/interfaces PascalCase. `interface` for data shapes, `type` for unions and
  prop aliases.
- Constants: SCREAMING_SNAKE_CASE only for module-level config
  (`DEFAULT_THROTTLE_MS`); otherwise camelCase.
- Backend JSON arrives snake_case — **keep it snake_case** in payload and
  response interfaces (`access_token`, `image_url`). Do not rename to camelCase.

## Imports

Order:

1. React / React Native
2. Third-party (`expo-*`, `@tanstack/react-query`, `axios`, `zustand`, …)
3. `@/common/*`
4. `@/features/*`
5. `@/assets/*`

Prefer named exports for hooks, utilities, services and components.

## Code Style

- **Formatting**: Prettier — 2 spaces, double quotes, trailing commas,
  semicolons, 80 columns. Do not fight it; run `npm run format`.
- **Comments**: no narration (`// fetch data`). Comment only non-obvious intent,
  a tradeoff, or a `//TODO:` / `//FIXME:` (ALL CAPS).
- **Logging**: `console.log` only behind `AppConfig.isDevelop`. Errors are
  already published on the API error channel — do not double-report.
- **Config & secrets**: public values use the `EXPO_PUBLIC_*` prefix and are read
  through `AppConfig`. Anything secret stays out of the bundle. Never commit
  `.env`, keystores, or service-account JSON.

## TypeScript

- `strict: true`. Avoid `any`; prefer `unknown` and narrow. Do not add
  `@ts-ignore` to new code.
- **Closed sets of named values → `enum`, never a string-literal union.** Any
  fixed catalog of states, variants or kinds is a PascalCase `*Enums`, and you
  reference members everywhere (`AlertSeverityEnums.ERROR`) — in `switch` cases,
  `Record<MyEnums, T>` keys (computed: `[MyEnums.X]: …`), defaults and ternaries.
  Reserve `type` unions for prop aliases and discriminated prop shapes.
- Every response is `BaseResponseType<T>`; paginated lists are
  `BasePaginationResponse<T>`; mutation options are `MutationOptions<T>`. All
  from `@/common/data-access/type` — do not redefine.
- Discriminated unions for variant props — narrow with the `"key" in props`
  idiom (see `AppButton`).
- `as const` for static catalogs.

---

# Localization (en + ar, RTL) — applies everywhere

## Hard rule: every user-facing string goes through localization

**NEVER** hard-code a user-facing string. This covers `<Text>` children,
`placeholder`, `accessibilityLabel`, screen and tab titles, button labels,
empty-state copy, validation errors, and any `const` array that feeds one of
those (store the `AppStringKey`, resolve at render time).

```tsx
import { useLocalization } from "@/common/business-logic/localization/localizationContext";

const { getString, activeLanguage, isRtl } = useLocalization();

<AppText>{getString("home_title")}</AppText>;
// Interpolation: positional placeholders, replaced at the call site.
<AppText>
  {getString("example_count_label").replace("p0", String(count))}
</AppText>;
```

```tsx
// ❌ BAD — hard-coded copy, even inside a "data" array
const ITEMS = [{ id: "language", title: "Language" }];

// ✅ GOOD — store the key, resolve at render time
const ITEMS: { id: string; titleKey: AppStringKey }[] = [
  { id: "language", titleKey: "settings_row_language" },
];
<AppText>{getString(item.titleKey)}</AppText>;
```

**Limited exceptions:** brand and proper nouns identical in every language;
dev-only screens and logs gated on `AppConfig.isDevelop`; non-rendered
identifiers (query keys, storage keys, route names, analytics events, test IDs).

## Adding strings

- Keys follow `<feature>_<subject>_<variant>` (`login_email_emptyError`).
- Add the key to the `AppStringKey` union **and** the `AppStrings` table in
  `src/common/data-access/localization/strings.ts`, with **both** `en` and `ar`
  populated. `AppStringKey` is the source of truth — never cast a raw string.
- Interpolate with positional placeholders `p0`, `p1` and `.replace` at the call
  site. There is no formatter helper.

## RTL behaviour

- `typography.*` already sets `textAlign` and `writingDirection` per language,
  and `AppThemeProvider` sets `direction` on the root view. Do not override
  unless you explicitly need LTR (phone numbers, URLs, emails).
- Use logical edges: `marginStart`/`marginEnd`, `paddingStart`/`paddingEnd`,
  `start`/`end` — not `left`/`right`.
- Branch on `isRtl` from `useAppTheme()` or `useLocalization()` for anything
  directional (a back chevron, a slide animation).

## Language switching

`setActiveLanguage("ar")` re-typesets the tree (fonts + direction) and re-scopes
the query cache, because the language is part of every query key via
`useDefaultQueryKey`. No screen refetches by hand.

---

## Commands

```bash
npm start                              # Metro
npm run ios / npm run android          # native build + run
npm run validate                       # format:check + lint:ci + type:check (CI gate)
npm run feature -- orders              # scaffold a full VLFA feature slice
```

**Scaffold a feature with the generator, not by hand.** `npm run feature -- orders`
writes the three layers, the cell, the screen and the route shell already wired
to `useApiClient` and `useDefaultQueryKey`. It deliberately does not touch
`paths.ts` or `strings.ts` — it prints the two edits for you to make, because a
generator silently rewriting the routes map or the string catalog is how those
files rot.

## Versioning

`APP_VERSION` and `BUILD_NUMBER` are constants at the top of `app.config.ts`.
Bump `BUILD_NUMBER` for every store upload, even when the marketing version does
not change — both stores reject a repeated build number.

`plugins/withAndroidSigning.js` injects `key.jks` (gitignored) into the Android
project at prebuild time, reading its credentials from the environment. Without
the file or the vars it skips cleanly, so prebuild still works for anyone
without the signing material.

## Project Notes

<!-- Add project-specific notes here -->
