---
description: "expo-template core — architecture, workflows (skills), non-negotiables, naming, imports, code style, TS essentials, project traps"
alwaysApply: true
---

# expo-template — Expo / React Native Base Template

**This is a base template, not a product.** Every piece that names an app — display name, bundle id / package, scheme, colors, fonts, icon, splash, the `AppStringKey` catalog, the `example` feature, `FeatureFlagEnums.EXAMPLE` — is a placeholder to replace. The architecture around those placeholders is the part that must not drift: it is what every project started from this base inherits.

Bilingual (en / ar with RTL) app shell. Expo SDK 57, React Native 0.86, React 19, Expo Router (file-based, typed routes), TanStack Query, Zustand, Axios, New Architecture + React Compiler enabled.

## Day one on a new project

1. **Identity** — name / slug / scheme / bundle id / package in `app.config.ts`, and the matching keys in `.env` + `.env.example`.
2. **Theme** — replace the deliberately neutral ramps in `src/common/presentation/theme/AppColor.ts`. The base ships **no font files**: every slot resolves to the platform system face, so drop `.ttf`/`.otf` files under `assets/fonts/<lang>/` and name them in `FontFamily` / `FontFiles` / `AppFonts` (`src/common/presentation/theme/AppFont.ts`). Nothing else changes — `AppThemeProvider` loads whatever `FontFiles` lists.
3. **Assets** — app icon, adaptive icon and splash under `assets/images/`.
4. **Strings** — `AppStringKey` + `AppStrings` in `src/common/data-access/localization/strings.ts` (local catalog; both `en` and `ar`).
5. **The worked example** — the `example` feature is a complete VLFA slice (`src/features/example/{data-access,business-logic,presentation}/` → `src/app/example/`). Copy it for the first real feature, then delete it.
6. **Flags** — `FeatureFlagEnums.EXAMPLE` exists so the resolution chain has something to resolve. Delete it once the first real flag lands.

## Layout (VLFA)

```
src/
  app/                         Expo Router routes ONLY — shells, layouts, params
  common/
    data-access/               API client, channels, registries, storage, types, strings
    business-logic/            Cross-cutting hooks, routes map, localization, utils, testIds
    presentation/              Theme, unbranded primitives, branded App* components
  features/
    core/<slice>/              api · environment · session · device · alerts ·
                               analytics · notifications · deep-links · dialogs ·
                               feature-flags · app-settings
                               (+ CoreProviders, CoreBootstrap, AppBootstrap)
    <feature>/
      data-access/             <feature>Service.ts · <feature>Queries.ts · <feature>Types.ts
      business-logic/          use<Feature>.ts · store/
      presentation/            <Feature>Screen.tsx · components/
assets/                        fonts, icons, images
plugins/                       Expo config plugins
.ai/                           rules + skills (symlinked into .claude / .cursor)
.maestro/                      Maestro E2E flows
```

**Layer rule:** `presentation → business-logic → data-access`. `common/` must not
import `features/` (except via channels / registries / `CoreProviders`).

## Where the scoped rules live

Folder-scoped rules load automatically when you work in that folder:

- [`.ai/rules/screens.md`](screens.md) — Expo Router route shells (`src/app/`)
- [`.ai/rules/network.md`](network.md) — service → queries → business-logic hooks
- [`.ai/rules/entities.md`](entities.md) — domain models in feature `data-access/`
- [`.ai/rules/state.md`](state.md) — Zustand, providers, hooks
- [`.ai/rules/ui.md`](ui.md) — components, theming, lists
- [`.ai/rules/dialogs.md`](dialogs.md) — bottom-sheet dialogs (`src/features/core/dialogs/`)

Always-on companion: [`.ai/rules/localization.md`](localization.md) — i18n / RTL.

On-demand reference:

- [`.ai/rules/featureflags.md`](featureflags.md) — resolution chain, `useFeatureFlag`
- [`.ai/rules/deeplinks.md`](deeplinks.md) — deep-link destinations
- [`.ai/rules/platform.md`](platform.md) — Expo SDK, config plugins, prebuild
- [`.ai/rules/blur.md`](blur.md) — `AppBlurView`, Android blur targets, `blurToolbar`
- [`.ai/rules/tablet.md`](tablet.md) — `isTablet`, `DimensionProvider` tablet tokens
- [`.ai/rules/testing.md`](testing.md) — Maestro E2E + `testIds.ts`
- [`.ai/rules/rule-authoring.md`](rule-authoring.md) — how `.ai/` is linked
- Root [`CLAUDE.md`](../../CLAUDE.md) + nested `src/**/CLAUDE.md` — VLFA source of truth

## Workflows (skills)

Every task follows a project skill in `.ai/skills/` (Claude Code and Cursor both read it through a symlink). Pick the matching one before writing code:

| Task                                           | Skill         |
| ---------------------------------------------- | ------------- |
| New feature / page backed by the backend       | `rn-feature`  |
| Change, extend or refactor an existing feature | `rn-upgrade`  |
| New or changed API call                        | `rn-endpoint` |
| New route / screen / tab                       | `rn-screen`   |
| Bug, crash, Sentry issue                       | `rn-bugfix`   |
| Before every commit / MR                       | `rn-verify`   |
| Add or change a rule, convention or skill      | `rn-rules`    |

Rules and skills are written only in `.ai/`; `.claude/` and `.cursor/` only hold symlinks to it. After adding, renaming or deleting a rule file, run `bash scripts/link-ai-rules.sh`.

## Non-Negotiable Rules

- **NEVER** put business logic, Zustand stores, API calls, or reusable components in `src/app/`. That folder is for Expo Router screens only.
- **ALWAYS** import using the `@/*` alias (`@/*` → `./src/*`). Never deep relative paths (`../../../`) and never bare `src/...`.
- Routes are thin shells under `src/app/`. Register new feature folders in the root stack when needed; keep params parsing in the route file.
- Dev-only routes live under `src/app/debug/` and must be wrapped in `Stack.Protected guard={AppConfig.isDevelop}`.
- Global wiring (providers, Sentry init, deep links, toast, splash) lives in `src/app/_layout.tsx` + `features/core/CoreProviders.tsx` — do not reproduce it elsewhere.
- The 3-layer stack (service → queries → business-logic hook) is mandatory. Screens consume only business-logic hooks — never call axios or React Query directly.
- Navigation goes through `useAppRouter()`. Never `useRouter()` / `router.push()` in a screen, and never hand-roll an auth check around a navigation: declare `loginGate` on the destination instead.
- Feature gating goes through the flag system: read with `useFeatureFlag(FeatureFlagEnums.X)`, gate routes with `featureGate` on the destination in `useAppRouter`. Never read `process.env.EXPO_PUBLIC_FLAG_*` in a screen, and never gate a route with a `return null` inside the screen body. See [`.ai/rules/featureflags.md`](featureflags.md).
- Any `AppTextInput`/`AppPinCode` collecting an identifier, password, or OTP code gets `autofillField={AutofillFieldEnums.X}` from `src/common/business-logic/utils/autofill.ts`. Never hand-write `autoComplete` / `textContentType` / `importantForAutofill` on an individual auth field — add a new enum member (and preset) to `src/common/business-logic/utils/autofill.ts` instead if an existing one doesn't fit. A screen-level password toggle must never set `keyboardType="visible-password"` — it breaks the Android autofill `inputType` classification; toggle visibility with `secureTextEntry` alone.
- Every user-facing date goes through `formatDateOrText(value, format)` from `@/utils/dateUtils` — never format a backend date string with a bare `new Date(...)` / `Intl.DateTimeFormat`. Backend date fields can carry free text ("Tomorrow", "2-3 working days"), and the rule is **show the text**: an unparseable value renders verbatim, never `""` and never `Invalid Date`. `parseDate` accepts only the shapes a backend actually sends — `YYYY-MM-DD` (local midnight), `YYYY-MM-DD HH:MM:SS` server time (local parts), zoned ISO-8601 — and rejects everything else, so call sites never pass their own parser: add a shape to `parseDate` rather than widening it back to a bare `new Date(raw)` (`new Date("12")` is 1 Dec 2001, not free text). Build every formatter through `dateFormatter(locale, options)` (module-level cache) — never `new Intl.DateTimeFormat` in a render path. Long dates ("5 March 2026") use `formatLongDate` / `formatLongDateOrUndefined`. Empty / null still renders `""`.
- Only a dialog with **more than one caller** belongs in `DialogManagerContext` / `src/features/core/dialogs/`. A single-caller bottom sheet stays next to its screen — see the Project traps section below.
- When the user says **"not implemented"** / **"not implemented yet"** / stub a CTA as not implemented, use `useNotImplemented` from `not-implemented-dialog` and call `openDialog()`. Do **not** invent a toast/`Alert` "Coming soon" for that phrase.

```ts
import { useNotImplemented } from "not-implemented-dialog";

const notImplemented = useNotImplemented();
notImplemented.openDialog(); // onPress / stub handler
```

## Naming

| Kind                          | Pattern                                                                | Example                                                                        |
| ----------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Route file (`src/app/`)       | feature folder + lowercase leaf, or flat lowercase file                | `src/app/example/list.tsx`, `src/app/example/detail.tsx`, `src/app/search.tsx` |
| Tab route                     | lowercase noun                                                         | `src/app/home.tsx`, `src/app/profile.tsx`                                      |
| Screen body (`src/features/`) | `<feature>/` folder; entry `<Feature>Screen.tsx` (PascalCase)          | `exampleList/ExampleListScreen.tsx`, `auth/AuthScreen.tsx`                     |
| Reusable component            | PascalCase                                                             | `ExampleCell.tsx`                                                              |
| Branded component             | `App` prefix                                                           | `AppButton`, `AppTextInput`, `AppToolbar`                                      |
| Custom touchable              | `C` prefix                                                             | `CTouchable` (else no prefix: `Loading`, `Spacer`)                             |
| Hook                          | `use` prefix, camelCase                                                | `useAppRouter.ts`                                                              |
| Context                       | `*Context.tsx` + `*Provider` + `use*Context` hook                      | `ThemeContext.tsx` → `AppThemeProvider`, `useAppTheme`                         |
| Entity / DTO                  | `*Interface.ts`, `export interface *Interface`                         | `exampleTypes.ts`, `UserInterface.ts`                                          |
| API module                    | `<domain>Api.ts`, exports `<domain>Api` object                         | `exampleService.ts` → `exampleApi`                                             |
| Query module                  | `<domain>Queries.ts`, exports `use<Action>Query` / `Mutation`          | `exampleQueries.ts` → `useGetExampleListQuery`                                 |
| Use case                      | `use<Action><Entity>UseCase.ts`                                        | `useExampleList.ts`                                                            |
| Zustand slice                 | `<Domain>Slice.ts`                                                     | `SettingsSlice.ts`                                                             |
| Zustand selectors             | `<Domain>Selectors.ts`, exports `use<Domain>Store<Get\|Update\|Clear>` | `SettingsSelectors.ts`                                                         |
| Zustand manager               | `use<Domain>Manager.ts`                                                | `useSettingsManager.ts`                                                        |
| Theme file                    | PascalCase `App*`                                                      | `AppColor.ts`, `AppFont.ts`                                                    |

### Symbol naming

- Types/interfaces: PascalCase. Prefer `interface` for data models, `type` for unions/prop aliases.
- Props type: `<Component>Props` (`AppButtonProps`).
- Enum: PascalCase + `Enums` suffix (`ActionEnums`, `FeatureFlagEnums`).
- Constants: SCREAMING_SNAKE_CASE only for module-level config (`DEVICE_REGISTER_PATH`, `AUTH_STORAGE`); otherwise camelCase.
- Backend JSON arrives snake_case — preserve it in payload/response interfaces (`access_token`, `password_confirmation`, `created_at`). Do NOT rename to camelCase.

## Imports

Order:

1. React / React Native
2. Third-party libs (`expo-*`, `@tanstack/react-query`, `@shopify/flash-list`, `axios`, `zustand`, ...)
3. `@/*` internal modules
4. `@/assets/*` (icons, images, lotties)
5. Relative imports (rare — avoid)

```ts
// ✅ GOOD
import AppButton from "@/common/presentation/components/app/AppButton";
import { useAppTheme } from "@/common/presentation/providers/ThemeContext";

// ❌ BAD — relative path
import AppButton from "@/common/presentation/components/app/AppButton";

// ❌ BAD — bare `src/...` (missing `@/` prefix)
import { AppPressable } from "src/common/presentation/components/app/AppPressable";
```

Prefer named exports for hooks, utilities, API objects, contexts. Components may be default-exported (follow nearby files).

## Code Style

- **Formatting**: Prettier — 2 spaces, double quotes, trailing commas, semicolons. Don't change.
- **Comments**: No narration (`// fetch data`, `// set state`). Only non-obvious intent, tradeoffs, or `//FIXME:` / `//TODO:` (ALL CAPS — keep convention).
- **Logging**: `console.log` only inside `AppConfig.isDevelop` paths. Production errors go to Sentry (initialized in `src/app/_layout.tsx`) — throw meaningful errors. Don't swallow errors silently. A response carrying `meta.message` is already toasted by the `AxiosContext` interceptor — don't double-toast in a use case or a screen.
- **Config & secrets**: **No key, token, client id, merchant id, secret or service URL is ever hardcoded** — not in `src/`, not in `app.config.ts`. Runtime values are `EXPO_PUBLIC_*`, read in `src/App.ts` and exposed on `AppConfig`; screens/hooks read `AppConfig`, never `process.env`. Prebuild-only values are unprefixed and read at the top of `app.config.ts` through its `requireEnv` helper, so a missing one fails the build instead of shipping dead. Write each `process.env.EXPO_PUBLIC_X` name out literally — babel inlines only that static form, so `process.env[name]` is `undefined` in release. `EXPO_PUBLIC_*` ships inside the bundle, so it is not secret: real secrets stay unprefixed and out of JS. Every new key goes into `.env`, `.env.example`, the `.env` heredoc + `require_vars` preflight in `.gitlab-ci.yml`, and the table in [`docs/build-and-release.md`](docs/build-and-release.md). Never commit `.env`, signing keys, or service-account JSON.

## TypeScript Essentials

- `strict: true` is enabled — never weaken types. Avoid `any`; prefer `unknown` and narrow. Do not add `@ts-ignore` to new code.
- `interface` for object/data shapes (extendable: `interface CreateExamplePayload extends BasePayload`); `type` for unions, intersections, prop aliases.
- **Closed sets of named values → `enum`, never a string-literal union `type`.** Any fixed catalog of states/variants/kinds (step states, statuses, modes, tabs) is a PascalCase `*Enums` enum (`LoginGateEnums`, `ToastTypeEnums`), and you reference members (`LoginGateEnums.REQUIRED`) everywhere — in `switch` cases, `Record<MyEnums, T>` keys (use computed keys `[MyEnums.X]: …`), defaults, and ternaries. Do NOT write `type State = "done" | "active"` or compare against raw string literals (`state === "done"`). Reserve `type` unions for prop aliases / discriminated-union prop shapes, not value catalogs. `as const` arrays remain fine for ordered static catalogs.
- Every API response is wrapped in `BaseResponseType<T>` (`{ data: T; meta?: { message?: string } }`) — T must not be an array (the type rejects it). Non-paginated lists use `BaseListResponse<T>` (`{ data: { items: T[] } }`, T = item). Paginated lists use `BasePaginationResponse<T>` (`{ data: { items: T[]; pagination } }` — `pagination` lives inside `data`; there is no cursor pagination). Mutation hook options follow `MutationOptions<T>`. All from `@/common/data-access/api/responseTypes` — do not redefine.
- Discriminated unions for variant props — use the `"key" in props` idiom to narrow.
- Snake_case API fields stay snake_case in TS interfaces.
- Use `as const` / `Readonly` arrays for static catalogs (`FEATURE_FLAG_LIST`).

---

## Project Notes

<!-- Add your project's own notes here. Keep architectural rules above; keep
     product decisions, API quirks and feature history in this section. -->

## Project traps

Hard-won traps from the base template. Read before "fixing" odd-looking code.

Each of these cost a debugging session on a real device in the project this
base was extracted from. They look like style preferences and are not: the
"obvious" version of each one is broken in a way that only shows up on a
physical Android phone, mid-gesture, or on the second language switch.

Symptom → cause → fix.

## 1. A runtime language / RTL switch must `reset()` to root

**Symptom.** The user switches language in settings. The sheet closes, half the
screen re-renders in the new language, and the app freezes — no crash, no
error, just a UI that never finishes switching. Sometimes it comes back after a
backgrounding; usually it needs a kill.

**Cause.** `I18nManager.forceRTL` flips the layout direction of a tree that is
already mounted, while the font provider is simultaneously swapping families
and React Query is invalidating every key. The mounted stack holds screens laid
out under the old direction and cannot reconcile them under the new one.

**Fix.** Treat a language change as a boot, not a state change:

```ts
const { setActiveLanguage } = useLocalizationContext();
const { reset } = useAppRouter();

const onSelectLanguage = async (next: "en" | "ar") => {
  await setActiveLanguage(next);
  reset(); // back to "/" — everything below re-mounts under the new direction
};
```

Also: **load every language's font files at startup**, not just the active
one's (`FontFiles` in `src/common/presentation/theme/AppFont.ts`). Loading on demand flips the
theme's `loaded` flag back to `false` during the switch, which unmounts the
tree at exactly the wrong moment.

## 2. A collapsible header must overlay the list, never sit in its flow

**Symptom.** Scrolling a screen with a shrinking header moves the content at
roughly double speed, and the header reaches a state where it can never finish
collapsing — it jitters between two heights, or the list bounces back up by the
amount the header just gave away.

**Cause.** An in-flow header that animates its own height changes the scroll
container's content offset while the user is scrolling it. The list scrolls by
`delta`, the header shrinks by `delta`, the content moves `2 × delta`, and the
new offset re-triggers the collapse. It is a feedback loop, not a tuning
problem.

**Fix.** Position the header absolutely over the list, and pay for it with
padding instead:

- Header: `position: "absolute"`, `top: 0`, `start: 0`, `end: 0`, animated
  `translateY` / opacity driven by a Reanimated shared value.
- List: `contentContainerStyle={{ paddingTop: headerHeight }}` — a constant, so
  the content never moves because of the header.
- Drive the animation from `useCollapsibleHeader` (`src/common/business-logic/hooks/useCollapsibleHeader.ts`),
  which already debounces direction reversals (a 12dp / 120ms threshold) so an
  overscroll bounce does not re-open the header.

Never animate the list's `contentInset`, `paddingTop` or the header's `height`
in response to scroll.

## 3. Android clips the last word of a centered shrink-to-fit `Text`

**Symptom.** A single-line label that scales itself down to fit — a tab title, a
price, a button label — renders as `Free deliv…` or drops its last word on
Android. The same component is fine on iOS and fine in the simulator at a
different font scale.

**Cause.** A centered `Text` inside a flex row gets a measured width equal to
its natural width at the _original_ font size. Android's layout then gives it
zero slack, so the shrunk text has nowhere to sit and the last glyph run is
clipped rather than re-laid-out.

**Fix.** Let the text own the full line and center the glyphs inside it:

```tsx
<AutoSizeText
  style={[typography.medium[14], { alignSelf: "stretch", textAlign: "center" }]}
>
  {getString("example_cta_label")}
</AutoSizeText>
```

`alignSelf: "stretch"` + `textAlign: "center"`, never `alignSelf: "center"`
alone. `AutoSizeText` (`src/common/presentation/components/AutoSizeText.tsx`) measures the
natural width and scales down to `minimumFontScale`; it still needs the stretch
to have room to do it.

## 4. A plain `ScrollView` inside a bottom sheet is dead on Android

**Symptom.** The sheet opens, the content is clearly taller than the sheet, and
dragging it does nothing on Android — or it drags the _sheet_ down and dismisses
it instead of scrolling. iOS behaves.

**Cause.** `@gorhom/bottom-sheet` owns the pan gesture of its content area. A
React Native `ScrollView` is not part of that gesture's handler chain, so on
Android the sheet's pan wins every touch and the scroll view never sees one.

**Fix.** Pick by which region scrolls:

- **The whole sheet body scrolls** → use the sheet's own scrollable
  (`BottomSheetScrollView` / `BottomSheetFlatList`), which is wired into the
  gesture chain. Keep `enableContentPanningGesture` on so dragging the content
  can still dismiss the sheet when it is scrolled to the top.
- **An inner region scrolls** (a tall list beside pinned header/footer content)
  → pass `enableContentPanningGesture={false}` on the sheet so the inner
  scrollable gets the gesture, and leave the handle as the only drag surface.

Related, same family of bug: every `AppTextInput` / `AppPinCode` rendered inside
a sheet must pass `bottomSheet` so it renders `BottomSheetTextInput`. A plain
`TextInput` is invisible to the sheet's keyboard tracking, and the keyboard
opens over the field.

## 5. `DialogManagerContext` is for shared dialogs only

**Symptom.** The dialog manager grows to twenty entries, every one of which is
imported, typed and hosted at the root — for sheets that exactly one screen
ever opens. The provider's `value` churns, and a change to one screen's sheet
props is a change to a root context type.

**Cause.** "All dialogs go in the manager" read as an architecture rule when it
was only ever a sharing mechanism.

**Fix.** Mount by reach:

| Reach                                       | Mount with                                                      |
| ------------------------------------------- | --------------------------------------------------------------- |
| **2+ callers**, or any screen could open it | `DialogManagerContext` + a file in `src/features/core/dialogs/` |
| **One caller** that fetches data            | `useLazyBottomSheet` in the owning screen, colocated next to it |
| **One caller**, no fetch                    | a plain `useRef<BottomSheetModal>` in the owning screen         |

Hard rule inside that table: **any dialog whose body makes a network call must
be mounted lazily** (manager or `useLazyBottomSheet`). An eager
`useRef`-mounted sheet mounts with its host screen, so its request fires before
the user has opened anything.

## 6. Measure Android performance on release builds only

**Symptom.** "Android is slow" — 650 MB of memory, janky lists, slow navigation
— measured in a Metro dev build, and then a day is spent optimising a render
path that was never the problem.

**Cause.** The dev build carries the Metro bundler connection, the full source
map, dev-only assertions, the network logger and an unminified bundle. That
overhead swamps the signal, and it is absent from what users run.

**Fix.** Profile a release build:

```bash
npx expo run:android --variant release
# or the local lane that signs with the release keystore
npm run build
```

Compare against a release baseline, not against iOS and not against a previous
dev build. The same rule applies to memory: pushed screens stay resident by
design in Expo Router, so "memory grows as you navigate" is expected — what
matters is whether a release build degrades, not whether the number rises.
