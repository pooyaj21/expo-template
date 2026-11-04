---
description: "Domain models (entities) and shared type conventions"
globs: src/features/*/data-access/**/*.{ts,tsx}
alwaysApply: false
paths:
  - "src/features/*/data-access/**/*.{ts,tsx}"
---

# Entities — `src/features/*/data-access/**/*.{ts,tsx}`

Domain models live in `src/features/*/data-access/`. One interface per file, named `<Name>Interface.ts`:

```
src/features/*/data-access/
  exampleTypes.ts       → export interface ExampleInterface { ... }
  UserInterface.ts         → export interface UserInterface { ... }
  SettingsInterface.ts     → the GET /src/app/settings payload (feature_flags, force_update, support)
  FeatureFlagInterface.ts  → FeatureFlagEnums + FEATURE_FLAG_DEFAULTS + FEATURE_FLAG_LIST
  index.tsx                → shared base types (BaseResponseType, BaseListResponse, BasePaginationResponse, BasePayload, BasePaginationPayload, MutationOptions, MetaResponseType, PaginationResponseType, ActionInterface, ButtonInterface, ImageType, enums)
```

## Entity rules

- **Every entity file declares exactly one `export interface <Name>Interface`** (no barrel re-exports — consumers import the specific file). Shared cross-entity shapes (`ImageType`, `ButtonInterface`, `ActionInterface`, `StatusTabInterface`, the response wrappers) belong in `index.tsx`.
- **Request payloads are NOT entities.** `ExampleListPayload`, `CreateExamplePayload`, `DeviceRegisterPayload` live in the api file that sends them (`src/features/*/data-access/*Api.ts`).
- Response wrappers — `data` is never an array, and app-facing lists always live at `data.items`:
  - **`BaseResponseType<T>`** — single object/value payload (`{ data: T; meta? }`). Passing `T[]` is a type error by design (`NonArray<T>` resolves to an error string).
  - **`BaseListResponse<T>`** — non-paginated list (`{ data: { items: T[] }; meta? }`). T is the **item** type.
  - **`BasePaginationResponse<T>`** — paginated list (`{ data: { items: T[]; pagination }; meta? }`). `pagination` sits **inside `data`**, beside the rows it describes. Extra fields on `data` are fine via interface merge, as long as `items` and `pagination` survive.
- **There is no cursor pagination.** Every list pages with `page` / `per_page` and reports `data.pagination.has_more`. Do not reintroduce `cursor`, `next_cursor`, or a top-level `links` block.
- The backend returns these shapes natively — api modules `return response.data` directly. There are no response adapters.
- Interfaces mirror the backend JSON exactly — snake_case fields stay snake_case (`created_at`, `has_more`, `access_token`).
- Optional fields use `?:`, not `| undefined` at the site.
- Shared shapes: images are `ImageType` (`string | ImageInterface | ResponsiveInterface<ImageInterface>` — `AppImage` normalizes all three); backend buttons are `ButtonInterface { text?; action }`, rendered with `<AppButton response={btn} />` and dispatched through `handleAction`.
- When the backend returns a discriminator field, expose it as an enum from `index.tsx` (`ActionEnums.INTERNAL | EXTERNAL`, `MetaTypeEnums`) so switches and `Record<Enum, T>` lookups stay exhaustive.
