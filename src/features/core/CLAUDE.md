# Core slices — `src/features/core/**`

Cohesive concerns several features need. Each is a normal VLFA slice —
`data-access/`, `business-logic/`, `presentation/` — and omits a layer folder
only when that layer has zero files.

| Slice           | Owns                                                                 |
| --------------- | -------------------------------------------------------------------- |
| `api`           | The `ApiClientProvider` / `useApiClient` context                     |
| `environment`   | Which backend the app talks to, switchable at runtime                |
| `session`       | The access token, the signed-in user, sign-in / sign-out             |
| `alerts`        | The toast channel, the API→toast bridge, the single render host      |
| `feature-flags` | Flag catalog + resolve order (dev → server → env → default)          |
| `app-settings`  | `GET /app/settings` + store; mirrors `feature_flags` into flag store |

`CoreProviders.tsx` and `CoreBootstrap.ts` sit at `features/core/` itself, not
inside a slice.

## CoreProviders — the composition root

The one file allowed to know about every slice. Order is not arbitrary:

```
GestureHandlerRootView → SafeAreaProvider → Environment → Localization →
AppTheme (typesets per script) → QueryClient → QueryScope (env + language +
session) → ApiClient (base URL from environment) → BottomSheetModal →
BlurTargetProvider → DialogManager → AppBootstrap → children + AlertHost
```

When the kernel needs a value from a slice, the kernel exposes a **prop** and
this file fills it (`ApiClientProvider baseUrl=…`, `QueryScopeProvider scope=…`).
That is what keeps `common/` free of feature imports.

## AppBootstrap — the gate

Everything that must be true before the first screen renders: environment and
language read, the device uuid resolved, the session hydrated from the keychain.
It also mounts the app-wide listeners once — deep links, push, screen tracking,
shake-to-debug.

**It owns the splash**, because it is the only component that knows about every
outcome: ready, retrying, and failed. Hiding the splash from the ready path
alone leaves a failed boot stuck behind it forever.

Steps latch. Once the app is up, a later failure surfaces as a toast, never as a
full-screen error that tears down a working session.

## CoreBootstrap — side-effect registration

Side-effect imports only. Each module registers a request-header provider or
starts a channel listener, once, before any component can fire a request. Add a
line when you add a concern the kernel must not import.

## Adding a core slice

1. `features/core/<name>/data-access/` — types, channels, storage helpers. Keep
   channels free of React; they are reachable from interceptors.
2. `features/core/<name>/business-logic/` — the context or store, the manager
   hook, and a `<name>Headers.ts` if it contributes a request header.
3. `features/core/<name>/presentation/` — only if it renders (alerts do,
   session does not).
4. Register the side-effect module in `CoreBootstrap.ts` and mount any provider
   in `CoreProviders.tsx`.

## Analytics

```tsx
const { track, events } = useAnalytics();
track(events.SIGN_IN, { user_id: user.id });
```

One vendor = one adapter in `analytics/adapters/`, registered in
`analyticsBootstrap.ts`. The vendor SDK is imported **there and nowhere else**,
so adding Mixpanel or Firebase touches one file and no call sites. Events come
from the `AnalyticsEvents` catalog — an event not in the catalog does not exist,
which is what stops `sign_in`, `signIn` and `Sign In` from all shipping.

`useScreenTracking()` is mounted once by `AppBootstrap`; screens do not report
themselves.

## Dialogs

```tsx
const { confirm } = useDialogManager();
confirm.present({
  title: getString("address_delete_title"),
  message: getString("address_delete_message"),
  destructive: true,
  onConfirm: deleteAddress,
});
```

Each entry is a `useLazyBottomSheet`, so a dialog's body — and any query inside
it — mounts only when presented. Without that, every screen that _can_ open a
dialog would run its queries on mount.

Add a dialog: build it on `AppBottomSheet`, add one controller in
`dialogManagerContext.tsx`, and add it to the value and the node list.

## Alerts

```tsx
const { showSuccess, showError, showWarning, showInfo } = useAlert();
showSuccess({ message: getString("profile_saved") });
```

**Whoever knows the outcome raises the alert.** A mutation's `onSuccess` lives in
business-logic, so business-logic alerts; a pure UI event alerts from
presentation. Outside React, call `showAlert(...)` directly.

Network failures are fed by `alertBridge.ts` off the API error channel. It stays
silent on **401** (the session slice signs out — one failure, one response) and
**422** (validation belongs inline next to the field, not in a toast that
vanishes). Do not toast an API failure yourself.

Backend messages need no `getString` — the API localizes them from the
`language` header.
