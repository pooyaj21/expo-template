---
description: "Shared generic API entity DTOs under common/data-access/type — Image, Action, NoteBox, DeviceOs, …"
globs: src/common/data-access/type/**/*Types.ts,src/features/**/data-access/*Types.ts
alwaysApply: false
paths:
  - "src/common/data-access/type/**/*Types.ts"
  - "src/features/**/data-access/*Types.ts"
---

# Shared entity types

Generic, brand-agnostic DTOs live under `src/common/data-access/type/` as `*Types.ts` files (**no barrels**). Feature-specific shapes stay in `src/features/<feature>/data-access/<feature>Types.ts` and import these when needed.

## Catalog

| File                | Exports                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `responseTypes.ts`  | Envelopes (`BaseResponseType`, lists, pagination, `MetaTypeEnums`, `MutationOptions`, …) |
| `imageTypes.ts`     | `ImageInterface`, `ImageType`, `ResponsiveInterface<T>`, `VideoInterface`                |
| `actionTypes.ts`    | `ActionEnums`, `ActionInterface`, `ButtonInterface`                                      |
| `statusTabTypes.ts` | `StatusTabInterface`                                                                     |
| `noteBoxTypes.ts`   | `NoteBoxInterface` (API note box; hex colours from backend)                              |
| `deviceTypes.ts`    | `DeviceOsEnums` (`ios` / `android`)                                                      |

## Rules

- Fields stay **snake_case** as the backend sends them.
- Keep types **generic** — no product brand names, analytics, or vendor SDKs.
- Presentation may import `*Types.ts` only (VLFA / `eslint-plugin-boundaries`). Prefer mapping API DTOs in business-logic when UI needs a different shape (e.g. optional-colour `NoteBox` under `common/business-logic/types/noteBox.ts` for chrome).
- Do not redefine `ActionEnums` / `ImageInterface` / envelopes inside a feature — import from common.
- Enums use the `Enums` suffix (`ActionEnums`, `DeviceOsEnums`).

## GOOD

```ts
import type { ImageType } from "@/common/data-access/type/imageTypes";
import type { ActionInterface } from "@/common/data-access/type/actionTypes";

export interface PromoCard {
  title: string;
  image: ImageType;
  cta: ActionInterface;
}
```

## BAD

```ts
// Local copy of a shared entity — drifts from the kernel
export enum ActionEnums {
  INTERNAL = "internal",
  EXTERNAL = "external",
}
```
