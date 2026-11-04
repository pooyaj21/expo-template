---
description: "Feature flags — resolution chain, useFeatureFlag / isFeatureEnabled, featureGate on router destinations"
globs: src/features/*/business-logic/store/featureFlag/**/*.{ts,tsx},src/common/business-logic/hooks/{useFeatureFlag,useAppRouter}.ts,src/App.ts,src/provider/AppConfig.ts,src/app/debug/**/*.{ts,tsx}
alwaysApply: false
paths:
  - "src/features/*/business-logic/store/featureFlag/**/*.{ts,tsx}"
  - "src/common/business-logic/hooks/{useFeatureFlag,useAppRouter}.ts"
  - "src/App.ts"
  - "src/provider/AppConfig.ts"
  - "src/app/debug/**/*.{ts,tsx}"
---

# Feature flags

On-demand reference. Pull this in before adding a flag, gating a surface behind
one, or changing anything under `src/features/*/business-logic/store/featureFlag/`,
`src/features/*/data-access/FeatureFlagInterface.ts`, `envFeatureFlags` in `src/App.ts`, or the
`featureGate` option in `src/common/business-logic/hooks/useAppRouter.ts`.

A flag answers one question — **is this feature on for this user, on this
build, right now** — and it is answered in one place. Screens never read
`process.env`, never read a raw settings field the flag already covers, and
never re-derive "is X on" from the presence of data.

The base ships one flag, `FeatureFlagEnums.EXAMPLE`, so the resolution chain
has something to resolve and the debug screen has a row. Delete it once the
first real flag lands.

## Resolution order

Highest wins:

| Layer               | Where it comes from                                                             | When it has an opinion                       |
| ------------------- | ------------------------------------------------------------------------------- | -------------------------------------------- |
| **Dev override**    | `src/app/debug/featureFlags.tsx` → `devOverrides` in the store (persisted)      | Only in `AppConfig.isDevelop` builds         |
| **Server**          | `GET /src/app/settings`, mirrored by `useGetSettingsUseCase`                    | The settings field is not `undefined`        |
| **Env**             | `EXPO_PUBLIC_FLAG_*` → `AppConfig.envFeatureFlags`                              | The value parses to exactly `true` / `false` |
| **Catalog default** | `FEATURE_FLAG_DEFAULTS` in `src/features/*/data-access/FeatureFlagInterface.ts` | Always — it is the floor                     |

`resolveFeatureFlag` in `src/features/*/business-logic/store/featureFlag/FeatureFlagSlice.ts` is the one
implementation of that order; nothing else may re-derive it.

**The server is the source of truth.** Env is the fallback used before the
first `/src/app/settings` answer and when the backend does not send the field at
all; it is _not_ a kill switch that overrides ops. A production build that must
hard-hide a feature regardless of the backend ships it as `false` in the
catalog default and never gets a `true` from the server.

`GET /src/app/settings` runs behind the splash (`AppManagerProvider` gates the app
on its first success), so by the time any screen renders, the server layer is
already in. There is no "flag flicker" window to design around.

Only `devOverrides` is persisted — server flags arrive fresh on every settings
call, so keeping them across restarts would just serve a stale answer for one
frame.

## Reading a flag

```tsx
import { FeatureFlagEnums } from "@/features/*/data-access/FeatureFlagInterface";
import { useFeatureFlag } from "@/common/business-logic/hooks/useFeatureFlag";

const isExampleEnabled = useFeatureFlag(FeatureFlagEnums.EXAMPLE);
```

- `useFeatureFlag(flag)` — the default. Re-renders when the flag flips.
- `useFeatureFlagManager()` — every flag plus its resolution (`flags`,
  `isEnabled`, `setDevOverride`, `clearDevOverrides`). For the debug screen and
  for code that needs more than one flag.
- `isFeatureEnabled(flag)` from `src/features/*/business-logic/store/featureFlag/FeatureFlagSlice.ts` —
  the non-hook read, for imperative paths (the router gate, deep-link
  dispatch). Resolves at **call** time, so it never captures a stale value.

## Gating navigation

Route gating lives in the router, next to the login gate — never in a screen:

```ts
exampleDetailScreen: screen<ExampleDetailParams>("/example/detail", {
  featureGate: FeatureFlagEnums.EXAMPLE,
}),
```

A gated destination with its flag off is a **no-op** (a dev-build
`console.log` says which flag blocked it). The gate runs _before_ the login
gate, so a guest is never sent to the auth screen for a feature that is off.

Because every in-app banner action and the deep-link dispatcher navigate
through `useAppRouter().navigateTo.*`, one `featureGate` also covers backend
action buttons and push payloads.

## Gating deep links

The router gate alone would let a guest be dragged through login before the
replay silently no-ops, so a gated link is dropped one step earlier. Map the
action to its flag in `FEATURE_GATED_ACTIONS`
(`src/deepLink/deepLinkActions.ts`):

```ts
const FEATURE_GATED_ACTIONS: Readonly<
  Partial<Record<DeepLinkActionEnums, FeatureFlagEnums>>
> = {
  [DeepLinkActionEnums.OPEN_SAMPLE_DETAIL]: FeatureFlagEnums.EXAMPLE,
  // …one entry per action of that feature
};
```

`useDeepLinkSystem` checks it in two places — in `process()` **before** the
login gate, and at the top of `navigateAction()`, which is the single choke
point shared by the post-login replay and in-app banner actions. A blocked
link is dropped silently (dev builds log which flag dropped it): no
navigation, no auth prompt, no not-implemented dialog, so the app never
advertises a feature that is off.

Routes are additionally wrapped in `<Stack.Protected guard={isFlagEnabled}>`
in the layout that owns them — a feature that is off has no route to restore
into, which is what catches saved navigation state from a build where it was
on.

## Gating UI

The route gate stops navigation; it does not hide entry points. Hide those at
the source so a disabled feature leaves no dead affordance:

- profile / settings rows → conditional spread in the section builder
- tabs and scope switchers → hidden, and the active value forced back to a
  value that still exists
- home / collection widgets → the renderer returns `null`
- the matching network call → pass `{ enabled: isFlagEnabled }` to the use case
  rather than fetching for a feature nobody can reach

## Adding a flag

1. Add the member to `FeatureFlagEnums` and an entry to
   `FEATURE_FLAG_DEFAULTS` (new features default to `false`) in
   `src/features/*/data-access/FeatureFlagInterface.ts`.
2. If the backend owns it, add the read in `useGetSettingsUseCase`'s
   `updateServerFlags({ … })` — that use case is the only writer of the server
   layer.
3. If a build needs to pin it, add `EXPO_PUBLIC_FLAG_<NAME>_ENABLED` to
   `envFeatureFlags` in `src/App.ts` — spelled out literally, babel only
   inlines the static form — plus `.env`, `.env.example`, the `.env` heredoc in
   `.gitlab-ci.yml` and the optional-overrides table in
   [`docs/build-and-release.md`](../docs/build-and-release.md). Skip this step
   for a purely server-driven flag; nothing else has to change.
4. Gate the routes (`featureGate`), the deep-link actions
   (`FEATURE_GATED_ACTIONS`), the route trees (`Stack.Protected`) and the entry
   points.

The debug screen picks up the new flag automatically — it iterates
`FEATURE_FLAG_LIST`.

## Don'ts

- ❌ Don't read `process.env.EXPO_PUBLIC_FLAG_*` outside `src/App.ts`.
- ❌ Don't gate a route with an early `return null` / `<Redirect>` in the screen
  body — use `featureGate` on the destination.
- ❌ Don't use a flag as a string-literal union or a raw string; it is
  `FeatureFlagEnums`.
- ❌ Don't branch on the raw `/src/app/settings` field a flag already covers.
- ❌ Don't add a flag for a feature you are shipping unconditionally.
- ❌ Don't leave a flagged feature's deep-link actions out of
  `FEATURE_GATED_ACTIONS` — the route no-op alone still walks a guest through
  login first.
