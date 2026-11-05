---
description: "Expo Router screens, navigation, route registration under src/app/"
globs: src/app/**/*.{ts,tsx}
alwaysApply: false
paths:
  - "src/app/**/*.{ts,tsx}"
---

# Expo Router Screens

`src/app/` is reserved for route files. A route file is a **thin shell**: it reads params (if any), then renders the matching `*Page` from `src/features/<feature>/presentation/`. All UI, data fetching, and logic live in the feature — never here.

**NEVER** put business logic, Zustand stores, API calls, or reusable components in this folder.

## Folder Layout

```
src/app/
  _layout.tsx              # root providers + Stack — registers feature folders + (tabs)
  index.tsx                # entry redirect
  (tabs)/                  # tab bar
    _layout.tsx
    index.tsx              # example list (or home)
  example/
    [id].tsx               # thin shell → ExampleDetailPage
  +not-found.tsx
  +native-intent.tsx
```

## Adding a Screen

1. **Build the body in the feature** — `src/features/<feature>/presentation/<Feature>Page.tsx` (see Screen Body Pattern).
2. **Add the thin route file** under `src/app/`:
   - A feature with sub-routes → folder `src/app/<feature>/` with `_layout.tsx` when needed and one leaf file per route.
   - A standalone screen → a flat file `src/app/<name>.tsx`.
3. **Register the route** in the owning `<Stack>` (`src/app/_layout.tsx` and/or the nested feature `_layout.tsx`).
4. **Add a path helper** in `src/common/business-logic/routes/paths.ts` — never hardcode path strings at call sites.
5. Dev-only surfaces go through the debug menu / develop flavor guards — not production routes.

Global wiring (providers, toast, splash, debug host) lives in `src/app/_layout.tsx` — do not reproduce it elsewhere. Provider order (binding): ErrorBoundary → Environment → Localization → Theme → QueryClient → GestureHandlerRootView → BottomSheetModal → DialogManager → AppBoot → (Stack, Toast, DebugMenuHost).

## Route File Pattern (the thin shell)

```tsx
import { useLocalSearchParams } from "expo-router";
import { ExampleDetailPage } from "@/features/example/presentation/ExampleDetailPage";

const ExampleDetailRoute = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ExampleDetailPage id={id} />;
};

export default ExampleDetailRoute;
```

## Screen Body Pattern — `src/features/<feature>/presentation/<Feature>Page.tsx

```tsx
import { PageContainer } from "@/common/presentation/components/PageContainer";
import { AppToolbar } from "@/common/presentation/components/AppToolbar";
import { StateHandler } from "@/common/presentation/components/StateHandler";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { useExample } from "@/features/example/business-logic/useExample";

export const ExampleListPage = () => {
  const { getString } = useLocalization();
  const { list, isLoading, error, isEmpty, refetch } = useExample();

  return (
    <PageContainer caringSides="top">
      <AppToolbar title={getString("example_list_title")} />
      <StateHandler
        data={list}
        error={error}
        isLoading={isLoading}
        isEmpty={isEmpty}
        retry={refetch}
      >
        {(items) => /* AppList … */ null}
      </StateHandler>
    </PageContainer>
  );
};
```

Rules:

- Named export `<Feature>Page`. Feature-specific sub-components live next to it under `presentation/`.
- Wrap every screen in `<PageContainer>`. Use `<AppToolbar>` for headers (Stacks disable native headers).
- Use `<StateHandler>` for any screen that renders remote data.
- Consume business-logic hooks only — never axios / React Query from the page.
- Gate flagged routes with `useFeatureFlag` at the navigation / layout level, not with a silent `return null` deep in the body after mounting expensive work.

## Navigation

All in-app navigation goes through `useAppRouter` (`src/features/core/navigation/business-logic/useAppRouter.ts`) — `navigateTo.*`, `back`, `dismiss`, `replace`, `reset`. Path strings are built only inside that catalog (and `routes` in `src/common/business-logic/routes/paths.ts`). Do **not** call `router.push` / `router.replace` from feature screens with raw or ad-hoc paths.

- Add a `routes` helper, then a `navigateTo` destination, before introducing a new screen entry point.
- Gate flagged destinations with `featureGate` on the catalog entry (call-time no-op when off) — never `return null` after mounting the page.
- Cross-screen function results ride tokens via `navCallbacks` (`putCallback` / `getCallback` / `releaseCallback`), not JSON params.
- Inbound URLs: see [`.ai/rules/deeplinks.md`](deeplinks.md) — parse once in `+native-intent.tsx`, then map to `navigateTo`.

## Dialogs from screens

Use the dialog manager hook — never import a shared dialog component into a screen:

```tsx
const dialogs = useDialogManager();
dialogs.foo.present({ onConfirm: handleConfirm });
dialogs.foo.dismiss();
```
