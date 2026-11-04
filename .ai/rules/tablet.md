---
description: "Tablet / large-screen layout — every page is built for phone AND tablet (iPad, Android tablets, foldables, rotation): the isTablet switch, the layout primitives, DimensionProvider tablet tokens, sheets, grids, images"
globs: src/features/**/presentation/**/*.{ts,tsx},src/common/presentation/**/*.{ts,tsx},src/common/business-logic/hooks/use{Dimensions,ColumnSidePadding,OrientationPolicy}.ts,src/common/business-logic/utils/contentLayout.ts,src/common/business-logic/layout/DimensionProvider.ts,src/app/**/*.tsx
alwaysApply: false
paths:
  - "src/features/**/presentation/**/*.{ts,tsx}"
  - "src/common/presentation/**/*.{ts,tsx}"
  - "src/common/business-logic/hooks/use{Dimensions,ColumnSidePadding,OrientationPolicy}.ts"
  - "src/common/business-logic/utils/contentLayout.ts"
  - "src/common/business-logic/layout/DimensionProvider.ts"
  - "src/app/**/*.tsx"
---

# Tablet & large screens

`ios.supportsTablet` is on and large screens rotate freely (`useOrientationPolicy`
unlocks orientation when `min(width, height) >= 600`). Real users open the app on
iPads, Android tablets, foldables and split screen. **Every new or changed page
ships with a tablet layout in the same change** — a phone layout stretched to
1024 px is a bug, not "later".

## The switch: `isTablet` from `useDimensions`

```ts
import { useDimensions } from "@/common/business-logic/hooks/useDimensions";

const { width, height, isTablet } = useDimensions();
```

- `isTablet` = `width >= TABLET_MIN_WIDTH` (600) **and** `width / height >= 0.8`.
  A tall narrow window stays phone layout on purpose.
- Reactive to rotation / split screen / fold. Branch at render time only.
- Inside a bottom sheet, `width` is already the sheet's width (560 max) via
  `SheetWidthProvider`.

❌ Never: `Dimensions.get(...)` in a screen (only `useOrientationPolicy` may),
a raw `useWindowDimensions().width > N` check, a new breakpoint constant, or
`Platform.isPad`.

## Pick the pattern that matches the page

| Page shape                                | Use                                                                                                                    | Shell reference                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Form / settings / single column           | `useColumnSidePadding(maxWidth?)` → centers a 640 px column (or a feature width from `DimensionProvider`)              | `SettingsScreen`, `HomeScreen`        |
| Full-width content page (lists, catalogs) | `getContentSidePadding` / `getContentWidth` from `contentLayout.ts` → content capped at 1240 px                        | Prefer for home rails / wide catalogs |
| List of cards                             | Feature tokens under `DimensionProvider.<feature>.list` (+ `.tablet`) for side margins; `AppList` for the list itself  | `ExampleListScreen`                   |
| Bottom sheet                              | Nothing — sheets cap at 560 and center. Grids inside use `useSheetDimensions()` / `useDimensions()` under the provider | Language / shared dialogs             |

If none fit, write a feature layout hook next to the screen that builds on these
helpers — don't re-derive centering math inline.

## Tokens live in `DimensionProvider`

- Global: `DimensionProvider.layout` (`contentMaxWidth` 1240, `columnMaxWidth` 640,
  `tabletSideMargin` 24, `columnSideMargin` 20) and `bottomSheet.tablet.maxWidth` 560.
- Feature tablet sizes go under that feature's entry (`DimensionProvider.example.list.tablet`,
  …). No magic tablet widths in the screen file.

## Rules for every page

1. **No fixed column counts.** Prefer helpers over hard-coded `numColumns`.
2. **No content edge-to-edge on tablet.** Forms and text sit in a centered column;
   only full-bleed media may span.
3. **Logical layout for two columns.** `marginStart/End`, `gap` — never `left/right`.
4. **Phone layout stays pixel-identical** — branch with `isTablet`.
5. **Rotation keeps state.** No `isTablet` in effects that refetch / reset / scroll.

## Verify

Changed pages on: iPad portrait + landscape (rotate while open), iPad ⅓ split
(phone fallback), Android tablet / foldable, Arabic on tablet.
