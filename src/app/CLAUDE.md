# Routes — `src/app/**`

Expo Router file-based routes. **Shells only.**

## What lives here

A route file parses its params and renders one feature component:

```tsx
import { useLocalSearchParams } from "expo-router";
import { ExampleDetailScreen } from "@/features/example/presentation/ExampleDetailScreen";

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ExampleDetailScreen id={id} />;
}
```

That is the whole file. Route `Page` ≠ feature `<Feature>Screen` — the screen
lives in `features/<feature>/presentation/` where it can be reused, tested and
composed.

## What must never live here

- Business logic, stores, API calls, `useQuery`, axios — ESLint blocks the
  imports.
- Reusable components. No `components/` tree under `src/app/`.
- Provider wiring beyond `_layout.tsx`.

## Layouts

- `src/app/_layout.tsx` is the single global root: `AppErrorBoundary` →
  `CoreProviders` → the splash gate → the `<Stack>` registry. Nothing else
  reproduces this.
- A feature folder with more than one route gets its own `_layout.tsx` declaring
  a nested `<Stack>`.
- **Register a new route at both levels**: in its feature's nested `_layout.tsx`
  and, if the folder is new, in the root `_layout.tsx`.

## Dev-only routes

Wrap in a guard so they do not exist in production:

```tsx
<Stack.Protected guard={AppConfig.isDevelop}>
  <Stack.Screen name="debug" />
</Stack.Protected>
```

## Navigation

Never write a path literal. Add it to `common/business-logic/routes/paths.ts`
and call `router.push(routes.exampleDetail(id))` via `useAppRouter()`.
