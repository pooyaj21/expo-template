# business-logic — `src/**/business-logic/**`

Hooks, stores and rules. It may import `data-access`; it may **not** import
`presentation` — return state and let the UI render it. ESLint enforces this.

## Feature hooks (the use-case layer)

`use<Feature>.ts` is the **only** surface a screen consumes. It calls the query
hook, applies side effects (store writes, alerts, analytics, cache
invalidation), and exposes a minimal API.

```ts
export const useExampleList = (params: ExampleListPayload = {}) => {
  const { data, isLoading, isFetching, isFetchingNextPage, ... } =
    useExampleListQuery(params);

  const list = infiniteListMapper(data);

  return {
    list,
    // A background refetch of page 1 is loading; fetching page 3 is not.
    isLoading: isLoading || (isFetching && !isFetchingNextPage),
    isEmpty: !isLoading && list.length === 0,
    error: error ?? undefined,
    refetch,
    pagination: { isFetchingNextPage, fetchNextPageIfAvailable },
  };
};
```

Mutation hooks accept `MutationOptions<T>` so a caller can chain navigation
without owning the mutation:

```ts
export const useCreateExample = (
  options?: MutationOptions<ExampleInterface>,
) => {
  const { mutate, isPending } = useCreateExampleMutation();
  const { showSuccess } = useAlert();

  const createExample = (payload: CreateExamplePayload) =>
    mutate(payload, {
      ...options,
      onSuccess: (data) => {
        showSuccess({ message: "…" });
        options?.onSuccess?.(data);
      },
    });

  return { createExample, isPending };
};
```

**Failures are already toasted by the alert bridge. Do not toast them again.**

## Context vs Zustand vs local state

- **Context** for app-wide concerns tied to a provider tree: theme,
  localization, environment, the API client. Lives beside its slice.
- **Zustand** for plain data that must survive unmount and be read from
  anywhere: session, cart, feature flags. Lives in
  `business-logic/store/`.
- **`useState` / `useReducer`** for anything feature-local. Not everything needs
  a store.

## Zustand shape

Three files per domain in `business-logic/store/`:

```
<domain>Slice.ts       # StateCreator + create()
<domain>Selectors.ts   # one hook per field/action
use<Domain>.ts         # the manager: composes selectors + side effects
```

- Export **one selector hook per field**, named `use<Domain>Store<Verb>`.
  Components never call `useXStore()` bare — that re-renders on every unrelated
  change.
- Screens and use cases consume the **manager** (`useSession`), not the store or
  the selectors, when a manager exists. The session token lives in three places
  (store, keychain, header ref) and they must move together — that is what the
  manager is for.
- Persist through `Storage` / `SecureStorage`, not `zustand/persist`, so every
  key stays in `storageKeys.ts`.

## Hooks

- Prefix `use`, one concern per hook, return a named object — never a tuple.
- Never call hooks conditionally. Gate the _effect_ inside, not the hook call.
- Cross-cutting hooks live in `common/business-logic/hooks/`
  (`useAppRouter`, `useForm`, `useDebouncedValue`, `useAppState`, …).

## Forms

`useForm` is a small, dependency-free controller: values, per-field errors, and
errors that only surface once a field is touched or the form is submitted.
Validators live in `utils/validators.ts` and return an `AppStringKey`, never a
message, so the screen renders it in the active language.

```ts
const form = useForm(
  { email: "", password: "" },
  { email: validateEmail, password: validatePassword },
);

const key = form.visibleError("email");
<AppTextInput error={key ? getString(key) : undefined} … />
```

Once a project has a dozen forms, react-hook-form + zod earns its weight;
swapping is a per-screen change because nothing else depends on this.

## Navigation

Never hard-code a path. Add it to `common/business-logic/routes/paths.ts` and
navigate with `useAppRouter()`:

```ts
const router = useAppRouter();
router.push(routes.exampleDetail(id));
```
