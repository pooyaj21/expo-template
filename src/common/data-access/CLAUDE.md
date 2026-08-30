# data-access — `src/**/data-access/**`

The bottom layer. It owns the network, persistence and the shapes that cross the
wire. It may not import `business-logic` or `presentation` — ESLint enforces it.

## The three files of a remote feature

### 1. `<feature>Types.ts`

Domain models (`<Name>Interface`) and payloads (`extends BasePayload` /
`BasePaginationPayload`). Backend fields stay snake_case.

### 2. `<feature>Service.ts` — raw HTTP

- Exports one object named `<feature>Service`.
- Every method takes `axios: AxiosInstance` as its **first** argument. Never
  import a client singleton — that is what makes the runtime environment switch
  work and what makes these testable with a stub.
- Returns `Promise<BaseResponseType<T>>` or `Promise<BasePaginationResponse<T>>`.
- No storage, no hooks, no React.

### 3. `<feature>Queries.ts` — React Query bindings

- One named export per endpoint: `use<Action>Query`, `use<Action>Mutation`,
  `use<Action>InfiniteQuery`.
- Get the client from `useApiClient()`.
- **Every** `queryKey` / `mutationKey` is wrapped in `useDefaultQueryKey([...])`
  so environment, language and session participate in invalidation. Forgetting
  it serves the previous language's or previous account's cached response.
- Keys are kebab-case strings: `["example-detail", id]`.

## The kernel — `common/data-access/`

- `api/apiClient.ts` — builds the axios instance. It imports no feature. Headers
  arrive from the registry, failures leave through the channel.
- `api/apiErrorChannel.ts` — publish failures; anyone may subscribe. React-free.
- `api/requestHeaders.ts` — slices register header providers; the client asks.
- `api/queryScope.tsx` — `useDefaultQueryKey`. The scope is filled by
  `CoreProviders`, so this file stays feature-free.
- `api/queryClient.ts`, `api/pagination.ts` — cache defaults and page mappers.
- `storage/storage.ts` — the only door to the device. `Storage` for ordinary
  values, `SecureStorage` for anything a leaked backup would compromise.
  Never import AsyncStorage or SecureStore anywhere else.
- `storage/storageKeys.ts` — every persisted key, in one auditable place.
- `type/` — `BaseResponseType`, `BasePaginationResponse`, `MutationOptions`,
  shared value types. Do not redefine these per feature.
- `localization/strings.ts` — the string catalog and `AppStringKey`.
- `config/AppConfig.ts` — build-time config read from `EXPO_PUBLIC_*`.

## Anti-patterns

- ❌ Importing a business-logic hook or a component from here.
- ❌ A service that reaches for a module-level axios instance.
- ❌ A query key not wrapped in `useDefaultQueryKey`.
- ❌ Hard-coded base URLs.
- ❌ Toasting an error here — publish it and let the alert bridge decide.
