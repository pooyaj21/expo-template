---
description: "Three-layer network stack — api, queries, usecase"
globs: src/common/data-access/api/**/*.{ts,tsx}
alwaysApply: false
paths:
  - "src/common/data-access/api/**/*.{ts,tsx}"
---

# Network Layer — `src/common/data-access/api/**/*.{ts,tsx}`

Every remote feature is implemented as **three files** in three folders. Do not skip or merge layers. The `example` stack (`api/exampleService.ts` → `src/features/example/data-access/exampleQueries.ts` → `src/features/example/business-logic/useExampleList.ts` …) is the reference implementation — copy it for the first real feature, then delete it.

The flow is one-directional: **screen → usecase → queries → api**. A query never calls another query, an api file never imports a store, and nothing below the use case knows a screen exists.

## 1. `src/features/*/data-access/<domain>Api.ts` — raw axios

- Exports an object named `<domain>Api`.
- Each method receives `axios: AxiosInstance` as its **first** argument (never imports a singleton).
- Declares its `*Payload` interfaces **here** (extending `BasePayload` / `BasePaginationPayload`) — a request payload belongs next to the endpoint that sends it, not in `src/features/*/data-access/`.
- Return type is `Promise<BaseResponseType<T>>` for a single payload (T must **not** be an array), `Promise<BaseListResponse<T>>` for a non-paginated list (T = item type), or `Promise<BasePaginationResponse<T>>` when the endpoint paginates. Lists live at `data.items` and `pagination` inside `data` (`data` is never an array) — the backend returns exactly that, so every method just does `return response.data`. Never adapt or reshape a response in the api layer.
- Do not read/write storage, call hooks, or touch React.
- A path the Axios interceptor has to recognise is exported as a SCREAMING_SNAKE_CASE constant (`DEVICE_REGISTER_PATH`) rather than repeated as a literal.

```ts
export interface ExampleListPayload extends BasePaginationPayload {
  sort?: string;
}

export const exampleApi = {
  list: async (
    axios: AxiosInstance,
    req?: ExampleListPayload,
  ): Promise<BasePaginationResponse<ExampleInterface>> => {
    const response = await axios.get(`/examples`, { params: req });
    return response.data;
  },
  detail: async (
    axios: AxiosInstance,
    id: number,
  ): Promise<BaseResponseType<ExampleInterface>> => {
    const response = await axios.get(`/examples/${id}`);
    return response.data;
  },
};
```

## 2. `src/features/*/data-access/<domain>Queries.ts` — React Query

- Named export per endpoint: `use<Action>Query` (reads), `use<Action>Mutation` (writes), `use<X>ListQuery` built on `useInfiniteQuery` (paginated reads).
- Get axios via `useAxiosContext()` — NOT `axios` directly.
- `queryKey` / `mutationKey` MUST be wrapped in `useDefaultQueryKey([...])` so environment, language and token participate in cache invalidation. A language switch or a login then refetches on its own — never invalidate those by hand.
- Query keys are kebab-case strings. Export the prefix as a constant (`SAMPLE_LIST_QUERY_PREFIX`) when something has to invalidate it, and put the invalidation helper here (`useInvalidateExampleQueries`), not in the use case.
- `retry: false` on reads — the Axios interceptor already surfaces the failure, and a retry only delays the error state. Global defaults (`staleTime`, `gcTime`, no-retry on 4xx) live on the `QueryClient` in `src/app/_layout.tsx`.
- Paginated reads use a numeric `page`: `initialPageParam: requestData(1)`, and `getNextPageParam` reads `lastPage?.data?.pagination` — advance on `has_more`, return `undefined` otherwise. Put the filter/sort params in the query key so a change resets paging.

```ts
export function useExampleDetailQuery(id?: number) {
  const axios = useAxiosContext();

  return useQuery({
    queryKey: useDefaultQueryKey([...SAMPLE_DETAIL_QUERY_PREFIX, id]),
    queryFn: async () => exampleApi.detail(axios, id!),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCreateExampleMutation() {
  const axios = useAxiosContext();

  return useMutation({
    mutationKey: useDefaultQueryKey(["create-example"]),
    mutationFn: (payload: CreateExamplePayload) =>
      exampleApi.create(axios, payload),
  });
}
```

## 3. `src/features/*/business-logic/use<Action><Entity>UseCase.ts` — business hook

The ONLY layer screens should consume. The use case:

- Calls the query/mutation hook and unwraps the envelope, so a screen never touches `data.data`.
- Applies side effects: store updates, cache invalidation, navigation chaining.
- Exposes a minimal API — reads return `{ <entity>, isLoading, error, refetch }`; paginated reads pipe the query through `mapInfiniteListQuery` (`src/common/data-access/api/Util.ts`) for `{ list, isLoading, error, isEmpty, refetch, pagination }`.
- Accepts `MutationOptions<T>` for mutations and calls the caller's `onSuccess` **after** its own side effects.

```ts
export const useCreateExampleUseCase = (
  options?: MutationOptions<ExampleInterface>,
) => {
  const { mutate, isPending } = useCreateExampleMutation();
  const invalidateExampleQueries = useInvalidateExampleQueries();

  const createExample = (payload: CreateExamplePayload) => {
    mutate(payload, {
      ...options,
      onSuccess: async (data) => {
        await invalidateExampleQueries();
        options?.onSuccess?.(data);
      },
    });
  };

  return { createExample, isPending };
};
```

### Store-backed use cases (the boot pair)

`useSetupDeviceUseCase` and `useGetSettingsUseCase` are the canonical exception to "read via `{ data, isLoading }`": their responses are mirrored into Zustand so the whole app — including non-React callers like the Axios header builders — reads them synchronously.

- **`useSetupDeviceUseCase({ onSuccess, onError })`** registers the install (`POST /devices`) and writes `uuid` / `fresh_id` into the device store, which is where the `Device-Id` header comes from. Guest traffic is identified by that uuid alone, so the failure has to reach `onError` — `AppManagerProvider` turns it into a retry on the splash rather than starting the app unidentified.
- **`useGetSettingsUseCase({ enabled })`** loads `GET /src/app/settings` and mirrors it into the settings store **and** the feature-flag store in an effect, returning only the gating state. `updateServerFlags` replaces the whole server layer: a flag the backend stopped sending must fall back to env/default, not keep its last value.
- Both are wired into `AppManagerProvider` and gated on each other (settings waits on device registration) — a new boot call gates on the same `deviceReady` latch, never on `dependenciesLoaded`.

## Supporting files

- **`Util.ts`** — `createAxiosInstance(baseURL)` (timeouts, device headers, pretty request/response logging, mock application), `DEFAULT_TIMEOUT_MS` / `LONG_TIMEOUT_MS` (opt into the long one per endpoint, never globally), `NO_CACHE_QUERY_OPTIONS`, and the infinite-list mappers.
- **`apiHeaders.ts`** — `deviceApiHeaders()` (os, version, build) and `sessionApiHeaders()` (`Language`, `Authorization`, `Device-Id`), read straight from the stores so every request is fresh by construction. `useApiHeaders()` is the React-side mirror for debug screens.
- **`NetworkLogger.ts` / `NetworkLoggerStub.tsx`** — `startApiNetworkLogging()` is called once from `src/app/_layout.tsx`; the stub keeps release bundles free of the logger UI.
- **`mock/`** — dev-only response transformers gated on `AppConfig.mocksEnabled`. Register a transformer per path in `registry.ts` to fake a field the backend does not serve yet; `*` matches exactly one path segment (`/examples/*` hits `/examples/12`, not `/examples/12/related`). A transformer returns the response untouched apart from the field it fakes, and never ships enabled.

## Network anti-patterns

- ❌ Calling `axios.post` in a screen or non-network hook.
- ❌ Using `useQuery` / `useMutation` directly in a screen.
- ❌ Hard-coding a base URL — the instance from `useAxiosContext()` already carries environment, local override and headers.
- ❌ Bypassing `useDefaultQueryKey` — stale data survives a language, environment or user switch.
- ❌ Re-toasting a failure: the `AxiosContext` response interceptor already toasts every `meta.message` it sees, on success and on error.
- ❌ Putting a request payload interface in `src/features/*/data-access/`.
