---
description: "Feature data-access stack — service, queries, business-logic hook, axios refresh slot, query managers"
globs: src/**/data-access/**/*.{ts,tsx},src/**/business-logic/use*.ts,src/common/business-logic/session/**/*.{ts,tsx},src/common/business-logic/hooks/useOnlineManager.ts,src/common/business-logic/hooks/useAppStateFocus.ts,src/common/business-logic/hooks/useNetworkStatus.ts,src/common/business-logic/hooks/usePurgeStaleDefaultQueryScopes.ts
alwaysApply: false
paths:
  - "src/**/data-access/**/*.{ts,tsx}"
  - "src/**/business-logic/use*.ts"
  - "src/common/business-logic/session/**/*.{ts,tsx}"
  - "src/common/business-logic/hooks/useOnlineManager.ts"
  - "src/common/business-logic/hooks/useAppStateFocus.ts"
  - "src/common/business-logic/hooks/useNetworkStatus.ts"
  - "src/common/business-logic/hooks/usePurgeStaleDefaultQueryScopes.ts"
---

# Network / data-access Layer

Every remote feature is implemented as **three files** across data-access + business-logic. Do not skip or merge layers.

## 1. `src/features/<feature>/data-access/<feature>Types.ts` — DTOs

- Payload / response interfaces. Fields stay **snake_case** exactly as the backend sends.
- Reuse shared envelopes from `@/common/data-access/type/responseTypes` (`BaseResponseType`, `BaseListResponse`, `BasePaginationResponse`, `BasePayload`, `BasePaginationPayload`, `MutationOptions`). Do not redefine them.
- Reuse generic entity DTOs from `@/common/data-access/type/*Types` (image, action, note box, …) — see `.ai/rules/entities.md`.
- `T` in `BaseResponseType<T>` must not be an array — lists use `BaseListResponse` / `BasePaginationResponse`.

## 2. `src/features/<feature>/data-access/<feature>Service.ts` — raw axios

- Exports one `<feature>Service` object of `async` functions.
- Uses `apiClient` from `@/common/data-access/api/axios` (or an injected instance if testing).
- Each method returns `response.data`. Pass query params via the axios `{ params }` option — never hand-build a query string.
- No React, no hooks, no toasts, no storage, no navigation.

```ts
import { apiClient } from "@/common/data-access/api/axios";
import { BaseListResponse } from "@/common/data-access/type/responseTypes";
import { ExampleItem } from "@/features/example/data-access/exampleTypes";

export const exampleService = {
  list: async (): Promise<BaseListResponse<ExampleItem>> => {
    const response = await apiClient.get("/posts");
    return response.data;
  },
  detail: async (id: string) => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  },
};
```

## 3. `src/features/<feature>/data-access/<feature>Queries.ts` — React Query

- Named export per endpoint: `use<Action>Query` / `use<Action>Mutation` / `use<Action>InfiniteQuery`.
- `queryKey` / `mutationKey` MUST be wrapped in `useDefaultQueryKey([...])` so language / env / scope participate in cache invalidation.
- Query keys are kebab-case strings (or a `<feature>Keys` factory + wrap).
- Paginated reads use `useInfiniteQuery` with helpers from `@/common/data-access/api/queryUtils` (`infiniteListMapper`, …).

```ts
export const useExampleListQuery = () =>
  useQuery({
    queryKey: useDefaultQueryKey(["example-list"]),
    queryFn: () => exampleService.list(),
  });
```

## 4. `src/features/<feature>/business-logic/use<Feature>.ts` — business hook

The ONLY layer presentation should consume for remote data:

- Calls the query/mutation hook.
- Applies side effects: store updates, invalidations, navigation callbacks.
- Exposes a minimal flat API (`{ list, isLoading, error, refetch }`, `{ submit, isPending }`).
- Accepts `MutationOptions<T>` for mutations so callers can hook `onSuccess` / `onError`.
- Errors: the axios interceptor already toasts via `apiResponseChannel` when `meta.message` is present — don't toast again. Don't swallow.

## Kernel: query managers + headers + 401 refresh

### Mount once from the root layout

Call `setupQueryManagers()` from `src/common/data-access/api/setupQueryManagers.ts` **once** next to `QueryClientProvider` in `src/app/_layout.tsx` (module scope or the layout body). It wires:

- NetInfo → React Query `onlineManager` (paused queries resume on reconnect)
- AppState → React Query `focusManager` (foreground refetches **stale** queries; `refetchOnWindowFocus: true` on `queryClient`)

Also mount `usePurgeStaleDefaultQueryScopes()` under `QueryClientProvider` so language / env scope changes drop only the **previous** scope's cache entries.

Hooks `useOnlineManager` / `useAppStateFocus` exist if a subtree must ensure the bridges without the imperative setup; prefer `setupQueryManagers()`.

UI connectivity banners use `useNetworkStatus()` → `{ isOnline }` (NetInfo; independent of the query bridge).

### Request headers

Feature slices register header providers with `registerRequestHeaderProvider` in `requestHeaders.ts` (from `CoreBootstrap` / slice bootstrap). The client never imports those slices.

### Auth-ready 401 refresh (no auth feature in this template)

`registerAuthRefreshHandler(handler)` in `src/common/data-access/api/authRefresh.ts`:

- On **401**, if a handler is registered, axios runs it **single-flight**, then retries the queued request **once** (`_authRetry`).
- If refresh fails or no handler is registered, publish to `apiErrorChannel` as before.
- The handler must return `true` only after a new access token is stored; it must **not** re-enter the 401 path via `apiClient` (use a dedicated refresh call / fetch).

A future **session** slice plugs in with `registerSessionAuth` from `src/common/business-logic/session/registerSessionAuth.ts`:

```ts
import { registerSessionAuth } from "@/common/business-logic/session/registerSessionAuth";

// From session/auth bootstrap (not from common):
registerSessionAuth({
  getAccessToken: () => tokenStore.getAccessToken(),
  refresh: async () => {
    // refresh tokens without apiClient 401 loops; persist; return true/false
    return true;
  },
});
```

That registers both the `Authorization: Bearer …` header provider and the refresh handler. Until a session slice exists, leave the handler unregistered — 401s only hit `apiErrorChannel`.

## Anti-patterns

- Calling `apiClient` / `axios` in a presentation component or route file.
- Using `useQuery` / `useMutation` directly in presentation.
- Hard-coding base URLs — `apiClient` + environment owns the base URL.
- Bypassing `useDefaultQueryKey`.
- Re-implementing toast on success/error that the interceptor already surfaces.
- Presentation importing anything from `data-access` except `*Types.ts`.
- Importing an auth/session feature from `common/data-access` — use the registries above.
