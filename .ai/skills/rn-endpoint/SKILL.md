---
name: rn-endpoint
description: Add or change a backend endpoint through the mandatory three layers — api (axios) → queries (React Query) → use case — plus the entity. Use when asked to call a new API, add a request/mutation, wire an endpoint, add pagination, or change a request/response shape.
---

# expo-template — add an endpoint (api → queries → use case)

Rules live in `.ai/rules/network.md` and `.ai/rules/entities.md`. Copy the shape from `exampleService.ts` / `exampleQueries.ts` / `useExampleList.ts`.

## 1. Entity — `src/features/*/data-access/<Name>Interface.ts`

- snake_case fields, exactly as the real response.
- Payloads: `<Action>Payload` interfaces, snake_case too.
- Response wrapper: `BaseResponseType<T>` (single), `BaseListResponse<T>` (`data.items`), `BasePaginationResponse<T>` (`data.items` + `data.pagination`). `T` is never an array. No cursor pagination exists.

## 2. API — `src/features/*/data-access/<domain>Api.ts`

- Exports one `<domain>Api` object. Every function takes `axios: AxiosInstance` first and returns `response.data`.
- No React, no hooks, no toasts, no try/catch.

## 3. Queries — `src/features/*/data-access/<domain>Queries.ts`

- `use<Action>Query` / `use<Action>Mutation` only. Query keys via `useDefaultQueryKey`.
- No business side-effects here (no store writes, no navigation).

## 4. Use case — `src/features/*/business-logic/use<Action><Entity>UseCase.ts`

- The only layer screens import.
- Combines the query/mutation with store updates, toasts that are _not_ already covered by `meta.message`, and navigation side-effects.
- A response `meta.message` is already toasted by the Axios interceptor — do not double-toast.

## 5. Verify

`rn-verify`, then hit the happy path and a failing response on both platforms.
