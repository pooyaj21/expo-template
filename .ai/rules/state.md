---
description: "Zustand stores, React contexts, and custom hooks"
globs: src/{store,contexts,hooks}/**/*.{ts,tsx}
alwaysApply: false
paths:
  - "src/{store,contexts,hooks}/**/*.{ts,tsx}"
---

# State Management — `src/{store,contexts,hooks}/**/*.{ts,tsx}`

This file covers Zustand stores, React contexts, and custom hooks. The same rules apply to siblings `src/common/presentation/providers/` and `src/common/business-logic/hooks/`.

## Context vs Zustand — when to use which

- **Context** for app-wide concerns inherently tied to the provider tree: the Axios instance, Theme, Localization, Environment, AppStage, the login controller, the dialog manager. Lives in `src/common/presentation/providers/`.
- **Zustand** for plain data that must survive unmount and stay readable **outside React**: auth token, device id, user profile, app settings, feature flags. Lives in `src/features/*/business-logic/store/<domain>/`.
- The deciding question is "does a non-React caller need this?". The Axios header builders read the token and device uuid through `getAuthToken()` / `getDeviceUuid()`, and `useAppRouter` resolves a feature gate through `isFeatureEnabled()` — which is exactly why those three are stores and not contexts.
- For feature-local state use `useState` / `useReducer` — not Zustand, not Context.

## Zustand

Each domain has **three** files in `src/features/*/business-logic/store/<domain>/`:

```
src/features/*/business-logic/store/settings/
  SettingsSlice.ts        # state + actions + create()
  SettingsSelectors.ts    # one granular useStore(state => …) hook per field/action
  useSettingsManager.ts   # business-level hook composing selectors + side effects
```

The base ships five: `auth/`, `user/`, `device/`, `settings/`, `featureFlag/`.

### Slice

```ts
interface SettingsState {
  settings?: SettingsInterface;
  updateSettings: (settings?: SettingsInterface) => void;
  clearSettings: () => void;
}

const createSettingsSlice: StateCreator<SettingsState> = (set) => ({
  settings: undefined,
  updateSettings: (settings) => set({ settings }),
  clearSettings: () => set({ settings: undefined }),
});

export const useSettingsStore = create<SettingsState>()((...a) => ({
  ...createSettingsSlice(...a),
}));
```

For persisted state, wrap with `persist` + `createJSONStorage`:

- Storage key: SCREAMING_SNAKE_CASE, suffixed `_STORAGE` (`"AUTH_STORAGE"`, `"DEVICE_STORAGE"`).
- Always set `version`.
- Always `partialize` down to what genuinely must survive a restart — the feature-flag store persists `devOverrides` only, because server flags arrive fresh on every `/src/app/settings` call.
- **Credentials persist to `secureStateStorage`** (`@/utils/secureStorage`): the auth token and the device identity. Everything else (user profile, dev flag overrides) uses AsyncStorage. `settings/` is deliberately **not** persisted — a stale cached force-update or support block is worse than none.
- A store the boot gate waits on exposes `hasHydrated` through `onRehydrateStorage` (see `AuthSlice` / `DeviceSlice`); `AppManagerProvider` reads it.
- Export a plain non-hook getter for imperative readers (`getAuthToken()`, `getDeviceUuid()`, `getUser()`, `isFeatureEnabled()`), and keep those the only non-React entry points into the store.

### Selectors

Export **one hook per field/action**, named `use<Domain>Store<Get|Update|Save|Clear|...>`:

```ts
export const useAuthStoreGet = () => useAuthStore((state) => state.token);
export const useAuthStoreSave = () => useAuthStore((state) => state.saveToken);
export const useAuthStoreClear = () =>
  useAuthStore((state) => state.clearToken);
```

Components and hooks subscribe through these selectors — never call `useAuthStore()` with no selector (it re-renders on every field).

### Manager hook

`use<Domain>Manager.ts` composes the selectors and owns the domain's derived values and side effects:

```ts
export const useAuthManager = () => {
  const token = useAuthStoreGet();
  const saveToken = useAuthStoreSave();
  const clearToken = useAuthStoreClear();
  const hasHydrated = useAuthStoreHasHydrated();

  return {
    token,
    isAuthenticated: token != undefined,
    saveToken,
    clearToken,
    hasHydrated,
  };
};
```

Screens and use cases consume the **manager**, not the store or the raw selectors.

## Contexts

File: `src/common/presentation/providers/<Name>Context.tsx`.

```tsx
type XContextType = {/* fields + actions */};
const XContext = createContext<XContextType | null>(null);

export function useXContext() {
  const ctx = useContext(XContext);
  if (ctx == null) throw new Error("Can't use useXContext outside XProvider");
  return ctx;
}

export const XProvider = ({ children }: { children: ReactNode }) => {
  // ...state, effects...
  return <XContext.Provider value={value}>{children}</XContext.Provider>;
};
```

Rules:

- Default context value is `null` and the consumer hook throws if accessed outside the provider.
- `loaded: boolean` is the standard field on a provider that performs async init (Environment, Localization, Theme, AppStage). `AppManagerProvider` waits for all of them — plus the `hasHydrated` stores — before swapping the native splash for `AppSplash`; the network bootstrap then runs behind that animation, and the gate opens only once both have settled.
- Memoize the context `value`; a provider that rebuilds it every render re-renders its whole subtree.
- Register new providers in `src/app/_layout.tsx`, which is the authoritative order: Environment → Localization → Theme → AppStage → QueryClient → LoginController → Axios → BottomSheetModal → DialogManager → AppManager. Two constraints are not negotiable: **Axios must wrap the bottom-sheet provider** (`@gorhom/portal` re-parents sheet bodies under the sheet host, so any context below that host is missing inside sheet content), and `AppManagerProvider` stays innermost — it is the boot gate, and the root `<Stack>` lives below it.
- A feature-scoped context registers at its feature's `src/app/<feature>/_layout.tsx`, not the global one.

## Hooks

File: `src/common/business-logic/hooks/use<Name>.ts` (or `.tsx` if it renders JSX).

- Always prefix with `use`. Return a plain object of named fields — never a tuple `[a, b, c]` for a domain API.
- Cross-cutting concerns only: navigation (`useAppRouter`, `useNavPrams`, `navCallbacks`), auth flow (`useUserManagement`, `useLoginControllerContext`), flags (`useFeatureFlag`), query keys (`useDefaultQueryKey`), layout (`useDimensions`, `useCollapsibleHeader`), device and platform affordances (`useShake`, `useHiddenTap`, `useHardwareBackPress`, `useLazyBottomSheet`, `useResetApp`). The deep link system lives in `src/deepLink/`.
- There is deliberately no safe-area wrapper hook — read `useSafeAreaInsets()` from `react-native-safe-area-context` directly, and never add one that floors or pads the insets.
- If a hook subscribes to a Zustand store, do it via the selector hooks — not an inline `useXStore((s) => …)`.
- Do not call hooks conditionally. Gate the _effect_ inside, not the hook call.

### Auth composition (canonical example)

```
useAuthStore* / useUserStore* (selectors)  → token, user, and their actions
useAuthManager / useUserManager            → per-domain managers
useUserManagement (hook)                   → combines both → login(token, user), logout(), updateUser()
useLoginControllerContext (context)        → ensureUserLogin() + post-login replay
useAppRouter                               → loginGate on the destination calls ensureUserLogin
```

Do not reach around this chain. Anything else holding per-account state (a cart, saved lists, an analytics identity) clears inside `useUserManagement.logout()` — never from the screen that calls it. `useResetApp()` is the harder reset: it clears the device store and the stage, logs out, drops the query cache, then `reset()`s to root.

## Contexts (`src/common/presentation/providers/`)

# Contexts — `src/common/presentation/providers/**/*.{ts,tsx}`

See [`src/features/*/business-logic/store/.ai/rules/`](../store/.ai/rules/) for the full state-management guide (context vs Zustand, provider ordering, manager-hook composition).

Quick reminders for this folder:

- File pattern: `<Name>Context.tsx` exporting `<Name>Provider` + `use<Name>Context`.
- Default context value is `null`; the consumer hook throws if used outside the provider.
- Async-init providers expose `loaded: boolean` (Environment, Localization, Theme, AppStage). `AppManagerProvider` waits on those plus the `hasHydrated` stores before hiding the native splash, then holds `AppSplash` while the boot calls run behind it.
- Memoize the context `value` — a rebuilt value re-renders the whole subtree.
- Register new providers in `src/app/_layout.tsx`, the authoritative order: Environment → Localization → Theme → AppStage → QueryClient → LoginController → Axios → BottomSheetModal → DialogManager → AppManager. Axios must wrap the bottom-sheet provider (`@gorhom/portal` re-parents sheet bodies under the sheet host, so contexts below it are missing inside sheet content), and `AppManagerProvider` stays innermost — it is the boot gate that the root `<Stack>` renders behind.
- A feature-scoped context registers at that feature's `src/app/<feature>/_layout.tsx`, never globally.
- `DialogManagerContext` hosts **shared** dialogs only — see [`src/features/core/dialogs/.ai/rules/`](../dialogs/.ai/rules/).

## Hooks (`src/common/business-logic/hooks/`)

# Hooks — `src/common/business-logic/hooks/**/*.{ts,tsx}`

See [`src/features/*/business-logic/store/.ai/rules/`](../store/.ai/rules/) for the full state-management guide (context vs Zustand, manager-hook composition, the canonical auth chain).

Quick reminders for this folder:

- File pattern: `use<Name>.ts` (or `.tsx` if it renders JSX). Always prefix with `use`.
- Cross-cutting concerns only: navigation (`useAppRouter`, `useNavPrams`, `navCallbacks`), auth flow (`useUserManagement`, `useLoginControllerContext` from `src/common/presentation/providers/`), flags (`useFeatureFlag`), query keys (`useDefaultQueryKey`), layout (`useDimensions`, `useCollapsibleHeader`, `useAppSafeAreaInsets`), platform affordances (`useShake`, `useHiddenTap`, `useHardwareBackPress`, `useLazyBottomSheet`, `useResetApp`). The deep link system lives in `src/deepLink/` (see [`.ai/rules/deeplinks.md`](../../.ai/rules/deeplinks.md)).
- `useAppSafeAreaInsets` is restored for Android: it floors `bottom` at `max(insets.bottom, initialWindowMetrics.bottom, 34)` so 3-button / unreliable nav-bar insets do not collapse under CTAs. Prefer it through `PageContainer`; do not mass-replace every raw `useSafeAreaInsets` call site.
- Return a plain object of named fields — never a tuple `[a, b, c]` for a domain API.
- Subscribe to Zustand via the selector hooks, never `useXStore((s) => …)` inline.
- Do not call hooks conditionally. Gate the _effect_ inside, not the hook call.
- `useAppRouter` is the single navigation surface: new destinations are declared on `navigateTo` with `screen<XParams>(href, options)`, and both gates (`loginGate`, `featureGate`) live there — never in a screen body.
- Auth-related work extends `useUserManagement` / `useLoginControllerContext` — don't reach around the chain.
