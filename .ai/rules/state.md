---
description: "Zustand stores, React providers, custom hooks, and React Query scope/focus/online bridges under VLFA paths"
globs: src/**/business-logic/**/*.{ts,tsx},src/common/business-logic/store/**/*.{ts,tsx},src/**/presentation/*Provider.tsx
alwaysApply: false
paths:
  - "src/**/business-logic/**/*.{ts,tsx}"
  - "src/common/business-logic/store/**/*.{ts,tsx}"
  - "src/**/presentation/*Provider.tsx"
---

# State Management

## Context / Provider vs Zustand — when to use which

- **Provider** for app-wide concerns tied to a tree (Theme, Localization, Environment, DialogManager, AppBoot). Lives under `features/core/<slice>/presentation/` with the hook in `business-logic/`.
- **Zustand** for plain data that survives unmount (favorites, prefs). Feature slices live under `features/<feature>/business-logic/store/` and are composed in `common/business-logic/store/app-state.ts`.
- For feature-local UI state, use `useState` / `useReducer` — not Zustand or a new provider.

## Zustand

Each domain typically has:

```
src/features/<feature>/business-logic/store/
  <domain>Slice.ts          # StateCreator + types
  <domain>Selectors.ts      # granular useStore(state => …) hooks (optional but preferred)
```

Compose slices into `useAppStore` in `src/common/business-logic/store/app-state.ts` (the comment marks where new slices are spread). That file is the **only** allowed `common → features` import for client state.

For persisted state, wrap with `persist` + `createJSONStorage(() => appStorage)` or `secureStorage` from `@/common/business-logic/interfaces/storageInterface`. Always set `version` on persisted stores. Storage key: SCREAMING_SNAKE_CASE, suffixed `_STORAGE`.

Components subscribe through selectors — never `useAppStore()` unconditionally.

## Providers

Template:

```tsx
type XContextType = {
  /* fields + actions */
};
const XContext = createContext<XContextType | null>(null);

export const useX = () => {
  const ctx = useContext(XContext);
  if (ctx == null) throw new Error("Can't use useX outside XProvider");
  return ctx;
};

export const XProvider = ({ children }: { children: ReactNode }) => {
  // ...
  return <XContext.Provider value={value}>{children}</XContext.Provider>;
};
```

Rules:

- Default context value is `null`; the consumer hook throws outside the provider.
- Register providers in `src/app/_layout.tsx` in the existing order (see screens rule). Feature-scoped providers register at their feature layout, not the global root.
- Core slices that must register headers / boot steps / flag sources do so via side-effect imports from `src/features/CoreBootstrap.ts`.

## React Query scope, focus, online

- **Default keys** — `useDefaultQueryKey` appends env + language from `queryScopeRegistry` (`setQueryScope` from Environment / Localization providers).
- **Purge on scope change** — mount `usePurgeStaleDefaultQueryScopes` under `QueryClientProvider`. It removes queries that matched the **previous** scope only (not a full cache clear).
- **Managers** — call `setupQueryManagers()` once from the root layout (`src/common/data-access/api/setupQueryManagers.ts`): NetInfo → `onlineManager`, AppState → `focusManager`. Keeps `refetchOnWindowFocus` correct on RN (stale queries refetch on foreground).
- **UI online flag** — `useNetworkStatus()` for banners; do not invent a second NetInfo subscription pattern elsewhere.
- Details and the future session auth plug-in: `.ai/rules/network.md`.

## Hooks

- File: `use<Name>.ts` (or `.tsx` if it renders JSX), camelCase, under the owning layer.
- Always prefix with `use`.
- Return a plain object of named fields — never a tuple for domain APIs.
- Do not call hooks conditionally. Gate the effect inside, not the hook call.
- Shared cross-cutting hooks live in `src/common/business-logic/hooks/`.
- Session auth registration (non-hook) lives in `src/common/business-logic/session/` — kernel helpers only; the auth feature owns tokens.
