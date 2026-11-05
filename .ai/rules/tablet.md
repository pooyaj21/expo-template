---
description: "Tablet / large-screen layout — every page is built for phone AND tablet"
globs: src/features/**/presentation/**/*.{ts,tsx},src/common/presentation/**/*.{ts,tsx},src/common/presentation/token/dimensions.ts,src/common/business-logic/hooks/useDimensions.ts,src/common/business-logic/hooks/useContentGrid.ts,src/common/business-logic/hooks/useColumnSidePadding.ts,src/common/business-logic/hooks/useDetailPageLayout.ts,src/common/business-logic/hooks/useOrientationPolicy.ts,src/common/business-logic/utils/contentLayout.ts
alwaysApply: false
paths:
  - "src/features/**/presentation/**/*.{ts,tsx}"
  - "src/common/presentation/**/*.{ts,tsx}"
  - "src/common/presentation/token/dimensions.ts"
  - "src/common/business-logic/hooks/useDimensions.ts"
  - "src/common/business-logic/hooks/useContentGrid.ts"
  - "src/common/business-logic/hooks/useColumnSidePadding.ts"
  - "src/common/business-logic/hooks/useDetailPageLayout.ts"
  - "src/common/business-logic/hooks/useOrientationPolicy.ts"
  - "src/common/business-logic/utils/contentLayout.ts"
---

# Tablet & large screens

`ios.supportsTablet` is on. Real users open the app on iPads, Android tablets, foldables and split screen. **Every new or changed page ships with a tablet layout in the same change** — a phone layout stretched to 1024 px is a bug, not "later".

## The switch: `isTablet` from `useDimensions`

```ts
import { useDimensions } from "@/common/business-logic/hooks/useDimensions";

const { width, height, isTablet } = useDimensions();
```

- Branch on `isTablet` at render time only. It is reactive to rotation / split screen.
- ❌ Never: `Dimensions.get(...)` in a screen, a raw `useWindowDimensions().width > N` check, a new ad-hoc breakpoint constant, or `Platform.isPad`.

## Layout helpers (prefer these over hand-rolled math)

| Helper                                           | Path                                                  | Use when                                                                  |
| ------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| `useContentGrid(cellWidth, sideMargin, spacing)` | `common/business-logic/hooks/useContentGrid.ts`       | Grids / lists — returns `{ sidePadding, numColumns }`                     |
| `useColumnSidePadding(columnMaxWidth?)`          | `common/business-logic/hooks/useColumnSidePadding.ts` | Single-column forms / settings — centers a max-width column               |
| `useDetailPageLayout(phoneSideMargin, kind?)`    | `common/business-logic/hooks/useDetailPageLayout.ts`  | Media + info detail pages — side padding, content width, column/rail gaps |
| `getContentWidth` / `getContentSidePadding`      | `common/business-logic/utils/contentLayout.ts`        | Pure helpers when you already have `width` / `isTablet`                   |
| `useOrientationPolicy()`                         | `common/business-logic/hooks/useOrientationPolicy.ts` | Root once — lock phone to portrait, unlock tablets                        |

`DetailPageLayoutKindEnums.DEFAULT` uses the standard column gap; `.WIDE` uses the wider gap. Tokens live in `contentLayoutMetrics` (`common/business-logic/constants/layout.ts`) and are mirrored by `dimensions.layout` in `common/presentation/token/dimensions.ts`.

## Patterns

| Page shape                      | Approach                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| Form / settings / single column | `useColumnSidePadding()` for horizontal padding                                              |
| Full-width content / lists      | `useContentGrid(...)` for side padding + `numColumns`                                        |
| Detail with media + info        | `useDetailPageLayout(...)` — two-column row on tablet, stacked on phone                      |
| Bottom sheet                    | Cap sheet width via `useSheetWidth` / `useSheetDimensions`; grids inside use the sheet width |

Feature-specific tablet sizes belong next to the feature — no magic numbers for tablet column widths in the page file.

## Rules for every page

1. **No fixed column counts.** Compute `numColumns` from width / `useContentGrid`.
2. **No content edge-to-edge on tablet** except full-bleed media.
3. **Two columns use logical layout** (`flexDirection: "row"`, `marginStart/End`, `gap`).
4. **Skeletons match the tablet layout.**
5. **Phone layout stays pixel-identical** — branch with `isTablet`; don't retune phone spacing while adding tablet.
6. **Rotation keeps state** — don't refetch or reset forms because `isTablet` flipped.

## Verify

Run each changed page on iPad (portrait + landscape + rotate), a narrow split, and an Android tablet / foldable. Check Arabic on tablet for column order.
