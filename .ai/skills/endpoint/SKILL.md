---
name: endpoint
description: Add or change a backend endpoint through the mandatory layers — types, service (axios), queries (React Query), business-logic hook. Use when asked to call a new API, add a request/mutation, wire an endpoint, add pagination, or change a request/response shape.
---

# Add an endpoint

Rules: `.ai/rules/network.md`, `.ai/rules/architecture.md`. Copy the shape from `src/features/example/data-access/`.

## 1. Types — `<feature>Types.ts`

- snake_case fields. Prices as strings if the backend sends strings.
- Payloads: `<Action>Payload` extending `BasePayload` / `BasePaginationPayload` when appropriate.
- Response wrappers from `@/common/data-access/type/responseTypes`.

## 2. Service — `<feature>Service.ts`

- One service object. Uses `apiClient`. Returns `response.data`.
- Query params via `{ params }`. No React, hooks, toasts, try/catch.

## 3. Queries — `<feature>Queries.ts`

- `use<Action>Query` / `Mutation` / `InfiniteQuery`.
- Keys always wrapped in `useDefaultQueryKey([...])`.
- Infinite lists: use `queryUtils` mappers / `getNextPageParam` from pagination.

## 4. Business hook — `use<Feature>.ts` (or `use<Action>.ts`)

- The only thing presentation imports for this data.
- Flat return shape; side effects here.
- Don't double-toast — the interceptor owns `meta.message`.

## 5. Changing an existing endpoint

- Grep every consumer before changing a field.
- Keep the BL return shape stable when you can.

## 6. Verify

Run the `verify` skill. List guessed fields as open backend questions.
