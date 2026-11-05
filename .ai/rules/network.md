---
description: "Feature data-access stack — service, queries, business-logic hook"
globs: src/**/data-access/**/*.{ts,tsx},src/**/business-logic/use*.ts
alwaysApply: false
paths:
  - "src/**/data-access/**/*.{ts,tsx}"
  - "src/**/business-logic/use*.ts"
---

# Network / data-access Layer

Every remote feature is implemented as **three files** across data-access + business-logic. Do not skip or merge layers.

## 1. `src/features/<feature>/data-access/<feature>Types.ts` — DTOs

- Payload / response interfaces. Fields stay **snake_case** exactly as the backend sends.
- Reuse shared envelopes from `@/common/data-access/type/responseTypes` (`BaseResponseType`, `BaseListResponse`, `BasePaginationResponse`, `BasePayload`, `BasePaginationPayload`, `MutationOptions`). Do not redefine them.
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

## Anti-patterns

- Calling `apiClient` / `axios` in a presentation component or route file.
- Using `useQuery` / `useMutation` directly in presentation.
- Hard-coding base URLs — `apiClient` + environment owns the base URL.
- Bypassing `useDefaultQueryKey`.
- Re-implementing toast on success/error that the interceptor already surfaces.
- Presentation importing anything from `data-access` except `*Types.ts`.
